import { BaseTool } from './ToolManager.js';

export class HandTool extends BaseTool {
  constructor() {
    super();
    this.isDragging = false;
    this.lastPosX = 0;
    this.lastPosY = 0;
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  activate() {
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'grab';
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
    this.canvas.defaultCursor = 'default';
  }

  handleMouseDown(opt) {
    if (opt.e.button !== 0 && opt.e.button !== 1) return;
    this.isDragging = true;
    this.canvas.defaultCursor = 'grabbing';
    this.lastPosX = opt.e.clientX;
    this.lastPosY = opt.e.clientY;
    opt.e.preventDefault();
  }

  handleMouseMove(opt) {
    if (!this.isDragging) return;
    const e = opt.e;
    if (this.toolManager.canvasManager && this.toolManager.canvasManager.panBy) {
      this.toolManager.canvasManager.panBy(e.clientX - this.lastPosX, e.clientY - this.lastPosY);
    } else {
      const vpt = this.canvas.viewportTransform;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.canvas.requestRenderAll();
    }
    this.lastPosX = e.clientX;
    this.lastPosY = e.clientY;
  }

  handleMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.canvas.defaultCursor = 'grab';
  }
}
