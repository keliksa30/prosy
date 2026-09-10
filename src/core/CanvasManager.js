import * as fabric from 'fabric';
import { installRadiusControls } from './RadiusControl.js';
import { SmartGuides } from './SmartGuides.js';
import { PathEditMode } from './PathEditMode.js';
import { installEffectsRenderer } from './EffectsRenderer.js';

const RULER = 18; // px chrome strip for the rulers

/**
 * CanvasManager
 * ------------------------------------------------------------------
 * The page (1920×1080) is a FIXED logical size. Zooming and panning only
 * ever change the VIEWPORT — never the page or its objects. This mirrors
 * Google Slides / Figma behavior:
 *
 *   - The fabric canvas backing store + CSS size are resized to
 *     pageSize * zoom on every zoom change, so rendering stays crisp at
 *     any level and nothing is ever clipped.
 *   - The canvas element is wrapped in .canvas-wrapper which is panned
 *     via CSS translate(). Fabric's viewportTransform holds ONLY the
 *     zoom factor (translation 0), so pointer math stays exact
 *     (fabric v7 divides pointer coords by zoom and maps physical →
 *     CSS sizes via its cssScale term).
 *   - Retina scaling is disabled above 100% zoom to keep backing-store
 *     memory sane.
 *
 * Public zoom API: zoomBy(factor, anchor?), setZoom(percent, anchor?),
 * fitToScreen(), zoomToFitOrHundred(), panBy(dx,dy), setPan(tx,ty),
 * resetView().
 */
export class CanvasManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.canvas = null;
    this.wrapper = null;
    this.viewport = null;

    this.PAGE_W = options.width || 1920;
    this.PAGE_H = options.height || 1080;

    this.MIN_ZOOM = 0.05;
    this.MAX_ZOOM = 2;

    this.isPanning = false;
    this.panLastX = 0;
    this.panLastY = 0;
    this._boundHandlers = {};
  }

  init() {
    this.viewport = document.querySelector('.canvas-viewport') || document.querySelector('.canvas-container');
    this.wrapper = document.querySelector('.canvas-wrapper');

    // Wrapper is the page "surface": it shrink-wraps the canvas and is
    // positioned absolutely at the viewport origin. Panning translates it.
    this.wrapper.style.position = 'absolute';
    this.wrapper.style.top = '0px';
    this.wrapper.style.left = '0px';
    this.wrapper.style.transform = 'translate(0px, 0px)';
    this.wrapper.style.transformOrigin = '0 0';
    this.wrapper.style.willChange = 'transform';

    const canvasEl = document.createElement('canvas');
    canvasEl.id = this.containerId;
    this.wrapper.appendChild(canvasEl);

    installEffectsRenderer();

    this.canvas = new fabric.Canvas(this.containerId, {
      width: this.PAGE_W,
      height: this.PAGE_H,
      preserveObjectStacking: true,
      subTargetCheck: true,
      // Retina stays OFF and static: toggling it per-zoom corrupts fabric's
      // object cache canvases (clipPath compositing breaks); static backing
      // = CSS size keeps clipping deterministic and memory bounded.
      enableRetinaScaling: false,
      backgroundColor: '#ffffff',
      stopContextMenu: true // we render our own context menu
    });

    // Touch-friendly selection controls on mobile/tablet screens
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && fabric.FabricObject) {
      fabric.FabricObject.prototype.cornerSize = 20;
      fabric.FabricObject.prototype.touchCornerSize = 34;
      fabric.FabricObject.prototype.transparentCorners = false;
      fabric.FabricObject.prototype.cornerColor = '#7b46f8';
      fabric.FabricObject.prototype.cornerStrokeColor = '#ffffff';
      fabric.FabricObject.prototype.borderColor = '#7b46f8';
      fabric.FabricObject.prototype.borderScaleFactor = 2;
    }

    // extra on-canvas controls (rect corner-radius handle) follow every rect
    installRadiusControls(this.canvas);

    // Illustrator-style paragraph text reflow: scaling a textbox reflows its width
    // rather than distorting/stretching its font size
    this.canvas.on('object:scaling', (e) => {
      const target = e.target;
      if (target && target.type === 'textbox') {
        const w = Math.max(40, Math.round(target.width * (target.scaleX || 1)));
        target.set({
          width: w,
          scaleX: 1,
          scaleY: 1
        });
        target.setCoords();
      }
    });

    // Hyperlink visual indicator: render a tiny link badge on objects that have
    // a custom.hyperlink set. Runs after every render cycle.
    this.canvas.on('after:render', () => this._drawHyperlinkBadges());

    this.setupZoomAndPan();
    this.fitToScreen(true);
    this.setupRulers();
    this.setupDragAndDrop();
    this.smartGuides = new SmartGuides(this);
    this.pathEditMode = new PathEditMode(this);

    let resizeTimer = null;
    let lastW = typeof window !== 'undefined' ? window.innerWidth : 0;
    let lastH = typeof window !== 'undefined' ? window.innerHeight : 0;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const curW = typeof window !== 'undefined' ? window.innerWidth : 0;
        const curH = typeof window !== 'undefined' ? window.innerHeight : 0;
        if (Math.abs(curW - lastW) > 12 || Math.abs(curH - lastH) > 40) {
          lastW = curW;
          lastH = curH;
          this.fitToScreen(true);
        }
      }, 150);
    });
    return this.canvas;
  }

  /* ------------------------------------------------------------------ */
  /* Hyperlink badges                                                     */
  /* ------------------------------------------------------------------ */

  _drawHyperlinkBadges() {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = canvas.getTopContext?.() || canvas.contextTop;
    if (!ctx) return;
    const zoom = this.getZoom();

    const objs = canvas.getObjects();
    for (const obj of objs) {
      if (!obj.custom?.hyperlink || obj.visible === false) continue;
      try {
        const rect = obj.getBoundingRect();
        // Position badge at top-right corner
        const bx = (rect.left + rect.width) * zoom - 18;
        const by = rect.top * zoom + 2;
        const size = 14;

        ctx.save();
        ctx.globalAlpha = 0.7;
        // Badge background
        ctx.fillStyle = '#7b46f8';
        ctx.beginPath();
        ctx.arc(bx + size / 2, by + size / 2, size / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        // Link icon (simple chain-link symbol)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Simplified link icon
        ctx.moveTo(bx + 4, by + size / 2);
        ctx.lineTo(bx + size - 4, by + size / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + 4, by + size / 2, 3, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx + size - 4, by + size / 2, 3, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();
        ctx.restore();
      } catch (e) {
        // skip if bounding rect fails
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Zoom / pan core                                                     */
  /* ------------------------------------------------------------------ */

  getPageWidth()  { return this.PAGE_W; }
  getPageHeight() { return this.PAGE_H; }
  getPageSize()   { return { width: this.PAGE_W, height: this.PAGE_H }; }

  getZoom() {
    const vpt = this.canvas ? this.canvas.viewportTransform : null;
    return vpt ? vpt[0] : 1;
  }

  /** wrapper translate (pan), css px */
  getPan() {
    if (!this.wrapper) return { x: 0, y: 0 };
    const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(this.wrapper.style.transform);
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
  }

  _applyView(zoom, panX, panY) {
    zoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, zoom));
    // Backing store = CSS size (static, retina disabled) — bounded memory,
    // deterministic clipPath/object caching at every zoom level.
    this.canvas.setDimensions({ width: this.PAGE_W * zoom, height: this.PAGE_H * zoom });
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    this.wrapper.style.transform = `translate(${Math.round(panX)}px, ${Math.round(panY)}px)`;
    this.canvas.requestRenderAll();
    this._drawRulers();
    document.dispatchEvent(new CustomEvent('prosy:zoomChanged', { detail: { zoom: Math.round(zoom * 100) } }));
  }

  /**
   * Set zoom (percent) keeping the scene point under `anchorCss`
   * (viewport-space css px, {x,y}) fixed on screen.
   */
  setZoom(percent, anchorCss = null) {
    if (!this.canvas) return;
    const z = percent / 100;
    const pan = this.getPan();
    if (anchorCss) {
      // Scene point under the anchor before the zoom.
      const vp = this._anchorToScene(anchorCss);
      this._applyView(z, 0, 0);
      // Where the page top-left must sit so that vp stays under the anchor.
      this.setPan(anchorCss.x - vp.x * z, anchorCss.y - vp.y * z);
    } else {
      this._applyView(z, pan.x, pan.y);
    }
  }

  zoomBy(factor, anchorCss = null) {
    this.setZoom(Math.round(this.getZoom() * 100 * factor) / 100 * 100, anchorCss);
  }

  /** map a viewport-space css point to scene coordinates */
  _anchorToScene(anchorCss) {
    const pan = this.getPan();
    const z = this.getZoom();
    return { x: (anchorCss.x - pan.x) / z, y: (anchorCss.y - pan.y) / z };
  }

  setPan(tx, ty) {
    const z = this.getZoom();
    this.wrapper.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px)`;
    this.canvas.setViewportTransform([z, 0, 0, z, 0, 0]);
    this.canvas.requestRenderAll();
    this._drawRulers();
  }

  panBy(dx, dy) {
    const p = this.getPan();
    this.setPan(p.x + dx, p.y + dy);
  }

  /** scene point → viewport css px (for guide overlays etc.) */
  sceneToScreen(sceneX, sceneY) {
    const p = this.getPan();
    const z = this.getZoom();
    return { x: sceneX * z + p.x, y: sceneY * z + p.y };
  }

  /** current visible scene rect */
  getVisibleSceneRect() {
    const vw = this.viewport ? this.viewport.clientWidth : this.PAGE_W;
    const vh = this.viewport ? this.viewport.clientHeight : this.PAGE_H;
    const tl = this._anchorToScene({ x: 0, y: 0 });
    const br = this._anchorToScene({ x: vw, y: vh });
    return { left: tl.x, top: tl.y, right: br.x, bottom: br.y };
  }

  fitToScreen(keepPercentAtHundred = false) {
    if (!this.canvas || !this.viewport) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const padding = isMobile ? 12 : 48;
    const vw = Math.max(100, this.viewport.clientWidth - padding * 2);
    const vh = Math.max(100, this.viewport.clientHeight - padding * 2);
    let z = Math.min(vw / this.PAGE_W, vh / this.PAGE_H);
    z = Math.min(1, Math.max(this.MIN_ZOOM, z)); // never upscale on fit
    const tx = (this.viewport.clientWidth - this.PAGE_W * z) / 2;
    const ty = (this.viewport.clientHeight - this.PAGE_H * z) / 2;
    this._applyView(z, tx, ty);
  }

  /** Fit if page currently overflows the viewport, else 100%. */
  fitOrHundred() {
    if (!this.viewport) return this.setZoom(100, null);
    const { width, height } = this.viewport.getBoundingClientRect();
    const fits = this.PAGE_W * this.getZoom() <= width - 8 && this.PAGE_H * this.getZoom() <= height - 8;
    if (fits) this.setZoom(100, null);
    else this.fitToScreen();
  }

  /* ------------------------------------------------------------------ */
  /* Input handling: wheel zoom (ctrl/cmd/alt + wheel or plain pinch),   */
  /* middle-drag / alt-drag panning                                      */
  /* ------------------------------------------------------------------ */

  setupZoomAndPan() {
    const viewport = this.viewport;

    // Wheel zoom anchored at the cursor. Works over the page and over the
    // gray workspace around it.
    viewport.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey || e.altKey)) return; // plain scroll not hijacked
      e.preventDefault();
      e.stopPropagation();
      const rect = viewport.getBoundingClientRect();
      const anchor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const factor = Math.exp(-e.deltaY * 0.0015);
      const z = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.getZoom() * factor));
      this.setZoom(z * 100, anchor);
    }, { passive: false });

    // --- Panning ---
    const down = (e) => {
      const wantsPan = e.button === 1 || e.altKey || (e.button === 0 && this.spaceDown);
      if (!wantsPan) return;
      e.preventDefault();
      this.isPanning = true;
      this.panLastX = e.clientX;
      this.panLastY = e.clientY;
      const upper = this.wrapper.querySelector('.upper-canvas');
      if (upper) upper.style.cursor = 'grabbing';
    };
    const move = (e) => {
      if (!this.isPanning) return;
      this.panBy(e.clientX - this.panLastX, e.clientY - this.panLastY);
      this.panLastX = e.clientX;
      this.panLastY = e.clientY;
    };
    const up = (e) => {
      if (!this.isPanning) return;
      this.isPanning = false;
      const upper = this.wrapper.querySelector('.upper-canvas');
      if (upper) upper.style.cursor = '';
    };

    viewport.addEventListener('mousedown', down);
    viewport.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    // --- Touch Pinch-to-Zoom & Pan for Mobile ---
    let touchStartDist = 0;
    let touchStartZoom = 1;
    let touchLastCenter = null;

    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        touchStartZoom = this.getZoom();
        touchLastCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
      }
    }, { passive: false });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDist > 0 && touchLastCenter) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };

        const dx = center.x - touchLastCenter.x;
        const dy = center.y - touchLastCenter.y;
        this.panBy(dx, dy);

        const scale = dist / touchStartDist;
        const newZoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, touchStartZoom * scale));
        const rect = viewport.getBoundingClientRect();
        const anchor = { x: center.x - rect.left, y: center.y - rect.top };
        this.setZoom(newZoom * 100, anchor);

        touchLastCenter = center;
      }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        touchStartDist = 0;
        touchLastCenter = null;
      }
    });


    // Clicking the gray workspace around the page deselects everything.
    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const inCanvas = e.target && e.target.closest && e.target.closest('.canvas-container');
      if (!inCanvas && this.canvas) {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      }
    });

    this._boundHandlers = { down, move, up };
  }

  setSpaceDown(v) {
    this.spaceDown = v;
  }

  /* ------------------------------------------------------------------ */
  /* Page appearance                                                     */
  /* ------------------------------------------------------------------ */

  setBackgroundColor(color) {
    if (!this.canvas) return;
    this.canvas.backgroundColor = color;
    this.canvas.requestRenderAll();
    document.dispatchEvent(new CustomEvent('prosy:canvasBgChanged', { detail: { color } }));
  }

  getBackgroundColor() {
    return this.canvas ? (this.canvas.backgroundColor || '#ffffff') : '#ffffff';
  }

  getCanvas() {
    return this.canvas;
  }

  getViewport() {
    return this.viewport;
  }

  /** true if scene point is inside the page bounds */
  isPointInPage(pt) {
    return pt && pt.x >= 0 && pt.y >= 0 && pt.x <= this.PAGE_W && pt.y <= this.PAGE_H;
  }

  /* ------------------------------------------------------------------ */
  /* Rulers (top + left chrome strips showing page coordinates)          */
  /* ------------------------------------------------------------------ */

  setupRulers() {
    const vp = this.viewport;
    if (!vp) return;
    this.rulersOn = localStorage.getItem('prosy.rulers') !== '0';

    this.rulerCorner = document.createElement('div');
    this.rulerCorner.className = 'prosy-ruler prosy-ruler-corner';
    this.rulerH = document.createElement('canvas');
    this.rulerH.className = 'prosy-ruler prosy-ruler-h';
    this.rulerV = document.createElement('canvas');
    this.rulerV.className = 'prosy-ruler prosy-ruler-v';
    vp.appendChild(this.rulerCorner);
    vp.appendChild(this.rulerH);
    vp.appendChild(this.rulerV);

    this._rulerResize = new ResizeObserver(() => { this._sizeRulers(); this._drawRulers(); });
    if (vp._prosyRulerObserved) this._rulerResize.disconnect();
    vp._prosyRulerObserved = true;
    this._rulerResize.observe(vp);
    this._sizeRulers();
    this._drawRulers();
  }

  setRulersVisible(on) {
    this.rulersOn = !!on;
    localStorage.setItem('prosy.rulers', this.rulersOn ? '1' : '0');
    if (this.rulersOn) this._sizeRulers();
    this._drawRulers();
  }

  rulersVisible() {
    return this.rulersOn;
  }

  _sizeRulers() {
    if (!this.rulerH || !this.rulersOn) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(0, this.viewport.clientWidth - RULER);
    const h = Math.max(0, this.viewport.clientHeight - RULER);
    for (const [cv, cw, ch] of [[this.rulerH, w, RULER], [this.rulerV, RULER, h]]) {
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      cv.style.width = cw + 'px';
      cv.style.height = ch + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  _drawRulers() {
    if (!this.rulerH || !this.rulersOn) {
      if (this.rulerCorner) this.rulerCorner.style.display = 'none';
      if (this.rulerH) this.rulerH.style.display = 'none';
      if (this.rulerV) this.rulerV.style.display = 'none';
      return;
    }
    this.rulerCorner.style.display = 'block';
    this.rulerH.style.display = 'block';
    this.rulerV.style.display = 'block';

    const css = getComputedStyle(document.documentElement);
    const cBg = css.getPropertyValue('--bg-panel').trim() || '#1e1f24';
    const cPage = css.getPropertyValue('--bg-surface').trim() || '#26272e';
    const cTick = css.getPropertyValue('--text-muted').trim() || '#6b6e78';
    const cText = css.getPropertyValue('--accent-text').trim() || '#c4b5fd';
    const cEdge = css.getPropertyValue('--border-strong').trim() || '#43464f';
    const z = this.getZoom();
    const pan = this.getPan();

    // page screen position inside each ruler's local space
    const toLocal = (axis, scene) => scene * z + (axis === 'x' ? pan.x : pan.y) - RULER;

    const step = this._tickStep(z);
    const major = step * 5;

    // ---- horizontal ruler ----
    const hr = this.rulerH.getContext('2d');
    const hw = this.rulerH.clientWidth, hh = this.rulerH.clientHeight;
    hr.clearRect(0, 0, hw, hh);
    hr.fillStyle = cBg;
    hr.fillRect(0, 0, hw, hh);
    const h0 = toLocal('x', 0);
    const h1 = toLocal('x', this.PAGE_W);
    if (h1 > 0 && h0 < hw) {
      hr.fillStyle = cPage;
      hr.fillRect(Math.max(0, h0), 0, Math.min(hw, h1) - Math.max(0, h0), hh);
      hr.font = '9px Inter, system-ui, sans-serif';
      hr.textBaseline = 'top';
      hr.fillStyle = cText;
      for (let s = Math.max(0, Math.floor(-toLocal('x', 0) / z / step) * step); s <= this.PAGE_W; s += step) {
        const x = toLocal('x', s);
        if (x < 0 || x > hw) continue;
        const isMajor = s % major === 0;
        const len = isMajor ? 8 : 4;
        hr.strokeStyle = isMajor ? cText : cTick;
        hr.beginPath();
        hr.moveTo(Math.round(x) + 0.5, hh - 1);
        hr.lineTo(Math.round(x) + 0.5, hh - 1 - len);
        hr.stroke();
        if (isMajor && s !== 0) {
          hr.fillStyle = cText;
          hr.fillText(String(s), Math.round(x) + 3, 1);
        }
      }
    }
    // page edge accents
    hr.fillStyle = cEdge;
    hr.fillRect(Math.max(0, Math.round(h0)) - 0.5, 0, 1, hh);
    if (h1 <= hw) hr.fillRect(Math.max(0, Math.round(h1)) - 0.5, 0, 1, hh);

    // ---- vertical ruler ----
    const vr = this.rulerV.getContext('2d');
    const vw = this.rulerV.clientWidth, vh = this.rulerV.clientHeight;
    vr.clearRect(0, 0, vw, vh);
    vr.fillStyle = cBg;
    vr.fillRect(0, 0, vw, vh);
    const v0 = toLocal('y', 0);
    const v1 = toLocal('y', this.PAGE_H);
    if (v1 > 0 && v0 < vh) {
      vr.fillStyle = cPage;
      vr.fillRect(0, Math.max(0, v0), vw, Math.min(vh, v1) - Math.max(0, v0));
      vr.font = '9px Inter, system-ui, sans-serif';
      vr.textBaseline = 'middle';
      vr.fillStyle = cText;
      for (let s = Math.max(0, Math.floor(-toLocal('y', 0) / z / step) * step); s <= this.PAGE_H; s += step) {
        const y = toLocal('y', s);
        if (y < 0 || y > vh) continue;
        const isMajor = s % major === 0;
        const len = isMajor ? 8 : 4;
        vr.strokeStyle = isMajor ? cText : cTick;
        vr.beginPath();
        vr.moveTo(vw - 1, Math.round(y) + 0.5);
        vr.lineTo(vw - 1 - len, Math.round(y) + 0.5);
        vr.stroke();
        if (isMajor && s !== 0) {
          vr.save();
          vr.translate(vw - 12, Math.round(y));
          vr.rotate(-Math.PI / 2);
          vr.fillStyle = cText;
          vr.fillText(String(s), 0, 0);
          vr.restore();
        }
      }
    }
    vr.fillStyle = cEdge;
    vr.fillRect(0, Math.max(0, Math.round(v0)) - 0.5, vw, 1);
    if (v1 <= vh) vr.fillRect(0, Math.max(0, Math.round(v1)) - 0.5, vw, 1);
  }

  /** smallest power-of-10-friendly step whose ticks stay ≥ 8 px apart */
  _tickStep(zoom) {
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];
    for (const s of steps) {
      if (s * zoom >= 8) return s;
    }
    return 10000;
  }

  /* ------------------------------------------------------------------ */
  /* Drag & Drop direct image file import                               */
  /* ------------------------------------------------------------------ */

  setupDragAndDrop() {
    const viewport = this.viewport;
    if (!viewport) return;

    const isImageFile = (file) => {
      if (file.type && file.type.startsWith('image/')) return true;
      return /\.(png|jpe?g|webp|svg|gif|bmp|ico)$/i.test(file.name || '');
    };

    viewport.addEventListener('dragenter', (e) => {
      const types = Array.from(e.dataTransfer?.types || []);
      if (types.includes('Files') || types.includes('text/prosy-photo-url')) {
        e.preventDefault();
        viewport.classList.add('drag-over-active');
      }
    });

    viewport.addEventListener('dragover', (e) => {
      const types = Array.from(e.dataTransfer?.types || []);
      if (types.includes('Files') || types.includes('text/prosy-photo-url')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    });

    viewport.addEventListener('dragleave', (e) => {
      if (!viewport.contains(e.relatedTarget)) {
        viewport.classList.remove('drag-over-active');
      }
    });

    viewport.addEventListener('drop', async (e) => {
      viewport.classList.remove('drag-over-active');

      // Handle stock photo drop from PhotosPanel
      const photoUrl = e.dataTransfer?.getData('text/prosy-photo-url');
      if (photoUrl) {
        e.preventDefault();
        e.stopPropagation();

        let scenePos = null;
        if (this.canvas && typeof this.canvas.getScenePoint === 'function') {
          try { scenePos = this.canvas.getScenePoint(e); } catch (err) {}
        }
        if (!scenePos) {
          const rect = viewport.getBoundingClientRect();
          const dropCss = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          scenePos = this._anchorToScene(dropCss);
        }

        const ops = this.app?.ops || this.app?.objectOps;
        const hitPlaceholder = this.findPlaceholderTarget(null, null, scenePos);
        if (hitPlaceholder && ops) {
          await ops.fillPlaceholderWithImage(hitPlaceholder, photoUrl);
          this.app.toast?.('Photo clipped into shape');
        } else {
          try {
            const img = await fabric.FabricImage.fromURL(photoUrl, { crossOrigin: 'anonymous' });
            if (img) {
              const maxDim = 500;
              const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
              img.scale(scale);
              img.set({
                left: scenePos.x - (img.width * scale) / 2,
                top: scenePos.y - (img.height * scale) / 2,
                originX: 'left',
                originY: 'top',
                name: 'Photo'
              });
              this.canvas.add(img);
              this.canvas.setActiveObject(img);
              this.canvas.requestRenderAll();
              this.app.historyManager?.saveState();
              this.app.toast?.('Photo added to page');
            }
          } catch (err) {
            console.error('Failed to drop photo', err);
          }
        }
        return;
      }

      const allFiles = Array.from(e.dataTransfer?.files || []);
      if (!allFiles.length) return;

      const prsFile = allFiles.find(f => /\.prs$/i.test(f.name || ''));
      if (prsFile) {
        e.preventDefault();
        e.stopPropagation();
        this.app.projectFileManager?.loadFromPrs(prsFile).catch(err => {
          this.app.toast?.('Error loading project: ' + err.message, true);
        });
        return;
      }

      const files = allFiles.filter(isImageFile);
      if (!files.length) return;
      e.preventDefault();
      e.stopPropagation();

      for (const file of files) {
        let scenePos = null;
        if (this.canvas && typeof this.canvas.getScenePoint === 'function') {
          try { scenePos = this.canvas.getScenePoint(e); } catch (err) {}
        }
        if (!scenePos) {
          const rect = viewport.getBoundingClientRect();
          const dropCss = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          scenePos = this._anchorToScene(dropCss);
        }

        const ops = this.app?.ops || this.app?.objectOps;
        const hitPlaceholder = this.findPlaceholderTarget(null, null, scenePos);
        if (hitPlaceholder && ops) {
          await ops.fillPlaceholderWithImage(hitPlaceholder, file);
        } else {
          await this.importImageFile(file, scenePos);
        }
      }
    });
  }

  _isPlaceholderShape(obj) {
    if (!obj || obj.visible === false) return false;
    if (obj.width >= 1800 && obj.height >= 1000) return false;
    if (obj.name === 'Background' || obj.name === 'Bg') return false;
    if (obj.type === 'image') return false;
    if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') return false;

    if (obj._isIcon || obj.name === 'Icon') return false;

    if (obj.custom?.isPhotoPlaceholder) return true;
    if (obj.custom?.maskWrap) return true;
    if (obj.custom?.shapeKey) return true;
    const n = (obj.name || '').toLowerCase();
    if (n.includes('photo') || n.includes('frame') || n.includes('slot') || n.includes('viewport') || n.includes('screen')) {
      return true;
    }
    // Any geometric shape can act as a drop / placeholder target
    if (['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon'].includes(obj.type)) {
      return true;
    }
    return false;
  }

  findPlaceholderTarget(target, subTargets, scenePt) {
    const pt = scenePt ? (scenePt instanceof fabric.Point ? scenePt : new fabric.Point(scenePt.x, scenePt.y)) : null;

    // 1. If target is an existing masked group
    if (target && target.custom?.maskWrap && (target.clipPath || target.custom?._maskData)) {
      return { type: 'masked-group', obj: target };
    }

    // 2. If target is a Group (e.g. ig-post, mobile-frame, photogrid)
    if (target && target.type === 'group' && target._objects) {
      if (subTargets && subTargets.length) {
        for (const st of subTargets) {
          if (this._isPlaceholderShape(st)) {
            return { type: 'group-child', group: target, child: st };
          }
        }
      }
      if (pt) {
        let localPt = null;
        try {
          localPt = fabric.util.sendPointToPlane(pt, undefined, target.calcTransformMatrix());
        } catch (e) {}
        if (localPt) {
          for (let i = target._objects.length - 1; i >= 0; i--) {
            const ch = target._objects[i];
            if (this._isPlaceholderShape(ch) && ch.containsPoint && ch.containsPoint(localPt)) {
              return { type: 'group-child', group: target, child: ch };
            }
          }
        }
      }
      for (let i = target._objects.length - 1; i >= 0; i--) {
        const ch = target._objects[i];
        if (this._isPlaceholderShape(ch)) {
          return { type: 'group-child', group: target, child: ch };
        }
      }
    }

    // 3. If target itself is a standalone placeholder / shape
    if (target && this._isPlaceholderShape(target)) {
      return { type: 'standalone', obj: target };
    }

    // 4. If target is a helper child (camera icon or label text)
    if (target && (target.custom?.isPhotoPlaceholderChild || /icon|label|hint/i.test(target.name || ''))) {
      if (typeof target.exitEditing === 'function' && target.isEditing) {
        target.exitEditing();
      }
      this.canvas.discardActiveObject();
      const pTag = target.custom?.placeholderTag;
      const canvasObjs = this.canvas.getObjects();
      if (pTag) {
        const box = canvasObjs.find(o => (o.custom?.placeholderTag === pTag || o.name === pTag) && this._isPlaceholderShape(o));
        if (box) return { type: 'standalone', obj: box };
      }
      const baseName = (target.name || '').replace(/\s*(Icon|Label|Hint|Text).*$/i, '');
      if (baseName) {
        const box = canvasObjs.find(o => (o.name === `${baseName} Box` || o.name === `${baseName} Frame` || o.name === baseName) && this._isPlaceholderShape(o));
        if (box) return { type: 'standalone', obj: box };
      }
    }

    // 5. Look for any placeholder object / shape containing pt
    if (pt) {
      const fPt = pt instanceof fabric.Point ? pt : new fabric.Point(pt.x, pt.y);

      // Primary: Fabric's accurate hierarchy and transformation hit test
      if (this.canvas && typeof this.canvas._searchPossibleTargets === 'function') {
        const subTargets = [];
        const searchRes = this.canvas._searchPossibleTargets(this.canvas.getObjects(), fPt, subTargets);
        const hitObj = searchRes?.target;

        if (hitObj && hitObj.visible !== false && hitObj.name !== 'Background' && hitObj.name !== 'Bg') {
          if (hitObj.type === 'group' && hitObj._objects) {
            // First check subTargets
            if (subTargets && subTargets.length) {
              for (let i = subTargets.length - 1; i >= 0; i--) {
                const st = subTargets[i];
                if (this._isPlaceholderShape(st)) {
                  return { type: 'group-child', group: hitObj, child: st };
                }
              }
            }
            // Check children via _checkTarget
            for (let j = hitObj._objects.length - 1; j >= 0; j--) {
              const ch = hitObj._objects[j];
              if (this._isPlaceholderShape(ch) && this.canvas._checkTarget && this.canvas._checkTarget(ch, fPt)) {
                return { type: 'group-child', group: hitObj, child: ch };
              }
            }
            // Fallback to designated photo slot in group
            const photoChild = hitObj._objects.find(c => c.custom?.isPhotoPlaceholder || /photo|frame|slot|viewport|screen/i.test(c.name || ''));
            if (photoChild) {
              return { type: 'group-child', group: hitObj, child: photoChild };
            }
          } else if (hitObj.custom?.maskWrap && (hitObj.clipPath || hitObj.custom?._maskData)) {
            return { type: 'masked-group', obj: hitObj };
          } else if (this._isPlaceholderShape(hitObj)) {
            return { type: 'standalone', obj: hitObj };
          }
        }
      }

      // Secondary fallback: manual reverse scan
      const canvasObjs = this.canvas.getObjects();
      for (let i = canvasObjs.length - 1; i >= 0; i--) {
        const o = canvasObjs[i];
        if (o === target || o.visible === false) continue;
        if (o.width >= 1800 && o.height >= 1000) continue;
        if (o.name === 'Background' || o.name === 'Bg') continue;
        if (o.type === 'group' && o._objects) {
          if (o.containsPoint && o.containsPoint(pt)) {
            const photoChild = o._objects.find(c => c.custom?.isPhotoPlaceholder || /photo|frame|slot|viewport|screen/i.test(c.name || ''));
            if (photoChild) return { type: 'group-child', group: o, child: photoChild };
          }
        } else if (o.custom?.maskWrap && (o.clipPath || o.custom?._maskData)) {
          if (o.containsPoint && o.containsPoint(pt)) {
            return { type: 'masked-group', obj: o };
          }
        } else if (this._isPlaceholderShape(o)) {
          if (o.containsPoint && o.containsPoint(pt)) {
            return { type: 'standalone', obj: o };
          }
        }
      }
    }

    return null;
  }

  async importImageFile(file, scenePos = null) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (f) => {
        try {
          const data = f.target.result;
          const img = await fabric.FabricImage.fromURL(data, { crossOrigin: 'anonymous' });
          const pw = this.PAGE_W || 1920;
          const ph = this.PAGE_H || 1080;
          const maxW = pw * 0.6;
          const maxH = ph * 0.6;
          if (img.width > maxW) img.scaleToWidth(maxW);
          if (img.getScaledHeight() > maxH) img.scaleToHeight(maxH);

          const posX = scenePos ? scenePos.x : pw / 2;
          const posY = scenePos ? scenePos.y : ph / 2;

          img.set({
            left: posX,
            top: posY,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            name: file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Image'
          });
          this.canvas.add(img);
          this.canvas.setActiveObject(img);
          this.canvas.requestRenderAll();
          document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
          resolve(img);
        } catch (err) {
          console.error('Failed to import dropped image', err);
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}
