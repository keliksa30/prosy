import * as fabric from 'fabric';

/**
 * PageManager — one "page" (a slide) owns a full 1920×1080 fabric scene.
 * Handles full CRUD, switching, real thumbnails and JSON normalization.
 * Terminology is intentionally "page" everywhere (user-facing).
 */
export class PageManager {
  constructor(canvasManager, historyManager) {
    this.canvasManager = canvasManager;
    this.historyManager = historyManager;
    this.pages = [];
    this.currentIndex = -1;
    this._thumbTimer = null;
    this._thumbCanvas = null;
  }

  init() {
    this.addPage(0, 'Cover');
    const canvas = this.canvasManager.getCanvas();
    // Refresh the thumbnail whenever the scene changes (debounced).
    canvas.on('object:added', () => this._scheduleThumb());
    canvas.on('object:modified', () => this._scheduleThumb());
    canvas.on('object:removed', () => this._scheduleThumb());
  }

  /* ------------------------------------------------------------------ */
  /* JSON helpers                                                        */
  /* ------------------------------------------------------------------ */

  static blankJson() {
    return { version: '7.0.0', backgroundColor: '#ffffff', background: '#ffffff', objects: [] };
  }

  /** normalize a stored page canvas_json so bg info & version are always sane */
  static normalizeJson(json) {
    const out = json && typeof json === 'object' ? json : {};
    if (!out.version) out.version = '7.0.0';
    if (!Array.isArray(out.objects)) out.objects = [];
    const bg = out.backgroundColor || out.background || '#ffffff';
    out.backgroundColor = bg;
    out.background = bg;
    return out;
  }

  static nextTitle(prefix, existing) {
    let i = 1;
    const used = new Set(existing.map(p => (p.title || '').toLowerCase()));
    let title = `${prefix} ${i}`;
    while (used.has(title.toLowerCase())) { i++; title = `${prefix} ${i}`; }
    return title;
  }

  /* ------------------------------------------------------------------ */
  /* Page CRUD                                                           */
  /* ------------------------------------------------------------------ */

  /**
   * Add a page. `index` = position to insert at (default: end).
   * If this is the very first page it is switched to automatically.
   */
  addPage(index = null, title = null, canvasJson = null) {
    const wasEmpty = this.pages.length === 0;
    this.saveCurrentPage();

    const page = {
      id: crypto.randomUUID(),
      title: title || PageManager.nextTitle('Page', this.pages),
      canvas_json: PageManager.normalizeJson(canvasJson),
      thumbnail: null
    };

    const at = (index === null || index === undefined)
      ? this.pages.length
      : Math.max(0, Math.min(this.pages.length, index));
    this.pages.splice(at, 0, page);

    if (wasEmpty) {
      this.currentIndex = -1; // force load below
      this.switchPage(at);
    }
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated', { detail: { pageId: page.id } }));
    return page;
  }

  getCurrentPage() {
    return this.pages[this.currentIndex] || null;
  }

  saveCurrentPage() {
    if (this._loading) return; // canvas mid-load — don't persist stale state
    if (this.currentIndex >= 0 && this.currentIndex < this.pages.length) {
      const canvas = this.canvasManager.getCanvas();
      let json;
      try {
        json = canvas.toObject(['custom', 'name', '_isIcon', '_userLocked', 'id', 'themeColor']); // keep names + custom + themeColor
      } catch (e) {
        json = PageManager.blankJson();
      }
      json.backgroundColor = json.backgroundColor || this.canvasManager.getBackgroundColor();
      json.background = json.backgroundColor;
      this.pages[this.currentIndex].canvas_json = PageManager.normalizeJson(json);
    }
  }

  duplicatePage(index = this.currentIndex) {
    if (index < 0) return null;
    this.saveCurrentPage();
    const src = this.pages[index];
    if (!src) return null;
    const copy = {
      id: crypto.randomUUID(),
      title: `${src.title} copy`,
      canvas_json: PageManager.normalizeJson(JSON.parse(JSON.stringify(src.canvas_json))),
      thumbnail: src.thumbnail
    };
    this.pages.splice(index + 1, 0, copy);
    this.switchPage(index + 1);
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    return copy;
  }

  renamePage(index, title) {
    const page = this.pages[index];
    if (!page || !title || !title.trim()) return;
    page.title = title.trim().slice(0, 60);
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    document.dispatchEvent(new CustomEvent('prosy:pageTitleChanged', { detail: { index, title: page.title } }));
  }

  deletePage(index = this.currentIndex) {
    if (this.pages.length <= 1 || index < 0 || index >= this.pages.length) return;
    this.saveCurrentPage();
    const dead = this.pages[index];
    this.pages.splice(index, 1);
    if (this.historyManager && dead) this.historyManager.forget(dead.id);
    let next = this.currentIndex;
    if (next >= this.pages.length) next = this.pages.length - 1;
    this.currentIndex = -1; // force reload
    this.switchPage(next);
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
  }

  /** drop all per-page undo stacks (wholesale template/project replace) */
  clearHistory() {
    if (this.historyManager) this.historyManager.clearAll();
  }

  movePage(index, dir) {
    const to = index + dir;
    if (index < 0 || to < 0 || to >= this.pages.length) return;
    const [p] = this.pages.splice(index, 1);
    this.pages.splice(to, 0, p);
    if (this.currentIndex === index) this.currentIndex = to;
    else if (this.currentIndex === to) this.currentIndex = index;
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    document.dispatchEvent(new CustomEvent('prosy:pageSwitched', { detail: { index: this.currentIndex } }));
  }

  switchToPage(index) {
    return this.switchPage(index);
  }

  async switchPage(index) {
    if (index < 0 || index >= this.pages.length) return;
    this.saveCurrentPage();
    this._loading = true;
    const hm = this.historyManager;
    hm.beginBulk(); // loadFromJSON fires object:added per object — never pollute the stack
    try {
      this.currentIndex = index;
      const page = this.pages[index];
      const json = PageManager.normalizeJson(page.canvas_json);
      const canvas = this.canvasManager.getCanvas();
      try {
        await canvas.loadFromJSON(json);
        canvas.backgroundColor = json.backgroundColor || '#ffffff';
        canvas.requestRenderAll();
        document.dispatchEvent(new CustomEvent('prosy:pageSwitched', { detail: { index } }));
      } catch (e) {
        console.error('Failed to load page JSON', e);
      }
    } finally {
      hm.endBulk();
      this._loading = false;
    }
    // Per-page undo context: the FIRST visit seeds a fresh stack; later
    // visits keep the page's granular history (see HistoryManager).
    const page = this.pages[index];
    if (page) hm.enterPage(page.id);
    this._scheduleThumb(true);
  }

  /* ------------------------------------------------------------------ */
  /* Thumbnails (real renders of the page, not placeholders)             */
  /* ------------------------------------------------------------------ */

  _scheduleThumb(immediate = false) {
    if (!this.canvasManager || !this.canvasManager.getCanvas()) return;
    const run = () => {
      this._thumbTimer = null;
      this._renderCurrentThumb();
    };
    if (this._thumbTimer) clearTimeout(this._thumbTimer);
    this._thumbTimer = immediate ? (run(), null) : setTimeout(run, 450);
  }

  async _renderCurrentThumb() {
    const idx = this.currentIndex;
    const page = this.pages[idx];
    if (!page) return;
    try {
      const dataUrl = await this.renderPageThumbnail(page.canvas_json);
      if (this.pages[idx] === page) page.thumbnail = dataUrl;
      document.dispatchEvent(new CustomEvent('prosy:pageThumbnailUpdated', { detail: { index: idx } }));
    } catch (e) {
      /* thumbnails are best-effort */
    }
  }

  /** render any page json to a small JPEG data-url (≈320×180) */
  renderPageThumbnail(canvasJson) {
    return new Promise((resolve, reject) => {
      try {
        const json = PageManager.normalizeJson(canvasJson);
        if (!this._thumbEl) {
          this._thumbEl = document.createElement('canvas');
          this._thumbEl.width = this.canvasManager.PAGE_W;
          this._thumbEl.height = this.canvasManager.PAGE_H;
          this._thumbCanvas = new fabric.StaticCanvas(this._thumbEl, {
            width: this.canvasManager.PAGE_W,
            height: this.canvasManager.PAGE_H,
            enableRetinaScaling: false,
            backgroundColor: json.backgroundColor || '#ffffff'
          });
        } else {
          this._thumbCanvas.backgroundColor = json.backgroundColor || '#ffffff';
        }
        const finish = () => {
          try {
            const m = 320 / this.canvasManager.PAGE_W; // ≈0.167 → 320×180 output
            const url = this._thumbCanvas.toDataURL({ format: 'jpeg', quality: 0.55, multiplier: m });
            resolve(url);
          } catch (e) { reject(e); }
        };
        this._thumbCanvas.loadFromJSON(json).then(() => { this._thumbCanvas.renderAll(); finish(); });
      } catch (e) { reject(e); }
    });
  }

  /** render an arbitrary json to a PNG data-url at full page size (used for icon/template previews) */
  renderPageImage(canvasJson) {
    return new Promise((resolve, reject) => {
      try {
        const json = PageManager.normalizeJson(canvasJson);
        const el = document.createElement('canvas');
        el.width = this.canvasManager.PAGE_W;
        el.height = this.canvasManager.PAGE_H;
        const sc = new fabric.StaticCanvas(el, {
          width: this.canvasManager.PAGE_W,
          height: this.canvasManager.PAGE_H,
          enableRetinaScaling: false,
          backgroundColor: json.backgroundColor || '#ffffff'
        });
        sc.loadFromJSON(json).then(() => {
          sc.renderAll();
          resolve(sc.toDataURL({ format: 'png' }));
          sc.dispose();
        });
      } catch (e) { reject(e); }
    });
  }
}
