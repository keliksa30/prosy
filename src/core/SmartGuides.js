/**
 * SmartGuides — Figma-grade alignment guidelines and snapping for Prosy.
 * Snaps moving objects to canvas center, page margins, and other objects'
 * edges/centerlines. Renders guidelines via a dedicated SVG overlay element
 * so lines are razor-sharp, NEVER get stuck, and vanish instantly on mouse release.
 */
export class SmartGuides {
  constructor(canvasManager) {
    this.cm = canvasManager;
    this.canvas = canvasManager.getCanvas();
    this.snapThreshold = 6; // snap threshold in screen pixels
    this.enabled = true;
    this.color = '#E11D48'; // High-visibility Figma magenta
    this._isMoving = false;
    this.svgEl = null;

    // Immediately purge any stale pixels on contextTop
    this._purgeUpperCanvas();
    this._bindEvents();
  }

  _purgeUpperCanvas() {
    if (!this.canvas) return;
    const ctx = this.canvas.getTopContext?.() || this.canvas.contextTop;
    if (ctx && this.canvas.upperCanvasEl) {
      ctx.clearRect(0, 0, this.canvas.upperCanvasEl.width, this.canvas.upperCanvasEl.height);
    }
  }

  _ensureOverlay() {
    if (this.svgEl && this.svgEl.parentNode) return this.svgEl;
    const parent = this.canvas.wrapperEl || this.canvas.upperCanvasEl?.parentNode || this.cm.wrapper;
    if (!parent) return null;

    // Remove any older overlay if exists
    const existing = parent.querySelectorAll('.smart-guides-overlay');
    existing.forEach(el => el.remove());

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'smart-guides-overlay');
    svg.setAttribute('viewBox', `0 0 ${this.cm.PAGE_W || 1920} ${this.cm.PAGE_H || 1080}`);
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:visible;';
    parent.appendChild(svg);
    this.svgEl = svg;
    return this.svgEl;
  }

  _bindEvents() {
    if (!this.canvas) return;

    this.canvas.on('object:moving', (e) => this.onObjectMoving(e));
    this.canvas.on('object:modified', () => this.clearGuidelines());
    this.canvas.on('mouse:up', () => this.clearGuidelines());
    this.canvas.on('selection:cleared', () => this.clearGuidelines());
    this.canvas.on('before:render', () => {
      // Keep upper canvas clean of stray marks
      if (!this._isMoving) this._purgeUpperCanvas();
    });

    window.addEventListener('blur', () => this.clearGuidelines());
    window.addEventListener('mouseup', () => this.clearGuidelines());
  }

  clearGuidelines() {
    this._isMoving = false;
    if (this.svgEl) {
      this.svgEl.innerHTML = '';
    }
    this._purgeUpperCanvas();
  }

  onObjectMoving(e) {
    if (!this.enabled || !e.target) return;
    const target = e.target;
    this._isMoving = true;

    const overlay = this._ensureOverlay();
    if (!overlay) return;

    const zoom = this.cm.getZoom() || 1;
    const threshold = this.snapThreshold / zoom;

    const tWidth = target.getScaledWidth();
    const tHeight = target.getScaledHeight();
    let tLeft = target.left;
    let tTop = target.top;

    const tRight = tLeft + tWidth;
    const tCenterX = tLeft + tWidth / 2;
    const tBottom = tTop + tHeight;
    const tCenterY = tTop + tHeight / 2;

    const pageW = this.cm.PAGE_W || 1920;
    const pageH = this.cm.PAGE_H || 1080;

    // 1. Candidate vertical snap lines (X positions)
    const vTargets = [
      { x: pageW / 2, isCenter: true, y1: 0, y2: pageH },
      { x: 60, y1: 0, y2: pageH },
      { x: pageW - 60, y1: 0, y2: pageH }
    ];

    // 2. Candidate horizontal snap lines (Y positions)
    const hTargets = [
      { y: pageH / 2, isCenter: true, x1: 0, x2: pageW },
      { y: 60, x1: 0, x2: pageW },
      { y: pageH - 60, x1: 0, x2: pageW }
    ];

    const objects = this.canvas.getObjects();
    for (const obj of objects) {
      if (
        obj === target ||
        obj.visible === false ||
        obj.evented === false ||
        obj.name === 'Background' ||
        obj.name === 'Bg'
      ) continue;

      const oWidth = obj.getScaledWidth();
      const oHeight = obj.getScaledHeight();
      const oLeft = obj.left;
      const oTop = obj.top;
      const oRight = oLeft + oWidth;
      const oCenterX = oLeft + oWidth / 2;
      const oBottom = oTop + oHeight;
      const oCenterY = oTop + oHeight / 2;

      const spanY1 = Math.min(tTop, oTop) - 20;
      const spanY2 = Math.max(tBottom, oBottom) + 20;
      vTargets.push(
        { x: oLeft, y1: spanY1, y2: spanY2 },
        { x: oCenterX, isCenter: true, y1: spanY1, y2: spanY2 },
        { x: oRight, y1: spanY1, y2: spanY2 }
      );

      const spanX1 = Math.min(tLeft, oLeft) - 20;
      const spanX2 = Math.max(tRight, oRight) + 20;
      hTargets.push(
        { y: oTop, x1: spanX1, x2: spanX2 },
        { y: oCenterY, isCenter: true, x1: spanX1, x2: spanX2 },
        { y: oBottom, x1: spanX1, x2: spanX2 }
      );
    }

    // Find the SINGLE best vertical snap
    let bestV = null;
    let minDiffX = threshold;

    for (const cand of vTargets) {
      // Test target left
      const diffLeft = Math.abs(tLeft - cand.x);
      if (diffLeft < minDiffX) {
        minDiffX = diffLeft;
        bestV = {
          snapLeft: cand.x,
          lineX: cand.x,
          y1: cand.y1,
          y2: cand.y2
        };
      }
      // Test target center
      const diffCenter = Math.abs(tCenterX - cand.x);
      if (diffCenter < minDiffX) {
        minDiffX = diffCenter;
        bestV = {
          snapLeft: cand.x - tWidth / 2,
          lineX: cand.x,
          y1: cand.y1,
          y2: cand.y2
        };
      }
      // Test target right
      const diffRight = Math.abs(tRight - cand.x);
      if (diffRight < minDiffX) {
        minDiffX = diffRight;
        bestV = {
          snapLeft: cand.x - tWidth,
          lineX: cand.x,
          y1: cand.y1,
          y2: cand.y2
        };
      }
    }

    // Find the SINGLE best horizontal snap
    let bestH = null;
    let minDiffY = threshold;

    for (const cand of hTargets) {
      // Test target top
      const diffTop = Math.abs(tTop - cand.y);
      if (diffTop < minDiffY) {
        minDiffY = diffTop;
        bestH = {
          snapTop: cand.y,
          lineY: cand.y,
          x1: cand.x1,
          x2: cand.x2
        };
      }
      // Test target center
      const diffCenter = Math.abs(tCenterY - cand.y);
      if (diffCenter < minDiffY) {
        minDiffY = diffCenter;
        bestH = {
          snapTop: cand.y - tHeight / 2,
          lineY: cand.y,
          x1: cand.x1,
          x2: cand.x2
        };
      }
      // Test target bottom
      const diffBottom = Math.abs(tBottom - cand.y);
      if (diffBottom < minDiffY) {
        minDiffY = diffBottom;
        bestH = {
          snapTop: cand.y - tHeight,
          lineY: cand.y,
          x1: cand.x1,
          x2: cand.x2
        };
      }
    }

    let didSnap = false;
    let svgLines = '';

    if (bestV) {
      target.set({ left: bestV.snapLeft });
      didSnap = true;
      svgLines += `<line x1="${bestV.lineX}" y1="${bestV.y1}" x2="${bestV.lineX}" y2="${bestV.y2}" stroke="${this.color}" stroke-width="1.2" stroke-dasharray="4,3" />`;
    }

    if (bestH) {
      target.set({ top: bestH.snapTop });
      didSnap = true;
      svgLines += `<line x1="${bestH.x1}" y1="${bestH.lineY}" x2="${bestH.x2}" y2="${bestH.lineY}" stroke="${this.color}" stroke-width="1.2" stroke-dasharray="4,3" />`;
    }

    overlay.innerHTML = svgLines;

    if (didSnap) {
      target.setCoords();
      this.canvas.requestRenderAll();
    }
  }
}
