import { Modal } from './Modal.js';
import { svg } from './icons.js';

export class ExportSettingsModal {
  constructor(app) {
    this.app = app;
    this.exportManager = app.exportManager;
    this.projectFileManager = app.projectFileManager;
    this.modal = null;
  }

  show() {
    const html = `
      <div style="display:flex;flex-direction:column;gap:4px;">
        <p style="color:var(--text-secondary);margin:0 0 12px;font-size:13px;">${this.app.pageManager.pages.length} page${this.app.pageManager.pages.length > 1 ? 's' : ''} in this project.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="export-card" id="export-prs">
            <div class="export-card-ic">${svg('Save', 22)}</div>
            <div class="export-card-title">Save project (.prs)</div>
            <div class="export-card-sub">Editable file to continue later</div>
          </div>
          <div class="export-card" id="export-png">
            <div class="export-card-ic">${svg('FileImage', 22)}</div>
            <div class="export-card-title">This page as PNG</div>
            <div class="export-card-sub">High-quality image, current page</div>
          </div>
          <div class="export-card" id="export-jpg">
            <div class="export-card-ic">${svg('FileImage', 22)}</div>
            <div class="export-card-title">This page as JPG</div>
            <div class="export-card-sub">Smaller file size image</div>
          </div>
          <div class="export-card" id="export-pdf">
            <div class="export-card-ic">${svg('FileText', 22)}</div>
            <div class="export-card-title">All pages as PDF</div>
            <div class="export-card-sub">One document, every page</div>
          </div>
          <div class="export-card" id="export-pptx">
            <div class="export-card-ic">${svg('Presentation', 22)}</div>
            <div class="export-card-title">PowerPoint (.pptx)</div>
            <div class="export-card-sub">Editable slides (texts, shapes, photos)</div>
          </div>
          <div class="export-card" id="export-allpng">
            <div class="export-card-ic">${svg('Images', 22)}</div>
            <div class="export-card-title">All pages as PNG</div>
            <div class="export-card-sub">Downloads one file per page</div>
          </div>
        </div>
      </div>`;

    this.modal = new Modal('export-modal', 'Export & save', html);
    this.modal.render();

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', async () => {
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
        try {
          await fn();
        } catch (err) {
          console.error(err);
          this.app.toast?.('Export failed: ' + err.message, true);
        } finally {
          this.modal.close();
        }
      });
    };

    bind('export-prs', () => { this.projectFileManager.saveToPrs(); });
    bind('export-png', () => this.exportManager.exportCurrentPage('png'));
    bind('export-jpg', () => this.exportManager.exportCurrentPage('jpeg'));
    bind('export-pdf', async () => {
      const el = document.getElementById('export-pdf');
      if (el) el.querySelector('.export-card-title').textContent = 'Rendering…';
      await this.exportManager.exportPDF();
    });
    bind('export-pptx', async () => {
      const el = document.getElementById('export-pptx');
      if (el) el.querySelector('.export-card-title').textContent = 'Generating…';
      await this.exportManager.exportPPTX();
    });
    bind('export-allpng', () => this.exportManager.exportAllPagesPng());

    this.modal.open();
  }
}
