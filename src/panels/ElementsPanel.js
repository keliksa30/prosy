import * as fabric from 'fabric';
import { svg } from '../ui/icons.js';
import { ELEMENT_DEFS, createElement, findElement } from '../elements/ElementLibrary.js';

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
}
