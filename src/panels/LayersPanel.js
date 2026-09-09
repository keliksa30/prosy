import { svg } from '../ui/icons.js';

const TYPE_ICONS = {
  rect: 'Square', circle: 'Circle', ellipse: 'Circle', triangle: 'Triangle',
  path: 'Shapes', star: 'Star', heart: 'Heart', line: 'Minus',
  'i-text': 'Type', text: 'Type', textbox: 'Type', image: 'Image',
  group: 'Group', activeSelection: 'Group', activeselection: 'Group'
};

function typeIcon(obj) {
  const key = obj.custom && obj.custom.shapeKey;
  if (key && TYPE_ICONS[key]) return TYPE_ICONS[key];
  if (obj.type === 'path') {
    const n = (obj.name || '').toLowerCase();
    if (n.includes('arrow')) return 'MoveRight';
    if (n.includes('star')) return 'Star';
    if (n.includes('heart')) return 'Heart';
    return 'Shapes';
  }
  return TYPE_ICONS[obj.type] || 'Box';
}

function layerLabel(obj) {
  if (obj.name && obj.name !== 'Text' && obj.name !== 'Image') return obj.name;
  if (obj.custom && obj.custom.shapeLabel) return obj.custom.shapeLabel;
  if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
    return (obj.text || 'Text').replace(/\n/g, ' ').slice(0, 24) || 'Text';
  }
  if (obj.type === 'group') {
    return 'Group' + (obj._objects ? ` (${obj._objects.length})` : '');
  }
  if (obj.type === 'image') return 'Image';
  const map = { rect: 'Rectangle', circle: 'Circle', ellipse: 'Ellipse', triangle: 'Triangle', line: 'Line', path: 'Shape' };
  return map[obj.type] || obj.type;
}

/**
 * LayersPanel — docked right-sidebar "Layers" tab.
 * Row per object (top layer first): type icon, editable name,
 * visibility + lock toggles. Click = select, double-click name = rename,
 * drag = reorder.
 */
export class LayersPanel {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvasManager.getCanvas();
    this.host = null;
    this._renderBound = () => this.render();
    this._bindCanvasEvents();
  }

  mount(host) {
    this.host = host;
    this.render();
  }

  _bindCanvasEvents() {
    const c = this.canvas;
    ['object:added', 'object:removed', 'object:modified', 'selection:created', 'selection:updated', 'selection:cleared'].forEach(ev =>
      c.on(ev, this._renderBound));
    document.addEventListener('prosy:pageSwitched', this._renderBound);
    document.addEventListener('prosy:objectEdited', this._renderBound);
  }

  render() {
    if (!this.host) return;
    const objects = this.canvas.getObjects();
    const active = this.canvas.getActiveObjects();
    this.host.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.className = 'panel-subhead';
    toolbar.innerHTML = `
      <span>${objects.length} ${objects.length === 1 ? 'layer' : 'layers'}</span>
      <span style="flex:1"></span>
      <button class="icobtn" id="layers-collapse-all" title="Collapse all">${svg('ChevronsDownUp', 14)}</button>
      <button class="icobtn" id="layers-select-all" title="Select all (Cmd/Ctrl+A)">${svg('SquareDashed', 14)}</button>
    `;
    this.host.appendChild(toolbar);

    const list = document.createElement('div');
    list.className = 'layers-list';
    list.addEventListener('dragover', (e) => this._onListOver(e));
    list.addEventListener('drop', (e) => this._onDrop(e));
    this.host.appendChild(list);

    if (!objects.length) {
      list.innerHTML = `<div class="layers-empty">This page is empty.<br>Add text, shapes or images.</div>`;
      return;
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const row = document.createElement('div');
      row.className = 'layer-row' + (active.includes(obj) ? ' active' : '') + (obj.visible === false ? ' hidden' : '');
      row.draggable = true;
      row.dataset.sceneIndex = i;

      const ic = document.createElement('span');
      ic.className = 'layer-typeic';
      ic.innerHTML = svg(typeIcon(obj), 14);
      row.appendChild(ic);

      const nameEl = document.createElement('span');
      nameEl.className = 'layer-name';
      nameEl.textContent = layerLabel(obj);
      nameEl.title = obj.name || layerLabel(obj);
      row.appendChild(nameEl);

      const vis = document.createElement('button');
      vis.className = 'layer-act';
      vis.title = obj.visible === false ? 'Show layer' : 'Hide layer';
      vis.innerHTML = svg(obj.visible === false ? 'EyeOff' : 'Eye', 14);
      row.appendChild(vis);

      const lock = document.createElement('button');
      lock.className = 'layer-act';
      const locked = obj._userLocked === true || obj.selectable === false;
      lock.title = locked ? 'Unlock layer' : 'Lock layer';
      lock.innerHTML = svg(locked ? 'Lock' : 'LockOpen', 13);
      row.appendChild(lock);

      // --- interactions ---
      row.addEventListener('click', (e) => {
        if (e.target.closest('.layer-act')) return;
        if (obj.selectable === false && obj._userLocked) return;
        const multi = e.shiftKey || e.metaKey || e.ctrlKey;
        if (multi && active.includes(obj)) {
          this.canvas.discardActiveObject();
          const rest = active.filter(o => o !== obj);
          if (rest.length) this.canvas.setActiveObject(new (window.fabric.ActiveSelection)(rest, { canvas: this.canvas }));
        } else if (multi) {
          const sel = [...active, obj];
          this.canvas.setActiveObject(new (window.fabric.ActiveSelection)(sel, { canvas: this.canvas }));
        } else {
          this.canvas.discardActiveObject();
          this.canvas.setActiveObject(obj);
        }
        this.canvas.requestRenderAll();
      });

      nameEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.className = 'layer-rename';
        input.value = obj.name || layerLabel(obj);
        nameEl.replaceWith(input);
        input.focus();
        input.select();
        const done = () => {
          const v = input.value.trim();
          obj.set('name', v || undefined);
          this.canvas.requestRenderAll();
          this.render();
        };
        input.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') done(); if (ev.key === 'Escape') this.render(); });
        input.addEventListener('blur', done);
      });

      vis.addEventListener('click', (e) => {
        e.stopPropagation();
        obj.set('visible', obj.visible === false);
        if (obj.visible === false && active.includes(obj)) {
          this.canvas.discardActiveObject();
        }
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        this.render();
      });

      lock.addEventListener('click', (e) => {
        e.stopPropagation();
        const locked = !(obj._userLocked === true);
        obj.set({
          selectable: !locked, evented: !locked,
          lockMovementX: locked, lockMovementY: locked,
          lockScalingX: locked, lockScalingY: locked, lockRotation: locked,
          _userLocked: locked
        });
        if (locked && active.includes(obj)) this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
        this.app.historyManager.saveState();
        this.render();
      });

      // drag reorder — target recorded as {scene, before} from the row
      // hovered, not from DOM position (the dragged row stays in the DOM).
      row.addEventListener('dragstart', (e) => {
        this._dragIdx = i;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(i));
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        this._dragIdx = null;
        this._drop = null;
        this._clearMarks();
      });
      row.addEventListener('dragover', (e) => {
        if (this._dragIdx === null || parseInt(row.dataset.sceneIndex, 10) === this._dragIdx) return;
        e.preventDefault();
        e.stopPropagation();
        this._clearMarks();
        const rect = e.currentTarget.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        const mark = document.createElement('div');
        mark.className = 'layer-dropmark';
        if (before) row.before(mark); else row.after(mark);
        this._drop = { scene: parseInt(row.dataset.sceneIndex, 10), before };
      });

      list.appendChild(row);
    }
    list.appendChild(Object.assign(document.createElement('div'), { className: 'layer-dropend' }));

    document.getElementById('layers-select-all')?.addEventListener('click', () => {
      this.app.keyboardManager.selectAll();
    });
    document.getElementById('layers-collapse-all')?.addEventListener('click', () => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
      this.render();
    });
  }

  _clearMarks() {
    this.host.querySelectorAll('.layer-dropmark').forEach(m => m.remove());
  }

  _onListOver(e) {
    // dropping past the last visible row → move to the very bottom
    if (this._dragIdx === null) return;
    e.preventDefault();
    const dropend = this.host.querySelector('.layer-dropend');
    const rect = dropend.getBoundingClientRect();
    if (e.clientY > rect.top - 14) {
      this._clearMarks();
      dropend.appendChild(Object.assign(document.createElement('div'), { className: 'layer-dropmark' }));
      this._drop = { scene: 0, before: false }; // below bottom-most layer
    }
  }

  _onDrop(e) {
    e.preventDefault();
    if (this._dragIdx === null) return;
    const f = this._dragIdx;
    const drop = this._drop;
    this._dragIdx = null;
    this._drop = null;
    this._clearMarks();
    if (!drop) return;

    const canvas = this.canvas;
    const obj = canvas.getObjects()[f];
    if (!obj) return;

    const s = drop.scene;            // hovered row's scene index (pre-removal)
    // no-op when the object already sits directly above/below the target
    if (drop.before && f === s + 1) return;
    if (!drop.before && f === s - 1) return;

    canvas.remove(obj);
    // target's scene index after the dragged object is gone
    const sA = f < s ? s - 1 : s;
    // display order is the reverse of scene order; scene index grows upward:
    //   drop above target → insert at sA + 1, drop below → insert at sA
    let k = drop.before ? sA + 1 : sA;
    const M = canvas.getObjects().length;
    k = Math.max(0, Math.min(M, k)); // k == M → appends on top
    canvas.insertAt(k, obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    this.app.historyManager.saveState();
    this.render();
  }
}
