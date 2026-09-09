const DRAFT_KEY = 'prosy.draft.v1';

export class ProjectFileManager {
  constructor(app) {
    this.app = app;
    this.pageManager = app.pageManager;
  }

  _buildProjectData() {
    this.pageManager.saveCurrentPage();
    return {
      version: '2.0.0',
      app: 'Prosy',
      timestamp: Date.now(),
      title: this.app.projectName || 'Untitled portfolio',
      pages: this.pageManager.pages
    };
  }

  saveToPrs() {
    const data = this._buildProjectData();
    const json = JSON.stringify(data, null, 2);
    const fileName = `${this._slug(data.title)}.prs`;

    // CRITICAL for iOS Safari and mobile devices:
    // If blob type is 'application/json', iOS Safari automatically appends .json or overrides
    // the extension to .prs.json / .json.
    // Using 'application/octet-stream' prevents WebKit from overriding the .prs extension.
    const blob = new Blob([json], { type: 'application/octet-stream' });

    // On iOS Safari / WebKit mobile, if Web Share API is supported for files,
    // invoke native share sheet so the user can easily choose "Save to Files" as .prs
    const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    if (isIOS && typeof navigator.canShare === 'function' && typeof File !== 'undefined') {
      try {
        const file = new File([blob], fileName, { type: 'application/octet-stream' });
        if (navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: fileName
          }).then(() => {
            this.app.toast?.('Saved as ' + fileName);
          }).catch((err) => {
            if (err.name !== 'AbortError') {
              this._downloadBlob(blob, fileName);
            }
          });
          return;
        }
      } catch (e) {
        // Fall back to standard anchor download
      }
    }

    this._downloadBlob(blob, fileName);
  }

  _downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    this.app.toast?.('Saved ' + fileName);
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 4000);
  }

  _slug(name) {
    return String(name || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'portfolio';
  }

  /* ------------------------- draft autosave ------------------------ */

  saveDraft(silent = false) {
    try {
      const data = this._buildProjectData();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      if (!silent) {
        document.dispatchEvent(new CustomEvent('prosy:saved', { detail: { time: Date.now() } }));
        this.app.toast?.('Project saved locally');
      }
    } catch (e) {
      console.warn('Draft save failed', e);
    }
  }

  hasDraft() {
    try {
      return !!localStorage.getItem(DRAFT_KEY);
    } catch (e) { return false; }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.pages) && data.pages.length) {
        this.pageManager.pages = data.pages.map(p => ({
          ...p,
          canvas_json: typeof p.canvas_json === 'string' ? JSON.parse(p.canvas_json) : p.canvas_json
        }));
        this.pageManager.currentIndex = -1;
        this.pageManager.clearHistory();
        this.app.projectName = data.title || this.app.projectName;
        this.pageManager.switchPage(0);
        document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Draft load failed', e);
      return false;
    }
  }

  clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* noop */ }
  }

  /* --------------------------- file load --------------------------- */

  loadFromPrs(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data && Array.isArray(data.pages) && data.pages.length > 0) {
            this.pageManager.pages = data.pages.map(p => ({
              ...p,
              id: p.id || crypto.randomUUID(),
              canvas_json: typeof p.canvas_json === 'string' ? JSON.parse(p.canvas_json) : p.canvas_json,
              thumbnail: null
            }));
            this.pageManager.currentIndex = -1;
            this.pageManager.clearHistory();
            this.app.projectName = data.title || data.name || data.projectName || 'Untitled portfolio';

            const nameEl = document.getElementById('project-name');
            if (nameEl) {
              nameEl.textContent = this.app.projectName;
              if ('value' in nameEl) nameEl.value = this.app.projectName;
            }

            if (this.app.welcomeScreen) {
              this.app.welcomeScreen.hide();
            }

            const tcModal = document.getElementById('template-chooser-modal');
            if (tcModal) tcModal.classList.add('hidden');

            await this.pageManager.switchPage(0);
            document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));

            // Pre-render thumbnails for the pages rail
            for (let i = 0; i < this.pageManager.pages.length; i++) {
              this.pageManager.renderPageThumbnail(this.pageManager.pages[i].canvas_json)
                .then(thumb => {
                  if (this.pageManager.pages[i]) {
                    this.pageManager.pages[i].thumbnail = thumb;
                    document.dispatchEvent(new CustomEvent('prosy:pagesUpdated'));
                  }
                })
                .catch(() => {});
            }

            this.saveDraft(true);
            this.app.toast?.('Project opened');
            resolve(true);
          } else {
            reject(new Error('Invalid .prs file format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  triggerLoad() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.prs,.json,application/json,application/octet-stream,text/plain,*/*';
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        this.loadFromPrs(file).catch(err => this.app.toast?.('Error opening project: ' + err.message, true));
      }
    };
    input.click();
  }
}
