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
    this.guideOverlay = null;
    this._snapAxes = null;
    this._spacingGuides = null;
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
    if (!this.guideOverlay) {
      this.guideOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.guideOverlay.setAttribute('class', 'smart-guides-overlay');
      vp.appendChild(this.guideOverlay);
    }
  }

  appViewport() {
    return this.toolManager.canvasManager ? this.toolManager.canvasManager.getViewport() : null;
  }

  hideGuides() {
    if (this.guideV) this.guideV.style.display = 'none';
    if (this.guideH) this.guideH.style.display = 'none';
    if (this.guideOverlay) this.guideOverlay.innerHTML = '';
    this._snapAxes = null;
    this._spacingGuides = null;
  }

  _sceneToScreen(x, y) {
    return this.toolManager.canvasManager.sceneToScreen(x, y);
  }

  handleMoving(e) {
    if (e.target && e.target.type === 'activeselection') { this.hideGuides(); return; }
    if (!e.target || (e.target.lockMovementX && e.target.lockMovementY)) return;
    // altKey = temporarily disable snapping
    if (e.e && e.e.altKey) { this.hideGuides(); return; }

    const cm = this.toolManager.canvasManager;
    if (!cm) return;
    const obj = e.target;
    const zoom = cm.getZoom();
    const tol = SNAP_TOLERANCE_CSS / zoom;

    // Others on canvas
    const others = this.canvas.getObjects().filter(o => o !== obj && o.visible !== false && o.name !== 'PenGuide');

    // 1. Standard Alignment Lines (Edges & Centers)
    const vLines = [0, cm.PAGE_W / 2, cm.PAGE_W];
    const hLines = [0, cm.PAGE_H / 2, cm.PAGE_H];
    others.forEach(o => {
      const b = o.getBoundingRect();
      vLines.push(b.left, b.left + b.width / 2, b.left + b.width);
      hLines.push(b.top, b.top + b.height / 2, b.top + b.height);
    });

    const self = obj.getBoundingRect();
    const objAnchorsX = [self.left, self.left + self.width / 2, self.left + self.width];
    const objAnchorsY = [self.top, self.top + self.height / 2, self.top + self.height];

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

    // 2. Smart Spacing (Equal Gap Detection in X and Y)
    let spacingX = null;
    let spacingY = null;

    if (others.length >= 2) {
      // Horizontal equal spacing
      const boxesX = others.map(o => o.getBoundingRect()).sort((a, b) => a.left - b.left);
      for (let i = 0; i < boxesX.length - 1; i++) {
        const o1 = boxesX[i];
        const o2 = boxesX[i + 1];
        const gap = o2.left - (o1.left + o1.width);
        if (gap > 4) {
          // Case A: obj is placed to the right of o2 with the same gap
          const targetRight = o2.left + o2.width + gap;
          if (Math.abs(self.left - targetRight) < tol) {
            spacingX = {
              delta: targetRight - self.left,
              gap: Math.round(gap),
              gaps: [
                { x1: o1.left + o1.width, x2: o2.left, y: (o1.top + o2.top) / 2 + o1.height / 2 },
                { x1: o2.left + o2.width, x2: o2.left + o2.width + gap, y: self.top + self.height / 2 }
              ]
            };
            break;
          }
          // Case B: obj is placed to the left of o1 with the same gap
          const targetLeft = o1.left - gap - self.width;
          if (Math.abs(self.left - targetLeft) < tol) {
            spacingX = {
              delta: targetLeft - self.left,
              gap: Math.round(gap),
              gaps: [
                { x1: targetLeft + self.width, x2: o1.left, y: self.top + self.height / 2 },
                { x1: o1.left + o1.width, x2: o2.left, y: (o1.top + o2.top) / 2 + o1.height / 2 }
              ]
            };
            break;
          }
          // Case C: obj is placed right between o1 and o2 (centered gap)
          const midLeft = o1.left + o1.width + (o2.left - (o1.left + o1.width) - self.width) / 2;
          const equalGaps = (o2.left - (o1.left + o1.width) - self.width) / 2;
          if (equalGaps > 4 && Math.abs(self.left - midLeft) < tol) {
            spacingX = {
              delta: midLeft - self.left,
              gap: Math.round(equalGaps),
              gaps: [
                { x1: o1.left + o1.width, x2: midLeft, y: (o1.top + self.top) / 2 + self.height / 2 },
                { x1: midLeft + self.width, x2: o2.left, y: (self.top + o2.top) / 2 + self.height / 2 }
              ]
            };
            break;
          }
        }
      }

      // Vertical equal spacing
      const boxesY = others.map(o => o.getBoundingRect()).sort((a, b) => a.top - b.top);
      for (let i = 0; i < boxesY.length - 1; i++) {
        const o1 = boxesY[i];
        const o2 = boxesY[i + 1];
        const gap = o2.top - (o1.top + o1.height);
        if (gap > 4) {
          // Case A: obj below o2
          const targetBottom = o2.top + o2.height + gap;
          if (Math.abs(self.top - targetBottom) < tol) {
            spacingY = {
              delta: targetBottom - self.top,
              gap: Math.round(gap),
              gaps: [
                { y1: o1.top + o1.height, y2: o2.top, x: (o1.left + o2.left) / 2 + o1.width / 2 },
                { y1: o2.top + o2.height, y2: o2.top + o2.height + gap, x: self.left + self.width / 2 }
              ]
            };
            break;
          }
          // Case B: obj above o1
          const targetTop = o1.top - gap - self.height;
          if (Math.abs(self.top - targetTop) < tol) {
            spacingY = {
              delta: targetTop - self.top,
              gap: Math.round(gap),
              gaps: [
                { y1: targetTop + self.height, y2: o1.top, x: self.left + self.width / 2 },
                { y1: o1.top + o1.height, y2: o2.top, x: (o1.left + o2.left) / 2 + o1.width / 2 }
              ]
            };
            break;
          }
          // Case C: obj between o1 and o2
          const midTop = o1.top + o1.height + (o2.top - (o1.top + o1.height) - self.height) / 2;
          const equalGaps = (o2.top - (o1.top + o1.height) - self.height) / 2;
          if (equalGaps > 4 && Math.abs(self.top - midTop) < tol) {
            spacingY = {
              delta: midTop - self.top,
              gap: Math.round(equalGaps),
              gaps: [
                { y1: o1.top + o1.height, y2: midTop, x: (o1.left + self.left) / 2 + self.width / 2 },
                { y1: midTop + self.height, y2: o2.top, x: (self.left + o2.left) / 2 + self.width / 2 }
              ]
            };
            break;
          }
        }
      }
    }

    // Apply Snapping (Smart spacing takes priority if active, else alignment)
    if (spacingX) {
      obj.set({ left: obj.left + spacingX.delta });
    } else if (bestX) {
      obj.set({ left: obj.left + bestX.d });
    }

    if (spacingY) {
      obj.set({ top: obj.top + spacingY.delta });
    } else if (bestY) {
      obj.set({ top: obj.top + bestY.d });
    }

    this._snapAxes = {
      x: !spacingX && bestX ? bestX.t : null,
      y: !spacingY && bestY ? bestY.t : null
    };
    this._spacingGuides = { x: spacingX, y: spacingY };
    this._renderGuides();
  }

  _renderGuides() {
    const cm = this.toolManager.canvasManager;
    const vp = this.appViewport();
    if (!cm || !vp) return;
    const visRect = vp.getBoundingClientRect();

    // Standard alignment lines
    if (this._snapAxes) {
      const ax = this._snapAxes;
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

    // Smart Spacing SVG indicators
    if (this.guideOverlay) {
      if (!this._spacingGuides || (!this._spacingGuides.x && !this._spacingGuides.y)) {
        this.guideOverlay.innerHTML = '';
        return;
      }

      let svgHtml = '';
      const PINK = '#FF007A';

      // Horizontal spacing
      if (this._spacingGuides.x && this._spacingGuides.x.gaps) {
        const gapPx = this._spacingGuides.x.gap;
        this._spacingGuides.x.gaps.forEach(g => {
          const p1 = cm.sceneToScreen(g.x1, g.y);
          const p2 = cm.sceneToScreen(g.x2, g.y);
          const midX = (p1.x + p2.x) / 2;
          const y = p1.y;
          // Connecting line
          svgHtml += `<line x1="${p1.x}" y1="${y}" x2="${p2.x}" y2="${y}" stroke="${PINK}" stroke-width="1.5" stroke-dasharray="3,2" />`;
          // End ticks
          svgHtml += `<line x1="${p1.x}" y1="${y - 6}" x2="${p1.x}" y2="${y + 6}" stroke="${PINK}" stroke-width="2" />`;
          svgHtml += `<line x1="${p2.x}" y1="${y - 6}" x2="${p2.x}" y2="${y + 6}" stroke="${PINK}" stroke-width="2" />`;
          // Badge pill
          svgHtml += `
            <g transform="translate(${midX}, ${y})">
              <rect x="-18" y="-9" width="36" height="18" rx="9" fill="${PINK}" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.5))" />
              <text x="0" y="3.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">${gapPx}</text>
            </g>
          `;
        });
      }

      // Vertical spacing
      if (this._spacingGuides.y && this._spacingGuides.y.gaps) {
        const gapPx = this._spacingGuides.y.gap;
        this._spacingGuides.y.gaps.forEach(g => {
          const p1 = cm.sceneToScreen(g.x, g.y1);
          const p2 = cm.sceneToScreen(g.x, g.y2);
          const midY = (p1.y + p2.y) / 2;
          const x = p1.x;
          // Connecting line
          svgHtml += `<line x1="${x}" y1="${p1.y}" x2="${x}" y2="${p2.y}" stroke="${PINK}" stroke-width="1.5" stroke-dasharray="3,2" />`;
          // End ticks
          svgHtml += `<line x1="${x - 6}" y1="${p1.y}" x2="${x + 6}" y2="${p1.y}" stroke="${PINK}" stroke-width="2" />`;
          svgHtml += `<line x1="${x - 6}" y1="${p2.y}" x2="${x + 6}" y2="${p2.y}" stroke="${PINK}" stroke-width="2" />`;
          // Badge pill
          svgHtml += `
            <g transform="translate(${x}, ${midY})">
              <rect x="-18" y="-9" width="36" height="18" rx="9" fill="${PINK}" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.5))" />
              <text x="0" y="3.5" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">${gapPx}</text>
            </g>
          `;
        });
      }

      this.guideOverlay.innerHTML = svgHtml;
    }
  }

  handleUp() {
    this.hideGuides();
  }
}
