export class ToolManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.getCanvas();
    this.currentTool = 'select';
    this.tools = {};
  }

  registerTool(name, toolInstance) {
    this.tools[name] = toolInstance;
    toolInstance.setToolManager(this);
  }

  setShapeType(type) {
    const t = this.tools['shape'];
    if (t) t.shapeType = type;
  }

  setTool(name) {
    if (!this.tools[name]) return;
    if (this.currentTool === name) {
      this._syncUI(name);
      return;
    }
    if (this.tools[this.currentTool]) {
      try { this.tools[this.currentTool].deactivate(); } catch (e) { console.error(e); }
    }
    this.currentTool = name;
    if (this.tools[name]) {
      try { this.tools[name].activate(); } catch (e) { console.error(e); }
    }
    this._syncUI(name);
    document.dispatchEvent(new CustomEvent('prosy:toolChanged', { detail: { tool: name } }));
  }

  _syncUI(name) {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      if (!btn.dataset.tool) return;
      const isActive = btn.dataset.tool === name;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  getCanvas() {
    return this.canvas;
  }
}

// Base Tool class
export class BaseTool {
  constructor() {
    this.toolManager = null;
    this.canvas = null;
  }

  setToolManager(manager) {
    this.toolManager = manager;
    this.canvas = manager.getCanvas();
  }

  activate() {
    // Override in subclasses
  }

  deactivate() {
    // Override in subclasses
  }
}
