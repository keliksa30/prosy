export class Modal {
  constructor(id, title, contentHtml) {
    this.id = id;
    this.title = title;
    this.contentHtml = contentHtml;
    this.element = null;
    this.onClose = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'modal-overlay';
    this.element.id = this.id;

    this.element.innerHTML = `
      <div class="modal-content">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 14px;">
          <h2 style="margin: 0; font-family: var(--font-headline); font-size: 17px;">${this.title}</h2>
          <button class="icobtn" id="close-${this.id}" title="Close (Esc)" style="padding: 6px;">${this.closeIcon()}</button>
        </div>
        <div class="modal-body">
          ${this.contentHtml}
        </div>
      </div>
    `;

    document.body.appendChild(this.element);

    document.getElementById(`close-${this.id}`).onclick = () => this.close();

    // Close on overlay click (but not when selecting text inside)
    this.element.addEventListener('mousedown', (e) => {
      if (e.target === this.element) this.close();
    });

    // Esc closes the modal unless focus is in an input (single Esc blurs there)
    this._esc = (e) => {
      if (e.key === 'Escape' && this.element) {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) { t.blur(); return; }
        this.close();
      }
    };
    document.addEventListener('keydown', this._esc);
  }

  closeIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  }

  open() {
    if (!this.element) this.render();
    this.element.style.display = 'flex';
  }

  close() {
    if (this.element && this.element.style.display !== 'none') {
      this.element.remove();
      this.element = null;
      document.removeEventListener('keydown', this._esc);
      if (this.onClose) this.onClose();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this._esc);
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
