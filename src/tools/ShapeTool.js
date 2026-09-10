import { BaseTool } from './ToolManager.js';
import { SHAPE_DEFS, createShape } from '../shapes/defs.js';

/**
 * ShapeTool — draws any shape from the shape library.
 *
 * The object is created lazily on the FIRST mouse:move (not during the
 * fabric mouse:down cycle) and only added to the canvas once its pointer
 * coordinates are known. A plain click (no drag) places the shape at its
 * default size. Shift keeps the original aspect ratio.
 */
export class ShapeTool extends BaseTool {
  constructor(shapeType = 'rect') {
    super();
    this.shapeType = shapeType;
    this.isDrawing = false;
    this.shape = null;
    this.startX = 0;
    this.startY = 0;
    this._created = false;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  activate() {
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'crosshair';
    this.canvas.getObjects().forEach(obj => {
      obj.set('selectable', false);
      obj.set('evented', false);
    });
    this.canvas.on('mouse:down', this.handleMouseDown);
    this.canvas.on('mouse:move', this.handleMouseMove);
    this.canvas.on('mouse:up', this.handleMouseUp);
  }

  deactivate() {
    this.canvas.off('mouse:down', this.handleMouseDown);
    this.canvas.off('mouse:move', this.handleMouseMove);
    this.canvas.off('mouse:up', this.handleMouseUp);
  }

  handleMouseDown(o) {
    if (this.toolManager.currentTool !== 'shape') return;
    if (o.e && o.e.button !== undefined && o.e.button !== 0) return;
    if (this.isDrawing) return; // ignore stray double-downs
    this.isDrawing = true;
    this._created = false;
    const pointer = o.scenePoint || this.canvas.getScenePoint(o.e);
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.shape = null;
  }

  _createShapeAt(pointer, { fromStart = true } = {}) {
    const obj = createShape(this.shapeType);
    obj.set({
      left: this.startX,
      top: this.startY,
      originX: 'left',
      originY: 'top',
      scaleX: 1,
      scaleY: 1,
      selectable: true,
      evented: true
    });
    this.shape = obj;
    this._created = true;
    // apply current pointer size so the first frame matches the cursor
    this._applyPointer(pointer);
    this.canvas.add(obj);
    this.canvas.requestRenderAll();
  }

  _applyPointer(pointer, shiftKey = false) {
    if (!this.shape) return;
    const def = SHAPE_DEFS[this.shapeType] || SHAPE_DEFS.rect;
    const baseW = this.shape.custom ? this.shape.custom.baseW : def.baseW;
    const baseH = this.shape.custom ? this.shape.custom.baseH : def.baseH;
    const obj = this.shape;

    // Lines / arrows: pointer-anchored — stretch toward the cursor
    if (def.isLine || this.shapeType === 'arrowRight' || this.shapeType === 'arrowUp') {
      const dx = pointer.x - this.startX;
      const dy = pointer.y - this.startY;
      const len = Math.max(8, Math.hypot(dx, dy));
      obj.set({ scaleX: len / baseW, scaleY: 1, angle: Math.atan2(dy, dx) * 180 / Math.PI, left: this.startX, top: this.startY });
      obj.setCoords();
      return;
    }

    let w = Math.abs(pointer.x - this.startX);
    let h = Math.abs(pointer.y - this.startY);
    const dirX = pointer.x >= this.startX ? 1 : -1;
    const dirY = pointer.y >= this.startY ? 1 : -1;

    if (shiftKey && w > 0.001 && h > 0.001) {
      const ratio = baseW / baseH;
      if (w / h > ratio) h = w / ratio;
      else w = h * ratio;
    }
    w = Math.max(2, w);
    h = Math.max(2, h);

    const left = dirX > 0 ? this.startX : this.startX - w;
    const top = dirY > 0 ? this.startY : this.startY - h;

    if (obj.type === 'ellipse') {
      obj.set({ rx: w / 2, ry: h / 2, left: dirX > 0 ? this.startX : this.startX - w, top: dirY > 0 ? this.startY : this.startY - h, scaleX: 1, scaleY: 1 });
    } else if (obj.type === 'rect') {
      obj.set({ width: w, height: h, left, top, scaleX: 1, scaleY: 1 });
    } else {
      obj.set({ scaleX: w / baseW, scaleY: h / baseH, left, top });
    }
    obj.setCoords();
    this.canvas.requestRenderAll();
  }

  handleMouseMove(o) {
    if (!this.isDrawing) return;
    const pointer = o.scenePoint || this.canvas.getScenePoint(o.e);
    const dx = Math.abs(pointer.x - this.startX);
    const dy = Math.abs(pointer.y - this.startY);

    if (!this._created && (dx > 3 || dy > 3)) {
      this._createShapeAt(pointer);
      return;
    }
    if (this.shape) {
      this._applyPointer(pointer, o.e.shiftKey);
    }
  }

  handleMouseUp(o) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const pointer = o.scenePoint || this.canvas.getScenePoint(o.e);

    if (!this._created) {
      // Click without drag: drop the default-size shape centered at click.
      const def = SHAPE_DEFS[this.shapeType] || SHAPE_DEFS.rect;
      this.startX = pointer.x;
      this.startY = pointer.y;
      this._createShapeAt({
        x: this.startX + Math.max(def.baseW, 220) / 2,
        y: this.startY + Math.max(def.baseH, 130) / 2
      });
      const obj = this.shape;
      if (obj && obj.setCoords) {
        const b = obj.getBoundingRect();
        obj.set({ left: pointer.x - b.width / 2, top: pointer.y - b.height / 2 });
        obj.setCoords();
      }
      this._finish();
      return;
    }

    const obj = this.shape;
    if (obj) {
      const b = obj.getBoundingRect();
      if (b.width < 8 || b.height < 8) {
        this.canvas.remove(obj);
        this._reset();
        this.toolManager.setTool('select');
        return;
      }
      this._finish();
      return;
    }
    this._reset();
  }

  _finish() {
    const obj = this.shape;
    if (obj) {
      obj.set({ selectable: true, evented: true });
      obj.setCoords();
      this.canvas.setActiveObject(obj);
      this.canvas.requestRenderAll();
    }
    this._reset();
    this.toolManager.setTool('select');
  }

  _reset() {
    this.shape = null;
    this._created = false;
  }
}
