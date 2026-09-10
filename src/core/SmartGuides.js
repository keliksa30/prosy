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

    // === SMART SPACING (EQUAL GAPS) ===
    let bestSpacingX = null;
    let minSpacingDiffX = threshold;
    let bestSpacingY = null;
    let minSpacingDiffY = threshold;
    
    const validObjects = objects.filter(o => 
      o !== target && o.visible !== false && o.evented !== false && o.name !== 'Background' && o.name !== 'Bg'
    );

    for (let i = 0; i < validObjects.length; i++) {
      for (let j = 0; j < validObjects.length; j++) {
        if (i === j) continue;
        const objA = validObjects[i];
        const objB = validObjects[j];
        
        // X-Axis Spacing (Horizontal Gaps)
        // Check if A and B overlap vertically
        const aTop = objA.top, aBottom = objA.top + objA.getScaledHeight();
        const bTop = objB.top, bBottom = objB.top + objB.getScaledHeight();
        if (!(aBottom < bTop || aTop > bBottom)) {
          const aRight = objA.left + objA.getScaledWidth();
          const gapX = objB.left - aRight;
          
          if (gapX > 0) {
            // Target is to the right of B
            const targetLeftExpected = objB.left + objB.getScaledWidth() + gapX;
            const diffRight = Math.abs(tLeft - targetLeftExpected);
            if (diffRight < minSpacingDiffX) {
              minSpacingDiffX = diffRight;
              const yCenter = (Math.max(aTop, bTop) + Math.min(aBottom, bBottom)) / 2;
              bestSpacingX = {
                snapLeft: targetLeftExpected,
                lines: [
                  { x1: aRight, y1: yCenter, x2: objB.left, y2: yCenter, label: Math.round(gapX) },
                  { x1: objB.left + objB.getScaledWidth(), y1: yCenter, x2: targetLeftExpected, y2: yCenter, label: Math.round(gapX) }
                ]
              };
            }
            // Target is to the left of A
            const targetRightExpected = objA.left - gapX;
            const expectedLeft = targetRightExpected - tWidth;
            const diffLeft = Math.abs(tLeft - expectedLeft);
            if (diffLeft < minSpacingDiffX) {
              minSpacingDiffX = diffLeft;
              const yCenter = (Math.max(aTop, bTop) + Math.min(aBottom, bBottom)) / 2;
              bestSpacingX = {
                snapLeft: expectedLeft,
                lines: [
                  { x1: expectedLeft + tWidth, y1: yCenter, x2: objA.left, y2: yCenter, label: Math.round(gapX) },
                  { x1: aRight, y1: yCenter, x2: objB.left, y2: yCenter, label: Math.round(gapX) }
                ]
              };
            }
          }
        }

        // Y-Axis Spacing (Vertical Gaps)
        // Check if A and B overlap horizontally
        const aLeft = objA.left, aRight = objA.left + objA.getScaledWidth();
        const bLeft = objB.left, bRight = objB.left + objB.getScaledWidth();
        if (!(aRight < bLeft || aLeft > bRight)) {
          const aBottom = objA.top + objA.getScaledHeight();
          const gapY = objB.top - aBottom;
          
          if (gapY > 0) {
            // Target is below B
            const targetTopExpected = objB.top + objB.getScaledHeight() + gapY;
            const diffBottom = Math.abs(tTop - targetTopExpected);
            if (diffBottom < minSpacingDiffY) {
              minSpacingDiffY = diffBottom;
              const xCenter = (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2;
              bestSpacingY = {
                snapTop: targetTopExpected,
                lines: [
                  { x1: xCenter, y1: aBottom, x2: xCenter, y2: objB.top, label: Math.round(gapY) },
                  { x1: xCenter, y1: objB.top + objB.getScaledHeight(), x2: xCenter, y2: targetTopExpected, label: Math.round(gapY) }
                ]
              };
            }
            // Target is above A
            const targetBottomExpected = objA.top - gapY;
            const expectedTop = targetBottomExpected - tHeight;
            const diffTop = Math.abs(tTop - expectedTop);
            if (diffTop < minSpacingDiffY) {
              minSpacingDiffY = diffTop;
              const xCenter = (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2;
              bestSpacingY = {
                snapTop: expectedTop,
                lines: [
                  { x1: xCenter, y1: expectedTop + tHeight, x2: xCenter, y2: objA.top, label: Math.round(gapY) },
                  { x1: xCenter, y1: aBottom, x2: xCenter, y2: objB.top, label: Math.round(gapY) }
                ]
              };
            }
          }
        }
      }
    }

    let didSnap = false;
    let svgLines = '';

    // Prefer edge alignment snaps over spacing snaps if they are very close, 
    // or vice versa depending on priority. We'll use spacing if it's found.
    if (bestSpacingX) {
      target.set({ left: bestSpacingX.snapLeft });
      didSnap = true;
      bestSpacingX.lines.forEach(l => {
        svgLines += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${this.color}" stroke-width="1.5" />`;
        // Draw little end caps
        svgLines += `<line x1="${l.x1}" y1="${l.y1 - 4}" x2="${l.x1}" y2="${l.y1 + 4}" stroke="${this.color}" stroke-width="1.5" />`;
        svgLines += `<line x1="${l.x2}" y1="${l.y2 - 4}" x2="${l.x2}" y2="${l.y2 + 4}" stroke="${this.color}" stroke-width="1.5" />`;
        // Draw label
        const cx = (l.x1 + l.x2) / 2;
        svgLines += `<rect x="${cx - 12}" y="${l.y1 - 10}" width="24" height="14" fill="${this.color}" rx="3" />`;
        svgLines += `<text x="${cx}" y="${l.y1 + 0.5}" fill="white" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">${l.label}</text>`;
      });
    } else if (bestV) {
      target.set({ left: bestV.snapLeft });
      didSnap = true;
      svgLines += `<line x1="${bestV.lineX}" y1="${bestV.y1}" x2="${bestV.lineX}" y2="${bestV.y2}" stroke="${this.color}" stroke-width="1.2" stroke-dasharray="4,3" />`;
    }

    if (bestSpacingY) {
      target.set({ top: bestSpacingY.snapTop });
      didSnap = true;
      bestSpacingY.lines.forEach(l => {
        svgLines += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${this.color}" stroke-width="1.5" />`;
        // Draw little end caps
        svgLines += `<line x1="${l.x1 - 4}" y1="${l.y1}" x2="${l.x1 + 4}" y2="${l.y1}" stroke="${this.color}" stroke-width="1.5" />`;
        svgLines += `<line x1="${l.x2 - 4}" y1="${l.y2}" x2="${l.x2 + 4}" y2="${l.y2}" stroke="${this.color}" stroke-width="1.5" />`;
        // Draw label
        const cy = (l.y1 + l.y2) / 2;
        svgLines += `<rect x="${l.x1 + 6}" y="${cy - 7}" width="24" height="14" fill="${this.color}" rx="3" />`;
        svgLines += `<text x="${l.x1 + 18}" y="${cy + 3.5}" fill="white" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">${l.label}</text>`;
      });
    } else if (bestH) {
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
