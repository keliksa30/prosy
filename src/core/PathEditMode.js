import * as fabric from 'fabric';
import { buildSvgPath } from '../tools/PenTool.js';

export function parsePathToNodes(pathObj) {
  if (pathObj.custom?.vectorData?.nodes) {
    return {
      nodes: JSON.parse(JSON.stringify(pathObj.custom.vectorData.nodes)),
      closed: !!pathObj.custom.vectorData.closed
    };
  }

  const pathCommands = pathObj.path || [];
  const matrix = pathObj.calcTransformMatrix();
  const offset = pathObj.pathOffset || { x: 0, y: 0 };

  const toScene = (lx, ly) => {
    const pt = new fabric.Point(lx - offset.x, ly - offset.y);
    const p = fabric.util.transformPoint(pt, matrix);
    return { x: Math.round(p.x), y: Math.round(p.y) };
  };

  const nodes = [];
  let closed = false;

  for (let i = 0; i < pathCommands.length; i++) {
    const cmd = pathCommands[i];
    const type = cmd[0];

    if (type === 'M' || type === 'L') {
      const p = toScene(cmd[1], cmd[2]);
      nodes.push({ x: p.x, y: p.y, cpIn: null, cpOut: null });
    } else if (type === 'C') {
      const prev = nodes[nodes.length - 1];
      const cp1 = toScene(cmd[1], cmd[2]);
      const cp2 = toScene(cmd[3], cmd[4]);
      const end = toScene(cmd[5], cmd[6]);

      if (prev) prev.cpOut = cp1;
      nodes.push({ x: end.x, y: end.y, cpIn: cp2, cpOut: null });
    } else if (type === 'Q') {
      const prev = nodes[nodes.length - 1];
      const cp = toScene(cmd[1], cmd[2]);
      const end = toScene(cmd[3], cmd[4]);

      if (prev) prev.cpOut = cp;
      nodes.push({ x: end.x, y: end.y, cpIn: cp, cpOut: null });
    } else if (type === 'Z' || type === 'z') {
      closed = true;
    }
  }

  return { nodes, closed };
}

/**
 * Figma-style Vector Edit Mode.
 * - Double click a path to enter edit mode.
 * - Squares for anchor points, circles for bezier handles.
 * - Drag anchor to move point & its handles.
 * - Drag handle to alter curve curvature (Alt for independent handle).
 * - Double-click anchor to toggle smooth vs sharp corner.
 * - Delete / Backspace removes selected node.
 * - Done floating button or Esc/Enter to exit.
 */
export class PathEditMode {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.getCanvas();
    this.activePath = null;
    this.nodes = [];
    this.closed = false;
    this.selectedNodeIndex = -1;

    this.controlObjects = [];
    this.floatingBar = null;

    this._onDblClick = this.onDblClick.bind(this);
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);

    this.canvas.on('mouse:dblclick', this._onDblClick);
    this.canvas.on('mouse:down', this._onMouseDown);
    window.addEventListener('keydown', this._onKeyDown);
  }

  onDblClick(options) {
    const target = options.target;
    if (!this.activePath && target && target.type === 'path' && !target._isIcon && target.name !== 'VectorControl') {
      this.enterEditMode(target);
    }
  }

  onMouseDown(options) {
    if (!this.activePath) return;
    const target = options.target;
    // If clicked on canvas background (not on vector controls or active path), exit edit mode
    if (!target) {
      this.exitEditMode();
    }
  }

  onKeyDown(e) {
    if (!this.activePath) return;

    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      this.exitEditMode();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedNodeIndex >= 0) {
      e.preventDefault();
      this.deleteSelectedNode();
    }
  }

  enterEditMode(path) {
    this.activePath = path;
    const parsed = parsePathToNodes(path);
    this.nodes = parsed.nodes;
    this.closed = parsed.closed;
    this.selectedNodeIndex = this.nodes.length > 0 ? 0 : -1;

    // Reset path transform to 1:1 in scene space to prevent compound rotation/scale distortions
    path.set({
      selectable: false,
      evented: false,
      opacity: 0.8
    });

    this.showFloatingBar();
    this.renderControls();
    this.canvas.requestRenderAll();
  }

  showFloatingBar() {
    this.hideFloatingBar();

    const bar = document.createElement('div');
    bar.className = 'vector-edit-bar';
    bar.style.position = 'fixed';
    bar.style.top = '60px';
    bar.style.left = '50%';
    bar.style.transform = 'translateX(-50%)';
    bar.style.zIndex = '300';
    bar.style.background = 'var(--bg-raised)';
    bar.style.border = '1px solid var(--border-color)';
    bar.style.boxShadow = 'var(--shadow-panel)';
    bar.style.borderRadius = '20px';
    bar.style.padding = '6px 14px';
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.gap = '12px';
    bar.style.fontSize = '12px';
    bar.style.color = 'var(--text-primary)';

    const label = document.createElement('span');
    label.style.fontWeight = '600';
    label.innerHTML = `<span style="color:var(--text-accent)">✦</span> Edit Vector`;

    const hint = document.createElement('span');
    hint.style.color = 'var(--text-muted)';
    hint.style.fontSize = '11px';
    hint.textContent = 'Drag nodes or handles • Double click node to toggle curve';

    const doneBtn = document.createElement('button');
    doneBtn.className = 'panel-action-btn';
    doneBtn.style.padding = '3px 10px';
    doneBtn.style.fontSize = '11px';
    doneBtn.style.background = 'var(--accent)';
    doneBtn.style.color = '#fff';
    doneBtn.textContent = 'Done';
    doneBtn.addEventListener('click', () => this.exitEditMode());

    bar.appendChild(label);
    bar.appendChild(hint);
    bar.appendChild(doneBtn);

    document.body.appendChild(bar);
    this.floatingBar = bar;
  }

  hideFloatingBar() {
    if (this.floatingBar) {
      this.floatingBar.remove();
      this.floatingBar = null;
    }
  }

  renderControls() {
    this.clearControls();
    if (!this.activePath || !this.nodes.length) return;

    // 1. Render anchor squares for all nodes
    this.nodes.forEach((n, idx) => {
      const isSelected = idx === this.selectedNodeIndex;

      const sq = new fabric.Rect({
        left: n.x,
        top: n.y,
        originX: 'center',
        originY: 'center',
        width: 8,
        height: 8,
        fill: isSelected ? '#007AFF' : '#ffffff',
        stroke: isSelected ? '#ffffff' : '#007AFF',
        strokeWidth: 1.5,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'grab',
        moveCursor: 'grabbing',
        name: 'VectorControl'
      });

      sq.nodeIndex = idx;

      // Select node on click
      sq.on('mousedown', (e) => {
        this.selectedNodeIndex = idx;
        this.renderControls();
      });

      // Double-click anchor toggles smooth curve vs sharp corner
      sq.on('mousedblclick', (e) => {
        e.e.stopPropagation();
        this.toggleNodeCurve(idx);
      });

      // Drag anchor
      let startX = n.x;
      let startY = n.y;

      sq.on('moving', () => {
        const dx = sq.left - startX;
        const dy = sq.top - startY;

        n.x = Math.round(sq.left);
        n.y = Math.round(sq.top);

        if (n.cpIn) {
          n.cpIn.x += dx;
          n.cpIn.y += dy;
        }
        if (n.cpOut) {
          n.cpOut.x += dx;
          n.cpOut.y += dy;
        }

        startX = sq.left;
        startY = sq.top;

        this.updatePathGeometry();
        this.updateHandleVisuals(idx);
      });

      sq.on('moved', () => {
        this.renderControls();
      });

      this.controlObjects.push(sq);
      this.canvas.add(sq);
    });

    // 2. Render bezier handle lines & circles for selected node (or nodes with handles)
    if (this.selectedNodeIndex >= 0 && this.selectedNodeIndex < this.nodes.length) {
      this.renderHandlesForNode(this.selectedNodeIndex);
    }

    this.canvas.requestRenderAll();
  }

  renderHandlesForNode(idx) {
    const n = this.nodes[idx];
    if (!n) return;

    ['cpIn', 'cpOut'].forEach(handleKey => {
      const handlePt = n[handleKey];
      if (!handlePt) return;

      // Stem line
      const line = new fabric.Line([n.x, n.y, handlePt.x, handlePt.y], {
        stroke: '#007AFF',
        strokeWidth: 1,
        strokeDashArray: [2, 2],
        selectable: false,
        evented: false,
        name: 'VectorControl'
      });
      this.controlObjects.push(line);
      this.canvas.add(line);

      // Handle circle dot
      const dot = new fabric.Circle({
        left: handlePt.x,
        top: handlePt.y,
        originX: 'center',
        originY: 'center',
        radius: 4,
        fill: '#007AFF',
        stroke: '#ffffff',
        strokeWidth: 1.5,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'pointer',
        moveCursor: 'crosshair',
        name: 'VectorControl'
      });

      dot.on('moving', (opt) => {
        const altKey = opt.e ? (opt.e.altKey || opt.e.metaKey) : false;

        handlePt.x = Math.round(dot.left);
        handlePt.y = Math.round(dot.top);

        line.set({ x2: handlePt.x, y2: handlePt.y });

        // If not holding Alt/Option, maintain smooth collinear symmetry with the opposite handle
        const otherKey = handleKey === 'cpIn' ? 'cpOut' : 'cpIn';
        if (!altKey && n[otherKey]) {
          const dx = handlePt.x - n.x;
          const dy = handlePt.y - n.y;
          const otherLen = Math.hypot(n[otherKey].x - n.x, n[otherKey].y - n.y) || Math.hypot(dx, dy);
          const currentLen = Math.hypot(dx, dy) || 1;
          const ratio = otherLen / currentLen;

          n[otherKey].x = Math.round(n.x - dx * ratio);
          n[otherKey].y = Math.round(n.y - dy * ratio);
        }

        this.updatePathGeometry();
      });

      dot.on('moved', () => {
        this.renderControls();
      });

      this.controlObjects.push(dot);
      this.canvas.add(dot);
    });
  }

  updateHandleVisuals(idx) {
    // Re-render handles quickly during anchor drag
    const nonAnchorControls = this.controlObjects.filter(obj => obj.type !== 'rect');
    nonAnchorControls.forEach(c => this.canvas.remove(c));
    this.controlObjects = this.controlObjects.filter(obj => obj.type === 'rect');

    if (this.selectedNodeIndex >= 0) {
      this.renderHandlesForNode(this.selectedNodeIndex);
    }
  }

  toggleNodeCurve(idx) {
    const n = this.nodes[idx];
    if (!n) return;

    if (n.cpIn || n.cpOut) {
      // Convert to sharp corner
      n.cpIn = null;
      n.cpOut = null;
    } else {
      // Convert to smooth curve with tangent handles
      const prev = idx > 0 ? this.nodes[idx - 1] : this.nodes[this.nodes.length - 1];
      const next = idx < this.nodes.length - 1 ? this.nodes[idx + 1] : this.nodes[0];

      let angle = 0;
      if (prev && next) {
        angle = Math.atan2(next.y - prev.y, next.x - prev.x);
      }
      const handleDist = 30;
      const hx = Math.cos(angle) * handleDist;
      const hy = Math.sin(angle) * handleDist;

      n.cpOut = { x: Math.round(n.x + hx), y: Math.round(n.y + hy) };
      n.cpIn = { x: Math.round(n.x - hx), y: Math.round(n.y - hy) };
    }

    this.updatePathGeometry();
    this.renderControls();
  }

  deleteSelectedNode() {
    if (this.selectedNodeIndex < 0 || this.nodes.length <= 2) return;

    this.nodes.splice(this.selectedNodeIndex, 1);
    this.selectedNodeIndex = Math.max(0, this.selectedNodeIndex - 1);

    this.updatePathGeometry();
    this.renderControls();
  }

  updatePathGeometry() {
    if (!this.activePath || this.nodes.length < 2) return;

    const svgPath = buildSvgPath(this.nodes, this.closed);
    if (!svgPath) return;

    try {
      const temp = new fabric.Path(svgPath);
      this.activePath.set({
        path: temp.path,
        width: temp.width,
        height: temp.height,
        pathOffset: temp.pathOffset,
        left: temp.left,
        top: temp.top
      });
      this.activePath.setCoords();
      this.canvas.requestRenderAll();
    } catch (e) {
      console.warn('Failed to update vector geometry', e);
    }
  }

  clearControls() {
    this.controlObjects.forEach(obj => this.canvas.remove(obj));
    this.controlObjects = [];
  }

  exitEditMode() {
    if (!this.activePath) return;

    this.clearControls();
    this.hideFloatingBar();

    if (!this.activePath.custom) this.activePath.custom = {};
    this.activePath.custom.vectorData = {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      closed: this.closed
    };

    this.activePath.set({
      selectable: true,
      evented: true,
      opacity: 1
    });

    this.activePath.setCoords();
    this.canvas.setActiveObject(this.activePath);
    this.canvas.requestRenderAll();

    if (this.canvasManager.app) {
      this.canvasManager.app.historyManager.saveState();
    }

    this.activePath = null;
    this.nodes = [];
    this.selectedNodeIndex = -1;
  }
}
