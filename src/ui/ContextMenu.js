import { svg } from './icons.js';
import { Modal } from './Modal.js';

/**
 * Right-click context menus, Google-Slides style.
 *  - Right-click a page thumbnail (filmstrip) → page actions.
 *  - Right-click canvas objects → object actions (cut/copy/paste,
 *    duplicate, group, arrange, flip, lock, delete…).
 *  - Right-click empty page/canvas → page actions + apply-template.
 *
 * One menu at a time; keyboard navigable (↑/↓/Enter/Esc).
 */
export class ContextMenu {
  constructor(app) {
    this.app = app;
    this.el = null;
    this._closeHandler = (e) => {
      if (this.el && e.target !== this.el && !this.el.contains(e.target)) this.hide();
    };
    this._escHandler = (e) => { if (e.key === 'Escape') this.hide(); };
    this._onScroll = () => this.hide();
    window.addEventListener('mousedown', this._closeHandler, true);
    window.addEventListener('keydown', this._escHandler, true);
    window.addEventListener('resize', this._onScroll);
    window.addEventListener('blur', this._onScroll);

    this.attachCanvasContextMenu();
  }

  attachCanvasContextMenu() {
    // Capture phase: fabric stops the event on the canvas element, so we
    // must intercept before it.
    const viewport = this.app.canvasManager.getViewport();
    viewport.addEventListener('contextmenu', (e) => this.onCanvasContext(e), true);
  }

  onCanvasContext(e) {
    e.preventDefault();
    e.stopPropagation();
    const app = this.app;
    const cm = app.canvasManager;
    const canvas = cm.getCanvas();
    if (!canvas) return;

    // Manual hit-test (fabric v7 findTarget expects an internal event
    // wrapper, not a raw DOM event).
    const vpRect = cm.getViewport().getBoundingClientRect();
    const scene = cm._anchorToScene({ x: e.clientX - vpRect.left, y: e.clientY - vpRect.top });
    const at = canvas.getObjects()
      .filter(o => o.visible !== false && o.evented !== false && o.selectable !== false)
      .reverse()
      .find(o => o.containsPoint({ x: scene.x, y: scene.y }, { tolerance: 3 }));

    if (at) {
      let select = at;
      while (select.group && select.group.type === 'group') select = select.group;
      const active = canvas.getActiveObjects();
      if (!active.includes(select)) {
        if (select.selectable !== false && select.evented !== false) {
          canvas.discardActiveObject();
          canvas.setActiveObject(select);
          canvas.requestRenderAll();
        }
      }
    }

    const hasSel = canvas.getActiveObjects().length > 0;
    if (hasSel) this.showObjectMenu(e.clientX, e.clientY);
    else this.showPageMenu(app.pageManager.currentIndex, e.clientX, e.clientY);
  }

  /* ------------------------------------------------------------------ */

  showPageMenu(index, x, y) {
    const pm = this.app.pageManager;
    const page = pm.pages[index];
    const menu = [
      { icon: 'LayoutTemplate', label: 'Apply template to this page…', onClick: () => this.app.templateChooser.show({ mode: 'page', pageIndex: index }) },
      { divider: true },
      { icon: 'FilePlus2', label: 'New page', onClick: () => { const p = pm.addPage(index + 1, null, null); pm.switchPage(pm.pages.indexOf(p)); } },
      { icon: 'CopyPlus', label: 'Duplicate page', onClick: () => pm.duplicatePage(index) },
      { icon: 'ChevronUp', label: 'Move page up', disabled: index === 0, onClick: () => pm.movePage(index, -1) },
      { icon: 'ChevronDown', label: 'Move page down', disabled: index >= pm.pages.length - 1, onClick: () => pm.movePage(index, 1) },
      { divider: true },
      { icon: 'Pencil', label: 'Rename page…', onClick: () => this.promptRename(index) },
      { icon: 'Trash2', label: 'Delete page', danger: true, disabled: pm.pages.length <= 1, onClick: () => pm.deletePage(index) }
    ];
    if (!page) return;
    this.show(menu, x, y);
  }

  promptRename(index) {
    const pm = this.app.pageManager;
    const page = pm.pages[index];
    if (!page) return;
    const modal = new Modal('rename-page-modal', 'Rename page', `
      <input id="rename-page-input" type="text" value="${escapeHtml(page.title || '')}"
        placeholder="Page name"
        style="width:100%;background:var(--bg-panel);border:1px solid var(--border-color);border-radius:6px;padding:10px 12px;color:var(--text-primary);font-size:14px;outline:none;">
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button class="btn btn-ghost" id="rename-cancel" style="font-size:12px;">Cancel</button>
        <button class="btn btn-primary" id="rename-save" style="font-size:12px;">Rename</button>
      </div>`);
    modal.render();
    modal.open();
    const input = document.getElementById('rename-page-input');
    const doSave = () => { pm.renamePage(index, input.value); modal.close(); };
    document.getElementById('rename-save').onclick = doSave;
    document.getElementById('rename-cancel').onclick = () => modal.close();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSave();
      else if (e.key === 'Escape') modal.close();
    });
    setTimeout(() => { input.focus(); input.select(); }, 30);
  }

  showObjectMenu(x, y) {
    const app = this.app;
    const canvas = app.canvasManager.getCanvas();
    const objs = canvas.getActiveObjects();
    const single = canvas.getActiveObject();
    const isGroup = single && single.type === 'group';
    const multi = objs.length > 1;
    const canClipboard = Boolean(app.clipboard && app.clipboard.length);
    const singleClipped = objs.length === 1 && app.ops.hasClipMaskSelection();
    const placeholderInfo = (objs.length === 1 && single) ? app.canvasManager?.findPlaceholderTarget(single) : null;
    const hasHyperlink = single && single.custom?.hyperlink;

    const items = [
      ...(placeholderInfo ? [
        { icon: 'ImagePlus', label: (single.clipPath || single.custom?.isFilled) ? 'Replace photo…' : 'Upload photo…', onClick: () => app.ops.promptUploadForPlaceholder(placeholderInfo) },
        { divider: true }
      ] : []),
      { icon: 'Scissors', label: 'Cut', shortcut: '⌘X', onClick: () => app.cutSelection() },
      { icon: 'Copy', label: 'Copy', shortcut: '⌘C', onClick: () => app.copySelection() },
      { icon: 'ClipboardPaste', label: 'Paste', shortcut: '⌘V', disabled: !canClipboard, onClick: () => app.pasteSelection() },
      { icon: 'CopyPlus', label: 'Duplicate', shortcut: '⌘D', onClick: () => app.ops.duplicate() },
      { divider: true },
      ...(multi ? [{ icon: 'Group', label: 'Group', shortcut: '⌘G', onClick: () => app.ops.group() }] : []),
      ...(isGroup ? [{ icon: 'Ungroup', label: 'Ungroup', shortcut: '⌘⇧G', onClick: () => app.ops.ungroup() }] : []),
      ...(objs.length >= 2 ? [{ icon: 'Scissors', label: 'Create clipping mask', shortcut: '⌘7', onClick: () => app.ops.createClipMask() }] : []),
      ...(singleClipped ? [
        { icon: 'MousePointerClick', label: 'Edit contents', shortcut: '⌘⇧E', onClick: () => app.ops.editClipMask() },
        { icon: 'Unlink', label: 'Release clipping mask', onClick: () => app.ops.releaseClipMask() }
      ] : []),
      { divider: true },
      { icon: 'ArrowUpToLine', label: 'Bring to front', shortcut: '⌘⇧]', onClick: () => app.ops.arrange('front') },
      { icon: 'ArrowDownToLine', label: 'Send to back', shortcut: '⌘⇧[', onClick: () => app.ops.arrange('back') },
      { icon: 'ChevronUpSquare', label: 'Bring forward', shortcut: '⌘]', onClick: () => app.ops.arrange('forward') },
      { icon: 'ChevronDownSquare', label: 'Send backward', shortcut: '⌘[', onClick: () => app.ops.arrange('backward') },
      { divider: true },
      { icon: 'FlipHorizontal2', label: 'Flip horizontally', onClick: () => app.ops.flip('x') },
      { icon: 'FlipVertical2', label: 'Flip vertically', onClick: () => app.ops.flip('y') },
      { divider: true },
      ...(hasHyperlink ? [
        { icon: 'ExternalLink', label: 'Open hyperlink', onClick: () => window.open(single.custom.hyperlink, '_blank') },
        { icon: 'Unlink', label: 'Remove hyperlink', onClick: () => app.ops.removeHyperlink() }
      ] : [
        { icon: 'Link', label: 'Add hyperlink…', onClick: () => this._promptHyperlink() }
      ]),
      { divider: true },
      { icon: 'Lock', label: 'Lock layer', onClick: () => app.ops.setLocked(true) },
      { icon: 'Trash2', label: 'Delete', shortcut: '⌫', danger: true, onClick: () => app.ops.delete() }
    ];
    this.show(items, x, y);
  }

  _promptHyperlink() {
    const app = this.app;
    const modal = new Modal('hyperlink-modal', 'Add hyperlink', `
      <input id="hyperlink-url-input" type="url" value=""
        placeholder="https://example.com"
        style="width:100%;background:var(--bg-panel);border:1px solid var(--border-color);border-radius:6px;padding:10px 12px;color:var(--text-primary);font-size:14px;outline:none;font-family:var(--font-mono, monospace);">
      <div style="margin-top:6px;font-size:11px;color:var(--text-muted);">This link will be clickable in exported PDFs — seamless, no underline.</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button class="btn btn-ghost" id="hyperlink-cancel" style="font-size:12px;">Cancel</button>
        <button class="btn btn-primary" id="hyperlink-save" style="font-size:12px;">Add link</button>
      </div>`);
    modal.render();
    modal.open();
    const input = document.getElementById('hyperlink-url-input');
    const doSave = () => {
      const url = input.value.trim();
      if (url) app.ops.setHyperlink(url);
      modal.close();
    };
    document.getElementById('hyperlink-save').onclick = doSave;
    document.getElementById('hyperlink-cancel').onclick = () => modal.close();
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') doSave();
      else if (e.key === 'Escape') modal.close();
    });
    setTimeout(() => { input.focus(); }, 30);
  }

  /* ------------------------------------------------------------------ */

  show(items, x, y) {
    this.hide();
    const el = document.createElement('div');
    el.className = 'ctx-menu';
    const ul = document.createElement('div');
    ul.className = 'ctx-menu-list';

    items.forEach(item => {
      if (item.divider) {
        ul.appendChild(Object.assign(document.createElement('div'), { className: 'ctx-menu-divider' }));
        return;
      }
      const row = document.createElement('button');
      row.className = 'ctx-menu-item' + (item.danger ? ' danger' : '') + (item.disabled ? ' disabled' : '');
      if (item.icon) {
        const ic = document.createElement('span');
        ic.className = 'ctx-menu-ic';
        ic.innerHTML = svg(item.icon, 15);
        row.appendChild(ic);
      } else {
        row.appendChild(document.createElement('span'));
      }
      const lbl = document.createElement('span');
      lbl.className = 'ctx-menu-label';
      lbl.textContent = item.label;
      row.appendChild(lbl);
      if (item.shortcut) {
        const k = document.createElement('span');
        k.className = 'ctx-menu-shortcut';
        k.textContent = item.shortcut;
        row.appendChild(k);
      }
      if (!item.disabled) {
        row.addEventListener('click', () => { this.hide(); item.onClick && item.onClick(); });
      }
      ul.appendChild(row);
    });

    el.appendChild(ul);
    document.body.appendChild(el);

    // Position within viewport
    const mw = 232, mh = ul.offsetHeight || 400;
    const vw = window.innerWidth, vh = window.innerHeight;
    el.style.left = Math.min(x, vw - mw - 8) + 'px';
    el.style.top = Math.min(y, vh - mh - 8) + 'px';

    this.el = el;
    const itemsArr = el.querySelectorAll('.ctx-menu-item:not(.disabled)');
    let idx = -1;
    const focusItem = (i) => {
      if (!itemsArr.length) return;
      idx = (i + itemsArr.length) % itemsArr.length;
      itemsArr[idx].focus();
    };
    el.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(idx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(idx - 1); }
    });
    setTimeout(() => focusItem(0), 10);
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); this.hide(); });
  }

  hide() {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
