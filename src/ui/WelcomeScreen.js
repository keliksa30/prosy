import { svg } from './icons.js';

/**
 * WelcomeScreen — the Prosy home: resume local draft, blank start or a
 * template pack. Emoji-free, uses real rendered pack thumbnails.
 */
export class WelcomeScreen {
  constructor(app) {
    this.app = app;
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'welcome-screen';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: var(--bg-workspace); z-index: 9999;
      display: flex; flex-direction: column;`;
    document.body.appendChild(this.container);
    this.render();
  }

  render() {
    const app = this.app;
    const hasDraft = app.projectFileManager.hasDraft();
    const packs = app.templateManager ? app.templateManager.packs : [];

    this.container.innerHTML = `
      <div class="welcome-topbar">
        <div class="welcome-brand">
          <img src="/favicon.svg" alt="Prosy" width="24" height="24">
          Prosy
        </div>
        <div class="welcome-actions">
          <button class="btn btn-ghost" id="welcome-open" style="font-size:12px;padding:6px 12px;">
            ${svg('FolderOpen', 14)} Open .prs
          </button>
        </div>
      </div>
      <div class="welcome-body">
        <div class="welcome-sidebar">
          <div class="welcome-sidebar-actions">
            ${hasDraft ? `
              <button class="btn btn-primary" id="btn-resume-file" style="justify-content:flex-start;padding:10px 14px;font-weight:600;">
                ${svg('Play', 14)} Resume project
              </button>
              <button class="btn btn-ghost" id="btn-discard-draft" style="justify-content:flex-start;padding:8px 12px;font-size:12px;">
                ${svg('Trash2', 13)} Discard draft
              </button>` : ''}
            <button class="btn ${hasDraft ? 'btn-ghost' : 'btn-primary'}" id="btn-new-file" style="justify-content:flex-start;padding:10px 14px;font-weight:600;">
              ${svg('FilePlus2', 14)} New blank project
            </button>
          </div>
          <div class="welcome-sidebar-note">
            <strong style="color:var(--text-secondary);">Prosy</strong> is a page-based
            designer for portfolios &amp; pitch decks. Pages, shapes,
            Google fonts, icons, masks — all yours.
          </div>
        </div>

        <div class="welcome-main">
          <h1 class="welcome-hero-title">Start something good</h1>
          <p class="welcome-hero-sub">Blank project, or a professional starter template.</p>

          <div id="welcome-grid" class="welcome-grid"></div>
        </div>
      </div>`;

    const grid = document.getElementById('welcome-grid');
    const card = (id, thumb, name, desc, onClick) => {
      const el = document.createElement('div');
      el.className = 'welcome-card';
      el.id = id;
      const t = document.createElement('div');
      t.className = 'welcome-thumb';
      if (thumb) {
        const img = document.createElement('img');
        img.src = thumb;
        img.alt = name;
        img.loading = 'lazy';
        t.appendChild(img);
      } else {
        t.classList.add('blank');
        t.innerHTML = svg('SquareDashed', 26);
      }
      const n = document.createElement('div');
      n.className = 'welcome-name';
      n.textContent = name;
      const d = document.createElement('div');
      d.className = 'welcome-desc';
      d.textContent = desc || '';
      el.appendChild(t);
      el.appendChild(n);
      if (desc) el.appendChild(d);
      el.addEventListener('click', onClick);
      grid.appendChild(el);
    };

    card('new-blank', null, 'Blank project', 'Empty 16:9 page',
      () => this.startBlank());

    packs.forEach(pack => {
      card(`welcome-${pack.id}`, pack.thumbnail, pack.name, `${pack.pages.length} pages · ${pack.description}`,
        () => {
          this.hide();
          this.app.templateChooser.show({ mode: 'pack', packId: pack.id });
        });
    });

    const resumeBtn = document.getElementById('btn-resume-file');
    if (resumeBtn) resumeBtn.onclick = () => { this.app.projectFileManager.loadDraft(); this.hide(); };
    const discardBtn = document.getElementById('btn-discard-draft');
    if (discardBtn) {
      discardBtn.onclick = () => {
        this.app.projectFileManager.clearDraft();
        this.render();
      };
    }
    const newBtn = document.getElementById('btn-new-file');
    if (newBtn) newBtn.onclick = () => this.startBlank();

    document.getElementById('welcome-open').onclick = () => {
      this.app.projectFileManager.triggerLoad();
    };
  }

  startBlank() {
    this.app.pageManager.pages = [];
    this.app.pageManager.currentIndex = -1;
    this.app.pageManager.clearHistory();
    this.app.pageManager.addPage(0, 'Cover');
    this.app.projectName = 'Untitled portfolio';
    this.hide();
  }

  hide() {
    this.container.style.display = 'none';
    this.app.projectFileManager.saveDraft(true);
  }

  show() {
    this.app.projectFileManager.saveDraft(true);
    this.render();
    this.container.style.display = 'flex';
  }
}
