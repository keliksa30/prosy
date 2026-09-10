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
import { PenTool } from '../tools/PenTool.js';

import { FilmstripPanel } from '../panels/FilmstripPanel.js';
import { PropertiesPanel } from '../panels/PropertiesPanel.js';
import { LayersPanel } from '../panels/LayersPanel.js';
import { ThemePanel } from '../panels/ThemePanel.js';
import { IconsPanel } from '../panels/IconsPanel.js';
import { ElementsPanel } from '../panels/ElementsPanel.js';
import { PhotosPanel } from '../panels/PhotosPanel.js';
import { PresentationMode } from './PresentationMode.js';
import { ThemeManager } from './ThemeManager.js';

import { TemplateManager } from '../templates/TemplateManager.js';
import { TemplateChooser } from '../ui/TemplateChooser.js';
import { ExportSettingsModal } from '../ui/ExportSettingsModal.js';
import { WelcomeScreen } from '../ui/WelcomeScreen.js';
import { ContextMenu } from '../ui/ContextMenu.js';
import { Modal } from '../ui/Modal.js';
import { svg } from '../ui/icons.js';
import { SHAPE_DEFS, SHAPE_LIST, createShape } from '../shapes/defs.js';
import {
  GOOGLE_FONTS, FONT_CATEGORIES, CUSTOM_FONTS, uploadCustomFont, deleteCustomFont, loadFont
} from './fonts.js';
import { QRCodeGenerator } from '../tools/QRCodeGenerator.js';
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
    this.themeManager = new ThemeManager(this);

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
    this.panels.theme = new ThemePanel(this);
    this.panels.icons = new IconsPanel(this);
    this.panels.elements = new ElementsPanel(this);
    this.panels.photos = new PhotosPanel(this);
    this.panels.properties.mount(document.getElementById('dock-body-design'));
    this.panels.layers.mount(document.getElementById('dock-body-layers'));
    this.panels.theme.mount(document.getElementById('dock-body-theme'));
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
    this.toolManager.registerTool('pen', new PenTool());
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
    const show = (on) => {
      bar.style.display = on ? 'flex' : 'none';
      const quickBar = document.getElementById('mobile-quick-actions');
      if (quickBar) {
        if (on) quickBar.style.display = 'none';
        else if (this.canvasManager?.canvas?.getActiveObject()) quickBar.style.display = 'flex';
      }
    };
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
          <button class="btn btn-ghost appbar-btn desktop-only" id="btn-about" title="About Prosy">
            ${svg('Info', 14)} About
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
        
        <button class="tool-btn" data-tool="pen" title="Pen tool (P)">
          ${svg('PenTool', 19)}<span>Pen</span>
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

        <button class="tool-btn" id="btn-tool-qrcode" title="Generate QR code from link">
          ${svg('QrCode', 19)}<span>QR Code</span>
        </button>

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
          <button class="dock-tab" data-tab="theme" title="Theme">
            ${svg('Palette', 15)}<span>Theme</span>
          </button>
        </div>
        <div class="dock-body">
          <div class="dock-body-pane active" id="dock-body-design"></div>
          <div class="dock-body-pane" id="dock-body-layers"></div>
          <div class="dock-body-pane" id="dock-body-theme"></div>
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
        <span>Click to select</span>·<span><b>T</b> text</span>·<span><b>R</b> shape</span>·<span><b>⌘D</b> duplicate</span>·<span><b>⌘G</b> group</span>·<span>Right-click for more</span>·<span id="btn-shortcuts" style="cursor:pointer;text-decoration:underline;color:var(--text-secondary);">Shortcuts</span>·<span id="btn-about-status" style="cursor:pointer;text-decoration:underline;color:var(--text-secondary);">About</span>
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

      <button class="mobile-bar-btn" id="mb-btn-theme">
        ${svg('Palette', 18)}
        <span>Theme</span>
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
      <button class="mobile-more-item" id="mmm-btn-save">${svg('Save', 16)} <span>Save .prs File</span></button>
      <button class="mobile-more-item" id="mmm-btn-export">${svg('Download', 16)} <span>Export (PDF/PPTX)</span></button>
      <button class="mobile-more-item" id="mmm-btn-open">${svg('FolderOpen', 16)} <span>Open .prs File</span></button>
      <button class="mobile-more-item" id="mmm-btn-templates">${svg('LayoutTemplate', 16)} <span>Templates</span></button>
      <button class="mobile-more-item" id="mmm-btn-present">${svg('Play', 16)} <span>Present Deck</span></button>
      <button class="mobile-more-item" id="mmm-btn-theme">${svg('Palette', 16)} <span>Theme & Styles</span></button>
      <button class="mobile-more-item" id="mmm-btn-about">${svg('Info', 16)} <span>About Prosy</span></button>
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
    this.setupQRCodeMenu();
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
    const aboutBtn = document.getElementById('btn-about');
    if (aboutBtn) aboutBtn.onclick = () => this.showAbout();
    const aboutStatus = document.getElementById('btn-about-status');
    if (aboutStatus) aboutStatus.onclick = () => this.showAbout();

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

  setupQRCodeMenu() {
    const btn = document.getElementById('btn-tool-qrcode');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._closeAllPopovers();
      this.showQRCodeDialog();
    });
  }

  /* ------------------------ dock tabs ------------------------ */

  setupDock() {
    const tabs = document.querySelectorAll('.dock-tab');
    const panes = {
      design: document.getElementById('dock-body-design'),
      layers: document.getElementById('dock-body-layers'),
      theme: document.getElementById('dock-body-theme')
    };
    const active = { design: true, layers: false, theme: false };
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
      if (name === 'theme' && this.panels.theme) this.panels.theme.render();
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
      document.getElementById('mmm-btn-save')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.projectFileManager.saveToPrs();
      });
      document.getElementById('mmm-btn-export')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.exportSettingsModal.show();
      });
      document.getElementById('mmm-btn-open')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.projectFileManager.triggerLoad();
      });
      document.getElementById('mmm-btn-templates')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.templateChooser.show({ mode: 'pack' });
      });
      document.getElementById('mmm-btn-present')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.presentationMode.start();
      });
      document.getElementById('mmm-btn-theme')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.openMobileThemeSheet();
      });
      document.getElementById('mmm-btn-about')?.addEventListener('click', () => {
        moreMenu.style.display = 'none';
        this.showAbout();
      });
    }

    // Sheet close & overlay dismiss
    const overlay = document.getElementById('mobile-sheet-overlay');
    const closeBtn = document.getElementById('mobile-sheet-close');
    if (overlay) overlay.onclick = () => this.closeMobileSheet();
    if (closeBtn) closeBtn.onclick = () => this.closeMobileSheet();

    // Bottom Navigation buttons
    document.getElementById('mb-btn-pages')?.addEventListener('click', () => this.openMobilePagesSheet());
    document.getElementById('mb-btn-add')?.addEventListener('click', () => this.openMobileAddSheet());
    document.getElementById('mb-btn-theme')?.addEventListener('click', () => this.openMobileThemeSheet());
    document.getElementById('mb-btn-layers')?.addEventListener('click', () => this.openMobileLayersSheet());
    document.getElementById('mb-btn-design')?.addEventListener('click', () => this.openMobilePropertiesSheet());

    // Selection changes for Mobile Quick Actions bar
    const canvas = this.canvasManager?.canvas;
    if (canvas) {
      const onSelectionChange = () => this.updateMobileQuickBar();
      canvas.on('selection:created', onSelectionChange);
      canvas.on('selection:updated', onSelectionChange);
      canvas.on('selection:cleared', () => {
        this.isMobileMultiSelect = false;
        onSelectionChange();
      });

      canvas.on('mouse:down:before', (opt) => {
        if (this.isMobileMultiSelect && opt.e && typeof window !== 'undefined' && window.innerWidth <= 768) {
          try {
            Object.defineProperty(opt.e, 'shiftKey', { get: () => true });
          } catch (err) {
            opt.e.shiftKey = true;
          }
        }
      });

      // Mobile double-tap on text object directly opens mobile text editor
      let lastTapTime = 0;
      canvas.on('mouse:down', (opt) => {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
          const now = Date.now();
          if (now - lastTapTime < 350) {
            const target = opt.target;
            if (target && (target.type === 'textbox' || target.type === 'i-text')) {
              this.openMobileTextEditor(target);
            }
          }
          lastTapTime = now;
        }
      });
    }
  }

  updateMobileQuickBar() {
    const quickBar = document.getElementById('mobile-quick-actions');
    if (!quickBar) return;
    const canvas = this.canvasManager?.canvas;
    const active = canvas?.getActiveObject();

    if (!active) {
      quickBar.classList.remove('visible');
      quickBar.innerHTML = '';
      return;
    }

    quickBar.innerHTML = '';

    const btnSelectMore = document.createElement('button');
    btnSelectMore.className = 'mobile-quick-btn' + (this.isMobileMultiSelect ? ' active' : '');
    if (this.isMobileMultiSelect) {
      btnSelectMore.style.background = 'var(--accent)';
      btnSelectMore.style.color = '#fff';
    }
    btnSelectMore.innerHTML = `${svg('CheckSquare', 14)} Select More`;
    btnSelectMore.onclick = () => {
      this.isMobileMultiSelect = !this.isMobileMultiSelect;
      this.updateMobileQuickBar();
    };
    quickBar.appendChild(btnSelectMore);

    const isText = active.type === 'textbox' || active.type === 'i-text';

    if (isText) {
      // Text quick actions: Edit Text, Font, Color, Size -, Size +, Duplicate, Delete, More
      const btnEdit = document.createElement('button');
      btnEdit.className = 'mobile-quick-btn';
      btnEdit.innerHTML = `${svg('PenTool', 14)} Edit`;
      btnEdit.onclick = () => this.openMobileTextEditor(active);
      quickBar.appendChild(btnEdit);

      const btnFont = document.createElement('button');
      btnFont.className = 'mobile-quick-btn';
      btnFont.innerHTML = `${svg('Type', 14)} Font`;
      btnFont.onclick = () => this.openMobileFontPicker(active);
      quickBar.appendChild(btnFont);

      const btnColor = document.createElement('button');
      btnColor.className = 'mobile-quick-btn';
      btnColor.innerHTML = `${svg('Palette', 14)} Color`;
      btnColor.onclick = () => this.openMobileColorPicker(active);
      quickBar.appendChild(btnColor);

      const btnMinus = document.createElement('button');
      btnMinus.className = 'mobile-quick-btn';
      btnMinus.innerHTML = svg('Minus', 13);
      btnMinus.onclick = () => {
        active.set('fontSize', Math.max(8, (active.fontSize || 40) - 2));
        if (active.initDimensions) active.initDimensions();
        if (active.setCoords) active.setCoords();
        canvas.requestRenderAll();
        this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      };
      quickBar.appendChild(btnMinus);

      const btnPlus = document.createElement('button');
      btnPlus.className = 'mobile-quick-btn';
      btnPlus.innerHTML = svg('Plus', 13);
      btnPlus.onclick = () => {
        active.set('fontSize', Math.min(300, (active.fontSize || 40) + 2));
        if (active.initDimensions) active.initDimensions();
        if (active.setCoords) active.setCoords();
        canvas.requestRenderAll();
        this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      };
      quickBar.appendChild(btnPlus);
    } else {
      // Shape / Object quick actions: Color, Photo (if shape/slot), Size -, Size +, Duplicate, Delete, More
      const btnColor = document.createElement('button');
      btnColor.className = 'mobile-quick-btn';
      btnColor.innerHTML = `${svg('Palette', 14)} Color`;
      btnColor.onclick = () => this.openMobileColorPicker(active);
      quickBar.appendChild(btnColor);

      const isIcon = Boolean(active._isIcon || active.name === 'Icon');
      const isShapeOrSlot = !isIcon && (
        ['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon'].includes(active.type) ||
        active.custom?.isPhotoPlaceholder || active.custom?.maskWrap ||
        (this.canvasManager && this.canvasManager._isPlaceholderShape(active))
      );

      if (isShapeOrSlot) {
        const btnPhoto = document.createElement('button');
        btnPhoto.className = 'mobile-quick-btn';
        btnPhoto.innerHTML = `${svg('ImagePlus', 14)} Photo`;
        btnPhoto.title = 'Add / Replace Photo';
        btnPhoto.onclick = async () => {
          const target = this.canvasManager?.findPlaceholderTarget(active) || { type: 'standalone', obj: active };
          await this.ops.promptUploadForPlaceholder(target);
          this.updateMobileQuickBar(this.canvasManager.canvas.getActiveObject());
        };
        quickBar.appendChild(btnPhoto);
      }

      if (active.clipPath) {
        const btnEditMask = document.createElement('button');
        btnEditMask.className = 'mobile-quick-btn';
        btnEditMask.innerHTML = `${svg('Scissors', 14)} Mask`;
        btnEditMask.title = 'Edit / Crop Photo in Mask';
        btnEditMask.onclick = () => this.ops.editClipMask();
        quickBar.appendChild(btnEditMask);
      }

      const btnMinus = document.createElement('button');
      btnMinus.className = 'mobile-quick-btn';
      btnMinus.innerHTML = svg('Minus', 13);
      btnMinus.onclick = () => {
        active.scale((active.scaleX || 1) * 0.92);
        if (active.setCoords) active.setCoords();
        canvas.requestRenderAll();
        this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      };
      quickBar.appendChild(btnMinus);

      const btnPlus = document.createElement('button');
      btnPlus.className = 'mobile-quick-btn';
      btnPlus.innerHTML = svg('Plus', 13);
      btnPlus.onclick = () => {
        active.scale((active.scaleX || 1) * 1.08);
        if (active.setCoords) active.setCoords();
        canvas.requestRenderAll();
        this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      };
      quickBar.appendChild(btnPlus);
    }

    const btnDup = document.createElement('button');
    if (active.type === 'activeselection' || active.type === 'activeSelection') {
      const btnGroup = document.createElement('button');
      btnGroup.className = 'mobile-quick-btn';
      btnGroup.innerHTML = `${svg('Group', 14)} Group`;
      btnGroup.title = 'Group';
      btnGroup.onclick = () => { this.ops.group(); this.updateMobileQuickBar(); };
      quickBar.appendChild(btnGroup);
    } else if (active.type === 'group') {
      const btnUngroup = document.createElement('button');
      btnUngroup.className = 'mobile-quick-btn';
      btnUngroup.innerHTML = `${svg('Ungroup', 14)} Ungroup`;
      btnUngroup.title = 'Ungroup';
      btnUngroup.onclick = () => { this.ops.ungroup(); this.updateMobileQuickBar(); };
      quickBar.appendChild(btnUngroup);
    }

    btnDup.className = 'mobile-quick-btn';
    btnDup.innerHTML = svg('Copy', 14);
    btnDup.title = 'Duplicate';
    btnDup.onclick = () => this.ops.duplicate();
    quickBar.appendChild(btnDup);

    const btnDel = document.createElement('button');
    btnDel.className = 'mobile-quick-btn';
    btnDel.innerHTML = svg('Trash2', 14);
    btnDel.style.color = 'var(--danger)';
    btnDel.title = 'Delete';
    btnDel.onclick = () => {
      if (this.ops && typeof this.ops.delete === 'function') {
        this.ops.delete();
      } else if (this.ops && typeof this.ops.deleteSelected === 'function') {
        this.ops.deleteSelected();
      }
      this.updateMobileQuickBar();
    };
    quickBar.appendChild(btnDel);

    const btnMore = document.createElement('button');
    btnMore.className = 'mobile-quick-btn';
    btnMore.innerHTML = `${svg('Sliders', 14)} More`;
    btnMore.onclick = () => this.openMobilePropertiesSheet();
    quickBar.appendChild(btnMore);

    quickBar.classList.add('visible');
  }

  openMobileTextEditor(textObj) {
    if (!textObj) return;
    const currentText = textObj.text || '';
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:14px;padding:4px 0;';
    container.innerHTML = `
      <textarea id="mobile-text-input" style="width:100%;min-height:120px;padding:12px;background:var(--bg-surface);border:1.5px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);font-size:16px;font-family:inherit;resize:vertical;outline:none;box-sizing:border-box;">${currentText}</textarea>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button class="btn btn-ghost" id="mte-btn-cancel" style="padding:9px 16px;">Cancel</button>
        <button class="btn btn-primary" id="mte-btn-save" style="padding:9px 20px;">Done</button>
      </div>
    `;

    this.openMobileSheet('Edit Text Content', container);

    setTimeout(() => {
      const input = document.getElementById('mobile-text-input');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 80);

    document.getElementById('mte-btn-cancel')?.addEventListener('click', () => {
      this.closeMobileSheet();
    });

    document.getElementById('mte-btn-save')?.addEventListener('click', () => {
      const input = document.getElementById('mobile-text-input');
      if (input) {
        textObj.set('text', input.value);
        if (textObj.initDimensions) textObj.initDimensions();
        if (textObj.setCoords) textObj.setCoords();
        this.canvasManager.canvas.requestRenderAll();
        this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
      this.closeMobileSheet();
    });
  }

  openMobileFontPicker(textObj) {
    if (!textObj) return;
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    const search = document.createElement('input');
    search.className = 'font-search';
    search.placeholder = 'Search fonts...';
    search.style.cssText = 'width:100%;margin:0;padding:10px 14px;font-size:14px;box-sizing:border-box;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);outline:none;';

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'panel-action-btn';
    uploadBtn.style.cssText = 'width:100%;justify-content:center;padding:10px;font-weight:600;font-size:13px;background:var(--bg-surface);border:1px solid var(--accent);color:var(--text-accent);border-radius:var(--radius-sm);cursor:pointer;';
    uploadBtn.innerHTML = `${svg('Upload', 15)} <span>Upload Custom Font (.ttf, .otf, .woff)</span>`;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ttf,.otf,.woff,.woff2';
    fileInput.style.display = 'none';

    uploadBtn.onclick = () => fileInput.click();
    fileInput.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const family = await uploadCustomFont(file);
        this.toast(`Font "${family}" uploaded`);
        textObj.set('fontFamily', family);
        if (textObj.initDimensions) textObj.initDimensions();
        if (textObj.setCoords) textObj.setCoords();
        this.canvasManager.canvas.requestRenderAll();
        this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        this.closeMobileSheet();
      } catch (err) {
        alert(err.message || 'Font upload failed');
      }
    };

    const list = document.createElement('div');
    list.style.cssText = 'max-height:55vh;overflow-y:auto;display:flex;flex-direction:column;gap:2px;-webkit-overflow-scrolling:touch;';

    const renderFonts = (filter = '') => {
      list.innerHTML = '';
      const q = filter.trim().toLowerCase();

      // Custom brand fonts
      const customMatches = CUSTOM_FONTS.filter(f => !q || f.family.toLowerCase().includes(q));
      if (customMatches.length > 0) {
        const catHead = document.createElement('div');
        catHead.className = 'font-cat';
        catHead.textContent = 'Custom Brand Fonts';
        catHead.style.cssText = 'font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);padding:8px 8px 3px;';
        list.appendChild(catHead);

        customMatches.forEach(f => {
          const row = document.createElement('div');
          row.className = 'font-row' + (textObj.fontFamily === f.family ? ' active' : '');
          row.style.cssText = 'padding:11px 12px;font-size:15px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;border-radius:var(--radius-sm);color:var(--text-primary);cursor:pointer;width:100%;text-align:left;';

          const nameSpan = document.createElement('span');
          nameSpan.style.fontFamily = `'${f.family}', sans-serif`;
          nameSpan.style.flex = '1';
          nameSpan.textContent = f.family;

          const badge = document.createElement('span');
          badge.style.cssText = 'font-size:9px;color:var(--text-accent);margin-right:8px;';
          badge.textContent = 'Custom';

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.style.cssText = 'background:none;border:none;color:var(--text-muted);padding:4px;cursor:pointer;';
          delBtn.innerHTML = svg('Trash2', 14);
          delBtn.onclick = (ev) => {
            ev.stopPropagation();
            deleteCustomFont(f.family);
            renderFonts(search.value);
          };

          row.appendChild(nameSpan);
          row.appendChild(badge);
          row.appendChild(delBtn);

          row.onclick = () => {
            textObj.set('fontFamily', f.family);
            if (textObj.initDimensions) textObj.initDimensions();
            if (textObj.setCoords) textObj.setCoords();
            this.canvasManager.canvas.requestRenderAll();
            this.historyManager.saveState();
            document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
            this.closeMobileSheet();
          };

          list.appendChild(row);
        });
      }

      // Google Fonts
      for (const cat of FONT_CATEGORIES) {
        const fams = GOOGLE_FONTS.filter(f => f.category === cat && (!q || f.family.toLowerCase().includes(q)));
        if (!fams.length) continue;
        const catHead = document.createElement('div');
        catHead.className = 'font-cat';
        catHead.textContent = cat;
        catHead.style.cssText = 'font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);padding:8px 8px 3px;';
        list.appendChild(catHead);

        fams.forEach(f => {
          loadFont(f.family);
          const row = document.createElement('button');
          row.className = 'font-row' + (textObj.fontFamily === f.family ? ' active' : '');
          row.style.cssText = 'padding:11px 12px;font-size:15px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;border-radius:var(--radius-sm);color:var(--text-primary);cursor:pointer;width:100%;text-align:left;';
          row.innerHTML = `
            <span style="font-family:'${f.family}', sans-serif;">${f.family}</span>
            <span style="font-size:9px;color:var(--text-muted);">${f.category}</span>
          `;
          row.onclick = () => {
            textObj.set('fontFamily', f.family);
            if (textObj.initDimensions) textObj.initDimensions();
            if (textObj.setCoords) textObj.setCoords();
            this.canvasManager.canvas.requestRenderAll();
            this.historyManager.saveState();
            document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
            this.closeMobileSheet();
          };
          list.appendChild(row);
        });
      }
    };

    search.addEventListener('input', (e) => renderFonts(e.target.value));
    renderFonts();

    container.appendChild(search);
    container.appendChild(uploadBtn);
    container.appendChild(fileInput);
    container.appendChild(list);

    this.openMobileSheet('Choose Font', container);
    setTimeout(() => search.focus(), 80);
  }

  recolorIcon(obj, color, saveHistory = true) {
    if (!obj) return;
    const walk = (o) => {
      if (o._objects && o._objects.length) {
        o._objects.forEach(walk);
      } else {
        let changed = false;
        if (o.stroke && o.stroke !== 'none' && o.stroke !== 'transparent') {
          o.set('stroke', color);
          changed = true;
        }
        if (o.fill && o.fill !== 'none' && o.fill !== 'transparent') {
          o.set('fill', color);
          changed = true;
        }
        if (!changed) {
          o.set('stroke', color);
        }
        o.dirty = true;
      }
    };
    walk(obj);
    obj.set('stroke', color);
    obj.dirty = true;
    this.canvasManager.canvas.requestRenderAll();
    if (saveHistory) {
      this.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  getIconColor(obj) {
    if (!obj) return '#0f172a';
    const collect = [];
    const walk = (o) => {
      if (o._objects && o._objects.length) o._objects.forEach(walk);
      else collect.push(o);
    };
    walk(obj);
    const found = collect.find(p => p.stroke && String(p.stroke).startsWith('#')) ||
                  collect.find(p => p.fill && String(p.fill).startsWith('#')) ||
                  collect.find(p => p.stroke && p.stroke !== 'none' && p.stroke !== 'transparent');
    if (found) {
      return String(found.stroke || found.fill);
    }
    return obj.stroke || obj.fill || '#0f172a';
  }

  openMobileColorPicker(obj) {
    if (!obj) return;
    const isText = obj.type === 'textbox' || obj.type === 'i-text';
    const isIcon = Boolean(
      obj._isIcon ||
      obj.name === 'Icon' ||
      (this.ops && this.ops.isIconSelection && this.ops.isIconSelection()) ||
      (obj.type === 'group' && !obj.custom?.maskWrap && !obj.custom?.isPhotoPlaceholder)
    );

    const prop = isText ? 'fill' : (obj.fill && obj.fill !== 'transparent' ? 'fill' : 'stroke');
    const currentColor = isIcon
      ? this.getIconColor(obj)
      : (obj.get(prop) || (isText ? '#18181b' : '#7b46f8'));

    const presets = [
      '#ffffff', '#f7f6f3', '#0f172a', '#18181b',
      '#7b46f8', '#9061f9', '#4f46e5', '#2563eb',
      '#059669', '#10b981', '#f59e0b', '#ef4444',
      '#ec4899', '#8b5cf6', '#64748b', '#000000'
    ];

    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:16px;padding:6px 0;';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(8, 1fr);gap:10px;';

    presets.forEach(hex => {
      const chip = document.createElement('button');
      chip.style.cssText = `
        width:100%;aspect-ratio:1;border-radius:8px;background:${hex};
        border:2px solid ${String(currentColor).toLowerCase() === hex.toLowerCase() ? 'var(--accent)' : 'rgba(255,255,255,0.15)'};
        cursor:pointer;padding:0;box-shadow:0 2px 6px rgba(0,0,0,0.2);
      `;
      chip.onclick = () => {
        if (isIcon) {
          this.recolorIcon(obj, hex, true);
        } else {
          obj.set(prop, hex);
          this.canvasManager.canvas.requestRenderAll();
          this.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        }
        this.closeMobileSheet();
      };
      grid.appendChild(chip);
    });

    const customRow = document.createElement('div');
    customRow.style.cssText = 'display:flex;align-items:center;gap:12px;padding:8px 0;';
    customRow.innerHTML = `
      <span style="font-size:13px;font-weight:600;color:var(--text-secondary);">Custom Color:</span>
      <input type="color" id="mobile-custom-color" value="${String(currentColor).startsWith('#') ? currentColor : '#7b46f8'}" style="width:50px;height:36px;border:none;border-radius:6px;cursor:pointer;background:transparent;">
    `;

    container.appendChild(grid);
    container.appendChild(customRow);

    const sheetTitle = isText ? 'Text Color' : (isIcon ? 'Icon Color' : 'Element Color');
    this.openMobileSheet(sheetTitle, container);

    setTimeout(() => {
      const colorInput = document.getElementById('mobile-custom-color');
      colorInput?.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (isIcon) {
          this.recolorIcon(obj, hex, false);
        } else {
          obj.set(prop, hex);
          this.canvasManager.canvas.requestRenderAll();
        }
      });
      colorInput?.addEventListener('change', (e) => {
        const hex = e.target.value;
        if (isIcon) {
          this.recolorIcon(obj, hex, true);
        } else {
          obj.set(prop, hex);
          this.canvasManager.canvas.requestRenderAll();
          this.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        }
      });
    }, 50);
  }

  addShapeToCenter(shapeId = 'rect') {
    const canvas = this.canvasManager.canvas;
    if (!canvas) return;
    const obj = createShape(shapeId);
    const pw = this.canvasManager.PAGE_W || 1920;
    const ph = this.canvasManager.PAGE_H || 1080;
    obj.set({
      left: pw / 2,
      top: ph / 2,
      originX: 'center',
      originY: 'center',
      selectable: true,
      evented: true
    });
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    this.toolManager.setTool('select');
    this.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
  }

  addTextToCenter(opt) {
    const canvas = this.canvasManager.canvas;
    if (!canvas) return;
    const pw = this.canvasManager.PAGE_W || 1920;
    const ph = this.canvasManager.PAGE_H || 1080;
    const isDark = (canvas.backgroundColor || '#ffffff') === '#0e0f12' || (canvas.backgroundColor || '#ffffff') === '#18181b';
    const fill = isDark ? '#ffffff' : '#18181b';

    const textObj = new fabric.Textbox(opt.text, {
      left: pw / 2,
      top: ph / 2,
      originX: 'center',
      originY: 'center',
      fontSize: opt.fontSize,
      fontWeight: opt.fontWeight,
      fontFamily: 'Inter',
      fill: fill,
      width: opt.fontSize > 40 ? 800 : 600,
      textAlign: 'center',
      selectable: true,
      evented: true
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
    this.toolManager.setTool('select');
    this.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
  }

  openMobileSheet(title, content) {
    const titleEl = document.getElementById('mobile-sheet-title');
    const contentEl = document.getElementById('mobile-sheet-content');
    const sheet = document.getElementById('mobile-bottom-sheet');
    const overlay = document.getElementById('mobile-sheet-overlay');
    if (!sheet || !contentEl) return;

    if (titleEl) titleEl.textContent = title;
    if (content !== contentEl) {
      contentEl.innerHTML = '';
      if (typeof content === 'string') {
        contentEl.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        contentEl.appendChild(content);
      }
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
    } else if (this._activeMobilePanel === 'photos') {
      const popover = document.getElementById('photos-popover');
      if (popover) this.panels.photos?.mount(popover);
    } else if (this._activeMobilePanel === 'icons') {
      const popover = document.getElementById('icons-popover');
      if (popover) this.panels.icons?.mount(popover);
    } else if (this._activeMobilePanel === 'elements') {
      const popover = document.getElementById('elements-popover');
      if (popover) this.panels.elements?.mount(popover);
    }
    this._activeMobilePanel = null;
  }

  openMobilePropertiesSheet() {
    this._activeMobilePanel = 'properties';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.properties) {
      contentEl.innerHTML = '';
      this.panels.properties.mount(contentEl);
    }
    this.openMobileSheet('Design & Properties', contentEl);
  }

  openMobileLayersSheet() {
    this._activeMobilePanel = 'layers';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.layers) {
      contentEl.innerHTML = '';
      this.panels.layers.mount(contentEl);
    }
    this.openMobileSheet('Layers', contentEl);
  }

  openMobilePagesSheet() {
    const pm = this.pageManager;
    if (!pm) return;
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

    // Top Prev / Next Navigation buttons
    if (pm.pages.length > 1) {
      const navRow = document.createElement('div');
      navRow.style.cssText = 'display:flex;gap:10px;align-items:center;';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn btn-ghost';
      prevBtn.style.cssText = 'flex:1;justify-content:center;font-size:12.5px;padding:9px;';
      prevBtn.innerHTML = `${svg('ChevronLeft', 15)} Prev Slide`;
      prevBtn.disabled = pm.currentIndex <= 0;
      prevBtn.onclick = async () => {
        if (pm.currentIndex > 0) {
          await pm.switchPage(pm.currentIndex - 1);
          this.refreshPageChrome();
          this.closeMobileSheet();
        }
      };

      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-ghost';
      nextBtn.style.cssText = 'flex:1;justify-content:center;font-size:12.5px;padding:9px;';
      nextBtn.innerHTML = `Next Slide ${svg('ChevronRight', 15)}`;
      nextBtn.disabled = pm.currentIndex >= pm.pages.length - 1;
      nextBtn.onclick = async () => {
        if (pm.currentIndex < pm.pages.length - 1) {
          await pm.switchPage(pm.currentIndex + 1);
          this.refreshPageChrome();
          this.closeMobileSheet();
        }
      };

      navRow.appendChild(prevBtn);
      navRow.appendChild(nextBtn);
      container.appendChild(navRow);
    }

    const strip = document.createElement('div');
    strip.className = 'mobile-pages-strip';

    pm.pages.forEach((page, idx) => {
      const card = document.createElement('div');
      card.className = 'mobile-page-thumb-card';
      const isActive = idx === pm.currentIndex;
      const thumbUrl = page.thumbnail || page.thumb;
      card.innerHTML = `
        <div class="mobile-page-thumb-box ${isActive ? 'active' : ''}">
          ${thumbUrl ? `<img src="${thumbUrl}" alt="" style="width:100%;height:100%;object-fit:cover;">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-weight:700;">${idx + 1}</div>`}
        </div>
        <div class="mobile-page-title">${idx + 1}. ${escapeHtml(page.title || 'Untitled')}</div>
      `;
      card.onclick = async () => {
        await pm.switchPage(idx);
        this.refreshPageChrome();
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
      this.refreshPageChrome();
      this.closeMobileSheet();
    };
    container.appendChild(addBtn);

    this.openMobileSheet('Slides / Pages (' + pm.pages.length + ')', container);
  }

  openMobileTextSubSheet() {
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:6px 0;';

    const textOptions = [
      {
        title: 'Add a heading',
        sub: '56px bold title text (sentuh kanvas)',
        fontSize: 56,
        fontWeight: 'bold',
        text: 'Heading',
        mode: 'text'
      },
      {
        title: 'Add a subheading',
        sub: '32px medium subtitle text (sentuh kanvas)',
        fontSize: 32,
        fontWeight: '600',
        text: 'Subheading',
        mode: 'text'
      },
      {
        title: 'Add body text',
        sub: '20px paragraph text (sentuh & tarik lebar di kanvas)',
        fontSize: 20,
        fontWeight: 'normal',
        text: 'Tap to write body text. Double-tap to edit on mobile.',
        mode: 'paragraph'
      }
    ];

    textOptions.forEach(opt => {
      const card = document.createElement('button');
      card.className = 'mobile-add-card';
      card.style.cssText = 'width:100%;padding:14px 16px;display:flex;flex-direction:row;align-items:center;justify-content:space-between;cursor:pointer;';
      card.innerHTML = `
        <div style="text-align:left;">
          <div style="font-size:16px;font-weight:${opt.fontWeight};color:var(--text-primary);margin-bottom:2px;">${opt.title}</div>
          <div style="font-size:11.5px;color:var(--text-secondary);">${opt.sub}</div>
        </div>
        <div style="color:var(--accent);display:flex;align-items:center;">${svg('Plus', 18)}</div>
      `;
      card.onclick = () => {
        this.closeMobileSheet();
        const textTool = this.toolManager.tools['text'];
        if (textTool) {
          textTool.mode = opt.mode;
        }
        this.toolManager.setTool('text');
        if (opt.mode === 'paragraph') {
          this.showMobileToolBanner('Sentuh & tarik di kanvas untuk mengatur lebar paragraf');
        } else {
          this.showMobileToolBanner(`Sentuh kanvas untuk menempatkan ${opt.title.toLowerCase()}`);
        }
      };
      container.appendChild(card);
    });

    this.openMobileSheet('Add Text', container);
  }

  openMobileAddSheet() {
    const container = document.createElement('div');
    container.className = 'mobile-add-grid';

    const items = [
      {
        icon: svg('Upload', 20),
        title: 'Upload Image',
        desc: 'From camera, gallery or files',
        action: async () => {
          this.closeMobileSheet();
          const file = await this.ops.promptUserForImage();
          if (file) {
            await this.canvasManager.importImageFile(file);
            this.toast('Image uploaded to canvas');
          }
        }
      },
      {
        icon: svg('Camera', 20),
        title: 'Stock Photos',
        desc: 'Unsplash HD stock library',
        action: () => {
          this.openMobilePhotosSheet();
        }
      },
      {
        icon: svg('Type', 20),
        title: 'Text',
        desc: 'Heading, subhead, paragraph',
        action: () => {
          this.openMobileTextSubSheet();
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
      },
      {
        icon: svg('PenTool', 20),
        title: 'Pen Tool',
        desc: 'Draw custom vector paths & bezier curves',
        action: () => {
          this.closeMobileSheet();
          this.toolManager.setTool('pen');
          this.toast('Pen Tool active — tap and drag to draw curves');
        }
      },
      {
        icon: svg('QrCode', 20),
        title: 'QR Code',
        desc: 'Generate QR code from URL or text',
        action: () => {
          this.closeMobileSheet();
          this.showQRCodeDialog();
        }
      },
      {
        icon: svg('Code', 20),
        title: 'Code Snippet',
        desc: 'macOS terminal code block with syntax highlight',
        action: () => {
          this.closeMobileSheet();
          this.panels.elements.insertCodeSnippet();
        }
      },
      {
        icon: svg('Palette', 20),
        title: 'Theme & Styles',
        desc: 'Global color palettes & tokens',
        action: () => {
          this.openMobileThemeSheet();
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

  openMobileThemeSheet() {
    this._activeMobilePanel = 'theme';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.theme) {
      contentEl.innerHTML = '';
      this.panels.theme.mount(contentEl);
    }
    this.openMobileSheet('Theme & Styles', contentEl);
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
      { id: 'hexagon', label: 'Polygon', icon: svg('Hexagon', 24) },
      { id: 'heart', label: 'Heart', icon: svg('Heart', 24) }
    ];

    shapes.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'mobile-add-card';
      btn.style.cssText = 'align-items:center;text-align:center;padding:14px 6px;cursor:pointer;';
      btn.innerHTML = `
        <div style="color:var(--text-primary);display:flex;align-items:center;justify-content:center;">${s.icon}</div>
        <div style="font-size:11.5px;font-weight:600;color:var(--text-secondary);margin-top:4px;">${s.label}</div>
      `;
      btn.onclick = () => {
        this.closeMobileSheet();
        this.toolManager.setShapeType(s.id);
        this.toolManager.setTool('shape');
        this.showMobileToolBanner(`Sentuh & tarik di kanvas untuk menggambar ${s.label}`);
      };
      container.appendChild(btn);
    });

    this.openMobileSheet('Choose Shape', container);
  }

  showMobileToolBanner(message) {
    if (typeof window === 'undefined' || window.innerWidth > 768) {
      this.toast(message);
      return;
    }
    let banner = document.getElementById('mobile-tool-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'mobile-tool-banner';
      banner.className = 'mobile-tool-banner';
      document.body.appendChild(banner);
    }
    banner.innerHTML = `
      <span class="mobile-tool-banner-text">${message}</span>
      <button class="mobile-tool-banner-cancel" id="mobile-tool-banner-cancel">Batal</button>
    `;
    banner.style.display = 'flex';
    document.getElementById('mobile-tool-banner-cancel')?.addEventListener('click', () => {
      this.toolManager.setTool('select');
      this.hideMobileToolBanner();
    });

    // Auto-hide when tool switches back to select
    const onToolChanged = (e) => {
      if (e.detail?.tool === 'select') {
        this.hideMobileToolBanner();
        document.removeEventListener('prosy:toolChanged', onToolChanged);
      }
    };
    document.addEventListener('prosy:toolChanged', onToolChanged);
  }

  hideMobileToolBanner() {
    const banner = document.getElementById('mobile-tool-banner');
    if (banner) banner.style.display = 'none';
  }

  openMobilePhotosSheet() {
    this._activeMobilePanel = 'photos';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.photos) {
      contentEl.innerHTML = '';
      this.panels.photos.mount(contentEl);
    }
    this.openMobileSheet('Stock Photos (Unsplash)', contentEl);
  }

  openMobileIconsSheet() {
    this._activeMobilePanel = 'icons';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.icons) {
      contentEl.innerHTML = '';
      this.panels.icons.mount(contentEl);
    }
    this.openMobileSheet('Icons & Logos', contentEl);
  }

  openMobileElementsSheet() {
    this._activeMobilePanel = 'elements';
    const contentEl = document.getElementById('mobile-sheet-content');
    if (contentEl && this.panels.elements) {
      contentEl.innerHTML = '';
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

  showAbout() {
    const html = `
      <div style="display:flex;flex-direction:column;gap:16px;font-size:13px;color:var(--text-secondary);max-height:68vh;overflow-y:auto;padding-right:4px;">
        <div style="display:flex;align-items:center;gap:14px;padding:12px 14px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:10px;">
          <img src="/favicon.svg" alt="Prosy" width="44" height="44" style="border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h3 style="margin:0;font-size:18px;font-weight:700;color:var(--text-primary);font-family:var(--font-headline);">Prosy</h3>
              <span style="font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:12px;background:var(--accent);color:#fff;">v2.4.1</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Modern Page-Based Visual Designer for Portfolios & Pitch Decks</div>
          </div>
        </div>

        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">✨ Highlight Features</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="padding:8px 12px;background:var(--bg-raised);border:1px solid var(--border-color);border-radius:8px;">
              <strong style="color:var(--text-primary);font-size:12.5px;">📐 Smart Guides & Equal Spacing (Figma-Style)</strong>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Pixel-perfect multi-alignment snapping and equidistant gap snapping with distance pill badges.</div>
            </div>
            <div style="padding:8px 12px;background:var(--bg-raised);border:1px solid var(--border-color);border-radius:8px;">
              <strong style="color:var(--text-primary);font-size:12.5px;">📄 Interactive Vector PDF & Clickable Links</strong>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Export with selectable, searchable, copy-pasteable text layers and clickable hyperlinks.</div>
            </div>
            <div style="padding:8px 12px;background:var(--bg-raised);border:1px solid var(--border-color);border-radius:8px;">
              <strong style="color:var(--text-primary);font-size:12.5px;">📱 QR Code Generator & Code Snippet Blocks</strong>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Pure JS vector QR code generation from links and macOS terminal code cards with syntax highlighting.</div>
            </div>
            <div style="padding:8px 12px;background:var(--bg-raised);border:1px solid var(--border-color);border-radius:8px;">
              <strong style="color:var(--text-primary);font-size:12.5px;">🎨 Global Design System & Bezier Pen Tool</strong>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Curated color palettes with instant multi-slide syncing and Figma-style vector path drawing.</div>
            </div>
            <div style="padding:8px 12px;background:var(--bg-raised);border:1px solid var(--border-color);border-radius:8px;">
              <strong style="color:var(--text-primary);font-size:12.5px;">📄 100% Native Editable PPTX Export</strong>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Decompose canvas layouts into genuine PowerPoint shapes and textboxes for Keynote and PowerPoint.</div>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border-color);font-size:12px;">
          <span>Open Source on <a href="https://github.com/keliksa30/prosy" target="_blank" rel="noreferrer" style="color:var(--text-accent);text-decoration:none;font-weight:600;">GitHub</a></span>
          <span style="color:var(--text-muted);">Crafted with ❤️ by keliksa30</span>
        </div>
      </div>
    `;
    const m = new Modal('about-modal', 'About Prosy', html);
    m.render();
    m.open();
  }

  showQRCodeDialog(initialUrl = '') {
    const modalId = 'qr-code-dialog';
    const activePrimary = this.themeManager?.tokens?.primary || '#007AFF';
    let currentColor = '#000000';
    let currentBg = '#ffffff';

    const html = `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:420px;margin:0 auto;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text-secondary);">Target URL or Text</label>
          <input type="text" id="qr-modal-url" placeholder="https://myportfolio.com" value="${escapeHtml(initialUrl || 'https://')}"
            style="width:100%;box-sizing:border-box;background:var(--bg-surface);border:1.5px solid var(--border-color);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--text-primary);outline:none;font-family:var(--font-mono, monospace);">
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;margin-bottom:6px;color:var(--text-secondary);">QR Color</label>
            <div style="display:flex;gap:6px;align-items:center;">
              <input type="color" id="qr-modal-color" value="${currentColor}" style="width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;background:none;">
              <button class="btn btn-ghost" id="qr-modal-theme-color" style="font-size:11px;padding:6px 10px;">✦ Theme</button>
            </div>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;margin-bottom:6px;color:var(--text-secondary);">Background</label>
            <div style="display:flex;gap:6px;align-items:center;">
              <input type="color" id="qr-modal-bg" value="${currentBg}" style="width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;background:none;">
              <button class="btn btn-ghost" id="qr-modal-bg-transparent" style="font-size:11px;padding:6px 10px;">None</button>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:center;align-items:center;padding:16px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:10px;">
          <div id="qr-modal-preview" style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;"></div>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px;">
          <button class="btn btn-ghost" id="qr-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="qr-modal-insert" style="font-weight:600;">
            ${svg('QrCode', 14)} Insert to Slide
          </button>
        </div>
      </div>
    `;

    const m = new Modal(modalId, '✦ QR Code Generator', html);
    m.render();
    m.open();

    const inputUrl = document.getElementById('qr-modal-url');
    const inputColor = document.getElementById('qr-modal-color');
    const inputBg = document.getElementById('qr-modal-bg');
    const previewEl = document.getElementById('qr-modal-preview');

    const updatePreview = async () => {
      const val = inputUrl ? inputUrl.value.trim() || 'https://prosy.design' : 'https://prosy.design';
      try {
        const svgCode = await QRCodeGenerator.generateSVG(val, {
          size: 180,
          color: currentColor,
          background: currentBg
        });
        if (previewEl) previewEl.innerHTML = svgCode;
      } catch (e) {
        console.error('QR preview error', e);
      }
    };

    if (inputUrl) inputUrl.addEventListener('input', updatePreview);
    if (inputColor) inputColor.addEventListener('input', (e) => {
      currentColor = e.target.value;
      updatePreview();
    });
    if (inputBg) inputBg.addEventListener('input', (e) => {
      currentBg = e.target.value;
      updatePreview();
    });

    document.getElementById('qr-modal-theme-color')?.addEventListener('click', () => {
      currentColor = activePrimary;
      if (inputColor) inputColor.value = activePrimary;
      updatePreview();
    });

    document.getElementById('qr-modal-bg-transparent')?.addEventListener('click', () => {
      currentBg = 'transparent';
      updatePreview();
    });

    updatePreview();

    const cancelBtn = document.getElementById('qr-modal-cancel');
    if (cancelBtn) cancelBtn.onclick = () => m.close();
    const insertBtn = document.getElementById('qr-modal-insert');
    if (insertBtn) insertBtn.onclick = async () => {
      const text = inputUrl ? inputUrl.value.trim() : '';
      if (!text) {
        this.toast('Please enter a URL or text');
        return;
      }
      try {
        const canvas = this.canvasManager.getCanvas();
        const vp = this.canvasManager.getViewport();
        const pan = canvas ? canvas.viewportTransform : [1, 0, 0, 1, 0, 0];
        const zoom = this.canvasManager.getZoom();
        const pw = this.canvasManager.PAGE_W || 1920;
        const ph = this.canvasManager.PAGE_H || 1080;
        const size = 200;

        let left = Math.round((pw - size) / 2);
        let top = Math.round((ph - size) / 2);
        if (vp && pan && zoom) {
          const vpLeft = (-pan[4] + vp.offsetWidth / 2) / zoom - size / 2;
          const vpTop = (-pan[5] + vp.offsetHeight / 2) / zoom - size / 2;
          if (vpLeft >= 40 && vpLeft <= pw - size - 40) {
            left = Math.round(vpLeft);
          }
          if (vpTop >= 40 && vpTop <= ph - size - 40) {
            top = Math.round(vpTop);
          }
        }

        const qrImg = await QRCodeGenerator.createFabricQR(text, {
          size,
          color: currentColor,
          background: currentBg,
          left: Math.round(left),
          top: Math.round(top)
        });

        canvas.add(qrImg);
        canvas.setActiveObject(qrImg);
        canvas.requestRenderAll();
        if (this.historyManager) this.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        this.toast('QR Code added to slide');
        m.close();
      } catch (err) {
        console.error('Failed to create QR Code', err);
        this.toast('Failed to generate QR Code', true);
      }
    };
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
