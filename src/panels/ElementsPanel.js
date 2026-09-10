import * as fabric from 'fabric';
import { svg } from '../ui/icons.js';
import { ELEMENT_DEFS, createElement, findElement } from '../elements/ElementLibrary.js';
import { createCodeSnippetGroup } from '../tools/CodeSnippetBlock.js';

/**
 * ElementsPanel — the "Elements" sidebar tab: professional pre-built
 * blocks (IG post / story mockups, photo frames, avatar circles, buttons,
 * chips, work cards, grids, quotes). Drag a card onto the page (or click
 * to drop it at the page centre), then customize: photo slots are real
 * images — select one and Replace image from the Design tab.
 */
export class ElementsPanel {
  constructor(app) {
    this.app = app;
    this.app.elementsPanel = this;
    this.app.elementLibrary = { createElement, findElement, ELEMENT_DEFS };
    this.canvas = app.canvasManager.getCanvas();
    this.cm = app.canvasManager;
    this.host = null;
  }

  mount(host) {
    this.host = host;
    this.render();
    this._bindDrop();
  }

  render() {
    if (!this.host) return;
    const host = this.host;
    host.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = `<div class="panel-head-title">Elements</div>
      <div class="panel-head-sub">${ELEMENT_DEFS.length} blocks · drag to page</div>`;
    host.appendChild(head);

    const note = document.createElement('div');
    note.className = 'panel-note';
    note.style.padding = '8px 12px 2px';
    note.textContent = 'Drag a block onto the page or click to add, then customize with your own content.';
    host.appendChild(note);

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn btn-secondary';
    uploadBtn.style.margin = '8px 12px';
    uploadBtn.style.width = 'calc(100% - 24px)';
    uploadBtn.innerHTML = `${svg('Upload', 14)} Upload SVG`;
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.svg';
    fileInput.style.display = 'none';
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const svgText = ev.target.result;
        fabric.loadSVGFromString(svgText, (objects, options) => {
          if (!objects || !objects.length) return;
          const svgObj = fabric.util.groupSVGElements(objects, options);
          
          svgObj.set({
            name: 'SVGUpload',
            isSvgGroup: true,
            cornerSize: 8,
            transparentCorners: false,
            cornerColor: 'white',
            cornerStrokeColor: '#007AFF',
            borderColor: '#007AFF',
            borderScaleFactor: 2
          });

          // Center on canvas
          const zoom = this.cm.getZoom();
          const vp = this.cm.getViewport();
          const pan = this.canvas.viewportTransform;
          const pw = this.cm.PAGE_W || 1920;
          const ph = this.cm.PAGE_H || 1080;
          const objW = svgObj.width * (svgObj.scaleX || 1);
          const objH = svgObj.height * (svgObj.scaleY || 1);

          let left = Math.round((pw - objW) / 2);
          let top = Math.round((ph - objH) / 2);
          if (vp && pan && zoom) {
            const vpLeft = (-pan[4] + vp.offsetWidth / 2) / zoom - objW / 2;
            const vpTop = (-pan[5] + vp.offsetHeight / 2) / zoom - objH / 2;
            if (vpLeft >= 40 && vpLeft <= pw - objW - 40) left = Math.round(vpLeft);
            if (vpTop >= 40 && vpTop <= ph - objH - 40) top = Math.round(vpTop);
          }
          svgObj.set({ left, top });

          this.canvas.add(svgObj);
          this.canvas.setActiveObject(svgObj);
          this.canvas.requestRenderAll();
          if (this.app.historyManager) this.app.historyManager.saveState();
        });
      };
      reader.readAsText(file);
    });
    
    const actionsGrid = document.createElement('div');
    actionsGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 12px;';

    const qrBtn = document.createElement('button');
    qrBtn.className = 'btn btn-secondary';
    qrBtn.style.fontSize = '12px';
    qrBtn.style.justifyContent = 'center';
    qrBtn.innerHTML = `${svg('QrCode', 14)} QR Code`;
    qrBtn.addEventListener('click', () => {
      this.app.showQRCodeDialog && this.app.showQRCodeDialog();
    });

    const codeBtn = document.createElement('button');
    codeBtn.className = 'btn btn-secondary';
    codeBtn.style.fontSize = '12px';
    codeBtn.style.justifyContent = 'center';
    codeBtn.innerHTML = `${svg('Code', 14)} Code Snippet`;
    codeBtn.addEventListener('click', () => {
      this.insertCodeSnippet();
    });

    actionsGrid.appendChild(qrBtn);
    actionsGrid.appendChild(codeBtn);

    host.appendChild(actionsGrid);
    host.appendChild(uploadBtn);
    host.appendChild(fileInput);

    const list = document.createElement('div');
    list.className = 'elements-list';
    ELEMENT_DEFS.forEach(def => {
      const row = document.createElement('div');
      row.className = 'element-card';
      row.draggable = true;
      row.dataset.element = def.id;
      row.title = `${def.name} — ${def.sub}`;

      const ic = document.createElement('span');
      ic.className = 'element-card-ic';
      ic.innerHTML = svg(def.icon, 18);
      const body = document.createElement('div');
      body.className = 'element-card-body';
      const name = document.createElement('div');
      name.className = 'element-card-name';
      name.textContent = def.name;
      const sub = document.createElement('div');
      sub.className = 'element-card-sub';
      sub.textContent = def.sub;
      body.appendChild(name);
      body.appendChild(sub);
      const grip = document.createElement('span');
      grip.className = 'element-card-grip';
      grip.innerHTML = svg('GripVertical', 14);
      row.appendChild(ic);
      row.appendChild(body);
      row.appendChild(grip);

      row.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/prosy-element', def.id);
        row.classList.add('dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      // click = insert at the page centre
      row.addEventListener('click', () => this.insertElement(def.id, null));
      list.appendChild(row);
    });
    host.appendChild(list);
  }

  _bindDrop() {
    const vp = this.cm.getViewport();
    if (!vp) return;
    vp.addEventListener('dragover', (e) => {
      if (e.dataTransfer && e.dataTransfer.types.includes('text/prosy-element')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    });
    vp.addEventListener('drop', (e) => {
      const id = e.dataTransfer && e.dataTransfer.getData('text/prosy-element');
      if (!id) return;
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const pan = this.cm.getPan();
      const zoom = this.cm.getZoom();
      const scene = {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };
      this.insertElement(id, scene);
    });
  }

  /** insert at scene point (null → page centre) */
  async insertElement(id, scenePt) {
    const def = ELEMENT_DEFS.find(d => d.id === id);
    if (!def) return;
    try {
      const { objs, w, h } = await createElement(def);
      if (!objs.length) return;
      let left, top;
      if (scenePt) {
        left = scenePt.x - w / 2;
        top = scenePt.y - h / 2;
      } else {
        left = Math.max(40, (this.cm.PAGE_W - w) / 2);
        top = Math.max(40, (this.cm.PAGE_H - h) / 2);
      }
      const hm = this.app.historyManager;
      hm.beginBulk();
      try {
        const group = new fabric.Group(objs, {
          left: Math.round(left),
          top: Math.round(top),
          originX: 'left',
          originY: 'top',
          name: def.name || 'Element',
          subTargetCheck: true
        });
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        this.canvas.requestRenderAll();
      } finally {
        hm.endBulk();
        this.app.historyManager.saveState();
        document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      }
      this.app.toast?.(`${def.name} added to slide`);
      if (this.app._closeElementsMenu) this.app._closeElementsMenu();
      if (this.app.closeMobileSheet) this.app.closeMobileSheet();
      if (this.app.dock && typeof window !== 'undefined' && window.innerWidth > 768) {
        this.app.dock.show('design');
      }
    } catch (e) {
      console.error('insertElement failed', e);
      this.app.toast?.('Could not add element', true);
    }
  }

  insertCodeSnippet(scenePt = null) {
    const w = 540;
    const h = 240;
    let left, top;
    if (scenePt) {
      left = scenePt.x - w / 2;
      top = scenePt.y - h / 2;
    } else {
      left = Math.max(40, (this.cm.PAGE_W - w) / 2);
      top = Math.max(40, (this.cm.PAGE_H - h) / 2);
    }

    const defaultCode = `// Fetch analytics summary\nasync function getStats() {\n  const res = await fetch('/api/stats');\n  const data = await res.json();\n  return data.totalViews;\n}`;
    const group = createCodeSnippetGroup({
      code: defaultCode,
      lang: 'javascript',
      theme: 'one-dark',
      left: Math.round(left),
      top: Math.round(top),
      width: w
    });

    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.requestRenderAll();
    if (this.app.historyManager) this.app.historyManager.saveState();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited'));

    this.app.toast?.('Code snippet added to slide');
    if (this.app._closeElementsMenu) this.app._closeElementsMenu();
    if (this.app.closeMobileSheet) this.app.closeMobileSheet();
    if (this.app.dock && typeof window !== 'undefined' && window.innerWidth > 768) {
      this.app.dock.show('design');
    }
  }
}
