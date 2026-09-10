import * as fabric from 'fabric';
import { BaseTool } from './ToolManager.js';

export function buildSvgPath(nodes, closed = false, previewPoint = null) {
  if (!nodes || nodes.length === 0) return '';
  let d = `M ${nodes[0].x} ${nodes[0].y} `;
  
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    if (prev.cpOut || curr.cpIn) {
      const cp1 = prev.cpOut || { x: prev.x, y: prev.y };
      const cp2 = curr.cpIn || { x: curr.x, y: curr.y };
      d += `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${curr.x} ${curr.y} `;
    } else {
      d += `L ${curr.x} ${curr.y} `;
    }
  }

  if (closed && nodes.length > 1) {
    const prev = nodes[nodes.length - 1];
    const curr = nodes[0];
    if (prev.cpOut || curr.cpIn) {
      const cp1 = prev.cpOut || { x: prev.x, y: prev.y };
      const cp2 = curr.cpIn || { x: curr.x, y: curr.y };
      d += `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${curr.x} ${curr.y} Z`;
    } else {
      d += `Z`;
    }
  } else if (previewPoint && nodes.length > 0) {
    const last = nodes[nodes.length - 1];
    if (last.cpOut) {
      d += `C ${last.cpOut.x} ${last.cpOut.y} ${previewPoint.x} ${previewPoint.y} ${previewPoint.x} ${previewPoint.y} `;
    } else {
      d += `L ${previewPoint.x} ${previewPoint.y} `;
    }
  }

  return d.trim();
}

/**
 * Figma-Style Bezier Pen Tool.
 * - Single click: Corner anchor point.
 * - Click & Drag: Pulls out mirrored bezier control handles (cpIn, cpOut).
 * - Mouse move: Smooth live bezier preview curve.
 * - Hover / Click start node: Snap and close path loop.
 * - Double click / Enter / Escape: Finish path.
 */
export class PenTool extends BaseTool {
  constructor() {
    super();
    this.nodes = [];
    this.isDrawing = false;
    this.isDraggingHandle = false;
    this.activeNode = null;
    this.hoverClose = false;
    this.previewPoint = null;

    this.activeShape = null;
    this.guideObjects = [];

    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onDblClick = this.onDblClick.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
  }

  activate() {
    if (!this.canvas) return;
    this.nodes = [];
    this.isDrawing = true;
    this.isDraggingHandle = false;
    this.activeNode = null;
    this.hoverClose = false;
    this.previewPoint = null;

    this.canvas.on('mouse:down', this._onMouseDown);
    this.canvas.on('mouse:move', this._onMouseMove);
    this.canvas.on('mouse:up', this._onMouseUp);
    this.canvas.on('mouse:dblclick', this._onDblClick);
    window.addEventListener('keydown', this._onKeyDown);

    document.body.style.cursor = 'crosshair';
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  deactivate() {
    if (this.canvas) {
      this.canvas.off('mouse:down', this._onMouseDown);
      this.canvas.off('mouse:move', this._onMouseMove);
      this.canvas.off('mouse:up', this._onMouseUp);
      this.canvas.off('mouse:dblclick', this._onDblClick);
    }
    window.removeEventListener('keydown', this._onKeyDown);
    document.body.style.cursor = '';
    this.finishPath(false);
  }

  getScenePointer(options) {
    if (options.scenePoint) return options.scenePoint;
    if (this.canvas.getScenePoint) return this.canvas.getScenePoint(options.e);
    return this.canvas.getViewportPoint(options.e);
  }

  onMouseDown(options) {
    if (!this.isDrawing) return;
    const p = this.getScenePointer(options);

    // 1. Check if clicking back on start node to close the path
    if (this.nodes.length >= 2) {
      const start = this.nodes[0];
      const dist = Math.hypot(p.x - start.x, p.y - start.y);
      if (dist <= 14) {
        this.finishPath(true);
        return;
      }
    }

    // 2. Add new node
    const newNode = {
      x: Math.round(p.x),
      y: Math.round(p.y),
      cpIn: null,
      cpOut: null
    };

    this.nodes.push(newNode);
    this.activeNode = newNode;
    this.isDraggingHandle = true;

    // Create or update preview path
    if (!this.activeShape) {
      const pathData = buildSvgPath(this.nodes, false, p);
      this.activeShape = new fabric.Path(pathData || `M ${p.x} ${p.y} L ${p.x} ${p.y}`, {
        fill: '',
        stroke: '#007AFF',
        strokeWidth: 2.5,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        selectable: false,
        evented: false,
        name: 'PenPreview'
      });
      this.canvas.add(this.activeShape);
    }

    this.updateCanvasVisuals();
  }

  onMouseMove(options) {
    if (!this.isDrawing) return;
    const p = this.getScenePointer(options);

    if (this.isDraggingHandle && this.activeNode) {
      // Pulling out Bezier control handles
      const dx = p.x - this.activeNode.x;
      const dy = p.y - this.activeNode.y;

      if (Math.hypot(dx, dy) > 3) {
        this.activeNode.cpOut = { x: Math.round(this.activeNode.x + dx), y: Math.round(this.activeNode.y + dy) };
        this.activeNode.cpIn = { x: Math.round(this.activeNode.x - dx), y: Math.round(this.activeNode.y - dy) };
      } else {
        this.activeNode.cpOut = null;
        this.activeNode.cpIn = null;
      }

      this.previewPoint = null;
      this.updateCanvasVisuals();
    } else if (this.nodes.length > 0) {
      // Free hover: live curve preview to cursor
      if (this.nodes.length >= 2) {
        const start = this.nodes[0];
        const dist = Math.hypot(p.x - start.x, p.y - start.y);
        this.hoverClose = (dist <= 14);
      } else {
        this.hoverClose = false;
      }

      this.previewPoint = this.hoverClose ? { x: this.nodes[0].x, y: this.nodes[0].y } : p;
      this.updateCanvasVisuals();
    }
  }

  onMouseUp(options) {
    if (this.isDraggingHandle) {
      this.isDraggingHandle = false;
      this.updateCanvasVisuals();
    }
  }

  onDblClick(options) {
    if (this.isDrawing) {
      this.finishPath(false);
    }
  }

  onKeyDown(e) {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      this.finishPath(false);
      if (this.toolManager) {
        this.toolManager.setTool('select');
      }
    }
  }

  updateCanvasVisuals() {
    if (!this.activeShape || this.nodes.length === 0) return;

    // 1. Update preview path geometry
    const pathData = buildSvgPath(this.nodes, false, this.previewPoint);
    if (pathData) {
      try {
        const temp = new fabric.Path(pathData);
        this.activeShape.set({
          path: temp.path,
          width: temp.width,
          height: temp.height,
          pathOffset: temp.pathOffset,
          left: temp.left,
          top: temp.top
        });
        this.activeShape.setCoords();
      } catch (e) {
        // Fallback
      }
    }

    // 2. Clear old guides
    this.clearGuides();

    // 3. Render anchor point squares & active handles
    this.nodes.forEach((n, idx) => {
      // Anchor square (Figma style)
      const sq = new fabric.Rect({
        left: n.x,
        top: n.y,
        originX: 'center',
        originY: 'center',
        width: 7,
        height: 7,
        fill: '#ffffff',
        stroke: idx === 0 && this.hoverClose ? '#10B981' : '#007AFF',
        strokeWidth: 1.5,
        selectable: false,
        evented: false,
        name: 'PenGuide'
      });
      this.guideObjects.push(sq);
      this.canvas.add(sq);

      // Closing snap halo indicator
      if (idx === 0 && this.hoverClose) {
        const halo = new fabric.Circle({
          left: n.x,
          top: n.y,
          originX: 'center',
          originY: 'center',
          radius: 9,
          fill: 'rgba(16, 185, 129, 0.2)',
          stroke: '#10B981',
          strokeWidth: 1.5,
          selectable: false,
          evented: false,
          name: 'PenGuide'
        });
        this.guideObjects.push(halo);
        this.canvas.add(halo);
      }

      // If dragging or if node has handles, draw handle lines and circles
      if (n.cpIn && n.cpOut) {
        // Line from cpIn to cpOut
        const hLine = new fabric.Line([n.cpIn.x, n.cpIn.y, n.cpOut.x, n.cpOut.y], {
          stroke: '#007AFF',
          strokeWidth: 1,
          strokeDashArray: [2, 2],
          selectable: false,
          evented: false,
          name: 'PenGuide'
        });
        this.guideObjects.push(hLine);
        this.canvas.add(hLine);

        // Control handle circles
        [n.cpIn, n.cpOut].forEach(cp => {
          const cpDot = new fabric.Circle({
            left: cp.x,
            top: cp.y,
            originX: 'center',
            originY: 'center',
            radius: 3.5,
            fill: '#007AFF',
            stroke: '#ffffff',
            strokeWidth: 1,
            selectable: false,
            evented: false,
            name: 'PenGuide'
          });
          this.guideObjects.push(cpDot);
          this.canvas.add(cpDot);
        });
      }
    });

    this.canvas.requestRenderAll();
  }

  clearGuides() {
    this.guideObjects.forEach(obj => this.canvas.remove(obj));
    this.guideObjects = [];
  }

  finishPath(closed = false) {
    this.isDrawing = false;
    this.clearGuides();

    if (this.activeShape) {
      this.canvas.remove(this.activeShape);
      this.activeShape = null;
    }

    if (this.nodes.length >= 2) {
      const finalSvg = buildSvgPath(this.nodes, closed);
      if (finalSvg) {
        const path = new fabric.Path(finalSvg, {
          fill: closed ? 'rgba(0, 122, 255, 0.08)' : '',
          stroke: '#111827',
          strokeWidth: 2.5,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          selectable: true,
          evented: true,
          name: 'VectorPath',
          custom: {
            vectorData: {
              nodes: JSON.parse(JSON.stringify(this.nodes)),
              closed: closed
            }
          }
        });

        this.canvas.add(path);
        this.canvas.setActiveObject(path);
        
        if (this.toolManager && this.toolManager.canvasManager && this.toolManager.canvasManager.app) {
          this.toolManager.canvasManager.app.historyManager.saveState();
        }
      }
    }

    this.nodes = [];
    this.activeNode = null;
    this.hoverClose = false;
    this.previewPoint = null;
    this.canvas.requestRenderAll();

    if (this.toolManager) {
      this.toolManager.setTool('select');
    }
  }
}
