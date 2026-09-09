/**
 * KeyboardManager — Canva/Google-Slides/Figma-grade shortcuts.
 *
 * Design rules:
 *  • while typing (input/textarea/contentEditable) native behavior wins
 *  • Space is a temporary hand tool: hold = pan, release = restore tool
 *  • Esc steps out: text editing → selection → select tool
 */
export class KeyboardManager {
  constructor(app) {
    this.app = app;
    this._toolBeforeSpace = null;
    this.init();
  }

  _isTyping(e) {
    const t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.getAttribute?.('contenteditable') === 'true');
  }

  _canvas() { return this.app.canvasManager.getCanvas(); }

  _isEditingText() {
    const a = this._canvas().getActiveObject();
    return !!(a && (a.isEditing || a._isEditing));
  }

  init() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e), { passive: false });
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(e) {
    // While a modal dialog is open, let the modal own the keyboard.
    if (document.querySelector('.modal-overlay')) return;

    // ---- Typing contexts: let the control do its thing --------------
    if (this._isTyping(e)) {
      if (e.key === 'Escape') {
        // blur inputs via Esc inside the app
        e.target.blur && e.target.blur();
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    const app = this.app;
    const canvas = this._canvas();
    const mod = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();

    // Editing text inside fabric: let the text editor have every key.
    if (this._isEditingText() && !mod) {
      if (e.key === 'Escape') {
        const a = canvas.getActiveObject();
        a.exitEditing && a.exitEditing();
        canvas.requestRenderAll();
        e.preventDefault();
      }
      return;
    }

    /* ------------------------ modifiers ------------------------ */
    if (mod) {
      const shift = e.shiftKey;
      switch (key) {
        case 'z': e.preventDefault(); shift ? app.redo() : app.undo(); return;
        case 'y': if (mod) { e.preventDefault(); app.redo(); } return;
        case 'a': e.preventDefault(); this.selectAll(); return;
        case 'c': e.preventDefault(); if (!shift) app.copySelection(); return;
        case 'x': e.preventDefault(); app.cutSelection(); return;
        case 'v': e.preventDefault(); app.pasteSelection(); return;
        case 'd': e.preventDefault(); if (!shift) app.ops.duplicate(); return;
        case 'g': e.preventDefault(); if (shift) app.ops.ungroup(); else app.ops.group(); return;
        case 's': e.preventDefault(); app.projectFileManager.saveDraft(true); return;
        case 'e': e.preventDefault(); if (shift) { if (app.ops.hasClipMaskSelection()) app.ops.editClipMask(); } else app.exportSettingsModal.show(); return;
        case '=':
        case '+': e.preventDefault(); app.canvasManager.setZoom(Math.min(200, Math.round(app.canvasManager.getZoom() * 100) + 10), this._center()); return;
        case '-': e.preventDefault(); app.canvasManager.setZoom(Math.max(5, Math.round(app.canvasManager.getZoom() * 100) - 10), this._center()); return;
        case '0': e.preventDefault(); app.canvasManager.fitToScreen(); return;
        case '1': e.preventDefault(); app.canvasManager.setZoom(100, null); return;
        case ']': e.preventDefault(); app.ops.arrange(shift ? 'front' : 'forward'); return;
        case '[': e.preventDefault(); app.ops.arrange(shift ? 'back' : 'backward'); return;
        case '?': case '/': e.preventDefault(); app.showShortcuts(); return;
        case '7': if (!shift) { e.preventDefault(); app.ops.createClipMask(); } return;
      }
      // mod + arrows = nudge by 10
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
        e.preventDefault();
        const n = 10;
        if (key === 'arrowleft') app.ops.nudge(-n, 0);
        else if (key === 'arrowright') app.ops.nudge(n, 0);
        else if (key === 'arrowup') app.ops.nudge(0, -n);
        else app.ops.nudge(0, n);
        return;
      }
      return;
    }

    /* --------------------- no modifiers ----------------------- */
    switch (key) {
      case ' ': // temporary pan
        e.preventDefault();
        this._startSpacePan();
        return;
      case 'escape':
        e.preventDefault();
        if (this.app.ops && this.app.ops.maskEditing) { this.app.ops.finishMaskEdit(); return; }
        this._escape();
        return;
      case 'delete':
      case 'backspace':
        if (this._isEditingText()) return;
        if (canvas.getActiveObjects().length) {
          e.preventDefault();
          app.ops.delete();
        }
        return;
      case 'arrowleft': case 'arrowright': case 'arrowup': case 'arrowdown':
        e.preventDefault();
        if (!canvas.getActiveObjects().length) return;
        {
          const n = e.shiftKey ? 10 : 1;
          if (key === 'arrowleft') app.ops.nudge(-n, 0);
          else if (key === 'arrowright') app.ops.nudge(n, 0);
          else if (key === 'arrowup') app.ops.nudge(0, -n);
          else app.ops.nudge(0, n);
        }
        return;
      case '?':
        app.showShortcuts();
        return;
      case 'f':
        if (!e.shiftKey && !mod && !this._isEditingText() && !this._isTyping(e)) {
          e.preventDefault();
          app.presentationMode?.start();
          return;
        }
        return;
    }

    // Flip shortcuts (shift+h / shift+v), then single-letter tools
    if (e.shiftKey && key === 'h' && canvas.getActiveObjects().length) { e.preventDefault(); app.ops.flip('x'); return; }
    if (e.shiftKey && key === 'v' && canvas.getActiveObjects().length) { e.preventDefault(); app.ops.flip('y'); return; }

    const sc = this.app.toolShortcutForKey(key);
    if (sc) {
      // Don't let stray letters yank the tool away while the user is about
      // to click-and-type with the text tool (only V/H stay available).
      if (this.app.toolManager.currentTool === 'text' && sc.tool !== 'select' && sc.tool !== 'pan') return;
      e.preventDefault();
      this.app.activateToolShortcut(key);
    }
  }

  onKeyUp(e) {
    if (e.key === ' ') this._endSpacePan();
  }

  _spaceActive = false;

  _startSpacePan() {
    const app = this.app;
    if (this._spaceActive) return;
    this._spaceActive = true;
    this._toolBeforeSpace = app.toolManager.currentTool;
    app.canvasManager.setSpaceDown(true);
    app.toolManager.setTool('pan');
  }

  _endSpacePan() {
    if (!this._spaceActive) return;
    this._spaceActive = false;
    this.app.canvasManager.setSpaceDown(false);
    if (this.app.toolManager.currentTool === 'pan') {
      this.app.toolManager.setTool(this._toolBeforeSpace || 'select');
    }
    this._toolBeforeSpace = null;
  }

  _escape() {
    const app = this.app;
    const canvas = this._canvas();
    const active = canvas.getActiveObject();
    if (active && (active.isEditing || active._isEditing)) {
      active.exitEditing && active.exitEditing();
      canvas.requestRenderAll();
    } else if (canvas.getActiveObjects().length) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    } else if (app.toolManager.currentTool !== 'select') {
      app.toolManager.setTool('select');
    }
  }

  _center() {
    const vp = this.app.canvasManager.getViewport();
    const r = vp ? vp.getBoundingClientRect() : null;
    return r ? { x: r.width / 2, y: r.height / 2 } : null;
  }

  selectAll() {
    const canvas = this._canvas();
    const sel = canvas.getObjects().filter(o => o.visible !== false && o.selectable !== false && o.evented !== false);
    if (!sel.length) return;
    canvas.discardActiveObject();
    if (sel.length === 1) canvas.setActiveObject(sel[0]);
    else canvas.setActiveObject(new (window.fabric.ActiveSelection)(sel, { canvas }));
    canvas.requestRenderAll();
  }
}
