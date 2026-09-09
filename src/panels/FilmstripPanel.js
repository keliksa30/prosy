import { svg } from '../ui/icons.js';

/**
 * FilmstripPanel — the "Pages" rail on the left.
 * Real rendered thumbnails, click to switch, drag to reorder,
 * right-click / double-click for page actions (duplicate, rename, …).
 */
export class FilmstripPanel {
  constructor(app) {
    this.app = app;
    this.pageManager = app.pageManager;
    this.container = document.querySelector('.filmstrip-panel');
    this.listEl = null;
    this._dragIndex = null;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="filmstrip-head">
        <span class="filmstrip-title">Pages</span>
        <span class="filmstrip-count" id="pages-count">1</span>
        <span style="flex:1"></span>
        <button class="icobtn" id="btn-filmstrip-add" title="Add page (after last page)">
          ${svg('Plus', 15)}
        </button>
      </div>
      <div class="filmstrip-list" id="filmstrip-list"></div>
      <button class="filmstrip-addrow" id="btn-filmstrip-addrow">
        ${svg('Plus', 14)} <span>Add page</span>
      </button>
    `;
    this.listEl = document.getElementById('filmstrip-list');

    document.getElementById('btn-filmstrip-add').onclick = () => this.addPageAtEnd();
    document.getElementById('btn-filmstrip-addrow').onclick = () => this.addPageAtEnd();
    this.listEl.addEventListener('dragover', (e) => this.onDragOver(e));
    this.listEl.addEventListener('drop', (e) => this.onDrop(e));
    this.listEl.addEventListener('dragleave', () => this._clearDropMark());

    document.addEventListener('prosy:pagesUpdated', () => this.render());
    document.addEventListener('prosy:pageSwitched', () => this.render());
    document.addEventListener('prosy:pageThumbnailUpdated', () => this.render());
    document.addEventListener('prosy:pageTitleChanged', () => this.render());
    this.render();
  }

  addPageAtEnd() {
    const pm = this.pageManager;
    const page = pm.addPage(pm.pages.length, null, null);
    pm.switchPage(pm.pages.indexOf(page));
  }

  render() {
    const pm = this.pageManager;
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
    const countEl = document.getElementById('pages-count');
    if (countEl) countEl.textContent = pm.pages.length;

    pm.pages.forEach((page, index) => {
      const row = document.createElement('div');
      row.className = 'filmstrip-item';
      row.draggable = true;
      if (index === pm.currentIndex) row.classList.add('active');

      const num = document.createElement('span');
      num.className = 'filmstrip-num';
      num.textContent = index + 1;
      num.title = page.title || `Page ${index + 1}`;

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'filmstrip-thumb';
      if (page.thumbnail) {
        const img = document.createElement('img');
        img.src = page.thumbnail;
        img.alt = page.title || '';
        img.loading = 'lazy';
        thumbWrap.appendChild(img);
      } else {
        thumbWrap.classList.add('empty');
        thumbWrap.appendChild(Object.assign(document.createElement('span'), { textContent: page.title ? page.title[0] : 'P' }));
      }
      row.appendChild(num);
      row.appendChild(thumbWrap);

      row.addEventListener('click', () => {
        if (this._justDragged) { this._justDragged = false; return; }
        if (index !== pm.currentIndex) pm.switchPage(index);
      });
      row.addEventListener('dblclick', (e) => {
        e.preventDefault();
        this.app.contextMenu.promptRename(index);
      });
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.app.contextMenu.showPageMenu(index, e.clientX, e.clientY);
      });

      // drag & drop reorder
      row.addEventListener('dragstart', (e) => {
        this._dragIndex = index;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        this._dragIndex = null;
        this._clearDropMark();
      });
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._markDropPosition(e, index);
      });

      this.listEl.appendChild(row);
    });
    this.listEl.appendChild(Object.assign(document.createElement('div'), { className: 'filmstrip-dropend', id: 'filmstrip-dropend' }));
  }

  _markDropPosition(e, overIndex) {
    if (this._dragIndex === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    this._clearDropMark();
    const targetIndex = before ? overIndex : overIndex + 1;
    const rows = this.listEl.querySelectorAll('.filmstrip-item');
    const mark = document.createElement('div');
    mark.className = 'filmstrip-dropmark';
    if (targetIndex >= rows.length) {
      const end = document.getElementById('filmstrip-dropend');
      if (end) end.appendChild(mark);
    } else {
      rows[targetIndex].before(mark);
    }
    this._dropAt = targetIndex;
  }

  _clearDropMark() {
    this.listEl.querySelectorAll('.filmstrip-dropmark').forEach(m => m.remove());
    this._dropAt = null;
  }

  onDragOver(e) {
    // allow dropping past the last item (append at end)
    if (this._dragIndex === null) return;
    const rect = this.listEl.getBoundingClientRect();
    if (e.clientY > rect.bottom - 24) {
      e.preventDefault();
      this._clearDropMark();
      const end = document.getElementById('filmstrip-dropend');
      if (end) end.appendChild(Object.assign(document.createElement('div'), { className: 'filmstrip-dropmark' }));
      this._dropAt = this.pageManager.pages.length;
    }
  }

  onDrop(e) {
    e.preventDefault();
    if (this._dragIndex === null) return;
    const from = this._dragIndex;
    const to = this._dropAt;
    this._dragIndex = null;
    this._justDragged = true;
    setTimeout(() => { this._justDragged = false; }, 50);
    if (to === null || to === undefined) return;
    const pm = this.pageManager;
    if (from === to || from === to - 1) { this._clearDropMark(); return; }
    const [page] = pm.pages.splice(from, 1);
    const insertAt = to > from ? to - 1 : to;
    pm.pages.splice(Math.max(0, insertAt), 0, page);
    if (pm.currentIndex === from) pm.currentIndex = insertAt;
    else if (pm.currentIndex > from && pm.currentIndex < (to > from ? to : insertAt)) pm.currentIndex--;
    else if (pm.currentIndex === insertAt) pm.currentIndex = from;
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    this._clearDropMark();
  }
}
