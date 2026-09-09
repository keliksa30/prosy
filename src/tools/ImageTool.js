import { BaseTool } from './ToolManager.js';
import * as fabric from 'fabric';

export class ImageTool extends BaseTool {
  activate() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml, image/gif';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) { this._backToSelect(); return; }
      const reader = new FileReader();
      reader.onload = async (f) => {
        const data = f.target.result;
        try {
          const img = await fabric.FabricImage.fromURL(data, { crossOrigin: 'anonymous' });
          const pw = this.canvasManager.PAGE_W || 1920;
          const ph = this.canvasManager.PAGE_H || 1080;
          const maxW = pw * 0.55;
          if (img.width > maxW) img.scaleToWidth(maxW);
          img.set({
            left: pw / 2,
            top: ph / 2,
            originX: 'center',
            originY: 'center',
            selectable: true,
            evented: true,
            name: 'Image'
          });
          this.canvas.add(img);
          this.canvas.setActiveObject(img);
          this.canvas.requestRenderAll();
        } catch (err) {
          console.error('Failed to load image', err);
        }
        this._backToSelect();
      };
      reader.readAsDataURL(file);
    };
    input.oncancel = () => this._backToSelect();
    input.click();
    // Safety: if the picker stalls, always return to select
    setTimeout(() => this._backToSelect(), 1500);
  }

  get canvasManager() {
    return this.toolManager ? this.toolManager.canvasManager : null;
  }

  _backToSelect() {
    if (this.toolManager && this.toolManager.currentTool === 'image') {
      this.toolManager.setTool('select');
    }
  }
}
