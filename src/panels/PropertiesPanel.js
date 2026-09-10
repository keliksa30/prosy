import * as fabric from 'fabric';
import { svg } from '../ui/icons.js';
import {
  scrub, valueRow, slider, colorControl, section, iconBtn, segmented
} from '../ui/controls.js';
import {
  GOOGLE_FONTS, FONT_CATEGORIES, CUSTOM_FONTS, uploadCustomFont, deleteCustomFont,
  fontCategory, loadFont, preloadFontCatalog
} from '../core/fonts.js';
import { SHAPE_DEFS } from '../shapes/defs.js';
import { createCodeSnippetGroup, CODE_LANGUAGES, CODE_THEMES } from '../tools/CodeSnippetBlock.js';
import { QRCodeGenerator } from '../tools/QRCodeGenerator.js';
import { Modal } from '../ui/Modal.js';
import { applyBlurEffect, applyGlowEffect } from '../core/EffectsRenderer.js';
import { getCornerRadii } from '../core/RadiusControl.js';

const BG_PRESETS = [
  ['#ffffff', 'White'], ['#f7f6f3', 'Paper'], ['#0f172a', 'Ink'], ['#18181b', 'Charcoal'],
  ['#1e1b4b', 'Indigo'], ['#064e3b', 'Forest'], ['#7b46f8', 'Prosy'], ['#f59e0b', 'Amber'],
  ['#f8fafc', 'Cloud'], ['#2e1065', 'Violet'], ['#4c0519', 'Wine'], ['#e2e8f0', 'Mist']
];

const FILL_DEFAULTS = {
  rect: '#7b46f8', rounded: '#7b46f8', pill: '#0f172a', ellipse: '#7b46f8',
  triangle: '#7b46f8', path: '#7b46f8', line: '#334155'
};

export class PropertiesPanel {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvasManager.getCanvas();
    this.ops = app.ops;
    this.host = null;
    this._lastRender = 0;
    this.fontPickerOpen = false;

    this.handleSelection = () => {
      if (!this.host) return;
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      const isMobileHost = this.host.id === 'mobile-sheet-content' || isMobile;
      if (!isMobileHost && !this.host.offsetParent) return; // visible tab only on desktop
      this._throttledRender();
    };
    this._onObjectEdited = (e) => {
      // If the edit came from this panel's own slider / direct input,
      // skip rebuilding the DOM so slider focus, dragging, and layout don't flicker
      if (e?.detail?.source === 'properties') return;
      this._throttledRender();
    };
    this._onBg = () => { if (!this.canvas.getActiveObjects().length) this._throttledRender(); };

    this.canvas.on('selection:created', this.handleSelection);
    this.canvas.on('selection:updated', this.handleSelection);
    this.canvas.on('selection:cleared', this.handleSelection);
    document.addEventListener('prosy:objectEdited', this._onObjectEdited);
    document.addEventListener('prosy:canvasBgChanged', this._onBg);
    document.addEventListener('prosy:pageSwitched', () => this._throttledRender());
  }

  _getScrollInfo() {
    if (!this.host) return { host: 0, inner: 0 };
    const inner = this.host.querySelector('.panel-scroll');
    return {
      host: this.host.scrollTop || 0,
      inner: inner ? inner.scrollTop : 0
    };
  }

  _restoreScrollInfo(info) {
    if (!this.host || !info) return;
    const apply = () => {
      if (info.host > 0 && this.host) this.host.scrollTop = info.host;
      const inner = this.host?.querySelector('.panel-scroll');
      if (info.inner > 0 && inner) inner.scrollTop = info.inner;
    };
    apply();
    requestAnimationFrame(apply);
  }

  _getTargetKey() {
    const single = this.single;
    if (single) return single.id || single;
    if (this.activeObjs.length > 1) return 'multi';
    return 'page';
  }

  _throttledRender() {
    const now = Date.now();
    if (now - this._lastRender < 40) {
      clearTimeout(this._t);
      this._t = setTimeout(() => this.render(), 40);
    } else {
      this._lastRender = now;
      this.render();
    }
  }

  mount(host) {
    this.host = host;
    this.render();
  }

  /* ------------------------------------------------------------------ */

  get activeObjs() { return this.canvas.getActiveObjects(); }

  get single() {
    const objs = this.activeObjs;
    return objs.length === 1 ? objs[0] : null;
  }

  render() {
    if (!this.host) return;

    // Capture current scroll positions before DOM re-creation
    const scrollInfo = this._getScrollInfo();
    const targetKey = this._getTargetKey();
    const isSameTarget = this._lastTargetKey === targetKey;
    this._lastTargetKey = targetKey;

    const single = this.single;
    if (!single) {
      if (this.activeObjs.length > 1) this.renderMulti();
      else this.renderPageSettings();
    } else {
      this.renderObject(single);
    }

    // Seamlessly restore scroll position if inspecting the same element/page
    if (isSameTarget) {
      this._restoreScrollInfo(scrollInfo);
    }
  }

  /* ====================== helpers ======================= */

  _commitLive(obj, props, { history = true } = {}) {
    obj.set(props);
    if (obj.setCoords) obj.setCoords();
    this.canvas.requestRenderAll();
    if (history) this.app.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
  }

  _row(label, control) {
    return valueRow(label, control);
  }

  _section(title, body, actions = null) {
    return section(title, body, { actions });
  }

  /** Size value used by W/H inputs, respecting non-uniform scale */
  _sizeX(o) { return o.width * (o.scaleX || 1); }
  _sizeY(o) { return o.height * (o.scaleY || 1); }

  /* ====================== PAGE SETTINGS ======================= */

  renderPageSettings() {
    const host = this.host;
    host.innerHTML = '';
    const pm = this.app.pageManager;
    const cm = this.app.canvasManager;
    const page = pm.getCurrentPage();
    const bg = cm.getBackgroundColor();

    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = `
      <div>
        <div class="panel-head-title">Page settings</div>
        <div class="panel-head-sub">1920 × 1080</div>
      </div>`;
    host.appendChild(head);

    // --- page name ---
    const nameBox = document.createElement('div');
    nameBox.className = 'page-name-row';
    const nameInput = document.createElement('input');
    nameInput.className = 'page-name-input';
    nameInput.value = page ? page.title : '';
    nameInput.placeholder = 'Page name';
    nameInput.addEventListener('change', () => {
      if (page) pm.renamePage(pm.currentIndex, nameInput.value);
      nameInput.value = page ? page.title : '';
    });
    const fileIc = document.createElement('span');
    fileIc.style.cssText = 'display:inline-flex;flex-shrink:0;';
    fileIc.innerHTML = svg('FileText', 14);
    nameBox.appendChild(fileIc);
    nameBox.appendChild(nameInput);
    host.appendChild(nameBox);

    // --- background ---
    const bgCard = this._section('Background', (() => {
      const body = document.createElement('div');
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      body.style.gap = '10px';

      const presets = document.createElement('div');
      presets.className = 'swatches';
      BG_PRESETS.forEach(([c, n]) => {
        const chip = document.createElement('button');
        chip.className = 'swatch' + (bg.toLowerCase() === c ? ' active' : '');
        chip.style.background = c;
        chip.title = n;
        chip.addEventListener('click', () => cm.setBackgroundColor(c));
        presets.appendChild(chip);
      });
      body.appendChild(presets);

      const colorRow = document.createElement('div');
      colorRow.className = 'bg-color-row';
      const cc = colorControl({
        value: bg,
        onInput: (c) => cm.setBackgroundColor(c),
        onChange: (c) => { cm.setBackgroundColor(c); this.app.pageManager.saveCurrentPage(); }
      });
      cc.style.flex = '1';
      colorRow.appendChild(cc);
      body.appendChild(colorRow);
      return body;
    })());
    host.appendChild(bgCard);

    // --- page actions ---
    const pageActions = document.createElement('div');
    pageActions.className = 'page-actions';
    const mk = (icon, label, fn, danger = false) => {
      const b = document.createElement('button');
      b.className = 'panel-action-btn' + (danger ? ' danger' : '');
      b.innerHTML = svg(icon, 15) + '<span>' + label + '</span>';
      b.addEventListener('click', fn);
      pageActions.appendChild(b);
    };
    mk('FilePlus2', 'Add page', () => this.app.ops.addPageAfterCurrent());
    mk('CopyPlus', 'Duplicate page', () => pm.duplicatePage(pm.currentIndex));
    mk('LayoutTemplate', 'Template…', () => this.app.templateChooser.show({ mode: 'page', pageIndex: pm.currentIndex }));
    mk('ChevronUp', 'Move up', () => pm.movePage(pm.currentIndex, -1));
    mk('ChevronDown', 'Move down', () => pm.movePage(pm.currentIndex, 1));
    mk('Trash2', 'Delete page', () => pm.deletePage(pm.currentIndex), true);
    host.appendChild(pageActions);

    // --- quick tips ---
    const tip = document.createElement('div');
    tip.className = 'panel-tip';
    tip.innerHTML = `<strong>Quick start</strong>
      <div>Double-click text on the page to edit it. Drag any object and it will snap to guides. Right-click a page or object for more actions.</div>`;
    host.appendChild(tip);
  }

  /* ====================== OBJECT (single) ======================= */

  renderObject(obj) {
    const host = this.host;
    host.innerHTML = '';
    const typeLabel = this._typeLabel(obj);
    const isIcon = Boolean(obj._isIcon || obj.name === 'Icon' || this.ops.isIconSelection() || (obj.type === 'group' && this._looksIconLike(obj)));

    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        <span class="panel-typeic">${svg(this._typeIcon(obj), 15)}</span>
        <span class="panel-head-title" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(obj.name || typeLabel)}</span>
      </div>
      <button class="icobtn" id="props-deselect" title="Deselect (Esc)">${svg('X', 14)}</button>`;
    head.querySelector('#props-deselect').addEventListener('click', () => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    });
    host.appendChild(head);

    const scroll = document.createElement('div');
    scroll.className = 'panel-scroll';
    host.appendChild(scroll);

    // ---------- Transform ----------
    scroll.appendChild(this._transformSection(obj));

    // ---------- Type-specific ----------
    const t = obj.type;
    if (t === 'i-text' || t === 'text' || t === 'textbox' || (t === 'group' && obj.text !== undefined)) {
      scroll.appendChild(this._textSection(obj));
    }
    const fillable = this._isFillable(obj);
    if (fillable && !isIcon) {
      scroll.appendChild(this._fillSection(obj));
    }
    if (isIcon) {
      scroll.appendChild(this._iconSection(obj));
    }
    if (obj.stroke !== undefined && !isIcon) {
      scroll.appendChild(this._strokeSection(obj));
    }
    if (obj.type === 'rect' && !isIcon) {
      scroll.appendChild(this._radiusSection(obj));
    }
    const cm = this.app.canvasManager;
    const isShape = ['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon'].includes(obj.type) && !isIcon;
    const isPlaceholder = isShape || obj.custom?.isPhotoPlaceholder || obj.custom?.maskWrap || (cm && cm._isPlaceholderShape(obj));
    // Show photo slot only if NOT already clipped (unmask section handles replace for clipped objects)
    if (isPlaceholder && obj.type !== 'image' && !isIcon && !obj.clipPath) {
      scroll.appendChild(this._photoPlaceholderSection(obj));
    }
    if (obj.type === 'image') {
      scroll.appendChild(this._imageSection(obj));
    }
    if (obj.clipPath) {
      scroll.appendChild(this._unmaskSection(obj));
    }
    if (obj.isCodeSnippet) {
      scroll.appendChild(this._codeSnippetSection(obj));
    }
    if (obj.isQRCode) {
      scroll.appendChild(this._qrCodeSection(obj));
    }
    scroll.appendChild(this._hyperlinkSection(obj));
    scroll.appendChild(this._appearanceSection(obj));
    scroll.appendChild(this._glowSection(obj));
    scroll.appendChild(this._shadowSection(obj));
    scroll.appendChild(this._arrangeSection(obj));
    scroll.appendChild(this._dangerSection(obj));
  }

  _maskable(o) {
    return o.type === 'image' || (o.type !== 'group' && o.type !== 'line' && o.fill !== undefined && o.type !== 'i-text');
  }

  /** Clip a selected image/shape inside another shape (clipPath mask).
   *  Images are wrapped into a group first — fabric v7 ignores clipPath
   *  on bare FabricImage, clipping a Group works. */
  async _applyClipMask(obj, shapeKey) {
    const def = SHAPE_DEFS[shapeKey] || SHAPE_DEFS.ellipse;
    const lw = Math.max(1, obj.width);   // local (pre-scale) size
    const lh = Math.max(1, obj.height);
    const canvas = this.canvas;

    let host = obj;
    let wrapped = false;
    if (obj.type === 'image') {
      canvas.discardActiveObject();
      host = new fabric.Group([obj]);
      canvas.remove(obj);
      host.set({ name: 'Masked image', custom: { maskWrap: 'single' } });
      canvas.add(host);
      wrapped = true;
    }

    let mask;
    const minL = Math.min(lw, lh);
    if (def.key === 'rect') mask = new fabric.Rect({ width: lw, height: lh, rx: 0, ry: 0, fill: '#000' });
    else if (def.key === 'rounded' || def.key === 'pill') mask = new fabric.Rect({ width: lw, height: lh, rx: minL * (def.key === 'pill' ? 0.5 : 0.18), ry: minL * (def.key === 'pill' ? 0.5 : 0.18), fill: '#000' });
    else if (def.key === 'ellipse') mask = new fabric.Ellipse({ rx: lw / 2, ry: lh / 2, fill: '#000' });
    else {
      const tpl = def.create();
      const bw = def.baseW || 100, bh = def.baseH || 100;
      const s = Math.max(lw / bw, lh / bh) * 1.15;
      tpl.set({ scaleX: s, scaleY: s, left: 0, top: 0, originX: 'left', originY: 'top', fill: '#000', strokeWidth: 0 });
      mask = tpl;
    }
    // Anchor: group hosts are centered → offset by half size; direct
    // hosts use top-left origin (left/top 0 covers the whole object).
    // fabric.Group v7 centres children by default, so wrapped images
    // get originX/Y 'center' with translate = 0 → the clip must also
    // be centred.
    const offX = wrapped ? -lw / 2 : 0;
    const offY = wrapped ? -lh / 2 : 0;
    mask.set({ originX: 'left', originY: 'top', left: offX, top: offY, absolutePositioned: false });

    host.set('clipPath', mask);
    // Preserve mask data for release/replace
    host.set('custom', {
      ...(host.custom || {}),
      _maskData: mask.toObject(['custom']),
      isPhotoPlaceholder: host.custom?.isPhotoPlaceholder || false
    });
    host.setCoords();
    canvas.discardActiveObject();
    canvas.setActiveObject(host);
    canvas.requestRenderAll();
    this.app.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    this.render();
  }

  _shapeDefs() {
    // (kept for API symmetry; masks are synchronous now)
    return Promise.resolve({ SHAPE_DEFS });
  }

  _maskSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const keys = ['rect', 'rounded', 'pill', 'ellipse', 'triangle', 'diamond', 'pentagon', 'hexagon', 'star', 'heart', 'arrowRight'];
    const grid = document.createElement('div');
    grid.className = 'mask-grid';
    keys.forEach(k => {
      const def = SHAPE_DEFS[k];
      const b = document.createElement('button');
      b.className = 'mask-chip';
      b.title = def.name;
      b.innerHTML = svg(def.icon, 16);
      b.addEventListener('click', () => this._applyClipMask(obj, k));
      grid.appendChild(b);
    });
    const info = document.createElement('div');
    info.className = 'panel-note';
    info.textContent = 'Clip this ' + (obj.type === 'image' ? 'image' : 'shape') + ' into a mask shape.';
    body.appendChild(info);
    body.appendChild(grid);
    const remove = document.createElement('button');
    remove.className = 'btn btn-ghost';
    remove.style.fontSize = '12px';
    remove.innerHTML = svg('ImageOff', 14) + 'Remove mask';
    remove.addEventListener('click', () => {
      this.app.ops.releaseClipMask();
      this.render();
    });
    body.appendChild(remove);

    // note about re-editing
    const tip = document.createElement('div');
    tip.className = 'panel-note';
    tip.textContent = 'Move/resize the object and the mask follows. Pick "Remove mask" to go back.';
    body.appendChild(tip);

    return this._section('Mask', body);
  }

  _unmaskSection(obj) {
    const body = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;gap:8px;overflow:hidden;';

    // Replace Photo button for masked images
    const isMaskedImage = obj.type === 'group' && obj.custom?.maskWrap && obj._objects?.some(o => o.type === 'image');
    if (isMaskedImage) {
      const replaceBtn = document.createElement('button');
      replaceBtn.className = 'btn btn-primary';
      replaceBtn.style.cssText = 'width:100%;justify-content:center;font-size:12px;box-sizing:border-box;';
      replaceBtn.innerHTML = `${svg('ImagePlus', 15)} Replace Photo…`;
      replaceBtn.addEventListener('click', async () => {
        const file = await this.app.objectOps.promptUserForImage();
        if (!file) return;
        await this.app.objectOps.replaceClipMaskImage(obj, file);
        this.render();
      });
      body.appendChild(replaceBtn);
    }

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;';
    const remove = document.createElement('button');
    remove.className = 'btn btn-ghost';
    remove.style.cssText = 'flex:1;min-width:0;font-size:11px;padding:6px 8px;overflow:hidden;white-space:nowrap;';
    remove.innerHTML = svg('ImageOff', 13) + ' Remove';
    remove.title = 'Remove clipping mask';
    remove.addEventListener('click', () => {
      this.app.ops.releaseClipMask();
      this.render();
    });
    const edit = document.createElement('button');
    edit.className = 'btn btn-ghost';
    edit.style.cssText = 'flex:1;min-width:0;font-size:11px;padding:6px 8px;overflow:hidden;white-space:nowrap;';
    edit.innerHTML = svg('MousePointerClick', 13) + ' Edit';
    edit.title = 'Edit mask contents';
    edit.addEventListener('click', () => {
      this.app.ops.editClipMask();
    });
    row.appendChild(remove);
    row.appendChild(edit);
    body.appendChild(row);
    return this._section('Mask', body);
  }

  _typeLabel(o) {
    if (o.custom && o.custom.shapeLabel) return o.custom.shapeLabel;
    if (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') return 'Text';
    if (o.type === 'image') return 'Image';
    if (o.type === 'group') {
      if (o._isIcon || o.name === 'Icon') return 'Icon';
      const inner = o._objects || [];
      if (inner.length && inner.every(p => p.stroke && (!p.fill || p.fill === '' || p.fill === 'transparent'))) return 'Icon';
      return 'Group';
    }
    const map = { rect: 'Rectangle', circle: 'Ellipse', ellipse: 'Ellipse', triangle: 'Triangle', line: 'Line', path: 'Shape' };
    return map[o.type] || 'Object';
  }

  _typeIcon(o) {
    if (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') return 'Type';
    if (o.type === 'image') return 'Image';
    if (o.type === 'group') return this._typeLabel(o) === 'Icon' ? 'Shapes' : 'Group';
    if (o.type === 'line') return 'Minus';
    return 'Shapes';
  }

  _looksIconLike(g) {
    if (!g) return false;
    if (g._isIcon || g.name === 'Icon') return true;
    if (g.type !== 'group' || !g._objects || !g._objects.length) return false;
    if (g.custom?.shapeKey || g.custom?.isPhotoPlaceholder || g.custom?.maskWrap) return false;
    const leaves = [];
    const walk = (o) => { if (o._objects) o._objects.forEach(walk); else leaves.push(o); };
    walk(g);
    if (!leaves.length) return false;
    return leaves.every(p => p.stroke && (!p.fill || p.fill === '' || p.fill === 'none' || p.fill === 'transparent'));
  }

  _isFillable(o) {
    if (o.type === 'line') return false;
    if (o.type === 'image' || o.type === 'group') return false;
    if (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') return true; // text supports gradient fills too
    return o.fill !== undefined && o.type !== 'path-group';
  }

  /* ---------------- transform ---------------- */

  _transformSection(obj) {
    const cm = this.app.canvasManager;
    const body = document.createElement('div');
    body.className = 'prop-grid2';

    const mkScrub = (key, value, min, max, suffix = '') => scrub({
      value, min, max, step: 1, suffix,
      onInput: (v) => { obj.set(key, v); this.canvas.requestRenderAll(); },
      onChange: (v) => this._commitLive(obj, { [key]: v })
    });

    // W/H on a possibly-scaled object must adjust scaleX/scaleY so the
    // visual size matches the entered value. For textboxes, width changes the wrap box.
    const makeSizeScrub = (axis) => {
      const visual = axis === 'x' ? this._sizeX(obj) : this._sizeY(obj);
      return scrub({
        value: Math.round(visual), min: 1, max: 20000, step: 1, suffix: '',
        onInput: (v) => {
          if (axis === 'x') {
            if (obj.type === 'textbox') {
              obj.set({ width: v, scaleX: 1 });
            } else {
              obj.set('scaleX', obj.width > 0 ? v / obj.width : 1);
            }
          } else {
            obj.set('scaleY', obj.height > 0 ? v / obj.height : 1);
          }
          this.canvas.requestRenderAll();
        },
        onChange: (v) => {
          if (axis === 'x') {
            if (obj.type === 'textbox') {
              obj.set({ width: v, scaleX: 1 });
            } else {
              obj.set('scaleX', obj.width > 0 ? v / obj.width : 1);
            }
          } else {
            obj.set('scaleY', obj.height > 0 ? v / obj.height : 1);
          }
          this._commitLive(obj, {});
        }
      });
    };

    const labelWrap = (text, control, col = 2) => {
      const wrap = document.createElement('div');
      wrap.className = col === 2 ? 'prop-cell' : 'prop-cell span2';
      const lbl = document.createElement('span');
      lbl.className = 'prop-cell-label';
      lbl.textContent = text;
      wrap.appendChild(lbl);
      wrap.appendChild(control);
      return wrap;
    };

    const x = mkScrub('left', Math.round(obj.left), -10000, 20000, '');
    const y = mkScrub('top', Math.round(obj.top), -10000, 20000, '');
    const w = makeSizeScrub('x');
    const h = makeSizeScrub('y');
    const rot = mkScrub('angle', Math.round(obj.angle || 0), -360, 360, '°');

    body.appendChild(labelWrap('X', x));
    body.appendChild(labelWrap('Y', y));
    body.appendChild(labelWrap('W', w));
    body.appendChild(labelWrap('H', h));
    const rotCell = document.createElement('div');
    rotCell.className = 'prop-cell span2';
    rotCell.appendChild(Object.assign(document.createElement('span'), { className: 'prop-cell-label', textContent: 'Rotate' }));
    const rotRow = document.createElement('div');
    rotRow.className = 'inline-row';
    rotRow.style.width = '100%';
    rot.style.flex = '1';
    rot.style.minWidth = '0';
    rotRow.appendChild(rot);
    const b90l = iconBtn('RotateCcw', { title: 'Rotate left 90°', size: 14, onClick: () => { obj.rotate((obj.angle || 0) - 90); this._commitLive(obj, {}); } });
    const b90r = iconBtn('RotateCw', { title: 'Rotate right 90°', size: 14, onClick: () => { obj.rotate((obj.angle || 0) + 90); this._commitLive(obj, {}); } });
    b90l.style.flex = '0 0 28px';
    b90r.style.flex = '0 0 28px';
    rotRow.appendChild(b90l);
    rotRow.appendChild(b90r);
    rotCell.appendChild(rotRow);
    body.appendChild(rotCell);

    // flip + lock row
    const actRow = document.createElement('div');
    actRow.className = 'inline-row';
    actRow.style.gap = '6px';
    const fl = iconBtn('FlipHorizontal2', { title: 'Flip horizontally (Shift+H)', size: 15, onClick: () => this.ops.flip('x') });
    const fv = iconBtn('FlipVertical2', { title: 'Flip vertically (Shift+V)', size: 15, onClick: () => this.ops.flip('y') });
    const lk = iconBtn(obj._userLocked ? 'Lock' : 'LockOpen', { title: obj._userLocked ? 'Unlock layer' : 'Lock layer', size: 14, onClick: (b) => { this.ops.setLocked(!obj._userLocked); } });
    const reset = iconBtn('LocateFixed', { title: 'Center on page', size: 15, onClick: () => {
      obj.set({ left: cm.PAGE_W / 2 - this._sizeX(obj) / 2, top: cm.PAGE_H / 2 - this._sizeY(obj) / 2 });
      this._commitLive(obj, {});
    } });
    actRow.append(fl, fv, lk, reset);
    const cell = document.createElement('div');
    cell.className = 'prop-cell span2';
    cell.appendChild(Object.assign(document.createElement('span'), { className: 'prop-cell-label', textContent: 'Arrange & flip' }));
    cell.appendChild(actRow);
    body.appendChild(cell);

    return this._section('Transform', body);
  }

  /* ---------------- typography ---------------- */

  _textSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';

    // font picker (custom, searchable)
    const fp = document.createElement('button');
    fp.className = 'font-picker-btn';
    const fpLabel = document.createElement('span');
    fpLabel.textContent = obj.fontFamily || 'Inter';
    fpLabel.style.fontFamily = `"${obj.fontFamily}", sans-serif`;
    fp.appendChild(fpLabel);
    fp.appendChild(Object.assign(document.createElement('span'), { className: 'font-picker-caret', innerHTML: svg('ChevronDown', 14) }));
    fp.addEventListener('click', () => this._toggleFontPicker(fp, obj));
    body.appendChild(fp);

    // size row: scrub + slider
    const sizeRow = document.createElement('div');
    sizeRow.className = 'inline-row';
    sizeRow.style.width = '100%';
    const sizeScrub = scrub({
      value: Math.round(obj.fontSize || 40), min: 4, max: 600, suffix: 'px',
      onInput: (v) => { obj.set('fontSize', v); this.canvas.requestRenderAll(); },
      onChange: (v) => this._commitLive(obj, { fontSize: v })
    });
    sizeScrub.style.flex = '1';
    sizeScrub.style.minWidth = '0';
    sizeRow.appendChild(sizeScrub);
    const sMinus = iconBtn('Minus', { title: 'Smaller', size: 13, onClick: () => { sizeScrub.setValue((obj.fontSize || 40) - 1); sizeScrub.dispatchEvent(new CustomEvent('commit')); } });
    const sPlus = iconBtn('Plus', { title: 'Larger', size: 13, onClick: () => { obj.set('fontSize', (obj.fontSize || 40) + 1); this.canvas.requestRenderAll(); this.app.historyManager.saveState(); } });
    sMinus.style.flex = '0 0 28px';
    sPlus.style.flex = '0 0 28px';
    sizeRow.appendChild(sMinus);
    sizeRow.appendChild(sPlus);
    body.appendChild(sizeRow);

    const sizeSlider = slider({
      value: obj.fontSize || 40, min: 6, max: 240, step: 1, format: (v) => `${Math.round(v)} px`,
      onInput: (v) => { obj.set('fontSize', v); this.canvas.requestRenderAll(); },
      onChange: (v) => { obj.set('fontSize', v); this.app.historyManager.saveState(); document.dispatchEvent(new CustomEvent('prosy:objectEdited')); }
    });
    body.appendChild(sizeSlider);

    // style row: B I U
    const styleRow = document.createElement('div');
    styleRow.className = 'inline-row';
    const bBtn = this._styleToggle('Bold', obj.fontWeight >= 600 || obj.fontWeight === 'bold', () => {
      const bold = !(obj.fontWeight >= 600 || obj.fontWeight === 'bold');
      obj.set('fontWeight', bold ? 700 : 400);
      this._commitLive(obj, {});
      this.render();
    });
    const iBtn = this._styleToggle('Italic', obj.fontStyle === 'italic', () => {
      obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
      this._commitLive(obj, {});
      this.render();
    });
    const uBtn = this._styleToggle('Underline', !!obj.underline, () => {
      obj.set('underline', !obj.underline);
      this._commitLive(obj, {});
      this.render();
    });
    styleRow.append(bBtn, iBtn, uBtn);
    // text color + gradients live in the shared "Fill" section below
    body.appendChild(styleRow);

    // align
    const alignRow = document.createElement('div');
    alignRow.className = 'inline-row';
    const alignSeg = segmented([
      { value: 'left', icon: 'AlignLeft', title: 'Align left' },
      { value: 'center', icon: 'AlignCenter', title: 'Align center' },
      { value: 'right', icon: 'AlignRight', title: 'Align right' },
      { value: 'justify', icon: 'AlignJustify', title: 'Justify' }
    ], { value: obj.textAlign || 'left', onChange: (v) => { obj.set('textAlign', v); this._commitLive(obj, {}); } });
    alignRow.appendChild(alignSeg);
    body.appendChild(alignRow);

    // paragraph box width (for wrapping textboxes)
    if (obj.type === 'textbox') {
      const boxW = scrub({
        value: Math.round(obj.width || 400), min: 40, max: 4000, suffix: 'px',
        onInput: (v) => { obj.set('width', v); obj.setCoords(); this.canvas.requestRenderAll(); },
        onChange: (v) => { obj.set('width', v); obj.setCoords(); this._commitLive(obj, { width: v }); }
      });
      body.appendChild(this._row('Paragraph width', boxW));
    }

    // spacing: line height + letter spacing
    const lh = scrub({
      value: +(obj.lineHeight || 1.2), min: 0.5, max: 3.2, step: 0.05, precision: 2, suffix: '×',
      onInput: (v) => { obj.set('lineHeight', v); this.canvas.requestRenderAll(); },
      onChange: (v) => this._commitLive(obj, { lineHeight: v })
    });
    const lsVal = Math.round((obj.charSpacing || 0) / 10); // percent-ish
    const ls = scrub({
      value: lsVal, min: -20, max: 100, step: 1, suffix: '%',
      onInput: (v) => { obj.set('charSpacing', v * 10); this.canvas.requestRenderAll(); },
      onChange: (v) => this._commitLive(obj, { charSpacing: v * 10 })
    });
    body.appendChild(this._row('Line height', lh));
    body.appendChild(this._row('Letter spacing', ls));

    return this._section('Text', body);
  }

  _styleToggle(label, active, onClick) {
    const b = document.createElement('button');
    b.className = 'style-btn' + (active ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  _toggleFontPicker(btn, objOrObjs) {
    preloadFontCatalog();
    if (this.fontPickerOpen) { this._closeFontPicker(); return; }
    const targets = Array.isArray(objOrObjs) ? objOrObjs : [objOrObjs];
    const pop = document.createElement('div');
    pop.className = 'font-picker';

    // search
    const search = document.createElement('input');
    search.className = 'font-search';
    search.placeholder = 'Search 40+ fonts…';

    // upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'panel-action-btn';
    uploadBtn.style.width = '100%';
    uploadBtn.style.margin = '6px 0';
    uploadBtn.style.justifyContent = 'center';
    uploadBtn.style.fontSize = '11.5px';
    uploadBtn.style.fontWeight = '600';
    uploadBtn.innerHTML = `${svg('Upload', 13)} <span>Upload Custom Font</span>`;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ttf,.otf,.woff,.woff2';
    fileInput.style.display = 'none';

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const family = await uploadCustomFont(file);
        this.app.toast?.(`Font "${family}" uploaded & active`);
        targets.forEach(t => {
          t.set('fontFamily', family);
          t.dirty = true;
          if (t.initDimensions) t.initDimensions();
          if (t.setCoords) t.setCoords();
        });
        const activeSel = this.canvas.getActiveObject();
        if (activeSel && activeSel.setCoords) activeSel.setCoords();
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        renderList();
        this.render();
      } catch (err) {
        alert(err.message || 'Font upload failed');
      }
    });

    const list = document.createElement('div');
    list.className = 'font-list';

    const renderList = () => {
      const q = search.value.trim().toLowerCase();
      list.innerHTML = '';

      // 1. Custom uploaded fonts
      const customMatches = CUSTOM_FONTS.filter(f => !q || f.family.toLowerCase().includes(q));
      if (customMatches.length > 0) {
        const catHead = document.createElement('div');
        catHead.className = 'font-cat';
        catHead.textContent = 'Custom Brand Fonts';
        list.appendChild(catHead);

        customMatches.forEach(f => {
          const row = document.createElement('div');
          const isCommon = targets.length > 0 && targets.every(t => t.fontFamily === f.family);
          row.className = 'font-row' + (isCommon ? ' active' : '');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';

          const nameSpan = document.createElement('span');
          nameSpan.style.fontFamily = `'${f.family}', sans-serif`;
          nameSpan.style.flex = '1';
          nameSpan.textContent = f.family;

          const badge = document.createElement('span');
          badge.className = 'font-cat-badge';
          badge.textContent = 'Custom';

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.title = 'Remove custom font';
          delBtn.style.background = 'none';
          delBtn.style.border = 'none';
          delBtn.style.color = 'var(--text-muted)';
          delBtn.style.cursor = 'pointer';
          delBtn.style.padding = '2px 4px';
          delBtn.innerHTML = svg('Trash2', 12);
          delBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            deleteCustomFont(f.family);
            renderList();
          });

          row.appendChild(nameSpan);
          row.appendChild(badge);
          row.appendChild(delBtn);

          row.addEventListener('click', () => {
            targets.forEach(t => {
              t.set('fontFamily', f.family);
              t.dirty = true;
              if (t.initDimensions) t.initDimensions();
              if (t.setCoords) t.setCoords();
            });
            const activeSel = this.canvas.getActiveObject();
            if (activeSel && activeSel.setCoords) activeSel.setCoords();
            this.canvas.requestRenderAll();
            this.app.historyManager.saveState();
            document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
            this._closeFontPicker();
            this.render();
          });

          list.appendChild(row);
        });
      }

      // 2. Google Fonts Catalog
      for (const cat of FONT_CATEGORIES) {
        const fams = GOOGLE_FONTS.filter(f => f.category === cat && (!q || f.family.toLowerCase().includes(q)));
        if (!fams.length) continue;
        const catHead = document.createElement('div');
        catHead.className = 'font-cat';
        catHead.textContent = cat;
        list.appendChild(catHead);
        fams.forEach(f => {
          const row = document.createElement('button');
          const isCommon = targets.length > 0 && targets.every(t => t.fontFamily === f.family);
          row.className = 'font-row' + (isCommon ? ' active' : '');
          row.innerHTML = `<span style="font-family:'${f.family}',sans-serif">${f.family}</span><span class="font-cat-badge">${f.category}</span>`;
          row.addEventListener('click', async () => {
            await loadFont(f.family);
            targets.forEach(t => {
              t.set('fontFamily', f.family);
              t.dirty = true;
              if (t.initDimensions) t.initDimensions();
              if (t.setCoords) t.setCoords();
            });
            const activeSel = this.canvas.getActiveObject();
            if (activeSel && activeSel.setCoords) activeSel.setCoords();
            this.canvas.requestRenderAll();
            this.app.historyManager.saveState();
            document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
            this._closeFontPicker();
            this.render();
          });
          list.appendChild(row);
        });
      }
    };
    search.addEventListener('input', renderList);
    renderList();

    pop.appendChild(search);
    pop.appendChild(uploadBtn);
    pop.appendChild(fileInput);
    pop.appendChild(list);
    btn.after(pop);
    this.fontPickerOpen = true;
    // close on outside click
    setTimeout(() => search.focus(), 20);
    this._fontPickerCloser = (e) => {
      if (!e.target.closest('.font-picker') && !e.target.closest('.font-picker-btn')) this._closeFontPicker();
    };
    document.addEventListener('mousedown', this._fontPickerCloser);
  }

  _closeFontPicker() {
    document.querySelectorAll('.font-picker').forEach(el => el.remove());
    if (this._fontPickerCloser) document.removeEventListener('mousedown', this._fontPickerCloser);
    this._fontPickerCloser = null;
    this.fontPickerOpen = false;
  }

  /* ---------------- fill / stroke / radius / icon ---------------- */

  _swatchRow(iconName, title, value, onInput, onChange, extra = null) {
    const wrap = document.createElement('div');
    wrap.className = 'prop-row';
    const cc = colorControl({ value, onInput, onChange });
    wrap.appendChild(cc);
    if (extra) wrap.appendChild(extra);
    return wrap;
  }

  _fillSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const isGrad = !!(obj.fill && obj.fill.type === 'linear');

    const modeRow = document.createElement('div');
    modeRow.className = 'inline-row';
    const seg = segmented([
      { value: 'solid', label: 'Solid' },
      { value: 'gradient', label: 'Gradient' }
    ], { value: isGrad ? 'gradient' : 'solid', onChange: (v) => this._fillMode(obj, v) });
    modeRow.appendChild(seg);
    body.appendChild(modeRow);

    if (isGrad) {
      body.appendChild(this._gradientBody(obj));
    } else {
      const cur = obj.fill && /^#/.test(String(obj.fill)) ? String(obj.fill) : FILL_DEFAULTS[obj.type] || '#7b46f8';
      const cc = colorControl({
        value: cur,
        themeManager: this.app.themeManager,
        themeToken: obj.themeColor?.fill || null,
        onThemeChange: (token) => {
          if (token) this.app.themeManager.bindObjectToTheme(obj, 'fill', token);
          else this.app.themeManager.unbindObjectFromTheme(obj, 'fill');
          this.render();
        },
        onInput: (c) => { 
          this.app.themeManager.unbindObjectFromTheme(obj, 'fill');
          obj.set('fill', c); this.canvas.requestRenderAll(); 
        },
        onChange: (c) => { 
          this.app.themeManager.unbindObjectFromTheme(obj, 'fill');
          this._commitLive(obj, { fill: c }); 
        }
      });
      cc.style.flex = '1';
      const none = document.createElement('button');
      none.className = 'none-chip';
      none.title = 'No fill';
      none.innerHTML = svg('Ban', 13);
      none.addEventListener('click', () => {
        obj.set('fill', 'transparent');
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        this.render();
      });
      const row = document.createElement('div');
      row.className = 'inline-row';
      row.appendChild(cc);
      row.appendChild(none);
      body.appendChild(row);

      const quick = ['#7b46f8', '#0f172a', '#ffffff', '#f8fafc', '#00c2a8', '#ff5d3d', '#ffc53d', '#38bdf8', '#f43f5e', '#10b981', '#8b5cf6', '#f472b6'];
      const sw = document.createElement('div');
      sw.className = 'swatches sm';
      quick.forEach(c => {
        const chip = document.createElement('button');
        chip.className = 'swatch sm';
        chip.style.background = c;
        chip.title = c;
        chip.addEventListener('click', () => { obj.set('fill', c); this.canvas.requestRenderAll(); this.app.historyManager.saveState(); this.render(); });
        sw.appendChild(chip);
      });
      body.appendChild(sw);
    }
    return this._section('Fill', body);
  }

  /** switch between solid fill and linear gradient */
  _fillMode(obj, mode) {
    if (mode === 'gradient' && !(obj.fill && obj.fill.type === 'linear')) {
      const cur = obj.fill && /^#/.test(String(obj.fill)) ? String(obj.fill) : '#7b46f8';
      this._applyGradient(obj, { c1: cur, c2: cur === '#7b46f8' ? '#fa51a2' : '#7b46f8', angle: 90, commit: false });
      this._commitLive(obj, {});
    } else if (mode === 'solid' && obj.fill && obj.fill.type === 'linear') {
      const hex = this._gradientColor1(obj);
      obj.set('fill', hex);
      this._commitLive(obj, {});
    }
    this.render();
  }

  _gradientColor1(obj) {
    const stops = (obj.fill && obj.fill.colorStops) || [];
    return stops.length && /^#/.test(String(stops[0].color)) ? String(stops[0].color) : '#7b46f8';
  }

  _gradientColor2(obj) {
    const stops = (obj.fill && obj.fill.colorStops) || [];
    if (!stops.length) return '#fa51a2';
    const last = stops[stops.length - 1];
    return /^#/.test(String(last.color)) ? String(last.color) : '#fa51a2';
  }

  _gradientAngle(obj) {
    const g = obj.fill;
    if (!g || g.type !== 'linear') return 90;
    const c = g.coords || {};
    if (g.gradientUnits === 'percentage') {
      const dx = (c.x2 || 0) - (c.x1 || 0);
      const dy = (c.y2 || 0) - (c.y1 || 0);
      if (dx || dy) {
        const a = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
        return ((a % 360) + 360) % 360;
      }
    }
    return 90;
  }

  /** build + apply a percentage-based linear fabric.Gradient */
  _applyGradient(obj, { c1, c2, angle, commit = true }) {
    const rad = ((angle || 0) * Math.PI) / 180;
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const g = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: { x1: 0.5 - dx * 0.5, y1: 0.5 - dy * 0.5, x2: 0.5 + dx * 0.5, y2: 0.5 + dy * 0.5 },
      colorStops: [
        { offset: 0, color: c1 },
        { offset: 1, color: c2 }
      ]
    });
    obj.set('fill', g);
    obj.dirty = true;
    if (commit) this._commitLive(obj, {});
    else this.canvas.requestRenderAll();
  }

  /** gradient editor: two stops, angle, presets */
  _gradientBody(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';
    const state = {
      c1: this._gradientColor1(obj),
      c2: this._gradientColor2(obj),
      angle: this._gradientAngle(obj)
    };

    // stops
    const stops = document.createElement('div');
    stops.className = 'inline-row';
    const mkStop = (key, label) => {
      const cc = colorControl({
        label,
        value: state[key],
        onInput: (c) => { state[key] = c; this._applyGradient(obj, state, false); },
        onChange: (c) => { state[key] = c; this._applyGradient(obj, state, true); }
      });
      cc.style.flex = '1';
      return cc;
    };
    stops.appendChild(mkStop('c1', 'Start'));
    stops.appendChild(mkStop('c2', 'End'));
    const swap = iconBtn('ArrowLeftRight', { title: 'Swap colors', size: 13, onClick: () => {
      const t = state.c1; state.c1 = state.c2; state.c2 = t;
      this._applyGradient(obj, state, true);
      this.render();
    } });
    stops.appendChild(swap);
    body.appendChild(stops);

    // angle
    const angRow = document.createElement('div');
    angRow.className = 'inline-row';
    const angleSlider = slider({
      value: state.angle, min: 0, max: 360, step: 5, format: (v) => `${Math.round(v)}°`,
      onInput: (v) => { state.angle = v; this._applyGradient(obj, state, false); },
      onChange: (v) => { state.angle = v; this._applyGradient(obj, state, true); }
    });
    angRow.appendChild(angleSlider);
    body.appendChild(angRow);

    // presets
    const presets = [
      ['#7b46f8', '#fa51a2', 'Prosy'], ['#0f172a', '#7b46f8', 'Ink violet'], ['#00c2a8', '#38bdf8', 'Aqua'],
      ['#ff5d3d', '#ffc53d', 'Sunset'], ['#f43f5e', '#7b46f8', 'Fuchsia'], ['#18181b', '#64748b', 'Slate']
    ];
    const sw = document.createElement('div');
    sw.className = 'swatches sm';
    presets.forEach(([c1, c2, name]) => {
      const chip = document.createElement('button');
      chip.className = 'swatch sm grad';
      chip.title = name;
      chip.style.background = `linear-gradient(90deg, ${c1}, ${c2})`;
      chip.addEventListener('click', () => {
        state.c1 = c1; state.c2 = c2; state.angle = 90;
        this._applyGradient(obj, state, true);
        this.render();
      });
      sw.appendChild(chip);
    });
    body.appendChild(sw);
    return body;
  }

  _photoPlaceholderSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const info = document.createElement('div');
    info.className = 'panel-note';
    info.textContent = 'Drag any photo file onto this shape, or click below to upload.';
    body.appendChild(info);

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.style.width = '100%';
    btn.style.justifyContent = 'center';
    btn.style.fontSize = '12px';
    const isFilled = obj.custom?.isFilled || obj.clipPath || obj.custom?.maskWrap;
    btn.innerHTML = `${svg('ImagePlus', 15)} ${isFilled ? 'Replace Photo…' : 'Upload Photo…'}`;
    btn.addEventListener('click', async () => {
      const target = this.app.canvasManager?.findPlaceholderTarget(obj) || { type: 'standalone', obj };
      await this.app.objectOps.promptUploadForPlaceholder(target);
      this.render();
    });
    body.appendChild(btn);

    return this._section('Photo Slot', body);
  }

  _strokeSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const cur = obj.stroke && String(obj.stroke).startsWith('#') ? String(obj.stroke) : '#000000';
    const cc = colorControl({
      value: cur,
      themeManager: this.app.themeManager,
      themeToken: obj.themeColor?.stroke || null,
      onThemeChange: (token) => {
        if (token) this.app.themeManager.bindObjectToTheme(obj, 'stroke', token);
        else this.app.themeManager.unbindObjectFromTheme(obj, 'stroke');
        this.render();
      },
      onInput: (c) => { 
        this.app.themeManager.unbindObjectFromTheme(obj, 'stroke');
        obj.set('stroke', c); this.canvas.requestRenderAll(); 
      },
      onChange: (c) => { 
        this.app.themeManager.unbindObjectFromTheme(obj, 'stroke');
        this._commitLive(obj, { stroke: c }); 
      }
    });
    cc.style.flex = '1';
    cc.style.minWidth = '0';
    const w = scrub({
      value: obj.strokeWidth || 0, min: 0, max: 60, step: 1, suffix: 'px',
      onInput: (v) => { obj.set('strokeWidth', v); this.canvas.requestRenderAll(); },
      onChange: (v) => this._commitLive(obj, { strokeWidth: v })
    });
    w.style.width = '76px';
    w.style.flex = '0 0 76px';
    const row = document.createElement('div');
    row.className = 'inline-row';
    row.style.width = '100%';
    row.appendChild(cc);
    row.appendChild(w);
    body.appendChild(row);

    // dashed toggles (for stroke-based shapes)
    if (obj.type !== 'line') {
      const isDashed = !!obj.strokeDashArray;
      const seg = segmented([
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' }
      ], {
        value: isDashed ? 'dashed' : 'solid',
        onChange: (mode) => {
          obj.set('strokeDashArray', mode === 'dashed' ? [12, 12] : null);
          this._commitLive(obj, {});
        }
      });
      seg.style.width = '100%';
      body.appendChild(seg);
    }
    return this._section('Border', body);
  }

  _radiusSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';

    const maxR = Math.max(1, Math.round(Math.min(this._sizeX(obj), this._sizeY(obj)) / 2));
    const sx = obj.scaleX || 1;

    const getRadii = () => {
      const raw = getCornerRadii(obj);
      return raw.map(r => Math.round(r * sx));
    };

    const isIndependent = Boolean(obj._independentCorners);

    const modeSeg = segmented([
      { value: 'all', label: 'All corners' },
      { value: 'independent', label: 'Independent' }
    ], {
      value: isIndependent ? 'independent' : 'all',
      onChange: (v) => {
        obj._independentCorners = (v === 'independent');
        if (!obj._independentCorners) {
          const [tl] = getRadii();
          this._applyCornerRadii(obj, [tl, tl, tl, tl], true);
        }
        this.render();
      }
    });
    body.appendChild(modeSeg);

    if (!isIndependent) {
      const [r] = getRadii();
      const sl = slider({
        label: 'Radius',
        value: r,
        min: 0,
        max: maxR,
        step: 1,
        format: (v) => `${v} px`,
        onInput: (v) => this._applyCornerRadii(obj, [v, v, v, v], false),
        onChange: (v) => this._applyCornerRadii(obj, [v, v, v, v], true)
      });
      body.appendChild(sl);

      const presets = document.createElement('div');
      presets.className = 'radius-presets';
      [[0, 'Sharp'], [12, 'Soft'], [24, 'Rounded'], [40, 'Rounder']].forEach(([v, name]) => {
        const b = document.createElement('button');
        b.className = 'chip-btn';
        b.textContent = name;
        b.addEventListener('click', () => {
          this._applyCornerRadii(obj, [v, v, v, v], true);
          this.render();
        });
        presets.appendChild(b);
      });
      const full = document.createElement('button');
      full.className = 'chip-btn';
      full.textContent = 'Full';
      full.title = 'Fully rounded (pill)';
      full.addEventListener('click', () => {
        this._applyCornerRadii(obj, [maxR, maxR, maxR, maxR], true);
        this.render();
      });
      presets.appendChild(full);
      body.appendChild(presets);
    } else {
      const [tl, tr, br, bl] = getRadii();

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = '1fr 1fr';
      grid.style.gap = '8px';

      const createCornerCell = (label, val, cornerIdx) => {
        const cell = document.createElement('div');
        cell.className = 'prop-cell';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.gap = '4px';

        const lbl = document.createElement('span');
        lbl.className = 'prop-cell-label';
        lbl.style.fontSize = '10px';
        lbl.style.fontWeight = '600';
        lbl.style.color = 'var(--text-secondary, #94a3b8)';
        lbl.textContent = label;
        cell.appendChild(lbl);

        const s = scrub({
          value: val,
          min: 0,
          max: maxR,
          step: 1,
          suffix: 'px',
          onInput: (v) => {
            const radii = getRadii();
            radii[cornerIdx] = v;
            this._applyCornerRadii(obj, radii, false);
          },
          onChange: (v) => {
            const radii = getRadii();
            radii[cornerIdx] = v;
            this._applyCornerRadii(obj, radii, true);
          }
        });
        cell.appendChild(s);
        return cell;
      };

      grid.appendChild(createCornerCell('Top-Left (TL)', tl, 0));
      grid.appendChild(createCornerCell('Top-Right (TR)', tr, 1));
      grid.appendChild(createCornerCell('Bottom-Left (BL)', bl, 3));
      grid.appendChild(createCornerCell('Bottom-Right (BR)', br, 2));

      body.appendChild(grid);
    }

    const note = document.createElement('div');
    note.className = 'panel-note';
    note.textContent = 'Drag circular corner handles on the shape or hold Alt to edit one corner.';
    body.appendChild(note);

    return this._section('Corner radius', body);
  }

  _applyCornerRadii(obj, visualRadii, commit) {
    const sx = obj.scaleX || 1;
    const maxLocal = Math.min((obj.width || 0) / 2, (obj.height || 0) / 2);
    const local = visualRadii.map(r => Math.max(0, Math.min(maxLocal, Math.round(r / (sx || 1)))));

    obj.cornerRadii = local;
    obj.rx = local[0];
    obj.ry = local[0];
    obj.dirty = true;

    if (commit) {
      this._commitLive(obj, {});
    } else {
      this.canvas.requestRenderAll();
    }
  }


  _iconSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';

    // collect current stroke color
    const cur = (() => {
      const collect = [];
      const walk = (o) => { if (o._objects) o._objects.forEach(walk); else collect.push(o); };
      walk(obj);
      const c = collect.find(p => p.stroke && String(p.stroke).startsWith('#')) ||
                collect.find(p => p.fill && String(p.fill).startsWith('#'));
      return c ? String(c.stroke || c.fill) : (obj.stroke || '#0f172a');
    })();

    const cc = colorControl({
      value: cur,
      onInput: (c) => { this._recolor(obj, c); this.canvas.requestRenderAll(); },
      onChange: (c) => { this._recolor(obj, c); this.app.historyManager.saveState(); }
    });
    cc.style.flex = '1';
    const row = document.createElement('div');
    row.className = 'inline-row';
    row.appendChild(cc);
    body.appendChild(row);

    const sw = document.createElement('div');
    sw.className = 'swatches sm';
    ['#0f172a', '#ffffff', '#7b46f8', '#00c2a8', '#ff5d3d', '#ffc53d', '#38bdf8', '#f43f5e', '#10b981', '#64748b'].forEach(c => {
      const chip = document.createElement('button');
      chip.className = 'swatch sm';
      chip.style.background = c;
      chip.addEventListener('click', () => {
        this._recolor(obj, c);
        this.app.historyManager.saveState();
        this.canvas.requestRenderAll();
        this.render();
      });
      sw.appendChild(chip);
    });
    body.appendChild(sw);
    const note = document.createElement('div');
    note.className = 'panel-note';
    note.textContent = 'Icons are vector art — recolor paints every path.';
    body.appendChild(note);
    return this._section('Icon color', body);
  }

  _recolor(obj, color) {
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
    this.canvas.requestRenderAll();
  }

  _imageSection(obj) {
    const body = document.createElement('div');
    const row = document.createElement('div');
    row.className = 'inline-row';
    const replace = document.createElement('button');
    replace.className = 'btn btn-ghost';
    replace.style.flex = '1';
    replace.innerHTML = svg('ImagePlus', 14) + 'Replace image';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    replace.appendChild(input);
    replace.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const f = input.files[0];
      if (!f) return;
      const dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
      try {
        const img = await fabric.FabricImage.fromURL(dataUrl);
        const cur = obj.getBoundingRect();
        const scale = Math.min(cur.width / img.width, cur.height / img.height);
        img.set({
          left: cur.left, top: cur.top,
          scaleX: scale, scaleY: scale,
          originX: 'left', originY: 'top'
        });
        const idx = this.canvas.getObjects().indexOf(obj);
        this.canvas.remove(obj);
        this.canvas.insertAt(idx, img);
        this.canvas.setActiveObject(img);
        this.app.historyManager.saveState();
        this.render();
      } catch (e) { console.error(e); }
    });
    row.appendChild(replace);
    body.appendChild(row);
    const note = document.createElement('div');
    note.className = 'panel-note';
    note.textContent = 'Mask this image into a shape with the Mask section below — then move the mask to reframe.';
    body.appendChild(note);
    return this._section('Image', body);
  }

  /* ---------------- appearance / blur / glow / shadow ---------------- */

  _appearanceSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '12px';

    const op = slider({
      label: 'Opacity',
      value: Math.round((obj.opacity ?? 1) * 100), min: 5, max: 100, step: 1, format: (v) => `${v}%`,
      onInput: (v) => { obj.set('opacity', v / 100); this.canvas.requestRenderAll(); },
      onChange: (v) => {
        obj.set('opacity', v / 100);
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
      }
    });
    body.appendChild(op);

    // Figma-style Blur: None, Gaussian Blur, Background Blur (Frosted Glass)
    const blurContainer = document.createElement('div');
    blurContainer.style.display = 'flex';
    blurContainer.style.flexDirection = 'column';
    blurContainer.style.gap = '8px';

    const blurHeader = document.createElement('div');
    blurHeader.style.display = 'flex';
    blurHeader.style.justifyContent = 'space-between';
    blurHeader.style.alignItems = 'center';
    blurHeader.innerHTML = `<span style="font-size:12px;font-weight:600;color:var(--text-secondary);">Blur Effect</span>`;
    blurContainer.appendChild(blurHeader);

    let currentBlurType = obj._blurType || ((obj._blurRadius || obj._blurValue) > 0 ? 'gaussian' : 'none');
    if (currentBlurType === 'layer') currentBlurType = 'gaussian'; // migrate old layer blur

    const blurTypeSeg = segmented([
      { value: 'none', label: 'None' },
      { value: 'gaussian', label: 'Gaussian' },
      { value: 'background', label: 'Background' }
    ], {
      value: currentBlurType,
      onChange: (v) => {
        const radius = (v === 'none') ? 0 : (obj._blurRadius || obj._blurValue || 16);
        applyBlurEffect(obj, v, radius);
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
        this.render();
      }
    });
    blurContainer.appendChild(blurTypeSeg);

    if (currentBlurType !== 'none') {
      const radiusControl = slider({
        label: 'Blur Radius',
        value: obj._blurRadius || obj._blurValue || 16,
        min: 1,
        max: 50,
        step: 1,
        format: (v) => `${v}px`,
        onInput: (v) => {
          applyBlurEffect(obj, currentBlurType, v);
          this.canvas.requestRenderAll();
        },
        onChange: (v) => {
          applyBlurEffect(obj, currentBlurType, v);
          this.canvas.requestRenderAll();
          this.app.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
        }
      });
      blurContainer.appendChild(radiusControl);

      if (currentBlurType === 'background') {
        const frostedBtn = document.createElement('button');
        frostedBtn.type = 'button';
        frostedBtn.className = 'btn-secondary';
        frostedBtn.style.fontSize = '11px';
        frostedBtn.style.fontWeight = '500';
        frostedBtn.style.padding = '7px 10px';
        frostedBtn.style.borderRadius = '6px';
        frostedBtn.style.display = 'flex';
        frostedBtn.style.alignItems = 'center';
        frostedBtn.style.justifyContent = 'center';
        frostedBtn.style.gap = '6px';
        frostedBtn.style.width = '100%';
        frostedBtn.style.background = 'rgba(123, 70, 248, 0.12)';
        frostedBtn.style.border = '1px solid rgba(123, 70, 248, 0.3)';
        frostedBtn.style.color = 'var(--text-primary, #fff)';
        frostedBtn.style.cursor = 'pointer';
        frostedBtn.style.marginTop = '2px';
        frostedBtn.innerHTML = `<span>Apply Frosted Glass Style</span>`;
        frostedBtn.onclick = () => this._applyFrostedGlass(obj);
        blurContainer.appendChild(frostedBtn);

        const normalizeBtn = document.createElement('button');
        normalizeBtn.type = 'button';
        normalizeBtn.className = 'btn-secondary';
        normalizeBtn.style.fontSize = '11px';
        normalizeBtn.style.fontWeight = '500';
        normalizeBtn.style.padding = '7px 10px';
        normalizeBtn.style.borderRadius = '6px';
        normalizeBtn.style.display = 'flex';
        normalizeBtn.style.alignItems = 'center';
        normalizeBtn.style.justifyContent = 'center';
        normalizeBtn.style.gap = '6px';
        normalizeBtn.style.width = '100%';
        normalizeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        normalizeBtn.style.border = '1px solid var(--border-color, rgba(255, 255, 255, 0.15))';
        normalizeBtn.style.color = 'var(--text-secondary, #94a3b8)';
        normalizeBtn.style.cursor = 'pointer';
        normalizeBtn.style.marginTop = '4px';
        normalizeBtn.innerHTML = `<span>Normalize</span>`;
        normalizeBtn.onclick = () => {
          const defaultFill = FILL_DEFAULTS[obj.type] || '#7b46f8';
          obj.set({
            fill: defaultFill,
            stroke: '',
            strokeWidth: 0
          });
          applyBlurEffect(obj, 'none', 0);
          this.canvas.requestRenderAll();
          this.app.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
          this.render();
        };
        blurContainer.appendChild(normalizeBtn);
      }
    }

    body.appendChild(blurContainer);
    return this._section('Appearance', body);
  }

  _applyFrostedGlass(obj) {
    const curFill = obj.fill;

    // A. Gradient frosted glass (Linear or Radial)
    if (curFill && (curFill.type === 'linear' || curFill.type === 'radial' || Array.isArray(curFill.colorStops))) {
      const coords = curFill.coords || { x1: 0, y1: 0, x2: 1, y2: 1 };
      const stops = (curFill.colorStops || []).map(st => {
        const { hex } = this._parseColorAlpha(st.color);
        return {
          offset: st.offset,
          color: this._hexAndAlphaToRgba(hex, 22)
        };
      });

      const firstStop = stops[0]?.color || 'rgba(255, 255, 255, 0.45)';
      const { hex: firstHex } = this._parseColorAlpha(firstStop);

      const glassGradient = new fabric.Gradient({
        type: curFill.type || 'linear',
        gradientUnits: curFill.gradientUnits || 'percentage',
        coords: { ...coords },
        colorStops: stops
      });

      obj.set({
        fill: glassGradient,
        stroke: this._hexAndAlphaToRgba(firstHex, 45),
        strokeWidth: obj.strokeWidth || 1.5
      });
    } else {
      // B. Solid color frosted glass (Hex, RGBA, RGB, Named)
      const fillStr = (curFill && typeof curFill === 'string' && curFill !== 'transparent')
        ? curFill
        : (FILL_DEFAULTS[obj.type] || '#7b46f8');

      const { hex } = this._parseColorAlpha(fillStr);
      const glassFill = this._hexAndAlphaToRgba(hex, 22);
      const glassStroke = this._hexAndAlphaToRgba(hex, 45);

      obj.set({
        fill: glassFill,
        stroke: glassStroke,
        strokeWidth: obj.strokeWidth || 1.5
      });
    }

    applyBlurEffect(obj, 'background', obj._blurRadius || 20);
    this.canvas.requestRenderAll();
    this.app.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
    this.render();
  }

  /* ---------------- glow effect ---------------- */

  _glowSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const has = Boolean(obj._glowActive);
    const seg = segmented([
      { value: 'none', label: 'None' },
      { value: 'glow', label: 'Glow' }
    ], {
      value: has ? 'glow' : 'none',
      onChange: (v) => {
        const active = (v === 'glow');
        applyGlowEffect(obj, active, obj._glowColor || '#00F0FF', obj._glowRadius || 20);
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
        this.render();
      }
    });
    body.appendChild(seg);

    if (has) {
      const pane = document.createElement('div');
      pane.style.display = 'flex';
      pane.style.flexDirection = 'column';
      pane.style.gap = '10px';

      const colorRow = document.createElement('div');
      colorRow.style.display = 'flex';
      colorRow.style.flexDirection = 'column';
      colorRow.style.gap = '6px';

      const colorLabel = document.createElement('div');
      colorLabel.style.fontSize = '12px';
      colorLabel.style.fontWeight = '600';
      colorLabel.style.color = 'var(--text-secondary)';
      colorLabel.textContent = 'Glow Color';
      colorRow.appendChild(colorLabel);

      const currentColor = obj._glowColor || '#00F0FF';
      const cc = colorControl({
        value: /^#[0-9a-fA-F]{6}$/.test(String(currentColor)) ? String(currentColor) : '#00F0FF',
        onInput: (c) => {
          applyGlowEffect(obj, true, c, obj._glowRadius || 20);
          this.canvas.requestRenderAll();
        },
        onChange: (c) => {
          applyGlowEffect(obj, true, c, obj._glowRadius || 20);
          this.canvas.requestRenderAll();
          this.app.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
        }
      });
      colorRow.appendChild(cc);

      // Neon presets palette
      const neonPresets = [
        { color: '#00F0FF', label: 'Cyan' },
        { color: '#A855F7', label: 'Purple' },
        { color: '#EC4899', label: 'Pink' },
        { color: '#F59E0B', label: 'Amber' },
        { color: '#10B981', label: 'Emerald' },
        { color: '#FFFFFF', label: 'White' }
      ];
      const chipsRow = document.createElement('div');
      chipsRow.style.display = 'flex';
      chipsRow.style.gap = '6px';
      chipsRow.style.flexWrap = 'wrap';

      neonPresets.forEach(preset => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.title = preset.label;
        chip.style.width = '20px';
        chip.style.height = '20px';
        chip.style.borderRadius = '50%';
        chip.style.border = (currentColor.toUpperCase() === preset.color.toUpperCase())
          ? '2px solid var(--accent, #7b46f8)'
          : '1px solid rgba(255,255,255,0.2)';
        chip.style.backgroundColor = preset.color;
        chip.style.cursor = 'pointer';
        chip.style.boxShadow = `0 0 6px ${preset.color}`;
        chip.onclick = () => {
          applyGlowEffect(obj, true, preset.color, obj._glowRadius || 20);
          this.canvas.requestRenderAll();
          this.app.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
          this.render();
        };
        chipsRow.appendChild(chip);
      });
      colorRow.appendChild(chipsRow);
      pane.appendChild(colorRow);

      const radSlider = slider({
        label: 'Radius',
        value: Math.round(obj._glowRadius || 20),
        min: 1,
        max: 60,
        step: 1,
        format: (v) => `${v}px`,
        onInput: (v) => {
          applyGlowEffect(obj, true, obj._glowColor || '#00F0FF', v);
          this.canvas.requestRenderAll();
        },
        onChange: (v) => {
          applyGlowEffect(obj, true, obj._glowColor || '#00F0FF', v);
          this.canvas.requestRenderAll();
          this.app.historyManager.saveState();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: obj } }));
        }
      });
      pane.appendChild(radSlider);

      body.appendChild(pane);
    }

    return this._section('Glow', body);
  }


  /* ---------------- code snippet section ---------------- */

  _codeSnippetSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';

    const data = obj.codeData || {
      code: 'console.log("Hello, World!");',
      lang: 'javascript',
      theme: 'one-dark',
      showLineNumbers: true,
      width: obj.width || 560
    };

    // Language Selector
    const langRow = document.createElement('div');
    langRow.className = 'inline-row';
    const langLabel = document.createElement('span');
    langLabel.className = 'val-label';
    langLabel.textContent = 'Language';
    const langSelect = document.createElement('select');
    langSelect.style.cssText = 'flex:1;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:5px 8px;color:var(--text-primary);font-size:12px;outline:none;';
    CODE_LANGUAGES.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = l.name;
      if (l.id === data.lang) opt.selected = true;
      langSelect.appendChild(opt);
    });
    langSelect.addEventListener('change', () => {
      data.lang = langSelect.value;
      this._updateCodeSnippet(obj, data);
    });
    langRow.appendChild(langLabel);
    langRow.appendChild(langSelect);
    body.appendChild(langRow);

    // Theme Selector
    const themeRow = document.createElement('div');
    themeRow.className = 'inline-row';
    const themeLabel = document.createElement('span');
    themeLabel.className = 'val-label';
    themeLabel.textContent = 'Theme';
    const themeSelect = document.createElement('select');
    themeSelect.style.cssText = 'flex:1;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:5px 8px;color:var(--text-primary);font-size:12px;outline:none;';
    Object.entries(CODE_THEMES).forEach(([id, tObj]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = tObj.name;
      if (id === data.theme) opt.selected = true;
      themeSelect.appendChild(opt);
    });
    themeSelect.addEventListener('change', () => {
      data.theme = themeSelect.value;
      this._updateCodeSnippet(obj, data);
    });
    themeRow.appendChild(themeLabel);
    themeRow.appendChild(themeSelect);
    body.appendChild(themeRow);

    // Line Numbers Toggle
    const lineRow = document.createElement('div');
    lineRow.className = 'inline-row';
    lineRow.style.justifyContent = 'space-between';
    const lineLabel = document.createElement('span');
    lineLabel.className = 'val-label';
    lineLabel.textContent = 'Line numbers';
    const lineCheckbox = document.createElement('input');
    lineCheckbox.type = 'checkbox';
    lineCheckbox.checked = data.showLineNumbers !== false;
    lineCheckbox.addEventListener('change', () => {
      data.showLineNumbers = lineCheckbox.checked;
      this._updateCodeSnippet(obj, data);
    });
    lineRow.appendChild(lineLabel);
    lineRow.appendChild(lineCheckbox);
    body.appendChild(lineRow);

    // Edit Code Button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary';
    editBtn.style.width = '100%';
    editBtn.style.justifyContent = 'center';
    editBtn.innerHTML = svg('Code', 13) + ' Edit Code Text…';
    editBtn.addEventListener('click', () => {
      this._openCodeEditorModal(obj, data);
    });
    body.appendChild(editBtn);

    return this._section('Code Snippet', body);
  }

  _updateCodeSnippet(oldGroup, data) {
    const left = oldGroup.left;
    const top = oldGroup.top;
    const newGroup = createCodeSnippetGroup({
      code: data.code,
      lang: data.lang,
      theme: data.theme,
      showLineNumbers: data.showLineNumbers,
      left,
      top,
      width: data.width || 560
    });
    if (oldGroup.scaleX && oldGroup.scaleX !== 0.5) {
      newGroup.scaleX = oldGroup.scaleX;
      newGroup.scaleY = oldGroup.scaleY;
    }

    this.canvas.remove(oldGroup);
    this.canvas.add(newGroup);
    this.canvas.setActiveObject(newGroup);
    this.canvas.requestRenderAll();
    this.app.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'properties', target: newGroup } }));
    this.render();
  }

  _openCodeEditorModal(obj, data) {
    const modalId = 'code-editor-modal';
    const html = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="font-size:12px;color:var(--text-muted);">Paste or type your code below. Line breaks and indentation are preserved.</div>
        <textarea id="code-modal-textarea" rows="12" style="width:100%;box-sizing:border-box;background:#181a1f;color:#abb2bf;border:1px solid var(--border-color);border-radius:8px;padding:12px;font-family:'JetBrains Mono', 'Fira Code', monospace;font-size:13px;line-height:1.5;outline:none;resize:vertical;"></textarea>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="btn btn-ghost" id="code-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="code-modal-save" style="font-weight:600;">Save Code</button>
        </div>
      </div>
    `;

    const m = new Modal(modalId, 'Edit Code Snippet', html);
    m.render();
    m.open();

    const textarea = document.getElementById('code-modal-textarea');
    if (textarea) {
      textarea.value = data.code || '';
      textarea.focus();
    }

    document.getElementById('code-modal-cancel')?.addEventListener('click', () => m.close());
    document.getElementById('code-modal-save')?.addEventListener('click', () => {
      if (textarea) {
        data.code = textarea.value;
        this._updateCodeSnippet(obj, data);
      }
      m.close();
    });
  }

  /* ---------------- qr code section ---------------- */

  _qrCodeSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';

    const data = obj.qrData || {
      text: obj.custom?.hyperlink || 'https://',
      color: '#000000',
      background: '#ffffff',
      size: 200
    };

    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.flexDirection = 'column';
    inputRow.style.gap = '4px';
    const label = document.createElement('span');
    label.className = 'val-label';
    label.textContent = 'QR Code Link / Text';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = data.text;
    input.style.cssText = 'width:100%;box-sizing:border-box;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:6px 8px;font-size:12px;color:var(--text-primary);font-family:var(--font-mono, monospace);outline:none;';
    input.addEventListener('keydown', (e) => e.stopPropagation());
    inputRow.appendChild(label);
    inputRow.appendChild(input);
    body.appendChild(inputRow);

    const updateBtn = document.createElement('button');
    updateBtn.className = 'btn btn-primary';
    updateBtn.style.width = '100%';
    updateBtn.style.justifyContent = 'center';
    updateBtn.innerHTML = svg('QrCode', 13) + ' Update QR Code';
    updateBtn.addEventListener('click', async () => {
      const newText = input.value.trim();
      if (!newText) return;
      data.text = newText;
      const dataUrl = QRCodeGenerator.generateDataURL(newText, {
        size: data.size || 200,
        color: data.color || '#000000',
        background: data.background || '#ffffff'
      });
      await obj.setSrc(dataUrl);
      obj.qrData = data;
      obj.custom = obj.custom || {};
      obj.custom.hyperlink = newText;
      this.canvas.requestRenderAll();
      this.app.historyManager.saveState();
      this.app.toast?.('QR Code updated');
    });
    body.appendChild(updateBtn);

    return this._section('QR Code', body);
  }

  /* ---------------- hyperlink section ---------------- */

  _hyperlinkSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const current = obj.custom?.hyperlink || '';

    const inputRow = document.createElement('div');
    inputRow.className = 'inline-row';
    inputRow.style.width = '100%';

    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'hyperlink-input';
    input.placeholder = 'https://example.com';
    input.value = current;
    input.style.cssText = 'flex:1;min-width:0;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:6px;padding:6px 10px;color:var(--text-primary);font-size:12px;outline:none;font-family:var(--font-mono, monospace);';
    input.addEventListener('focus', () => { input.style.borderColor = 'var(--accent)'; });
    input.addEventListener('blur', () => { input.style.borderColor = 'var(--border-color)'; });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation(); // prevent canvas shortcuts
      if (e.key === 'Enter') {
        const url = input.value.trim();
        if (url) {
          this.app.ops.setHyperlink(url);
        } else {
          this.app.ops.removeHyperlink();
        }
        this.render();
      }
    });
    inputRow.appendChild(input);

    body.appendChild(inputRow);

    const btnRow = document.createElement('div');
    btnRow.className = 'inline-row';

    if (current) {
      const openBtn = document.createElement('button');
      openBtn.className = 'btn btn-ghost';
      openBtn.style.flex = '1';
      openBtn.style.fontSize = '11px';
      openBtn.innerHTML = svg('ExternalLink', 13) + ' Open';
      openBtn.addEventListener('click', () => {
        window.open(current, '_blank');
      });
      btnRow.appendChild(openBtn);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-ghost';
      removeBtn.style.flex = '1';
      removeBtn.style.fontSize = '11px';
      removeBtn.innerHTML = svg('Unlink', 13) + ' Remove';
      removeBtn.addEventListener('click', () => {
        this.app.ops.removeHyperlink();
        this.render();
      });
      btnRow.appendChild(removeBtn);
    } else {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-ghost';
      addBtn.style.flex = '1';
      addBtn.style.fontSize = '11px';
      addBtn.innerHTML = svg('Link', 13) + ' Add link';
      addBtn.addEventListener('click', () => {
        const url = input.value.trim();
        if (url) {
          this.app.ops.setHyperlink(url);
          this.render();
        } else {
          input.focus();
        }
      });
      btnRow.appendChild(addBtn);
    }
    body.appendChild(btnRow);

    const note = document.createElement('div');
    note.className = 'panel-note';
    note.textContent = current
      ? 'This object has a hyperlink. It will be clickable in exported PDFs (no visible underline).'
      : 'Add a URL to make this object clickable in exported PDFs.';
    body.appendChild(note);

    return this._section('Hyperlink', body);
  }

  /* ---------------- shadow / effects ---------------- */

  _parseColorAlpha(colorStr) {
    if (!colorStr) return { hex: '#000000', opacity: 100 };
    const s = String(colorStr).trim();
    if (s.startsWith('#')) {
      if (s.length === 9) {
        const hex = s.slice(0, 7);
        const a = parseInt(s.slice(7, 9), 16) / 255;
        return { hex, opacity: Math.round(a * 100) };
      }
      return { hex: s.length === 7 ? s : '#000000', opacity: 100 };
    }
    const match = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
      const toHex = (n) => n.toString(16).padStart(2, '0');
      return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, opacity: Math.round(a * 100) };
    }
    return { hex: '#000000', opacity: 100 };
  }

  _hexAndAlphaToRgba(hex, opacityPercent) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    const a = Math.max(0, Math.min(1, opacityPercent / 100));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  _shadowSection(obj) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';

    const has = !!obj.shadow;
    const seg = segmented([
      { value: 'none', label: 'None' },
      { value: 'shadow', label: 'Shadow' }
    ], { value: has ? 'shadow' : 'none', onChange: (v) => {
      if (v === 'shadow' && !obj.shadow) {
        this._applyShadow(obj, { color: 'rgba(0, 0, 0, 0.35)', blur: 18, offsetX: 0, offsetY: 8, affectStroke: true }, true);
      } else if (v === 'none' && obj.shadow) {
        obj.set('shadow', null);
        this._commitLive(obj, {});
      }
      this.render();
    } });
    body.appendChild(seg);

    if (has) {
      const pane = document.createElement('div');
      pane.style.display = 'flex';
      pane.style.flexDirection = 'column';
      pane.style.gap = '8px';

      const sh = obj.shadow;
      const { hex: shadowHex, opacity: shadowOpacity } = this._parseColorAlpha(sh.color);

      const colorRow = document.createElement('div');
      colorRow.style.display = 'flex';
      colorRow.style.flexDirection = 'column';
      colorRow.style.gap = '8px';

      const cc = colorControl({
        value: shadowHex,
        onInput: (c) => {
          const newCol = this._hexAndAlphaToRgba(c, shadowOpacity);
          this._applyShadow(obj, { color: newCol }, false);
        },
        onChange: (c) => {
          const newCol = this._hexAndAlphaToRgba(c, shadowOpacity);
          this._applyShadow(obj, { color: newCol }, true);
        }
      });
      colorRow.appendChild(cc);

      // Shadow Opacity Slider
      const opSlider = slider({
        label: 'Shadow Opacity',
        value: shadowOpacity,
        min: 0,
        max: 100,
        step: 1,
        format: (v) => `${v}%`,
        onInput: (v) => {
          const newCol = this._hexAndAlphaToRgba(shadowHex, v);
          this._applyShadow(obj, { color: newCol }, false);
        },
        onChange: (v) => {
          const newCol = this._hexAndAlphaToRgba(shadowHex, v);
          this._applyShadow(obj, { color: newCol }, true);
        }
      });
      colorRow.appendChild(opSlider);
      pane.appendChild(colorRow);

      const blur = slider({
        label: 'Blur',
        value: Math.round(sh.blur || 0), min: 0, max: 80, step: 1, format: (v) => `${v}px`,
        onInput: (v) => this._applyShadow(obj, { blur: v }, false),
        onChange: (v) => this._applyShadow(obj, { blur: v }, true)
      });
      pane.appendChild(blur);

      const offGrid = document.createElement('div');
      offGrid.className = 'prop-grid2';
      const mkOff = (axis, label) => {
        const s = scrub({
          value: Math.round(sh[axis] || 0), min: -120, max: 120, step: 1, suffix: 'px',
          onInput: (v) => this._applyShadow(obj, { [axis]: v }, false),
          onChange: (v) => this._applyShadow(obj, { [axis]: v }, true)
        });
        const wrap = document.createElement('div');
        wrap.className = 'prop-cell';
        const lbl = document.createElement('span');
        lbl.className = 'prop-cell-label';
        lbl.textContent = label;
        wrap.appendChild(lbl);
        wrap.appendChild(s);
        return wrap;
      };
      offGrid.appendChild(mkOff('offsetX', 'Offset X'));
      offGrid.appendChild(mkOff('offsetY', 'Offset Y'));
      pane.appendChild(offGrid);

      const presets = [
        ['Soft', 'rgba(0,0,0,0.25)', 24, 0, 8], ['Hard', 'rgba(0,0,0,0.6)', 2, 4, 4],
        ['Violet glow', 'rgba(123,70,248,0.5)', 34, 0, 0], ['Floating', 'rgba(0,0,0,0.3)', 40, 0, 18]
      ];
      const chips = document.createElement('div');
      chips.className = 'inline-row';
      chips.style.flexWrap = 'wrap';
      chips.style.gap = '6px';
      presets.forEach(([name, color, blurV, ox, oy]) => {
        const b = document.createElement('button');
        b.className = 'chip-btn';
        b.textContent = name;
        b.addEventListener('click', () => this._applyShadow(obj, { color, blur: blurV, offsetX: ox, offsetY: oy }, true));
        chips.appendChild(b);
      });
      pane.appendChild(chips);
      body.appendChild(pane);
    }
    return this._section('Shadow', body);
  }


  _applyShadow(obj, fields, commit) {
    let sh = obj.shadow;
    if (!sh || !fields) sh = new fabric.Shadow({ color: '#000000', blur: 0, offsetX: 0, offsetY: 0 });
    const next = { ...sh, ...fields };
    // fabric.Shadow is effectively immutable once drawn — build a fresh one
    const fresh = new fabric.Shadow({
      color: next.color,
      blur: Math.max(0, next.blur || 0),
      offsetX: next.offsetX || 0,
      offsetY: next.offsetY || 0,
      affectStroke: true
    });
    obj.set('shadow', fresh);
    obj.dirty = true;
    if (commit) this._commitLive(obj, {});
    else this.canvas.requestRenderAll();
  }

  _arrangeSection(obj) {
    const body = document.createElement('div');
    body.className = 'prop-grid4';
    const actions = [
      ['ArrowUpToLine', 'Bring to front', () => this.ops.arrange('front')],
      ['ArrowDownToLine', 'Send to back', () => this.ops.arrange('back')],
      ['ArrowUpNarrowWide', 'Bring forward', () => this.ops.arrange('forward')],
      ['ArrowDownNarrowWide', 'Send backward', () => this.ops.arrange('backward')]
    ];
    actions.forEach(([ic, title, fn]) => {
      const b = iconBtn(ic, { title, size: 15, onClick: () => { fn(); } });
      b.style.width = '100%';
      b.style.height = '30px';
      body.appendChild(b);
    });
    return this._section('Order', body);
  }

  _dangerSection(obj) {
    const body = document.createElement('div');
    body.className = 'inline-row';
    const dup = document.createElement('button');
    dup.className = 'btn btn-ghost';
    dup.style.flex = '1';
    dup.innerHTML = svg('CopyPlus', 14) + 'Duplicate';
    dup.addEventListener('click', () => this.app.ops.duplicate());
    const del = document.createElement('button');
    del.className = 'btn danger-btn';
    del.style.flex = '1';
    del.innerHTML = svg('Trash2', 14) + 'Delete';
    del.addEventListener('click', () => this.ops.delete());
    body.appendChild(dup);
    body.appendChild(del);
    return section('Actions', body);
  }

  /* ====================== MULTI-SELECT ======================= */

  _multiTextSection(textObjs) {
    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '10px';

    // 1. Font picker (updates all selected texts at once)
    const fp = document.createElement('button');
    fp.className = 'font-picker-btn';
    const firstFont = textObjs[0].fontFamily || 'Inter';
    const isSameFont = textObjs.every(t => t.fontFamily === firstFont);
    const fpLabel = document.createElement('span');
    fpLabel.textContent = isSameFont ? firstFont : `Mixed fonts (${textObjs.length})`;
    if (isSameFont) fpLabel.style.fontFamily = `"${firstFont}", sans-serif`;
    fp.appendChild(fpLabel);
    fp.appendChild(Object.assign(document.createElement('span'), { className: 'font-picker-caret', innerHTML: svg('ChevronDown', 14) }));
    fp.addEventListener('click', () => this._toggleFontPicker(fp, textObjs));
    body.appendChild(fp);

    // 2. Font size: relative A- / A+ buttons AND absolute scrub
    const sizeRow = document.createElement('div');
    sizeRow.className = 'inline-row';
    sizeRow.style.width = '100%';

    const firstSize = Math.round(textObjs[0].fontSize || 24);
    const isSameSize = textObjs.every(t => Math.round(t.fontSize || 24) === firstSize);

    const sizeScrub = scrub({
      value: isSameSize ? firstSize : firstSize,
      min: 6, max: 600, suffix: 'px',
      onInput: (v) => {
        textObjs.forEach(t => {
          t.set('fontSize', v);
          if (t.initDimensions) t.initDimensions();
          if (t.setCoords) t.setCoords();
        });
        const a = this.canvas.getActiveObject();
        if (a && a.setCoords) a.setCoords();
        this.canvas.requestRenderAll();
      },
      onChange: (v) => {
        textObjs.forEach(t => {
          t.set('fontSize', v);
          if (t.initDimensions) t.initDimensions();
          if (t.setCoords) t.setCoords();
        });
        const a = this.canvas.getActiveObject();
        if (a && a.setCoords) a.setCoords();
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
    });
    sizeScrub.style.flex = '1';
    sizeScrub.style.minWidth = '0';

    const sMinus = iconBtn('Minus', {
      title: 'Decrease size for all (-2px)',
      size: 13,
      onClick: () => {
        textObjs.forEach(t => {
          const cur = t.fontSize || 24;
          t.set('fontSize', Math.max(6, cur - 2));
          if (t.initDimensions) t.initDimensions();
          if (t.setCoords) t.setCoords();
        });
        const a = this.canvas.getActiveObject();
        if (a && a.setCoords) a.setCoords();
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        this.render();
      }
    });

    const sPlus = iconBtn('Plus', {
      title: 'Increase size for all (+2px)',
      size: 13,
      onClick: () => {
        textObjs.forEach(t => {
          const cur = t.fontSize || 24;
          t.set('fontSize', Math.min(600, cur + 2));
          if (t.initDimensions) t.initDimensions();
          if (t.setCoords) t.setCoords();
        });
        const a = this.canvas.getActiveObject();
        if (a && a.setCoords) a.setCoords();
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
        this.render();
      }
    });

    sMinus.style.flex = '0 0 28px';
    sPlus.style.flex = '0 0 28px';
    sizeRow.appendChild(sizeScrub);
    sizeRow.appendChild(sMinus);
    sizeRow.appendChild(sPlus);
    body.appendChild(sizeRow);

    // 3. Style Row: Bold, Italic, Underline
    const styleRow = document.createElement('div');
    styleRow.className = 'inline-row';
    const allBold = textObjs.every(t => t.fontWeight >= 600 || t.fontWeight === 'bold');
    const allItalic = textObjs.every(t => t.fontStyle === 'italic');
    const allUnderline = textObjs.every(t => !!t.underline);

    const bBtn = this._styleToggle('Bold', allBold, () => {
      const nextBold = !allBold;
      textObjs.forEach(t => t.set('fontWeight', nextBold ? 700 : 400));
      this.canvas.requestRenderAll();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      this.render();
    });

    const iBtn = this._styleToggle('Italic', allItalic, () => {
      const nextItalic = !allItalic;
      textObjs.forEach(t => t.set('fontStyle', nextItalic ? 'italic' : 'normal'));
      this.canvas.requestRenderAll();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      this.render();
    });

    const uBtn = this._styleToggle('Underline', allUnderline, () => {
      const nextU = !allUnderline;
      textObjs.forEach(t => t.set('underline', nextU));
      this.canvas.requestRenderAll();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      this.render();
    });

    styleRow.append(bBtn, iBtn, uBtn);
    body.appendChild(styleRow);

    // 4. Alignment
    const alignRow = document.createElement('div');
    alignRow.className = 'inline-row';
    const firstAlign = textObjs[0].textAlign || 'left';
    const alignSeg = segmented([
      { value: 'left', icon: 'AlignLeft', title: 'Align left' },
      { value: 'center', icon: 'AlignCenter', title: 'Align center' },
      { value: 'right', icon: 'AlignRight', title: 'Align right' },
      { value: 'justify', icon: 'AlignJustify', title: 'Justify' }
    ], {
      value: firstAlign,
      onChange: (v) => {
        textObjs.forEach(t => t.set('textAlign', v));
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
    });
    alignRow.appendChild(alignSeg);
    body.appendChild(alignRow);

    // 5. Text Color (Fill)
    const curColor = textObjs[0].fill && /^#/.test(String(textObjs[0].fill)) ? String(textObjs[0].fill) : '#0f172a';
    const cc = colorControl({
      value: curColor,
      themeManager: this.app.themeManager,
      themeToken: textObjs[0].themeColor?.fill || null,
      onThemeChange: (token) => {
        textObjs.forEach(t => {
          if (token) this.app.themeManager.bindObjectToTheme(t, 'fill', token);
          else this.app.themeManager.unbindObjectFromTheme(t, 'fill');
        });
        this.render();
      },
      onInput: (c) => {
        textObjs.forEach(t => {
          this.app.themeManager.unbindObjectFromTheme(t, 'fill');
          t.set('fill', c);
        });
        this.canvas.requestRenderAll();
      },
      onChange: (c) => {
        textObjs.forEach(t => {
          this.app.themeManager.unbindObjectFromTheme(t, 'fill');
          t.set('fill', c);
        });
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
    });
    cc.style.flex = '1';
    const colorRow = document.createElement('div');
    colorRow.className = 'prop-row';
    colorRow.appendChild(cc);
    body.appendChild(this._row('Text color', colorRow));

    // 6. Spacing: line height + letter spacing
    const firstLh = +(textObjs[0].lineHeight || 1.2);
    const lh = scrub({
      value: firstLh, min: 0.5, max: 3.2, step: 0.05, precision: 2, suffix: '×',
      onInput: (v) => {
        textObjs.forEach(t => t.set('lineHeight', v));
        this.canvas.requestRenderAll();
      },
      onChange: (v) => {
        textObjs.forEach(t => t.set('lineHeight', v));
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
    });
    const firstLs = Math.round((textObjs[0].charSpacing || 0) / 10);
    const ls = scrub({
      value: firstLs, min: -20, max: 100, step: 1, suffix: '%',
      onInput: (v) => {
        textObjs.forEach(t => t.set('charSpacing', v * 10));
        this.canvas.requestRenderAll();
      },
      onChange: (v) => {
        textObjs.forEach(t => t.set('charSpacing', v * 10));
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
    });
    body.appendChild(this._row('Line height', lh));
    body.appendChild(this._row('Letter spacing', ls));

    return this._section(`Typography (${textObjs.length})`, body);
  }

  renderMulti() {
    const host = this.host;
    host.innerHTML = '';
    const objs = this.activeObjs;
    const ops = this.ops;

    // Collect all text objects (directly selected or inside selected groups)
    const textObjs = [];
    const walkText = (items) => {
      for (const o of items) {
        if (['i-text', 'textbox', 'text'].includes(o.type)) {
          textObjs.push(o);
        } else if (o.type === 'group' && o._objects && !o._isIcon && !o.custom?.maskWrap) {
          walkText(o._objects);
        }
      }
    };
    walkText(objs);

    const head = document.createElement('div');
    head.className = 'panel-head';
    const textCountLabel = textObjs.length ? ` · ${textObjs.length} text layers` : '';
    head.innerHTML = `<div class="panel-head-title">${objs.length} objects selected${textCountLabel}</div>`;
    host.appendChild(head);

    const scroll = document.createElement('div');
    scroll.className = 'panel-scroll';
    host.appendChild(scroll);

    // Multi-text typography section if any text is in the selection!
    if (textObjs.length > 0) {
      scroll.appendChild(this._multiTextSection(textObjs));
    }

    // align target
    let target = 'selection';
    const targetSeg = segmented([
      { value: 'selection', label: 'Each other' },
      { value: 'page', label: 'Page' }
    ], {
      value: target,
      onChange: (v) => { target = v; }
    });

    // align grid
    const alignGrid = document.createElement('div');
    alignGrid.className = 'prop-grid3';
    const alignDefs = [
      ['left', 'AlignLeft', 'Align left'], ['centerX', 'AlignCenter', 'Align center'],
      ['right', 'AlignRight', 'Align right'],
      ['top', 'AlignStartVertical', 'Align top'], ['middle', 'AlignCenterVertical', 'Align middle'],
      ['bottom', 'AlignEndVertical', 'Align bottom']
    ];
    const alignButtons = [];
    alignDefs.forEach(([mode, ic, title]) => {
      const b = iconBtn(ic, { title, size: 15, onClick: () => ops.align(mode, target) });
      b.style.width = '100%';
      b.style.height = '30px';
      alignButtons.push(b);
      alignGrid.appendChild(b);
    });
    const alignGroup = [alignButtons];

    const distRow = document.createElement('div');
    distRow.className = 'inline-row';
    const dh = iconBtn('AlignHorizontalDistributeCenter', { title: 'Distribute horizontally', size: 16, onClick: () => ops.distribute('h') });
    const dv = iconBtn('AlignVerticalDistributeCenter', { title: 'Distribute vertically', size: 16, onClick: () => ops.distribute('v') });
    distRow.append(dh, dv);
    distRow.appendChild(document.createTextNode(' '));

    const matchRow = document.createElement('div');
    matchRow.className = 'inline-row';
    const mw = iconBtn('StretchHorizontal', { title: 'Match widths', size: 15, onClick: () => ops.matchSize('w') });
    const mh = iconBtn('StretchVertical', { title: 'Match heights', size: 15, onClick: () => ops.matchSize('h') });
    const mb = iconBtn('Maximize', { title: 'Match both', size: 15, onClick: () => ops.matchSize('both') });
    matchRow.append(mw, mh, mb);

    const orderRow = document.createElement('div');
    orderRow.className = 'inline-row';
    const f = iconBtn('ArrowUpToLine', { title: 'Bring to front', size: 15, onClick: () => ops.arrange('front') });
    const b = iconBtn('ArrowDownToLine', { title: 'Send to back', size: 15, onClick: () => ops.arrange('back') });
    const g = iconBtn('Group', { title: 'Group (Cmd+G)', size: 15, onClick: () => ops.group() });
    const dup = iconBtn('CopyPlus', { title: 'Duplicate (Cmd+D)', size: 15, onClick: () => ops.duplicate() });
    const del = iconBtn('Trash2', { title: 'Delete', size: 15, onClick: () => ops.delete() });
    del.classList.add('danger');
    orderRow.append(f, b, g, dup, del);

    scroll.appendChild(this._section('Align', (() => {
      const c = document.createElement('div');
      c.style.display = 'flex';
      c.style.flexDirection = 'column';
      c.style.gap = '8px';
      c.appendChild(targetSeg);
      c.appendChild(alignGrid);
      c.appendChild(distRow);
      return c;
    })()));
    scroll.appendChild(this._section('Resize & arrange', (() => {
      const c = document.createElement('div');
      c.style.display = 'flex';
      c.style.flexDirection = 'column';
      c.style.gap = '8px';
      c.appendChild(matchRow);
      c.appendChild(orderRow);
      return c;
    })()));

    // opacity for all
    const op = slider({
      value: 100, min: 5, max: 100, step: 1, format: (v) => `${v}%`,
      onInput: (v) => {
        objs.forEach(o => o.set('opacity', v / 100));
        this.canvas.requestRenderAll();
      },
      onChange: (v) => {
        objs.forEach(o => o.set('opacity', v / 100));
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
    });
    scroll.appendChild(this._section('Opacity', op));
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
