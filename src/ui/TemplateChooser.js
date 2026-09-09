import { Modal } from './Modal.js';
import { svg } from './icons.js';

/**
 * TemplateChooser — pick a whole pack (replaces the project) OR pick a
 * single layout for a page (Google-Slides style "apply template to page"),
 * or browse curated category templates (Covers, Galleries, Table of Contents, Showcases).
 */
export class TemplateChooser {
  constructor(app) {
    this.app = app;
    this.templateManager = app.templateManager;
    this.modal = null;
    this.mode = 'pack';          // 'pack' | 'page'
    this.pageIndex = 0;
    this.currentCategory = 'all'; // 'all' | 'covers' | 'galleries' | 'toc' | 'showcase'
    this.packId = null;
    this.layoutIndex = 0;
    this.selectedLayoutIndices = new Set([0]);
    this.selectedCatTemplateId = null;
  }

  show({ mode = 'pack', pageIndex = null, packId = null } = {}) {
    this.mode = mode;
    this.pageIndex = pageIndex === null ? this.app.pageManager.currentIndex : pageIndex;
    this.currentCategory = 'all';
    this.packId = packId || this.templateManager.packs[0]?.id || null;
    this.layoutIndex = 0;
    this.selectedLayoutIndices = new Set([0]);
    this.selectedCatTemplateId = null;
    this._render();
  }

  _pack() {
    return this.templateManager.packs.find(p => p.id === this.packId) || null;
  }

  _render() {
    const title = this.mode === 'page'
      ? 'Apply template to page'
      : 'Choose a template or layout';

    const html = `
      <div class="tc-cat-tabs" id="tc-cat-tabs"></div>
      <div class="tc-container">
        <div class="tc-sidebar" id="tc-sidebar">
          <div class="tc-sidebar-head">Template Packs</div>
          <div id="tc-packs" class="tc-packs-list"></div>
        </div>
        <div class="tc-main">
          <div id="tc-layouts-head" class="tc-layouts-head"></div>
          <div id="tc-layouts" class="tc-layouts-grid"></div>
          <div id="tc-actions" class="tc-actions-bar"></div>
        </div>
      </div>`;

    this.modal = new Modal('template-chooser-modal', title, html);
    this.modal.render();
    this._renderTabs();
    this._renderPacks();
    this._renderLayouts();
    this._renderActions();
    this.modal.open();
  }

  _renderTabs() {
    const tabsEl = document.getElementById('tc-cat-tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    const cats = this.templateManager.getCategories();
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tc-cat-tab' + (this.currentCategory === cat.id ? ' active' : '');
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        this.currentCategory = cat.id;
        this.layoutIndex = null;
        this.selectedCatTemplateId = null;

        const sidebar = document.getElementById('tc-sidebar');
        if (sidebar) {
          sidebar.style.display = this.currentCategory === 'all' ? 'flex' : 'none';
        }

        this._renderTabs();
        this._renderLayouts();
        this._renderActions();
      });
      tabsEl.appendChild(btn);
    });
  }

  _renderPacks() {
    const el = document.getElementById('tc-packs');
    if (!el) return;
    el.innerHTML = '';
    this.templateManager.packs.forEach(pack => {
      const card = document.createElement('div');
      card.className = 'tc-pack' + (pack.id === this.packId ? ' active' : '');

      const thumb = document.createElement('div');
      thumb.className = 'tc-pack-thumb';
      if (pack.thumbnail) {
        const img = document.createElement('img');
        img.src = pack.thumbnail;
        img.alt = pack.name;
        thumb.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'tc-pack-info';
      const name = document.createElement('div');
      name.className = 'tc-pack-name';
      name.textContent = pack.name;
      const meta = document.createElement('div');
      meta.className = 'tc-pack-meta';
      meta.textContent = `${pack.pages.length} pages`;

      info.appendChild(name);
      info.appendChild(meta);

      card.appendChild(thumb);
      card.appendChild(info);

      card.addEventListener('click', () => {
        this.packId = pack.id;
        this.layoutIndex = this.mode === 'page' ? 0 : null;
        this._renderPacks();
        this._renderLayouts();
        this._renderActions();
      });
      el.appendChild(card);
    });
  }

  _renderLayouts() {
    const grid = document.getElementById('tc-layouts');
    const head = document.getElementById('tc-layouts-head');
    if (!grid) return;
    grid.innerHTML = '';

    // Category view: Show filtered single-page templates
    if (this.currentCategory !== 'all') {
      const templates = this.templateManager.getCategoryTemplates(this.currentCategory);
      if (head) {
        head.style.display = 'flex';
        const catObj = this.templateManager.getCategories().find(c => c.id === this.currentCategory);
        head.innerHTML = `
          <div class="tc-layouts-head-info">
            <div class="tc-layouts-head-title">${catObj ? catObj.name : 'Category Templates'}</div>
            <div class="tc-layouts-head-sub">Curated ready-to-use single page layouts</div>
          </div>
          <span class="tc-layout-page-num" style="font-size:11px;padding:4px 8px;">${templates.length} layouts</span>`;
      }

      templates.forEach(tpl => {
        const tile = document.createElement('div');
        tile.className = 'tc-layout' + (this.selectedCatTemplateId === tpl.id ? ' active' : '');

        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'tc-layout-thumb';
        const img = document.createElement('img');
        img.src = this.templateManager.categoryThumbs[tpl.id] || '';
        img.alt = tpl.title;
        if (!img.src) img.style.display = 'none';
        thumbWrap.appendChild(img);

        const footer = document.createElement('div');
        footer.className = 'tc-layout-footer';
        const label = document.createElement('div');
        label.className = 'tc-layout-label';
        label.textContent = tpl.title;
        const num = document.createElement('span');
        num.className = 'tc-layout-page-num';
        num.textContent = 'Ready';

        footer.appendChild(label);
        footer.appendChild(num);

        tile.appendChild(thumbWrap);
        tile.appendChild(footer);

        tile.addEventListener('click', () => {
          this.selectedCatTemplateId = tpl.id;
          this._renderLayouts();
          this._renderActions();
        });
        grid.appendChild(tile);
      });
      return;
    }

    // "All Packs" view: Show pages from active pack
    const pack = this._pack();
    if (!pack) {
      if (head) head.style.display = 'none';
      grid.innerHTML = `<div style="grid-column:1/-1;color:var(--text-muted);font-size:13px;padding:60px 0;text-align:center;">
        ${this.mode === 'page'
          ? 'Pick a template pack on the left to see its page layouts.'
          : 'Pick a template pack on the left to preview and apply.'}
      </div>`;
      return;
    }

    if (head) {
      head.style.display = 'flex';
      head.innerHTML = `
        <div class="tc-layouts-head-info">
          <div class="tc-layouts-head-title">${pack.name}</div>
          <div class="tc-layouts-head-sub">${this.mode === 'page' ? 'Select a layout to apply to current page' : 'Preview all pages in this template pack'}</div>
        </div>
        <span class="tc-layout-page-num" style="font-size:11px;padding:4px 8px;">${pack.pages.length} pages</span>`;
    }

    pack.pages.forEach((page, i) => {
      const isSelected = this.selectedLayoutIndices && this.selectedLayoutIndices.has(i);
      const isActive = this.layoutIndex === i;
      const tile = document.createElement('div');
      tile.className = 'tc-layout' + (isActive || isSelected ? ' active' : '');

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'tc-layout-thumb';
      thumbWrap.style.position = 'relative';

      // Multi-select checkbox badge in top right
      const checkBadge = document.createElement('button');
      checkBadge.className = 'tc-check-badge' + (isSelected ? ' checked' : '');
      checkBadge.title = isSelected ? 'Deselect page' : 'Select page';
      checkBadge.innerHTML = svg(isSelected ? 'CheckSquare' : 'Square', 14);
      checkBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this.selectedLayoutIndices) this.selectedLayoutIndices = new Set();
        if (this.selectedLayoutIndices.has(i)) {
          this.selectedLayoutIndices.delete(i);
          if (this.layoutIndex === i) {
            this.layoutIndex = Array.from(this.selectedLayoutIndices)[0] ?? null;
          }
        } else {
          this.selectedLayoutIndices.add(i);
          this.layoutIndex = i;
        }
        this._renderLayouts();
        this._renderActions();
      });
      thumbWrap.appendChild(checkBadge);

      const img = document.createElement('img');
      img.src = pack.pageThumbs && pack.pageThumbs[i] ? pack.pageThumbs[i] : '';
      img.alt = page.title;
      if (!img.src) img.style.display = 'none';
      thumbWrap.appendChild(img);

      const footer = document.createElement('div');
      footer.className = 'tc-layout-footer';
      const label = document.createElement('div');
      label.className = 'tc-layout-label';
      label.textContent = page.title;
      const num = document.createElement('span');
      num.className = 'tc-layout-page-num';
      num.textContent = `P${i + 1}`;

      footer.appendChild(label);
      footer.appendChild(num);

      tile.appendChild(thumbWrap);
      tile.appendChild(footer);

      tile.addEventListener('click', () => {
        this.layoutIndex = i;
        if (!this.selectedLayoutIndices) this.selectedLayoutIndices = new Set();
        this.selectedLayoutIndices.clear();
        this.selectedLayoutIndices.add(i);
        this._renderLayouts();
        this._renderActions();
      });
      grid.appendChild(tile);
    });
  }

  _renderActions() {
    const bar = document.getElementById('tc-actions');
    if (!bar) return;
    bar.innerHTML = '';
    const cancel = document.createElement('button');
    cancel.className = 'btn btn-ghost';
    cancel.style.fontSize = '12px';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => this.modal.close());
    bar.appendChild(cancel);

    // Category Single Template selection
    if (this.currentCategory !== 'all') {
      if (this.selectedCatTemplateId) {
        const replace = document.createElement('button');
        replace.className = 'btn btn-primary';
        replace.style.fontSize = '12px';
        replace.innerHTML = svg('Replace', 14) + 'Apply to This Page Only';
        replace.addEventListener('click', async () => {
          this.modal.close();
          await this.templateManager.applyCategoryTemplate(this.selectedCatTemplateId, { mode: 'replace', pageIndex: this.pageIndex });
        });
        bar.appendChild(replace);

        const insert = document.createElement('button');
        insert.className = 'btn btn-ghost';
        insert.style.fontSize = '12px';
        insert.innerHTML = svg('FilePlus2', 14) + 'Insert as New Page';
        insert.addEventListener('click', async () => {
          this.modal.close();
          await this.templateManager.applyCategoryTemplate(this.selectedCatTemplateId, { mode: 'insert', pageIndex: this.pageIndex });
        });
        bar.appendChild(insert);
      } else {
        const hint = document.createElement('span');
        hint.style.cssText = 'align-self:center;font-size:12px;color:var(--text-muted);';
        hint.textContent = 'Select a layout above';
        bar.appendChild(hint);
      }
      return;
    }

    // "All Packs" view
    const pack = this._pack();
    if (!pack) return;

    // Multi-page selection
    if (this.selectedLayoutIndices && this.selectedLayoutIndices.size > 1) {
      const count = this.selectedLayoutIndices.size;
      const insertMulti = document.createElement('button');
      insertMulti.className = 'btn btn-primary';
      insertMulti.style.fontSize = '12px';
      insertMulti.innerHTML = svg('FilePlus2', 14) + `Insert ${count} Selected Pages`;
      insertMulti.addEventListener('click', async () => {
        this.modal.close();
        const sorted = Array.from(this.selectedLayoutIndices).sort((a, b) => a - b);
        await this.templateManager.applyTemplatePages(pack.id, sorted, { mode: 'insert', pageIndex: this.pageIndex });
      });
      bar.appendChild(insertMulti);

      const applyAll = document.createElement('button');
      applyAll.className = 'btn btn-ghost';
      applyAll.style.fontSize = '12px';
      applyAll.innerHTML = svg('LayoutTemplate', 14) + `Apply All Pages (${pack.pages.length})`;
      applyAll.addEventListener('click', async () => {
        this.modal.close();
        await this.templateManager.applyTemplatePack(pack.id);
        this.app.toast?.(`${pack.name} applied — ${pack.pages.length} pages`);
      });
      bar.appendChild(applyAll);
      return;
    }

    const curLayoutIdx = this.layoutIndex !== null ? this.layoutIndex : 0;
    const pageTitle = pack.pages[curLayoutIdx]?.title || `Page ${curLayoutIdx + 1}`;

    // 1. "Apply to This Page Only"
    const replaceThisPage = document.createElement('button');
    replaceThisPage.className = 'btn btn-primary';
    replaceThisPage.style.fontSize = '12px';
    replaceThisPage.innerHTML = svg('Replace', 14) + `Apply to This Page Only (P${curLayoutIdx + 1})`;
    replaceThisPage.title = `Replace current page with ${pageTitle}`;
    replaceThisPage.addEventListener('click', async () => {
      this.modal.close();
      await this.templateManager.applyTemplatePage(pack.id, curLayoutIdx, { mode: 'replace', pageIndex: this.pageIndex });
    });
    bar.appendChild(replaceThisPage);

    // 2. "Insert as New Page"
    const insertAsNew = document.createElement('button');
    insertAsNew.className = 'btn btn-ghost';
    insertAsNew.style.fontSize = '12px';
    insertAsNew.innerHTML = svg('FilePlus2', 14) + 'Insert as New Page';
    insertAsNew.title = `Insert ${pageTitle} as a new page`;
    insertAsNew.addEventListener('click', async () => {
      this.modal.close();
      await this.templateManager.applyTemplatePage(pack.id, curLayoutIdx, { mode: 'insert', pageIndex: this.pageIndex });
    });
    bar.appendChild(insertAsNew);

    // 3. "Apply All Pages" / "Replace Entire Project"
    const applyAllPages = document.createElement('button');
    applyAllPages.className = 'btn btn-ghost';
    applyAllPages.style.fontSize = '12px';
    applyAllPages.innerHTML = svg('LayoutTemplate', 14) + `Apply All Pages (${pack.pages.length})`;
    applyAllPages.title = 'Replace entire project with all pages of this pack';
    applyAllPages.addEventListener('click', async () => {
      this.modal.close();
      await this.templateManager.applyTemplatePack(pack.id);
      this.app.toast?.(`${pack.name} applied — ${pack.pages.length} pages`);
    });
    bar.appendChild(applyAllPages);
  }
}
