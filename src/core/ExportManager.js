import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import * as fabric from 'fabric';
import { PageManager } from './PageManager.js';

/**
 * ExportManager — PNG/JPG per page and full PDF, all rendered through an
 * offscreen static canvas so output is independent of the editor zoom.
 *
 * PDF hyperlinks: objects with `custom.hyperlink` get invisible clickable
 * areas in the exported PDF — seamless, no underline or visual artefact.
 */
function toHexColor(color) {
  if (!color || color === 'transparent' || color === 'none') return null;
  if (typeof color === 'string') {
    const trimmed = color.trim();
    if (trimmed.startsWith('#')) {
      const h = trimmed.replace('#', '');
      if (h.length === 3) return h.split('').map(c => c + c).join('').toUpperCase();
      return h.substring(0, 6).toUpperCase();
    }
    const m = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) {
      const r = parseInt(m[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(m[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(m[3], 10).toString(16).padStart(2, '0');
      return `${r}${g}${b}`.toUpperCase();
    }
  }
  return null;
}

export class ExportManager {
  constructor(app) {
    this.app = app;
    this.pageManager = app.pageManager;
    this.canvasManager = app.canvasManager;
  }

  _offscreen() {
    const el = document.createElement('canvas');
    el.width = this.canvasManager.PAGE_W;
    el.height = this.canvasManager.PAGE_H;
    const sc = new fabric.StaticCanvas(el, {
      width: this.canvasManager.PAGE_W,
      height: this.canvasManager.PAGE_H,
      enableRetinaScaling: false,
      backgroundColor: '#ffffff'
    });
    return { el, sc };
  }

  async _renderPage(sc, pageJson) {
    const json = PageManager.normalizeJson(pageJson);
    sc.backgroundColor = json.backgroundColor || '#ffffff';
    await sc.loadFromJSON(json);
    sc.renderAll();
  }

  async exportPageImage(index, format = 'png') {
    const page = this.pageManager.pages[index];
    if (!page) return;
    this.pageManager.saveCurrentPage();
    const { sc } = this._offscreen();
    try {
      await this._renderPage(sc, page.canvas_json);
      const dataUrl = sc.toDataURL({ format: format === 'jpeg' ? 'jpeg' : 'png', quality: 0.95 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `prosy_page_${index + 1}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      a.click();
    } finally {
      sc.dispose && sc.dispose();
    }
  }

  exportCurrentPage(format = 'png') {
    return this.exportPageImage(this.pageManager.currentIndex, format);
  }

  async exportAllPagesPng() {
    for (let i = 0; i < this.pageManager.pages.length; i++) {
      await this.exportPageImage(i, 'png');
      await new Promise(r => setTimeout(r, 350));
    }
  }

  _collectHyperlinks(pageJson) {
    const links = [];
    const json = PageManager.normalizeJson(pageJson);
    const objects = json.objects || [];

    const walk = (objs) => {
      for (const obj of objs) {
        const url = obj.custom?.hyperlink;
        if (url) {
          const left = obj.left || 0;
          const top = obj.top || 0;
          const w = (obj.width || 100) * (obj.scaleX || 1);
          const h = (obj.height || 100) * (obj.scaleY || 1);
          links.push({ url, x: left, y: top, w, h });
        }
        if (obj.objects && Array.isArray(obj.objects)) {
          walk(obj.objects);
        }
      }
    };
    walk(objects);
    return links;
  }

  async exportPDF() {
    this.pageManager.saveCurrentPage();
    const W = this.canvasManager.PAGE_W;
    const H = this.canvasManager.PAGE_H;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H] });
    const { sc } = this._offscreen();
    try {
      for (let i = 0; i < this.pageManager.pages.length; i++) {
        const page = this.pageManager.pages[i];
        try {
          await this._renderPage(sc, page.canvas_json);
        } catch (e) {
          console.error('Failed to render page for PDF export', e);
        }
        const imgData = sc.toDataURL({ format: 'jpeg', quality: 0.9 });
        if (i > 0) pdf.addPage([W, H], 'landscape');
        pdf.setPage(i + 1);
        pdf.addImage(imgData, 'JPEG', 0, 0, W, H);

        const links = this._collectHyperlinks(page.canvas_json);
        for (const link of links) {
          if (!link.url || link.w <= 0 || link.h <= 0) continue;
          pdf.link(link.x, link.y, link.w, link.h, { url: link.url });
        }
      }
      pdf.save('prosy_portfolio.pdf');
    } finally {
      sc.dispose && sc.dispose();
    }
  }

  /**
   * Fully Editable PowerPoint (.pptx) Export
   * Converts fabric objects into native PowerPoint editable textboxes,
   * vector shapes (rects, circles, lines), and standalone movable photos.
   */
  async exportPPTX() {
    this.pageManager.saveCurrentPage();
    const W = this.canvasManager.PAGE_W || 1920;
    const H = this.canvasManager.PAGE_H || 1080;

    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9'; // 10" x 5.625"
    pres.title = this.app.projectName || 'Portfolio Deck';

    const { sc } = this._offscreen();
    try {
      for (let i = 0; i < this.pageManager.pages.length; i++) {
        const page = this.pageManager.pages[i];
        try {
          await this._renderPage(sc, page.canvas_json);
        } catch (e) {
          console.error('Failed to render page for PPTX export', e);
        }

        const slide = pres.addSlide();

        // 1. Native Slide Background
        const bgHex = toHexColor(sc.backgroundColor || page.canvas_json?.backgroundColor || '#ffffff');
        if (bgHex) {
          slide.background = { color: bgHex };
        }

        // 2. Flatten container groups in sc to get true world coordinates for child elements
        let hasGroups = true;
        let guard = 0;
        while (hasGroups && guard < 10) {
          guard++;
          const currentObjs = sc.getObjects();
          const grp = currentObjs.find(o => o.type === 'group' && !o.custom?.maskWrap && !o._isIcon && o._objects?.length);
          if (!grp) {
            hasGroups = false;
            break;
          }
          const kids = [...(grp._objects || [])];
          kids.forEach(k => {
            const matrix = k.calcTransformMatrix();
            k.group = undefined;
            k.parent = undefined;
            if (fabric.util && typeof fabric.util.applyTransformToObject === 'function') {
              fabric.util.applyTransformToObject(k, matrix);
            } else {
              const p = fabric.util.qrDecompose(matrix);
              k.set({
                left: p.translateX,
                top: p.translateY,
                scaleX: p.scaleX,
                scaleY: p.scaleY,
                angle: p.angle,
                originX: 'center',
                originY: 'center'
              });
            }
            sc.add(k);
            k.setCoords();
          });
          grp._objects = [];
          sc.remove(grp);
        }

        sc.renderAll();

        // 3. Process every object as native PowerPoint element
        const objects = sc.getObjects();
        for (const obj of objects) {
          if (obj.visible === false) continue;

          // Skip redundant full-page background rectangles that duplicate slide.background
          const isFullBg = (obj.type === 'rect' && obj.width >= W * 0.95 && obj.height >= H * 0.95) ||
                           obj.name === 'Background' || obj.name === 'Bg';
          if (isFullBg) continue;

          const bbox = obj.getBoundingRect ? obj.getBoundingRect() : {
            left: obj.left || 0,
            top: obj.top || 0,
            width: (obj.width || 100) * (obj.scaleX || 1),
            height: (obj.height || 100) * (obj.scaleY || 1)
          };

          // Coordinate conversion: 1920x1080 px -> 10x5.625 inches
          const x = (bbox.left / W) * 10;
          const y = (bbox.top / H) * 5.625;
          const w = (bbox.width / W) * 10;
          const h = (bbox.height / H) * 5.625;

          const hyperlink = obj.custom?.hyperlink ? { url: obj.custom.hyperlink } : undefined;

          // A. NATIVE EDITABLE TEXTBOX
          if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') {
            const text = obj.text || '';
            if (!text.trim()) continue;

            // Convert CSS px font size to PowerPoint pt
            const fontSize = Math.max(8, Math.round((obj.fontSize || 16) * (obj.scaleY || 1) * 0.72));
            const color = toHexColor(obj.fill) || '111827';
            const fontFace = obj.fontFamily || 'Inter';
            const bold = obj.fontWeight === 'bold' || obj.fontWeight >= 600;
            const italic = obj.fontStyle === 'italic';
            const align = obj.textAlign || 'left';

            slide.addText(text, {
              x, y,
              w: Math.max(w, 0.4),
              h: Math.max(h, 0.25),
              fontFace,
              fontSize,
              color,
              bold,
              italic,
              align,
              valign: 'top',
              margin: 0,
              wrap: true,
              isTextBox: true,
              hyperlink
            });
            continue;
          }

          // B. NATIVE EDITABLE RECTANGLE / CARD
          if (obj.type === 'rect') {
            const fillHex = toHexColor(obj.fill);
            const strokeHex = toHexColor(obj.stroke);
            const hasFill = !!fillHex;
            const hasStroke = strokeHex && obj.strokeWidth > 0;
            if (!hasFill && !hasStroke) continue;

            const fill = hasFill ? {
              color: fillHex,
              transparency: obj.opacity !== undefined ? Math.round((1 - obj.opacity) * 100) : 0
            } : { type: 'none' };

            const line = hasStroke ? {
              color: strokeHex,
              width: Math.max(obj.strokeWidth * (10 / W) * 72, 0.75)
            } : { type: 'none' };

            const isRounded = (obj.rx || 0) > 0;
            const shapeType = isRounded ? pres.ShapeType.roundRect : pres.ShapeType.rect;
            const rectRadius = isRounded ? Math.min((obj.rx / (obj.width || 100)) * 0.5, 0.5) : undefined;

            slide.addShape(shapeType, {
              x, y, w, h,
              fill,
              line,
              rectRadius,
              hyperlink
            });
            continue;
          }

          // C. NATIVE EDITABLE CIRCLE / ELLIPSE
          if (obj.type === 'circle' || obj.type === 'ellipse') {
            const fillHex = toHexColor(obj.fill);
            const strokeHex = toHexColor(obj.stroke);
            const fill = fillHex ? { color: fillHex } : { type: 'none' };
            const line = (strokeHex && obj.strokeWidth > 0) ? {
              color: strokeHex,
              width: Math.max(obj.strokeWidth * (10 / W) * 72, 0.75)
            } : { type: 'none' };

            slide.addShape(pres.ShapeType.ellipse, {
              x, y, w, h,
              fill,
              line,
              hyperlink
            });
            continue;
          }

          // D. NATIVE EDITABLE LINE
          if (obj.type === 'line') {
            const strokeHex = toHexColor(obj.stroke) || 'CBD5E1';
            slide.addShape(pres.ShapeType.line, {
              x, y,
              w: Math.max(w, 0.05),
              h: Math.max(h, 0.05),
              line: { color: strokeHex, width: Math.max(obj.strokeWidth * 0.75, 1) }
            });
            continue;
          }

          // E. STANDALONE MOVEABLE PHOTO / MASKED GROUP / ICON
          try {
            const imgData = obj.toDataURL({ format: 'png', multiplier: 2 });
            if (imgData && imgData.length > 60) {
              slide.addImage({
                data: imgData,
                x, y, w, h,
                hyperlink
              });
            }
          } catch (imgErr) {
            console.warn('Failed to rasterize standalone element for slide', imgErr);
          }
        }
      }

      const safeName = (this.app.projectName || 'portfolio').replace(/[^a-z0-9_-]/gi, '_');
      await pres.writeFile({ fileName: `${safeName}.pptx` });
      this.app.toast?.('Editable PowerPoint (.pptx) exported successfully');
    } finally {
      sc.dispose && sc.dispose();
    }
  }
}
