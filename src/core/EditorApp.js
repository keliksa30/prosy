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
          <button class="btn btn-ghost appbar-btn desktop-only" id="btn-templates" title="Template library">
            ${svg('LayoutTemplate', 15)} Templates
          </button>
          <button class="btn btn-ghost appbar-btn desktop-only" id="btn-present" title="Presentation deck full-screen (F)">
            ${svg('Play', 14)} Present
          </button>
          <button class="btn btn-ghost appbar-btn desktop-only" id="btn-open" title="Open a .prs project file">
            ${svg('FolderOpen', 15)} Open
          </button>
          <button class="btn btn-primary appbar-btn" id="btn-export" title="Export & save (Cmd/Ctrl+E)">
            ${svg('Download', 15)} <span class="desktop-only">Export</span>
          </button>
          <button class="icobtn mobile-only" id="btn-mobile-more" title="More options">
            ${svg('MoreVertical', 17)}
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

    <!-- Mobile Quick Actions Bar (appears when object selected) -->
    <div class="mobile-quick-actions" id="mobile-quick-actions">
      <button class="mobile-quick-btn" id="mq-btn-color" title="Color">${svg('Palette', 14)} <span>Color</span></button>
      <button class="mobile-quick-btn" id="mq-btn-size-down" title="Smaller">${svg('Minus', 13)}</button>
      <button class="mobile-quick-btn" id="mq-btn-size-up" title="Larger">${svg('Plus', 13)}</button>
      <button class="mobile-quick-btn" id="mq-btn-duplicate" title="Duplicate">${svg('Copy', 14)}</button>
      <button class="mobile-quick-btn" id="mq-btn-delete" title="Delete" style="color:var(--danger);">${svg('Trash2', 14)}</button>
      <button class="mobile-quick-btn" id="mq-btn-edit" title="All Properties">${svg('SlidersHorizontal', 14)} <span>Edit</span></button>
    </div>

    <!-- Mobile Bottom Navigation Bar (Canva style) -->
    <div class="mobile-bottom-bar" id="mobile-bottom-bar">
      <button class="mobile-bar-btn" id="mb-btn-pages">
        ${svg('Files', 18)}
        <span id="mb-page-lbl">Slide 1/1</span>
      </button>

      <button class="mobile-bar-btn fab-btn" id="mb-btn-add">
        ${svg('Plus', 18)}
        <span>Add</span>
      </button>

      <button class="mobile-bar-btn" id="mb-btn-layers">
        ${svg('Layers', 18)}
        <span>Layers</span>
      </button>

      <button class="mobile-bar-btn" id="mb-btn-design">
        ${svg('SlidersHorizontal', 18)}
        <span>Design</span>
      </button>
    </div>

    <!-- Mobile Bottom Sheet & Overlay -->
    <div class="mobile-sheet-overlay" id="mobile-sheet-overlay"></div>
    <div class="mobile-bottom-sheet" id="mobile-bottom-sheet">
      <div class="mobile-sheet-handle-area" id="mobile-sheet-handle-area">
        <div class="mobile-sheet-handle"></div>
      </div>
      <div class="mobile-sheet-header">
        <span id="mobile-sheet-title">Options</span>
        <button class="icobtn" id="mobile-sheet-close">${svg('X', 18)}</button>
      </div>
      <div class="mobile-sheet-content" id="mobile-sheet-content"></div>
    </div>

    <!-- Mobile More Menu Dropdown -->
    <div class="mobile-more-menu" id="mobile-more-menu" style="display:none">
      <button class="mobile-more-item" id="mmm-btn-templates">${svg('LayoutTemplate', 16)} <span>Templates</span></button>
      <button class="mobile-more-item" id="mmm-btn-present">${svg('Play', 16)} <span>Present Deck</span></button>
      <button class="mobile-more-item" id="mmm-btn-open">${svg('FolderOpen', 16)} <span>Open File</span></button>
    </div>

    <div class="toast-stack" id="toast-stack"></div>
    `;
  }

  /* ================================================================== */
  /* CHROME HELPERS                                                      */
  /* ================================================================== */

  refreshPageChrome() {
    const el = document.getElementById('status-page');
    const mobEl = document.getElementById('mb-page-lbl');
    const pm = this.pageManager;
    if (pm) {
      const cur = pm.currentIndex + 1;
      const text = `Page ${cur} of ${pm.pages.length}`;
      if (el) el.textContent = text;
      if (mobEl) mobEl.textContent = `Slide ${cur}/${pm.pages.length}`;
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
    this.setupMobileUI();

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

  /* ================================================================== */
  /* MOBILE INTERFACE & BOTTOM SHEETS                                   */
  /* ================================================================== */

  setupMobileUI() {
    // Overflow more menu on mobile
    const moreBtn = document.getElementById('btn-mobile-more');
    const moreMenu = document.getElementById('mobile-more-menu');
    if (moreBtn && moreMenu) {
      moreBtn.onclick = (e) => {
        e.stopPropagation();
        moreMenu.style.display = moreMenu.style.display === 'none' ? 'flex' : 'none';
      };
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#mobile-more-menu') && !e.target.closest('#btn-mobile-more')) {
          moreMenu.style.display = 'none';
        }
      });
      document.getElementById('mmm-btn-templates').onclick = () => {
        moreMenu.style.display = 'none';
        this.templateChooser.show({ mode: 'pack' });
      };
      document.getElementById('mmm-btn-present').onclick = () => {
        moreMenu.style.display = 'none';
        this.presentationMode.start();
      };
      document.getElementById('mmm-btn-open').onclick = () => {
        moreMenu.style.display = 'none';
        this.projectFileManager.triggerLoad();
      };
    }

    // Sheet close & overlay dismiss
    const overlay = document.getElementById('mobile-sheet-overlay');
    const closeBtn = document.getElementById('mobile-sheet-close');
    if (overlay) overlay.onclick = () => this.closeMobileSheet();
    if (closeBtn) closeBtn.onclick = () => this.closeMobileSheet();

    // Bottom Navigation buttons
    document.getElementById('mb-btn-pages')?.addEventListener('click', () => this.openMobilePagesSheet());
    document.getElementById('mb-btn-add')?.addEventListener('click', () => this.openMobileAddSheet());
    document.getElementById('mb-btn-layers')?.addEventListener('click', () => this.openMobileLayersSheet());
    document.getElementById('mb-btn-design')?.addEventListener('click', () => this.openMobilePropertiesSheet());

    // Selection changes for Mobile Quick Actions bar
    const canvas = this.canvasManager?.canvas;
    const quickBar = document.getElementById('mobile-quick-actions');
    if (canvas && quickBar) {
      const updateQuickBar = () => {
        const active = canvas.getActiveObject();
        if (active) {
          quickBar.classList.add('visible');
        } else {
          quickBar.classList.remove('visible');
        }
      };
      canvas.on('selection:created', updateQuickBar);
      canvas.on('selection:updated', updateQuickBar);
      canvas.on('selection:cleared', updateQuickBar);

      // Quick bar buttons
      document.getElementById('mq-btn-duplicate')?.addEventListener('click', () => this.ops.duplicate());
      document.getElementById('mq-btn-delete')?.addEventListener('click', () => this.ops.deleteSelected());
      document.getElementById('mq-btn-edit')?.addEventListener('click', () => this.openMobilePropertiesSheet());
      document.getElementById('mq-btn-color')?.addEventListener('click', () => this.openMobilePropertiesSheet());
      document.getElementById('mq-btn-size-down')?.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj) {
          if (obj.fontSize) {
            obj.set('fontSize', Math.max(8, (obj.fontSize || 40) - 2));
            if (obj.initDimensions) obj.initDimensions();
            if (obj.setCoords) obj.setCoords();
          } else {
            obj.scale((obj.scaleX || 1) * 0.95);
            obj.setCoords();
          }
          canvas.requestRenderAll();
          this.historyManager.saveState();
        }
      });
      document.getElementById('mq-btn-size-up')?.addEventListener('click', () => {
        const obj = canvas.getActiveObject();
        if (obj) {
          if (obj.fontSize) {
            obj.set('fontSize', Math.min(300, (obj.fontSize || 40) + 2));
            if (obj.initDimensions) obj.initDimensions();
            if (obj.setCoords) obj.setCoords();
          } else {
            obj.scale((obj.scaleX || 1) * 1.05);
            obj.setCoords();
          }
          canvas.requestRenderAll();
          this.historyManager.saveState();
        }
      });
    }
  }

  openMobileSheet(title, content) {
    const titleEl = document.getElementById('mobile-sheet-title');
    const contentEl = document.getElementById('mobile-sheet-content');
    const sheet = document.getElementById('mobile-bottom-sheet');
    const overlay = document.getElementById('mobile-sheet-overlay');
    if (!sheet || !contentEl) return;

    if (titleEl) titleEl.textContent = title;
    contentEl.innerHTML = '';
    if (typeof content === 'string') {
      contentEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentEl.appendChild(content);
    }

    overlay?.classList.add('active');
    sheet.classList.add('open');
  }

  closeMobileSheet() {
    const sheet = document.getElementById('mobile-bottom-sheet');
    const overlay = document.getElementById('mobile-sheet-overlay');
    sheet?.classList.remove('open');
    overlay?.classList.remove('active');

    // Restore any mounted panels back to desktop dock
    if (this._activeMobilePanel === 'properties') {
      const designPane = document.getElementById('dock-body-design');
      if (designPane) this.panels.properties?.mount(designPane);
    } else if (this._activeMobilePanel === 'layers') {
      const layersPane = document.getElementById('dock-body-layers');
      if (layersPane) this.panels.layers?.mount(layersPane);
    }
    this._activeMobilePanel = null;
  }

  openMobilePropertiesSheet() {
    this._activeMobilePanel = 'properties';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.properties) {
      this.panels.properties.mount(contentEl);
    }
    this.openMobileSheet('Design & Properties', contentEl);
  }

  openMobileLayersSheet() {
    this._activeMobilePanel = 'layers';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.layers) {
      this.panels.layers.mount(contentEl);
    }
    this.openMobileSheet('Layers', contentEl);
  }

  openMobilePagesSheet() {
    const pm = this.pageManager;
    if (!pm) return;
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

    const strip = document.createElement('div');
    strip.className = 'mobile-pages-strip';

    pm.pages.forEach((page, idx) => {
      const card = document.createElement('div');
      card.className = 'mobile-page-thumb-card';
      const isActive = idx === pm.currentIndex;
      card.innerHTML = `
        <div class="mobile-page-thumb-box ${isActive ? 'active' : ''}">
          ${page.thumb ? `<img src="${page.thumb}" alt="">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-weight:700;">${idx + 1}</div>`}
        </div>
        <div class="mobile-page-title">${idx + 1}. ${escapeHtml(page.title || 'Untitled')}</div>
      `;
      card.onclick = () => {
        pm.switchToPage(idx);
        this.closeMobileSheet();
      };
      strip.appendChild(card);
    });

    container.appendChild(strip);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.style.cssText = 'width:100%;justify-content:center;padding:11px;font-size:13px;';
    addBtn.innerHTML = `${svg('Plus', 16)} Add New Slide`;
    addBtn.onclick = () => {
      this.ops.addPageAfterCurrent();
      this.closeMobileSheet();
    };
    container.appendChild(addBtn);

    this.openMobileSheet('Slides / Pages (' + pm.pages.length + ')', container);
  }

  openMobileAddSheet() {
    const container = document.createElement('div');
    container.className = 'mobile-add-grid';

    const items = [
      {
        icon: svg('Type', 20),
        title: 'Text',
        desc: 'Heading or paragraph text',
        action: () => {
          this.closeMobileSheet();
          this.toolManager.setTool('text');
          this.toast('Tap anywhere on canvas to place text');
        }
      },
      {
        icon: svg('Square', 20),
        title: 'Shapes',
        desc: 'Rectangles, circles, lines',
        action: () => {
          this.openMobileShapesSubSheet();
        }
      },
      {
        icon: svg('Camera', 20),
        title: 'Photos',
        desc: 'Free stock photos & uploads',
        action: () => {
          this.openMobilePhotosSheet();
        }
      },
      {
        icon: svg('Sparkles', 20),
        title: 'Icons',
        desc: 'Lucide & brand logos',
        action: () => {
          this.openMobileIconsSheet();
        }
      },
      {
        icon: svg('LayoutGrid', 20),
        title: 'Elements',
        desc: 'Cards, buttons & blocks',
        action: () => {
          this.openMobileElementsSheet();
        }
      },
      {
        icon: svg('LayoutTemplate', 20),
        title: 'Templates',
        desc: 'Explore portfolio packs',
        action: () => {
          this.closeMobileSheet();
          this.templateChooser.show({ mode: 'pack' });
        }
      }
    ];

    items.forEach(it => {
      const card = document.createElement('button');
      card.className = 'mobile-add-card';
      card.innerHTML = `
        <div class="mobile-add-card-icon">${it.icon}</div>
        <div class="mobile-add-card-title">${it.title}</div>
        <div class="mobile-add-card-desc">${it.desc}</div>
      `;
      card.onclick = () => it.action();
      container.appendChild(card);
    });

    this.openMobileSheet('Add to Slide', container);
  }

  openMobileShapesSubSheet() {
    const container = document.createElement('div');
    container.style.cssText = 'display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;padding:6px 0;';

    const shapes = [
      { id: 'rect', label: 'Rectangle', icon: svg('Square', 24) },
      { id: 'ellipse', label: 'Circle', icon: svg('Circle', 24) },
      { id: 'line', label: 'Line', icon: svg('Minus', 24) },
      { id: 'triangle', label: 'Triangle', icon: svg('Triangle', 24) },
      { id: 'star', label: 'Star', icon: svg('Star', 24) },
      { id: 'polygon', label: 'Polygon', icon: svg('Hexagon', 24) },
      { id: 'heart', label: 'Heart', icon: svg('Heart', 24) }
    ];

    shapes.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'mobile-add-card';
      btn.style.cssText = 'align-items:center;text-align:center;padding:14px 6px;';
      btn.innerHTML = `
        <div style="color:var(--text-primary);display:flex;align-items:center;justify-content:center;">${s.icon}</div>
        <div style="font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-top:4px;">${s.label}</div>
      `;
      btn.onclick = () => {
        this.closeMobileSheet();
        this.toolManager.setTool('shape');
        const st = this.toolManager.getTool('shape');
        if (st) st.setShape(s.id);
        this.toast(`Drag on canvas to draw ${s.label}`);
      };
      container.appendChild(btn);
    });

    this.openMobileSheet('Choose Shape', container);
  }

  openMobilePhotosSheet() {
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.photos) {
      this.panels.photos.mount(contentEl);
    }
    this.openMobileSheet('Stock Photos (Unsplash)', contentEl);
  }

  openMobileIconsSheet() {
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.icons) {
      this.panels.icons.mount(contentEl);
    }
    this.openMobileSheet('Icons & Logos', contentEl);
  }

  openMobileElementsSheet() {
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.elements) {
      this.panels.elements.mount(contentEl);
    }
    this.openMobileSheet('UI Elements & Blocks', contentEl);
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
