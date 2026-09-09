/**
 * HistoryManager — per-page undo/redo stacks.
 *
 * Every page owns its own undo history (keyed by page id), so switching
 * away and back keeps that page's steps — undo is granular per page and
 * never leaks across pages. Each stack entry is the full page JSON.
 *
 * Undo history survives page switches: re-entering a page keeps its
 * stack (only the very first visit seeds it). If the canvas state on
 * re-entry differs from the stack top (e.g. the user undid a few steps
 * before leaving), the stack is trimmed and re-seeded from the current
 * state so undo always continues from where you are.
 *
 * Bulk guards (`beginBulk`/`endBulk`) suppress the auto-save listeners
 * during wholesale loads (loadFromJSON fires object:added per object —
 * those intermediate states must never pollute the stack).
 */
export class HistoryManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.stacks = new Map();   // pageId -> { history: [], currentIndex: -1, lastState: null }
    this.currentPageId = null;
    this.maxHistory = 60;
    this.isProcessing = false;
    this._bulk = 0;
    this._bound = false;
  }

  /** attach canvas listeners once (called at app boot) */
  init() {
    if (this._bound) return;
    this._bound = true;
    this.canvas.on('object:added', () => this.saveState());
    this.canvas.on('object:modified', () => this.saveState());
    this.canvas.on('object:removed', () => this.saveState());
  }

  _stack(pageId = this.currentPageId) {
    if (!pageId) return null;
    if (!this.stacks.has(pageId)) this.stacks.set(pageId, { history: [], currentIndex: -1, lastState: null });
    return this.stacks.get(pageId);
  }

  /** true while a bulk load is running (undo/redo restore, page switch, …) */
  get busy() {
    return this.isProcessing || this._bulk > 0;
  }

  /** suppress auto-save events; pair with endBulk(). Nested calls are fine. */
  beginBulk() {
    this._bulk++;
  }

  endBulk() {
    this._bulk = Math.max(0, this._bulk - 1);
  }

  /**
   * Enter a page's undo context.
   * - First visit (no stack yet): seed a fresh stack with the loaded state.
   * - Revisit: keep the existing granular history. If the canvas state
   *   differs from the stack top (edits were undone, then we left), trim
   *   the redo tail and reseed from the current state — undo continues
   *   from exactly where the user is, not from a stale snapshot.
   */
  enterPage(pageId) {
    const s = this._stack(pageId);
    this.currentPageId = pageId;
    const snap = this._snapshot();
    if (!snap) return;
    if (!s.history.length) {
      s.history = [snap];
      s.currentIndex = 0;
      s.lastState = snap;
    } else if (s.lastState !== snap) {
      // state diverged from the top → redo tail is meaningless
      if (s.currentIndex < s.history.length - 1) {
        s.history = s.history.slice(0, s.currentIndex + 1);
      }
      s.history.push(snap);
      if (s.history.length > this.maxHistory) s.history.shift();
      else s.currentIndex++;
      s.lastState = snap;
    }
    this._notify();
  }

  /** wipe a page's stack (page deleted / wholesale replaced) */
  forget(pageId) {
    this.stacks.delete(pageId);
    if (this.currentPageId === pageId) this.currentPageId = null;
  }

  clearAll() {
    this.stacks.clear();
    this.currentPageId = null;
  }

  _snapshot() {
    try {
      // keep names + custom (slot/mask metadata) alive across undo steps
      return JSON.stringify(this.canvas.toJSON(['custom', 'name']));
    } catch (e) {
      console.error('History snapshot error', e);
      return null;
    }
  }

  /** Capture current canvas state (skipped when identical to the last one). */
  saveState() {
    if (this.busy) return;
    const s = this._stack();
    if (!s) return;
    const state = this._snapshot();
    if (!state) return;
    if (s.lastState === state) return; // dedupe consecutive identical states
    s.lastState = state;

    if (s.currentIndex < s.history.length - 1) {
      s.history = s.history.slice(0, s.currentIndex + 1);
    }
    s.history.push(state);
    if (s.history.length > this.maxHistory) {
      s.history.shift();
    } else {
      s.currentIndex++;
    }
    this._notify();
  }

  _notify() {
    const s = this._stack();
    document.dispatchEvent(new CustomEvent('prosy:historyChanged', {
      detail: { canUndo: !!s && s.currentIndex > 0, canRedo: !!s && s.currentIndex < s.history.length - 1 }
    }));
  }

  async _load(state) {
    this.isProcessing = true;
    try {
      await this.canvas.loadFromJSON(state);
      this.canvas.requestRenderAll();
    } catch (e) {
      console.error('History load error', e);
    } finally {
      this.isProcessing = false;
    }
  }

  async undo() {
    const s = this._stack();
    if (!s || s.currentIndex <= 0) return;
    s.currentIndex--;
    await this._load(s.history[s.currentIndex]);
    this._notify();
  }

  async redo() {
    const s = this._stack();
    if (!s || s.currentIndex >= s.history.length - 1) return;
    s.currentIndex++;
    await this._load(s.history[s.currentIndex]);
    this._notify();
  }

  canUndo() {
    const s = this._stack();
    return !!s && s.currentIndex > 0;
  }

  canRedo() {
    const s = this._stack();
    return !!s && s.currentIndex < s.history.length - 1;
  }
}
