import { BaseTool } from './ToolManager.js';

const SNAP_COLOR = '#ff2bd6';
const SNAP_TOLERANCE_CSS = 6; // px on screen

/**
 * SelectTool — marquee + smart guides + object snapping.
 *
 * While moving an object, its edges/centers snap to page edges, page
 * center and other objects' edges/centers (Google-Slides behavior) and
 * magenta guide lines are drawn on the canvas viewport.
 */
export class SelectTool extends BaseTool {
  constructor() {
    super();
    this.guideV = null;
    this.guideH = null;
    this._snapAxes = null;
    this.handleMoving = this.handleMoving.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this._bound = false;
  }

  activate() {
    this.canvas.selection = true;
    this.canvas.getObjects().forEach(obj => {
      obj.set('selectable', obj._userLocked ? false : true);
      obj.set('evented', obj._userLocked ? false : true);
    });
    this.canvas.defaultCursor = 'default';
    this._ensureGuides();
    if (!this._bound) {
      this.canvas.on('object:moving', this.handleMoving);
      this.canvas.on('object:scaling', this.handleMoving);
      this.canvas.on('mouse:up', this.handleUp);
      this._bound = true;
    }
  }

  deactivate() {
    this.canvas.selection = false;
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.hideGuides();
    if (this._bound) {
      this.canvas.off('object:moving', this.handleMoving);
      this.canvas.off('object:scaling', this.handleMoving);
      this.canvas.off('mouse:up', this.handleUp);
      this._bound = false;
    }
  }

  _ensureGuides() {
    const vp = this.appViewport();
    if (!vp) return;
    if (!this.guideV) {
      this.guideV = document.createElement('div');
      this.guideV.className = 'snap-guide snap-guide-v';
      this.guideH = document.createElement('div');
      this.guideH.className = 'snap-guide snap-guide-h';
      vp.appendChild(this.guideV);
      vp.appendChild(this.guideH);
      this.guideV.style.display = 'none';
      this.guideH.style.display = 'none';
    }
  }

  appViewport() {
    return this.toolManager.canvasManager ? this.toolManager.canvasManager.getViewport() : null;
  }

  hideGuides() {
    if (this.guideV) this.guideV.style.display = 'none';
    if (this.guideH) this.guideH.style.display = 'none';
    this._snapAxes = null;
  }

  _sceneToScreen(x, y) {
    return this.toolManager.canvasManager.sceneToScreen(x, y);
  }

  handleMoving(e) {
    if (e.type === 'object:scaling') { this.hideGuides(); return; } // snapping during scale needs separate math
    if (e.target && e.target.type === 'activeselection') { this.hideGuides(); return; }
    if (!e.target || e.target.lockMovementX && e.target.lockMovementY) return;
    // altKey = temporarily disable snapping (also lets you pan)
    if (e.e && e.e.altKey) { this.hideGuides(); return; }

    const cm = this.toolManager.canvasManager;
    if (!cm) return;
    const obj = e.target;
    const zoom = cm.getZoom();
    const tol = SNAP_TOLERANCE_CSS / zoom;

    // Candidate lines from the page + every other object
    const vLines = [0, cm.PAGE_W / 2, cm.PAGE_W];
    const hLines = [0, cm.PAGE_H / 2, cm.PAGE_H];
    const others = this.canvas.getObjects().filter(o => o !== obj && o.visible !== false);
    others.forEach(o => {
      const b = o.getBoundingRect();
      vLines.push(b.left, b.left + b.width / 2, b.left + b.width);
      hLines.push(b.top, b.top + b.height / 2, b.top + b.height);
    });

    // Where this object's own anchor lines currently are (bbox, scene)
    const self = obj.getBoundingRect();
    const objAnchorsX = [self.left, self.left + self.width / 2, self.left + self.width];
    const objAnchorsY = [self.top, self.top + self.height / 2, self.top + self.height];
    // object origin ↔ bbox origin offsets (origin may be center)
    const ox = obj.left - self.left;
    const oy = obj.top - self.top;

    let bestX = null, bestY = null;
    for (const t of vLines) {
      for (const a of objAnchorsX) {
        const d = t - a;
        if (Math.abs(d) < tol && (!bestX || Math.abs(d) < Math.abs(bestX.d))) bestX = { d, t };
      }
    }
    for (const t of hLines) {
      for (const a of objAnchorsY) {
        const d = t - a;
        if (Math.abs(d) < tol && (!bestY || Math.abs(d) < Math.abs(bestY.d))) bestY = { d, t };
      }
    }

    if (bestX) obj.set({ left: obj.left + bestX.d });
    if (bestY) obj.set({ top: obj.top + bestY.d });

    // Draw guides on the axes that snapped
    this._snapAxes = { x: bestX ? bestX.t : null, y: bestY ? bestY.t : null };
    this._renderGuides();
  }

  _renderGuides() {
    const cm = this.toolManager.canvasManager;
    const vp = this.appViewport();
    if (!cm || !vp || !this._snapAxes) return;
    const ax = this._snapAxes;
    const visRect = vp.getBoundingClientRect();
    if (ax.x !== null) {
      const s = cm.sceneToScreen(ax.x, 0);
      this.guideV.style.display = 'block';
      this.guideV.style.left = (s.x - 0.5) + 'px';
      this.guideV.style.height = visRect.height + 'px';
    } else this.guideV.style.display = 'none';
    if (ax.y !== null) {
      const s = cm.sceneToScreen(0, ax.y);
      this.guideH.style.display = 'block';
      this.guideH.style.top = (s.y - 0.5) + 'px';
      this.guideH.style.width = visRect.width + 'px';
    } else this.guideH.style.display = 'none';
  }

  handleUp() {
    this.hideGuides();
  }
}
