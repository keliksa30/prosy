import { PageManager } from '../core/PageManager.js';
import { loadFonts, fontFamiliesInJson } from '../core/fonts.js';
import { CATEGORIES, CATEGORY_TEMPLATES } from './data/category-templates.js';

/**
 * TemplateManager
 * ----------------
 * Supports:
 *  1. Whole pack  — replaces the whole project (Welcome screen / Templates)
 *  2. Per page    — pick ONE layout from any pack or category template and:
 *                    • replace current page content, or
 *                    • insert as new page after the current one.
 *  3. Category-based templates (Covers, Galleries & Photogrids, Table of Contents, Project Showcases)
 */
export class TemplateManager {
  constructor(app) {
    this.app = app;
    this.pageManager = app.pageManager;
    this.packs = [];
    this.categories = CATEGORIES;
    this.categoryTemplates = CATEGORY_TEMPLATES;
    this.categoryThumbs = {};
  }

  async init() {
    try {
      const mods = await Promise.all([
        import('./data/pack-studio-today.js'),
        import('./data/pack-jost-brand.js'),
        import('./data/pack-neo-studio.js'),
        import('./data/pack-digital-portfolio.js'),
        import('./data/pack-aurelia.js'),
        import('./data/pack-rayo-fashion.js'),
        import('./data/pack-dsm-kinetic.js'),
        import('./data/pack-persona-folio.js'),
        import('./data/pack-lumina-folio.js'),
        import('./data/pack-apex-minimal.js'),
        import('./data/pack-codedark.js'),
        import('./data/pack-editorial.js'),
        import('./data/pack-chroma.js'),
        import('./data/pack-executive.js'),
        import('./data/pack-startup-pitch.js'),
        import('./data/pack-agency-portfolio.js'),
        import('./data/pack-product-launch.js'),
        import('./data/pack-academic-paper.js')
      ]);
      this.packs = mods.map(m => m.default || Object.values(m).find(v => v && v.id && v.pages));
      this.packs = this.packs.filter(Boolean);

      // Runtime thumbnails: render the first page of each pack.
      for (const pack of this.packs) {
        pack.thumbnail = pack.thumbnail || await this._packThumb(pack);
        pack.pageThumbs = {};
        for (let i = 0; i < pack.pages.length; i++) {
          if (pack.pages[i].canvas_json) {
            pack.pageThumbs[i] = await this.pageManager.renderPageThumbnail(pack.pages[i].canvas_json);
          }
        }
      }

      // Pre-render category template thumbnails
      for (const tpl of this.categoryTemplates) {
        if (tpl.canvas_json) {
          this.categoryThumbs[tpl.id] = await this.pageManager.renderPageThumbnail(tpl.canvas_json).catch(() => '');
        }
      }
    } catch (e) {
      console.error('Failed to load template packs', e);
    }
  }

  getCategories() {
    return this.categories;
  }

  getCategoryTemplates(catId = 'all') {
    if (!catId || catId === 'all') {
      return this.categoryTemplates;
    }
    return this.categoryTemplates.filter(t => t.category === catId);
  }

  async _packThumb(pack) {
    const first = pack.pages.find(p => p.canvas_json);
    if (!first) return '';
    try {
      return await this.pageManager.renderPageThumbnail(first.canvas_json);
    } catch (e) {
      return '';
    }
  }

  /* -------------------------- whole pack -------------------------- */

  async applyTemplatePack(packId) {
    const pack = this.packs.find(p => p.id === packId);
    if (!pack) return;
    if (this._applyingPack) return;
    this._applyingPack = true;
    try {
      await loadFonts(packFonts(pack));
      const pm = this.pageManager;
      pm.pages = pack.pages.map(p => ({
        id: crypto.randomUUID(),
        title: p.title,
        canvas_json: PageManager.normalizeJson(JSON.parse(JSON.stringify(p.canvas_json))),
        thumbnail: null
      }));
      pm.currentIndex = -1;
      pm.clearHistory();
      await pm.switchPage(0);
      this.app.projectName = pack.projectName || pack.name;
      const nameEl = document.getElementById('project-name');
      if (nameEl) nameEl.value = this.app.projectName;
      document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));

      for (let i = 1; i < pm.pages.length; i++) {
        if (!pm.pages[i].thumbnail) {
          pm.pages[i].thumbnail = await pm.renderPageThumbnail(pm.pages[i].canvas_json).catch(() => null);
        }
      }
      document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    } finally {
      this._applyingPack = false;
    }
  }

  /**
   * Apply a single layout from a pack.
   * mode 'replace' → overwrite current page; 'insert' → add new page.
   */
  async applyTemplatePage(packId, layoutIndex, { mode = 'replace', pageIndex = null } = {}) {
    const pack = this.packs.find(p => p.id === packId);
    if (!pack) return;
    const layout = pack.pages[layoutIndex];
    if (!layout) return;
    const json = PageManager.normalizeJson(JSON.parse(JSON.stringify(layout.canvas_json)));
    await loadFonts(fontFamiliesInJson(json));

    const pm = this.pageManager;
    const target = pageIndex === null ? pm.currentIndex : pageIndex;
    if (target < 0) return;

    if (mode === 'insert') {
      const page = pm.addPage(target + 1, layout.title, json);
      pm.switchPage(pm.pages.indexOf(page));
    } else {
      const page = pm.pages[target];
      if (!page) return;
      page.canvas_json = json;
      page.thumbnail = null;
      pm.renamePage(target, layout.title);
      if (target === pm.currentIndex) {
        pm.currentIndex = -1;
        await pm.switchPage(target);
      } else if (pm.historyManager) {
        pm.historyManager.forget(page.id);
      }
      document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    }
    this.app.toast?.('Template applied to page');
  }

  /**
   * Apply multiple layouts from a pack (e.g. selected pages).
   */
  async applyTemplatePages(packId, layoutIndices, { mode = 'insert', pageIndex = null } = {}) {
    const pack = this.packs.find(p => p.id === packId);
    if (!pack || !layoutIndices || !layoutIndices.length) return;
    const pm = this.pageManager;
    let insertAt = pageIndex === null ? pm.currentIndex : pageIndex;
    if (insertAt < 0) insertAt = 0;

    let firstAddedIdx = -1;
    for (let i = 0; i < layoutIndices.length; i++) {
      const idx = layoutIndices[i];
      const layout = pack.pages[idx];
      if (!layout) continue;
      const json = PageManager.normalizeJson(JSON.parse(JSON.stringify(layout.canvas_json)));
      await loadFonts(fontFamiliesInJson(json));
      const newPage = pm.addPage(insertAt + 1 + i, layout.title, json);
      if (firstAddedIdx === -1) {
        firstAddedIdx = pm.pages.indexOf(newPage);
      }
    }
    if (firstAddedIdx >= 0) {
      await pm.switchPage(firstAddedIdx);
    }
    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    this.app.toast?.(`${layoutIndices.length} template page${layoutIndices.length > 1 ? 's' : ''} added`);
  }

  /**
   * Apply a single layout from category templates.
   */
  async applyCategoryTemplate(templateId, { mode = 'replace', pageIndex = null } = {}) {
    const layout = this.categoryTemplates.find(t => t.id === templateId);
    if (!layout) return;
    const json = PageManager.normalizeJson(JSON.parse(JSON.stringify(layout.canvas_json)));
    await loadFonts(fontFamiliesInJson(json));

    const pm = this.pageManager;
    const target = pageIndex === null ? pm.currentIndex : pageIndex;
    if (target < 0) return;

    if (mode === 'insert') {
      const page = pm.addPage(target + 1, layout.title, json);
      pm.switchPage(pm.pages.indexOf(page));
    } else {
      const page = pm.pages[target];
      if (!page) return;
      page.canvas_json = json;
      page.thumbnail = null;
      pm.renamePage(target, layout.title);
      if (target === pm.currentIndex) {
        pm.currentIndex = -1;
        await pm.switchPage(target);
      } else if (pm.historyManager) {
        pm.historyManager.forget(page.id);
      }
      document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
    }
    this.app.toast?.(`Applied "${layout.title}"`);
  }
}

function packFonts(pack) {
  const set = new Set();
  pack.pages.forEach(p => {
    if (p.canvas_json) fontFamiliesInJson(p.canvas_json).forEach(f => set.add(f));
  });
  return [...set];
}
