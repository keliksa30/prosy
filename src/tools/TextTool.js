import { BaseTool } from './ToolManager.js';
import * as fabric from 'fabric';

/**
 * TextTool — two flavours, chosen from the text caret menu:
 *   mode 'text'      → single click drops a heading IText and edits it
 *   mode 'paragraph' → drag on the page defines the paragraph's width and
 *                      a wrapping Textbox is created (height grows as you
 *                      type); a plain click creates a default-width box.
 *
 * Figma-like enhancements:
 *   - Dashed ghost rectangle preview while dragging
 *   - Width label follows the ghost
 *   - Text cursor on hover
 *   - Auto-enter editing on creation
 */
export class TextTool extends BaseTool {
  constructor() {
    super();
    this.mode = 'text';
    this.isDown = false;
    this.created = null;
    this.startX = 0;
    this.startY = 0;
    this._ghost = null;
    this._ghostLabel = null;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  activate() {
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'text';
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
    this._removeGhost();
  }

  _contrastColor() {
    const bg = this.canvas.backgroundColor || '#ffffff';
    const hex = String(bg).replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum > 0.6 ? '#18181b' : '#ffffff';
    }
    return '#18181b';
  }

  _make({ x, y, width = null }) {
    const common = {
      left: Math.round(x),
      top: Math.round(y),
      fontFamily: 'Inter',
      fontSize: 40,
      fontWeight: 'normal',
      fill: this._contrastColor(),
      selectable: true,
      evented: true,
      name: 'Text'
    };
    if (this.mode === 'paragraph') {
      return new fabric.Textbox('Type a paragraph…', {
        ...common,
        width: Math.max(100, width || 600),
        fontSize: 28,
        lineHeight: 1.45,
        splitByGrapheme: false
      });
    }
    return new fabric.IText('Type something', { ...common, fontSize: 48 });
  }

  _finishEditing(obj) {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.requestRenderAll();
    try {
      obj.enterEditing();
      obj.selectAll();
    } catch (e) {
      console.warn('Could not enter text editing automatically', e);
    }
  }

  /* ---- Ghost preview (Figma-style dashed rectangle) ---- */

  _createGhost(x, y) {
    const ghost = new fabric.Rect({
      left: x,
      top: y,
      width: 1,
      height: 40,
      fill: 'rgba(123, 70, 248, 0.06)',
      stroke: '#7b46f8',
      strokeWidth: 1.5,
      strokeDashArray: [6, 4],
      strokeUniform: true,
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      originX: 'left',
      originY: 'top',
      rx: 3,
      ry: 3
    });
    this.canvas.add(ghost);
    this._ghost = ghost;

    // Width label
    const label = new fabric.IText('0 px', {
      left: x,
      top: y - 20,
      fontSize: 11,
      fontFamily: 'Inter, system-ui, sans-serif',
      fill: '#7b46f8',
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      originX: 'left',
      originY: 'top'
    });
    this.canvas.add(label);
    this._ghostLabel = label;
  }

  _updateGhost(startX, startY, currentX, currentY) {
    if (!this._ghost) return;
    const w = Math.max(1, Math.abs(currentX - startX));
    const h = Math.max(30, Math.abs(currentY - startY));
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    this._ghost.set({ left, top, width: w, height: h });
    this._ghost.setCoords();
    if (this._ghostLabel) {
      this._ghostLabel.set({
        left: left + w / 2 - 15,
        top: top - 20,
        text: `${Math.round(w)} px`
      });
      this._ghostLabel.setCoords();
    }
    this.canvas.requestRenderAll();
  }

  _removeGhost() {
    if (this._ghost) {
      this.canvas.remove(this._ghost);
      this._ghost = null;
    }
    if (this._ghostLabel) {
      this.canvas.remove(this._ghostLabel);
      this._ghostLabel = null;
    }
  }

  /* ---- Event handlers ---- */

  handleMouseDown(o) {
    if (this.toolManager.currentTool !== 'text') return;
    if (o.e.button !== 0) return;
    const pointer = o.scenePoint || this.canvas.getScenePoint(o.e);
    this.isDown = true;
    this.created = null;
    this.startX = pointer.x;
    this.startY = pointer.y;

    if (this.mode === 'text') {
      // heading: click → instant IText (existing behaviour)
      this.isDown = false;
      this._finishEditing(this._make({ x: pointer.x, y: pointer.y }));
      this.toolManager.setTool('select');
    } else if (this.mode === 'paragraph') {
      // Start ghost preview
      this._createGhost(pointer.x, pointer.y);
    }
  }

  handleMouseMove(o) {
    if (!this.isDown || this.mode !== 'paragraph') return;
    const pointer = o.scenePoint || this.canvas.getScenePoint(o.e);

    // Update ghost rectangle
    this._updateGhost(this.startX, this.startY, pointer.x, pointer.y);
  }

  handleMouseUp(o) {
    if (!this.isDown || this.mode !== 'paragraph') return;
    this.isDown = false;
    const pointer = o.scenePoint || this.canvas.getScenePoint(o.e);
    const dx = Math.abs(pointer.x - this.startX);

    // Remove ghost
    this._removeGhost();

    if (dx < 10) {
      // plain click: default-width paragraph box at the pointer
      this.created = this._make({ x: pointer.x, y: pointer.y, width: 600 });
    } else {
      // dragged: use the drag width
      const left = Math.min(this.startX, pointer.x);
      const top = Math.min(this.startY, pointer.y);
      this.created = this._make({ x: left, y: top, width: dx });
    }
    this._finishEditing(this.created);
    this.created = null;
    this.toolManager.setTool('select');
  }
}
