import { CanvasManager } from './CanvasManager.js';
import { HistoryManager } from './HistoryManager.js';
import { PageManager } from './PageManager.js';
import { ProjectFileManager } from './ProjectFileManager.js';
import { ExportManager } from './ExportManager.js';
import { KeyboardManager } from './KeyboardManager.js';
import { ObjectOps } from './ObjectOps.js';

import { ToolManager } from '../tools/ToolManager.js';
import { SelectTool } from '../tools/SelectTool.js';
import { HandTool } from '../tools/HandTool.js';
import { ShapeTool } from '../tools/ShapeTool.js';
import { TextTool } from '../tools/TextTool.js';
import { ImageTool } from '../tools/ImageTool.js';

import { FilmstripPanel } from '../panels/FilmstripPanel.js';
import { PropertiesPanel } from '../panels/PropertiesPanel.js';
import { LayersPanel } from '../panels/LayersPanel.js';
import { IconsPanel } from '../panels/IconsPanel.js';
import { ElementsPanel } from '../panels/ElementsPanel.js';
import { PhotosPanel } from '../panels/PhotosPanel.js';
import { PresentationMode } from './PresentationMode.js';

import { TemplateManager } from '../templates/TemplateManager.js';
import { TemplateChooser } from '../ui/TemplateChooser.js';
import { ExportSettingsModal } from '../ui/ExportSettingsModal.js';
import { WelcomeScreen } from '../ui/WelcomeScreen.js';
import { ContextMenu } from '../ui/ContextMenu.js';
import { Modal } from '../ui/Modal.js';
import { svg } from '../ui/icons.js';
import { SHAPE_DEFS, SHAPE_LIST } from '../shapes/defs.js';
import * as fabric from 'fabric';

const TOOL_KEYS = {
  v: { tool: 'select' }, h: { tool: 'pan' }, t: { tool: 'text' },
  r: { tool: 'shape', shape: 'rect' }, o: { tool: 'shape', shape: 'ellipse' },
  l: { tool: 'shape', shape: 'line' }
};

export class EditorApp {
  constructor(rootElement) {
    this.root = rootElement;
    this.projectName = 'Untitled portfolio';
    this.clipboard = null;
    this.pasteCount = 0;
    this.undo = () => this.historyManager && this.historyManager.undo();
    this.redo = () => this.historyManager && this.historyManager.redo();
  }

  async init() {
    this.renderLayout();

    // ---------- core ----------
    this.canvasManager = new CanvasManager('prosy-canvas', { width: 1920, height: 1080 });
    this.canvasManager.app = this;
    const canvas = this.canvasManager.init();
    window.fabric = fabric;

    this.historyManager = new HistoryManager(canvas);
    this.historyManager.init();

    this.pageManager = new PageManager(this.canvasManager, this.historyManager);
    this.pageManager.init();

    this.ops = new ObjectOps(this);
    this.objectOps = this.ops;

    this.projectFileManager = new ProjectFileManager(this);
    this.exportManager = new ExportManager(this);
    this.exportSettingsModal = new ExportSettingsModal(this);
    this.presentationMode = new PresentationMode(this);

    // ---------- templates ----------
    this.templateManager = new TemplateManager(this);
    await this.templateManager.init();
    this.templateChooser = new TemplateChooser(this);
    this.contextMenu = new ContextMenu(this);
    this.welcomeScreen = new WelcomeScreen(this);

    // ---------- panels / dock ----------
    this.panels = {};
    this.panels.filmstrip = new FilmstripPanel(this);
    this.panels.properties = new PropertiesPanel(this);
    this.panels.layers = new LayersPanel(this);
    this.panels.icons = new IconsPanel(this);
    this.panels.elements = new ElementsPanel(this);
    this.panels.photos = new PhotosPanel(this);
    this.panels.properties.mount(document.getElementById('dock-body-design'));
    this.panels.layers.mount(document.getElementById('dock-body-layers'));
    this.panels.icons.mount(document.getElementById('icons-popover'));
    this.panels.elements.mount(document.getElementById('elements-popover'));
    this.panels.photos.mount(document.getElementById('photos-popover'));

    // ---------- tools ----------
    this.toolManager = new ToolManager(this.canvasManager);
    this.toolManager.registerTool('select', new SelectTool());
    this.toolManager.registerTool('pan', new HandTool());
    this.toolManager.registerTool('text', new TextTool());
    this.toolManager.registerTool('shape', new ShapeTool('rect'));
    this.toolManager.registerTool('image', new ImageTool());
    this.toolManager.setTool('select');

    // ---------- keyboard ----------
    this.keyboardManager = new KeyboardManager(this);

    this.setupUIEvents();
    this.setupDock();
    this.setupMaskEditBar();
    this.setupAutosave();

    // zoom label updates
    document.addEventListener('prosy:zoomChanged', (e) => {
      const lbl = document.getElementById('zoom-percentage-lbl');
      if (lbl && e.detail) lbl.textContent = `${e.detail.zoom}%`;
    });
    document.addEventListener('prosy:pageSwitched', () => this.refreshPageChrome());
    document.addEventListener('prosy:pagesUpdated', () => this.refreshPageChrome());
    document.addEventListener('prosy:historyChanged', (e) => {
      const u = document.getElementById('btn-undo');
      const r = document.getElementById('btn-redo');
      if (u) u.disabled = !e.detail.canUndo;
      if (r) r.disabled = !e.detail.canRedo;
    });
    document.addEventListener('prosy:saved', () => this.pulseSaved());

    this.refreshPageChrome();
    console.log('Prosy Editor Core initialized');
  }

  /* ---------------- mask-edit (isolation) floating bar ---------------- */

  setupMaskEditBar() {
    const bar = document.getElementById('mask-edit-bar');
    if (!bar) return;
    const show = (on) => { bar.style.display = on ? 'flex' : 'none'; };
    document.getElementById('btn-mask-done').onclick = () => this.ops.finishMaskEdit();
    document.getElementById('btn-mask-cancel').onclick = () => this.ops.cancelMaskEdit();
    document.addEventListener('prosy:maskEditChanged', (e) => show(!!e.detail.editing));
    document.addEventListener('prosy:pageSwitched', () => {
      if (this.ops.maskEditing) this.ops.cancelMaskEdit();
    });
    show(false);
  }

  /* ================================================================== */
  /* LAYOUT                                                              */
  /* ================================================================== */

  renderLayout() {
    this.root.innerHTML = `
    <div class="header-area">
      <div class="app-bar">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <button class="icobtn" id="btn-back-home" title="Back to home">
            ${svg('House', 17)}
          </button>
          <div style="width:1px;height:18px;background:var(--border-color);margin:0 6px;"></div>
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <img src="/favicon.svg" alt="" width="20" height="20" style="border-radius:5px;">
            <span style="font-weight:700;font-family:var(--font-headline);font-size:15px;">Prosy</span>
          </div>
          <div style="width:1px;height:18px;background:var(--border-color);margin:0 6px;"></div>
          <span id="project-name" class="project-name" title="Double-click to rename">${escapeHtml(this.projectName)}</span>
        </div>

        <div style="display:flex;align-items:center;gap:4px;">
          <button class="icobtn" id="btn-undo" title="Undo (Cmd/Ctrl+Z)" disabled>${svg('Undo2', 17)}</button>
          <button class="icobtn" id="btn-redo" title="Redo (Cmd/Ctrl+Shift+Z)" disabled>${svg('Redo2', 17)}</button>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn btn-ghost appbar-btn" id="btn-templates" title="Template library">
            ${svg('LayoutTemplate', 15)} Templates
          </button>
          <button class="btn btn-ghost appbar-btn" id="btn-present" title="Presentation deck full-screen (F)">
            ${svg('Play', 14)} Present
          </button>
          <button class="btn btn-ghost appbar-btn" id="btn-open" title="Open a .prs project file">
            ${svg('FolderOpen', 15)} Open
          </button>
          <button class="btn btn-primary appbar-btn" id="btn-export" title="Export & save (Cmd/Ctrl+E)">
            ${svg('Download', 15)} Export
          </button>
        </div>
      </div>

      <div class="ribbon-toolbar">
        <button class="tool-btn" data-tool="select" title="Select & move (V)">
          ${svg('MousePointer2', 19)}<span>Select</span>
        </button>
        <button class="tool-btn" data-tool="pan" title="Hand tool (H · hold Space to pan)">
          ${svg('Hand', 19)}<span>Pan</span>
        </button>

        <div style="width:1px;height:26px;background:var(--border-color);margin:0 6px;"></div>

        <div class="shape-drop-wrap" id="text-drop-wrap">
          <button class="tool-btn tool-btn-wide" id="btn-text" data-tool="text" title="Add heading text (T)">
            <span class="shape-label-wrap">${svg('Type', 15)}</span>
          </button>
          <button class="text-caret" id="btn-text-caret" title="Text options">${svg('ChevronDown', 11)}</button>
          <div class="text-menu" id="text-menu" style="display:none">
            <button class="text-menu-item" data-textmode="text"><span class="text-menu-ic">${svg('Type', 15)}</span><span><b>Heading text</b><small>Click, then type — for titles</small></span></button>
            <button class="text-menu-item" data-textmode="paragraph"><span class="text-menu-ic">${svg('AlignLeft', 15)}</span><span><b>Paragraph text</b><small>Drag to set the width — wraps like a box</small></span></button>
          </div>
        </div>

        <div class="shape-drop-wrap" id="shape-drop-wrap">
          <button class="tool-btn tool-btn-wide" id="btn-shapes" data-tool="shape" title="Shapes — click to draw, or open the menu">
            <span class="shape-label-wrap"><span id="shape-tool-label">${svg('Square', 15)}</span>${svg('ChevronDown', 11)}</span>
          </button>
        </div>

        <button class="tool-btn" data-tool="image" title="Insert image">
          ${svg('Image', 19)}<span>Image</span>
        </button>

        <div class="shape-drop-wrap" id="icons-drop-wrap">
          <button class="tool-btn" id="btn-tool-icons" title="Icon library">
            ${svg('Sparkles', 19)}<span>Icons</span>
          </button>
          <div class="icons-popover" id="icons-popover" style="display:none"></div>
        </div>

        <div class="shape-drop-wrap" id="elements-drop-wrap">
          <button class="tool-btn" id="btn-tool-elements" title="Element blocks">
            ${svg('LayoutGrid', 19)}<span>Elements</span>
          </button>
          <div class="elements-popover" id="elements-popover" style="display:none"></div>
        </div>

        <div class="shape-drop-wrap" id="photos-drop-wrap">
          <button class="tool-btn" id="btn-tool-photos" title="Stock photos (Unsplash)">
            ${svg('Camera', 19)}<span>Photos</span>
          </button>
          <div class="photos-popover" id="photos-popover" style="display:none"></div>
        </div>

        <div style="flex:1"></div>

        <button class="tool-btn" id="btn-add-page" title="Add a page after the current one">
          ${svg('FilePlus2', 18)}<span>Add page</span>
        </button>
      </div>
    </div>

    <div class="workspace">
      <div class="filmstrip-panel"></div>

      <div class="canvas-viewport">
        <div class="canvas-wrapper"></div>
        <div class="mask-edit-bar" id="mask-edit-bar" style="display:none">
          <span class="mask-edit-hint">${svg('Scissors', 13)} Mask edit — drag content; dashed line = mask window</span>
          <span style="flex:1"></span>
          <button class="btn btn-ghost mask-edit-btn" id="btn-mask-cancel">Cancel</button>
          <button class="btn btn-primary mask-edit-btn" id="btn-mask-done">${svg('Check', 13)} Done <span class="mask-edit-esc">Esc</span></button>
        </div>
      </div>

      <div class="dock-panel" id="dock">
        <div class="dock-tabs">
          <button class="dock-tab active" data-tab="design" title="Design & properties">
            ${svg('SlidersHorizontal', 15)}<span>Design</span>
          </button>
          <button class="dock-tab" data-tab="layers" title="Layers">
            ${svg('Layers', 15)}<span>Layers</span>
          </button>
        </div>
        <div class="dock-body">
          <div class="dock-body-pane active" id="dock-body-design"></div>
          <div class="dock-body-pane" id="dock-body-layers"></div>
        </div>
      </div>
    </div>

    <div class="status-bar">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="status-page" id="status-page">Page 1 of 1</span>
        <div style="width:1px;height:14px;background:var(--border-color);"></div>
        <div class="zoom-controls">
          <button class="zoom-btn" id="btn-zoom-out" title="Zoom out (Cmd/Ctrl+−)">${svg('Minus', 13)}</button>
          <div class="zoom-drop-wrap">
            <button class="zoom-btn zoom-val" id="btn-zoom-pct" title="Zoom presets">100%</button>
            <div class="zoom-drop" id="zoom-drop" style="display:none"></div>
          </div>
          <button class="zoom-btn" id="btn-zoom-in" title="Zoom in (Cmd/Ctrl++)">${svg('Plus', 13)}</button>
          <button class="zoom-btn" id="btn-zoom-fit" title="Fit page to screen (Cmd/Ctrl+0)">${svg('Scan', 14)}</button>
          <button class="zoom-btn" id="btn-rulers" title="Toggle rulers">${svg('Ruler', 13)}</button>
        </div>
      </div>
      <div class="status-hints">
        <span>Click to select</span>·<span><b>T</b> text</span>·<span><b>R</b> shape</span>·<span><b>⌘D</b> duplicate</span>·<span><b>⌘G</b> group</span>·<span>Right-click for more</span>·<span id="btn-shortcuts" style="cursor:pointer;text-decoration:underline;color:var(--text-secondary);">Shortcuts</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="save-indicator" id="save-indicator">${svg('Cloud', 12)} Saved</span>
        <span style="font-size:10px;color:var(--text-muted);" id="sel-count"></span>
      </div>
    </div>

    <div class="toast-stack" id="toast-stack"></div>
    `;
  }

  /* ================================================================== */
  /* CHROME HELPERS                                                      */
  /* ================================================================== */

  refreshPageChrome() {
    const el = document.getElementById('status-page');
    const pm = this.pageManager;
    if (el && pm) {
      const cur = pm.currentIndex + 1;
      el.textContent = `Page ${cur} of ${pm.pages.length}`;
    }
  }

  pulseSaved() {
    const el = document.getElementById('save-indicator');
    if (!el) return;
    el.innerHTML = svg('CloudCheck', 12) + ' Saved';
    el.classList.add('flash');
    clearTimeout(this._savePulse);
    this._savePulse = setTimeout(() => {
      el.innerHTML = svg('Cloud', 12) + ' Saved';
      el.classList.remove('flash');
    }, 1600);
  }

  toast(message, isError = false) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' error' : '');
    t.textContent = message;
    stack.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 250); }, 2200);
  }

  /* ================================================================== */
  /* EVENTS                                                              */
  /* ================================================================== */

  setupUIEvents() {
    // tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (tool && tool !== 'image') this.toolManager.setTool(tool);
        else if (tool === 'image') this.toolManager.setTool('image');
      });
    });

    // shapes dropdown
    this.setupShapeMenu();
    // text heading/paragraph dropdown
    this.setupTextMenu();

    // toolbar icons, elements & photos popovers
    this.setupIconsMenu();
    this.setupElementsMenu();
    this.setupPhotosMenu();

    document.getElementById('btn-add-page').onclick = () => this.ops.addPageAfterCurrent();

    // back home (saves draft first)
    document.getElementById('btn-back-home').onclick = () => {
      this.pageManager.saveCurrentPage();
      this.welcomeScreen.show();
    };

    document.getElementById('btn-undo').onclick = () => this.undo();
    document.getElementById('btn-redo').onclick = () => this.redo();
    document.getElementById('btn-templates').onclick = () => this.templateChooser.show({ mode: 'pack' });
    document.getElementById('btn-present').onclick = () => this.presentationMode.start();
    document.getElementById('btn-export').onclick = () => this.exportSettingsModal.show();
    document.getElementById('btn-open').onclick = () => this.projectFileManager.triggerLoad();
    document.getElementById('btn-shortcuts').onclick = () => this.showShortcuts();

    // zoom controls
    document.getElementById('btn-zoom-in').onclick = () => this.canvasManager.setZoom(Math.min(200, Math.round(this.canvasManager.getZoom() * 100) + 10), this._zoomCenter());
    document.getElementById('btn-zoom-out').onclick = () => this.canvasManager.setZoom(Math.max(5, Math.round(this.canvasManager.getZoom() * 100) - 10), this._zoomCenter());
    document.getElementById('btn-zoom-fit').onclick = () => this.canvasManager.fitToScreen();
    const rulerBtn = document.getElementById('btn-rulers');
    const syncRulerBtn = () => {
      const on = this.canvasManager.rulersVisible();
      rulerBtn.classList.toggle('active', on);
      rulerBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    rulerBtn.onclick = () => {
      this.canvasManager.setRulersVisible(!this.canvasManager.rulersVisible());
      syncRulerBtn();
    };
    syncRulerBtn();
    const pct = document.getElementById('btn-zoom-pct');
    pct.onclick = (e) => { e.stopPropagation(); this.toggleZoomDrop(); };

    // project name rename
    const nameEl = document.getElementById('project-name');
    const bindRename = (span) => {
      span.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.className = 'project-name-input';
        input.value = this.projectName;
        span.replaceWith(input);
        input.focus(); input.select();
        const finish = (ok) => {
          if (ok && input.value.trim()) this.projectName = input.value.trim();
          const s = document.createElement('span');
          s.id = 'project-name'; s.className = 'project-name';
          s.title = 'Double-click to rename'; s.textContent = this.projectName;
          input.replaceWith(s);
          bindRename(s);
        };
        input.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') finish(true); else if (ev.key === 'Escape') finish(false); });
        input.addEventListener('blur', () => finish(true));
      });
    };
    bindRename(nameEl);

    // selection count
    this.canvasManager.getCanvas().on('selection:created', (e) => this._updateSelCount());
    this.canvasManager.getCanvas().on('selection:updated', (e) => this._updateSelCount());
    this.canvasManager.getCanvas().on('selection:cleared', () => this._updateSelCount());
  }

  _bindRename(span) { /* replaced by inline logic */ }

  _updateSelCount() {
    const el = document.getElementById('sel-count');
    if (!el) return;
    const n = this.canvasManager.getCanvas().getActiveObjects().length;
    el.textContent = n ? `${n} selected` : '';
  }

  _zoomCenter() {
    const vp = this.canvasManager.getViewport();
    const r = vp ? vp.getBoundingClientRect() : null;
    return r ? { x: r.width / 2, y: r.height / 2 } : null;
  }

  /* ------------------- text (heading / paragraph) menu ------------------- */

  setupTextMenu() {
    const wrap = document.getElementById('text-drop-wrap');
    const caret = document.getElementById('btn-text-caret');
    const menu = document.getElementById('text-menu');
    const main = document.getElementById('btn-text');
    if (!wrap || !caret || !menu) return;

    const setMode = (mode) => {
      const t = this.toolManager.tools['text'];
      if (!t) return;
      t.mode = mode;
      this.toolManager.setTool('text');
      const title = mode === 'paragraph' ? 'Paragraph text — drag to set width' : 'Add heading text (T)';
      if (main) main.title = title;
      menu.style.display = 'none';
      document.querySelectorAll('.text-menu-item').forEach(b => b.classList.toggle('active', b.dataset.textmode === mode));
    };

    menu.querySelectorAll('.text-menu-item').forEach(item => {
      item.addEventListener('click', () => setMode(item.dataset.textmode));
    });
    caret.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#text-drop-wrap')) menu.style.display = 'none';
    });
    // keep menu highlight in sync with the active mode
    document.addEventListener('prosy:toolChanged', () => {
      const t = this.toolManager.tools['text'];
      document.querySelectorAll('.text-menu-item').forEach(b => b.classList.toggle('active', !!t && b.dataset.textmode === t.mode));
    });
    // Esc closes the menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.style.display !== 'none') menu.style.display = 'none';
    });
  }

  /* ------------------- shape picker menu ------------------- */

  /** keep the icon-only shape button in sync (icon of the active shape) */
  _syncShapeTool(def) {
    if (!def) return;
    const labelEl = document.getElementById('shape-tool-label');
    const btn = document.getElementById('btn-shapes');
    if (labelEl) labelEl.innerHTML = svg(def.icon, 15);
    if (btn) btn.title = `${def.name} — click to draw, or open the menu`;
  }

  setupShapeMenu() {
    const wrap = document.getElementById('shape-drop-wrap');
    const btn = document.getElementById('btn-shapes');

    const setShape = (key) => {
      this.toolManager.setShapeType(key);
      this.toolManager.setTool('shape');
      const def = SHAPE_DEFS[key];
      this._syncShapeTool(def);
    };

    const menu = document.createElement('div');
    menu.className = 'shape-menu';
    menu.style.display = 'none';
    const grid = document.createElement('div');
    grid.className = 'shape-menu-grid';
    SHAPE_LIST.forEach(key => {
      const def = SHAPE_DEFS[key];
      const cell = document.createElement('button');
      cell.className = 'shape-menu-cell';
      cell.title = def.name;
      cell.dataset.label = def.name;
      cell.innerHTML = svg(def.icon, 24);
      cell.addEventListener('click', () => { setShape(key); this._closeShapeMenu(); });
      grid.appendChild(cell);
    });
    menu.appendChild(grid);
    wrap.appendChild(menu);

    const toggle = () => {
      const visible = menu.style.display !== 'none';
      menu.style.display = visible ? 'none' : 'block';
    };
    // Clicking anywhere on the Shapes button opens the gallery — the
    // current shape is only used after picking one (or via keyboard R).
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    this._closeShapeMenu = () => { menu.style.display = 'none'; };
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#shape-drop-wrap')) menu.style.display = 'none';
      if (!e.target.closest('#icons-drop-wrap')) {
        const ip = document.getElementById('icons-popover');
        if (ip) ip.style.display = 'none';
      }
      if (!e.target.closest('#elements-drop-wrap')) {
        const ep = document.getElementById('elements-popover');
        if (ep) ep.style.display = 'none';
      }
    });

    // keyboard shape shortcut keeps the icon + hover name in sync
    document.addEventListener('prosy:toolChanged', (e) => {
      if (e.detail.tool !== 'shape') return;
      const t = this.toolManager.tools['shape'];
      const key = t ? t.shapeType : 'rect';
      this._syncShapeTool(SHAPE_DEFS[key]);
    });
  }

  /* ------------------- icons, elements & photos popovers ------------------- */

  _closeAllPopovers() {
    const ids = ['text-menu', 'icons-popover', 'elements-popover', 'photos-popover', 'zoom-drop'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (this._closeShapeMenu) this._closeShapeMenu();
  }

  setupIconsMenu() {
    const wrap = document.getElementById('icons-drop-wrap');
    const btn = document.getElementById('btn-tool-icons');
    const pop = document.getElementById('icons-popover');
    if (!wrap || !btn || !pop) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = pop.style.display !== 'none';
      this._closeAllPopovers();
      if (!open) {
        pop.style.display = 'flex';
        if (this.panels.icons) this.panels.icons.render();
      }
    });
    this._closeIconsMenu = () => { pop.style.display = 'none'; };
  }

  setupElementsMenu() {
    const wrap = document.getElementById('elements-drop-wrap');
    const btn = document.getElementById('btn-tool-elements');
    const pop = document.getElementById('elements-popover');
    if (!wrap || !btn || !pop) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = pop.style.display !== 'none';
      this._closeAllPopovers();
      if (!open) {
        pop.style.display = 'flex';
        if (this.panels.elements) this.panels.elements.render();
      }
    });
    this._closeElementsMenu = () => { pop.style.display = 'none'; };
  }

  setupPhotosMenu() {
    const wrap = document.getElementById('photos-drop-wrap');
    const btn = document.getElementById('btn-tool-photos');
    const pop = document.getElementById('photos-popover');
    if (!wrap || !btn || !pop) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = pop.style.display !== 'none';
      this._closeAllPopovers();
      if (!open) {
        pop.style.display = 'flex';
        if (this.panels.photos) this.panels.photos.render();
      }
    });
    this._closePhotosMenu = () => { pop.style.display = 'none'; };
  }

  /* ------------------------ dock tabs ------------------------ */

  setupDock() {
    const tabs = document.querySelectorAll('.dock-tab');
    const panes = {
      design: document.getElementById('dock-body-design'),
      layers: document.getElementById('dock-body-layers')
    };
    const active = { design: true, layers: false };
    const show = (name) => {
      Object.keys(active).forEach(k => { active[k] = k === name; });
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
      Object.keys(panes).forEach(k => {
        const on = k === name;
        if (panes[k]) panes[k].classList.toggle('active', on);
      });
      // refresh on show
      if (name === 'design' && this.panels.properties) this.panels.properties.render();
      if (name === 'layers' && this.panels.layers) this.panels.layers.render();
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
    this.dock = { show, panes };
  }

  /* -------------------- zoom presets popover -------------------- */

  toggleZoomDrop() {
    const drop = document.getElementById('zoom-drop');
    if (!drop) return;
    const open = drop.style.display !== 'none';
    if (open) { drop.style.display = 'none'; return; }
    drop.innerHTML = '';
    const cm = this.canvasManager;
    const mk = (label, fn, active = false) => {
      const b = document.createElement('button');
      b.className = 'zoom-drop-item' + (active ? ' active' : '');
      b.textContent = label;
      b.addEventListener('click', () => { fn(); drop.style.display = 'none'; });
      drop.appendChild(b);
    };
    mk('Fit page', () => cm.fitToScreen(), cm.getZoom() === Math.min(1, Math.min((cm.getViewport().clientWidth - 96) / 1920, (cm.getViewport().clientHeight - 96) / 1080)));
    mk('50%', () => cm.setZoom(50, this._zoomCenter()));
    mk('75%', () => cm.setZoom(75, this._zoomCenter()));
    mk('100%', () => cm.setZoom(100, null), Math.abs(cm.getZoom() - 1) < 0.01);
    mk('125%', () => cm.setZoom(125, this._zoomCenter()));
    mk('150%', () => cm.setZoom(150, this._zoomCenter()));
    mk('200%', () => cm.setZoom(200, this._zoomCenter()));
    drop.style.display = 'block';
    setTimeout(() => {
      const close = (e) => {
        if (!e.target.closest('.zoom-drop, #btn-zoom-pct')) {
          drop.style.display = 'none';
          document.removeEventListener('mousedown', close);
        }
      };
      document.addEventListener('mousedown', close);
    }, 0);
  }

  /* ================================================================== */
  /* AUTOSAVE                                                            */
  /* ================================================================== */

  setupAutosave() {
    // silent draft autosave — edits are never lost
    window.addEventListener('beforeunload', () => this.projectFileManager.saveDraft(true));
    this._autosaveTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && this.welcomeScreen.container.style.display === 'none') {
        this.projectFileManager.saveDraft(true);
      }
    }, 15000);
  }

  /* ================================================================== */
  /* CLIPBOARD                                                           */
  /* ================================================================== */

  _clipboardJson() {
    const objs = this.canvasManager.getCanvas().getActiveObjects();
    return Promise.all(objs.map(o => o.toObject(['name', 'custom', 'clipPath'])));
  }

  async copySelection() {
    const objs = this.canvasManager.getCanvas().getActiveObjects();
    if (!objs.length) return;
    this.clipboard = await Promise.all(objs.map(o => o.clone()));
    this.pasteCount = 0;
    this._flashSel(0.35);
    this.toast(`Copied ${objs.length} ${objs.length === 1 ? 'object' : 'objects'}`);
  }

  async cutSelection() {
    const objs = this.canvasManager.getCanvas().getActiveObjects();
    if (!objs.length) return;
    this.clipboard = await Promise.all(objs.map(o => o.clone()));
    this.pasteCount = 0;
    this.ops.delete();
    this.toast(`Cut ${objs.length} ${objs.length === 1 ? 'object' : 'objects'}`);
  }

  async pasteSelection() {
    const canvas = this.canvasManager.getCanvas();
    if (!this.clipboard || !this.clipboard.length) return;
    this.pasteCount++;
    const clones = await Promise.all(this.clipboard.map(o => o.clone()));
    const offset = 24 * this.pasteCount;
    canvas.discardActiveObject();
    const added = [];
    clones.forEach(c => {
      c.set({
        left: (c.left || 0) + offset,
        top: (c.top || 0) + offset,
        evented: true, selectable: true
      });
      canvas.add(c);
      added.push(c);
    });
    if (added.length === 1) canvas.setActiveObject(added[0]);
    else if (added.length > 1) canvas.setActiveObject(new fabric.ActiveSelection(added, { canvas }));
    canvas.requestRenderAll();
    this.ops._commit?.();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
  }

  _flashSel(opacity) {
    const objs = this.canvasManager.getCanvas().getActiveObjects();
    objs.forEach(o => { o.set('opacity', opacity); });
    this.canvasManager.getCanvas().requestRenderAll();
    setTimeout(() => {
      objs.forEach(o => o.set('opacity', o._prevOpacity ?? 1));
      this.canvasManager.getCanvas().requestRenderAll();
    }, 160);
  }

  /* ================================================================== */
  /* TOOL SHORTCUTS                                                      */
  /* ================================================================== */

  toolShortcutForKey(key) {
    return TOOL_KEYS[key] || null;
  }

  activateToolShortcut(key) {
    const sc = TOOL_KEYS[key];
    if (!sc) return;
    if (sc.tool === 'shape') {
      const shapeKey = sc.shape || 'rect';
      this.toolManager.setShapeType(shapeKey);
      this.toolManager.setTool('shape');
      this._syncShapeTool(SHAPE_DEFS[shapeKey]);
    } else {
      this.toolManager.setTool(sc.tool);
    }
  }

  /* -------------------- shortcuts help -------------------- */

  showShortcuts() {
    const rows = [
      ['Select / move', 'V'], ['Text', 'T'], ['Rectangle', 'R'], ['Ellipse', 'O'],
      ['Line', 'L'], ['Hand / pan', 'H or Space'], ['Duplicate', '⌘D'],
      ['Group / Ungroup', '⌘G · ⌘⇧G'], ['Select all', '⌘A'],
      ['Copy / Cut / Paste', '⌘C · ⌘X · ⌘V'],
      ['Bring forward / backward', '⌘] · ⌘['],
      ['To front / back', '⌘⇧] · ⌘⇧['],
      ['Flip horizontal / vertical', '⇧H · ⇧V'],
      ['Nudge 1px · 10px', '← ↑ ↓ → · ⇧+arrows'],
      ['Delete layer', '⌫ / Delete'],
      ['Zoom in / out', '⌘+ · ⌘− (scroll = zoom)'],
      ['Fit page / 100%', '⌘0 · ⌘1'],
      ['Save draft', '⌘S'], ['Export', '⌘E'],
      ['Deselect / exit', 'Esc'], ['Rename page', 'double-click page']
    ];
    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 28px;max-height:58vh;overflow-y:auto;font-size:12.5px;">
        ${rows.map(([label, key]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:5px 2px;border-bottom:1px solid var(--border-color);">
            <span style="color:var(--text-secondary);">${label}</span>
            <kbd style="font-family:var(--font-label);background:var(--bg-surface);border:1px solid var(--border-color);border-radius:5px;padding:2px 7px;font-size:11px;white-space:nowrap;color:var(--text-primary);">${key}</kbd>
          </div>`).join('')}
      </div>
      <div style="margin-top:14px;font-size:12px;color:var(--text-muted);">Zoom: scroll with Ctrl/Cmd held (pinch on trackpad). Drag with Space or middle mouse to pan.</div>`;
    const m = new Modal('shortcuts-modal', 'Keyboard shortcuts', html);
    m.render();
    m.open();
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
