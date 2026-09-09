import * as fabric from 'fabric';

/**
 * ObjectOps — the "power editing" actions shared by keyboard shortcuts,
 * context menus, the properties panel and multi-select tools.
 * Every op ends with a history commit + a `prosy:objectEdited` event so
 * the sidebar & filmstrip stay in sync.
 */
export class ObjectOps {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvasManager.getCanvas();
    this.app.objectOps = this;
    this.app.promptUploadForPlaceholder = (t) => this.promptUploadForPlaceholder(t);
    this.app.fillPlaceholderWithImage = (t, f) => this.fillPlaceholderWithImage(t, f);
  }

  _commit() {
    if (this.app.historyManager) this.app.historyManager.saveState();
    this.canvas.requestRenderAll();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
  }

  _flashSelected() {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => { o.set('opacity', 0.4); });
    this.canvas.requestRenderAll();
    setTimeout(() => {
      objs.forEach(o => o.set('opacity', o._prevOpacity ?? 1));
      this.canvas.requestRenderAll();
    }, 90);
  }

  /* --------------------------- lifecycle --------------------------- */

  async duplicate(offset = 32) {
    if (this._maskEdit) { this.app.toast?.('Finish the mask edit first (Esc / Done)'); return; }
    const active = this.canvas.getActiveObject();
    if (!active) return;
    const objs = this.canvas.getActiveObjects();
    const clones = await Promise.all(objs.map(o => o.clone()));
    this.canvas.discardActiveObject();
    const newOnes = [];
    clones.forEach((c, i) => {
      c.set({
        left: (c.left || 0) + offset,
        top: (c.top || 0) + offset,
        evented: true,
        selectable: true,
        hasControls: true
      });
      this.canvas.add(c);
      newOnes.push(c);
    });
    if (newOnes.length === 1) this.canvas.setActiveObject(newOnes[0]);
    else if (newOnes.length > 1) this.canvas.setActiveObject(new fabric.ActiveSelection(newOnes, { canvas: this.canvas }));
    this._commit();
  }

  delete() {
    if (this._maskEdit) { this.app.toast?.('Finish the mask edit first (Esc / Done)'); return; }
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    this.canvas.discardActiveObject();
    objs.forEach(o => this.canvas.remove(o));
    this._commit();
  }

  deleteSelected() {
    return this.delete();
  }

  /* ---------------------------- grouping --------------------------- */

  async group() {
    const active = this.canvas.getActiveObject();
    if (!active || active.type !== 'activeselection') return;
    const objs = this.canvas.getActiveObjects();
    if (objs.length < 2) return;
    this.canvas.discardActiveObject();
    const group = new fabric.Group(objs);
    // children must leave the canvas — the group constructor does not
    objs.forEach(o => this.canvas.remove(o));
    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this._commit();
  }

  /** split a group back into independent canvas objects with exact absolute positions */
  _explodeGroup(group) {
    const canvas = this.canvas;
    const kids = [...(group._objects || [])];
    canvas.discardActiveObject();
    kids.forEach(k => {
      // Calculate absolute transformation matrix in world coordinates before detaching
      const matrix = k.calcTransformMatrix();
      k.group = undefined;
      k.parent = undefined;
      if (fabric.util && typeof fabric.util.applyTransformToObject === 'function') {
        fabric.util.applyTransformToObject(k, matrix);
      } else {
        const p = fabric.util.qrDecompose(matrix);
        k.set({
          left: p.translateX,
          top: p.translateY,
          scaleX: p.scaleX,
          scaleY: p.scaleY,
          angle: p.angle,
          skewX: p.skewX,
          skewY: p.skewY,
          originX: 'center',
          originY: 'center'
        });
      }
      canvas.add(k);
      k.setCoords();
    });
    group._objects = [];
    canvas.remove(group);
    return kids;
  }

  ungroup() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    if (active.type === 'group') {
      const kids = this._explodeGroup(active);
      this.canvas.requestRenderAll();
      if (kids.length) {
        this.canvas.setActiveObject(new fabric.ActiveSelection(kids, { canvas: this.canvas }));
      }
      this._commit();
    }
  }

  /* ---------------------------- arrange ---------------------------- */

  arrange(mode) {
    const obj = this.canvas.getActiveObject();
    if (!obj) return;
    switch (mode) {
      case 'front': this.canvas.bringObjectToFront(obj); break;
      case 'back': this.canvas.sendObjectToBack(obj); break;
      case 'forward': {
        const objects = this.canvas.getObjects();
        const idx = objects.indexOf(obj);
        if (idx < objects.length - 1) {
          this.canvas.remove(obj);
          this.canvas.insertAt(idx + 1, obj);
        }
        break;
      }
      case 'backward': {
        const objects = this.canvas.getObjects();
        const idx = objects.indexOf(obj);
        if (idx > 0) {
          this.canvas.remove(obj);
          this.canvas.insertAt(idx - 1, obj);
        }
        break;
      }
    }
    this.canvas.setActiveObject(obj);
    this._commit();
  }

  /* --------------------------- transforms -------------------------- */

  nudge(dx, dy) {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => o.set({ left: (o.left || 0) + dx, top: (o.top || 0) + dy }));
    objs.forEach(o => o.setCoords());
    this._commit();
  }

  flip(axis) {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => o.set({ flipX: axis === 'x' ? !o.flipX : o.flipX, flipY: axis === 'y' ? !o.flipY : o.flipY }));
    this._commit();
  }

  setLocked(locked) {
    const objs = this.canvas.getActiveObjects();
    objs.forEach(o => {
      o.set({
        selectable: !locked,
        evented: !locked,
        lockMovementX: locked, lockMovementY: locked,
        lockScalingX: locked, lockScalingY: locked, lockRotation: locked,
        _userLocked: locked
      });
      if (locked) this.canvas.discardActiveObject();
    });
    this._commit();
  }

  /* -------------------------- alignment ---------------------------- */

  _boundsOf(objs) {
    const rs = objs.map(o => o.getBoundingRect()); // x,y,width,height (scene units)
    const left = Math.min(...rs.map(r => r.left));
    const top = Math.min(...rs.map(r => r.top));
    const right = Math.max(...rs.map(r => r.left + r.width));
    const bottom = Math.max(...rs.map(r => r.top + r.height));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  /**
   * align targets — 'selection' or 'page'
   */
  alignTargetBounds(target) {
    if (target === 'page') {
      return { left: 0, top: 0, right: this.app.canvasManager.PAGE_W, bottom: this.app.canvasManager.PAGE_H, width: this.app.canvasManager.PAGE_W, height: this.app.canvasManager.PAGE_H };
    }
    return this._boundsOf(this.canvas.getActiveObjects());
  }

  alignSupported(mode, target = 'selection') {
    return true;
  }

  align(mode, target = 'selection') {
    const objs = this.canvas.getActiveObjects();
    if (objs.length === 0) return;
    if (objs.length === 1 && target === 'selection') target = 'page'; // single object: align to page
    const t = this.alignTargetBounds(target);

    objs.forEach(o => {
      const b = o.getBoundingRect();
      let { left, top } = o;
      const moveX = { left: () => left = t.left - (b.left - left), center: () => left = (t.left + t.width / 2 - b.width / 2) - (b.left - left), right: () => left = t.right - b.width - (b.left - left) };
      const moveY = { top: () => top = t.top - (b.top - top), middle: () => top = (t.top + t.height / 2 - b.height / 2) - (b.top - top), bottom: () => top = t.bottom - b.height - (b.top - top) };
      if (mode === 'left' || mode === 'centerX' || mode === 'right') moveX[mode === 'centerX' ? 'center' : mode]();
      else if (mode === 'top' || mode === 'middle' || mode === 'bottom') moveY[mode === 'middle' ? 'middle' : mode]();
      o.set({ left, top });
    });
    objs.forEach(o => o.setCoords());
    this._commit();
  }

  distribute(mode) {
    const objs = this.canvas.getActiveObjects();
    if (objs.length < 3) return;
    const ordered = [...objs].sort((a, b) => {
      const ba = a.getBoundingRect(), bb = b.getBoundingRect();
      return mode === 'h' ? ba.left - bb.left : ba.top - bb.top;
    });
    const t = this._boundsOf(ordered);
    if (mode === 'h') {
      const innerW = ordered.slice(1, -1).reduce((s, o) => s + o.getBoundingRect().width, 0);
      const gap = (t.width - innerW) / (ordered.length - 1);
      let cursor = t.left;
      ordered.forEach((o, i) => {
        const b = o.getBoundingRect();
        o.set({ left: cursor - (b.left - o.left) });
        cursor += b.width + gap;
      });
    } else {
      const innerH = ordered.slice(1, -1).reduce((s, o) => s + o.getBoundingRect().height, 0);
      const gap = (t.height - innerH) / (ordered.length - 1);
      let cursor = t.top;
      ordered.forEach((o, i) => {
        const b = o.getBoundingRect();
        o.set({ top: cursor - (b.top - o.top) });
        cursor += b.height + gap;
      });
    }
    ordered.forEach(o => o.setCoords());
    this._commit();
  }

  /** make all selected objects the same width/height (largest wins) */
  matchSize(mode) {
    const objs = this.canvas.getActiveObjects();
    if (objs.length < 2) return;
    let w = 0, hgt = 0;
    objs.forEach(o => {
      const b = o.getBoundingRect();
      w = Math.max(w, b.width);
      hgt = Math.max(hgt, b.height);
    });
    objs.forEach(o => {
      const sx = o.scaleX || 1, sy = o.scaleY || 1;
      if (mode === 'w' || mode === 'both') {
        if (o.width > 0) o.set({ scaleX: (w / o.width) * Math.sign(sx) });
      }
      if (mode === 'h' || mode === 'both') {
        if (o.height > 0) o.set({ scaleY: (hgt / o.height) * Math.sign(sy) });
      }
    });
    objs.forEach(o => o.setCoords());
    this._commit();
  }

  /* ------------------------- common props -------------------------- */

  setProps(props, { commit = true, notify = true } = {}) {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => o.set(props));
    objs.forEach(o => o.setCoords());
    if (commit) this._commit();
    else this.canvas.requestRenderAll();
  }

  /** recolor an icon group (stroke-based svg art) recursively */
  setIconColor(color) {
    const objs = this.canvas.getActiveObjects();
    const walk = (o) => {
      if (o._objects && o._objects.length) {
        o._objects.forEach(walk);
      } else {
        let changed = false;
        if (o.stroke && o.stroke !== 'none' && o.stroke !== 'transparent') {
          o.set('stroke', color);
          changed = true;
        }
        if (o.fill && o.fill !== 'none' && o.fill !== 'transparent') {
          o.set('fill', color);
          changed = true;
        }
        if (!changed) {
          o.set('stroke', color);
        }
        o.dirty = true;
      }
    };
    objs.forEach(o => {
      walk(o);
      o.set('stroke', color);
      o.dirty = true;
    });
    this.canvas.requestRenderAll();
    this._commit();
  }

  isIconSelection() {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return false;
    return objs.every(o => this._looksLikeIcon(o));
  }

  _looksLikeIcon(o) {
    if (!o) return false;
    if (o._isIcon || o.name === 'Icon') return true;
    const collect = (obj) => {
      if (!obj) return [];
      if (obj._objects) return obj._objects.flatMap(collect);
      return [obj];
    };
    const leaves = collect(o);
    if (!leaves.length) return false;
    return leaves.some(p => p.stroke && p.stroke !== 'none' && p.stroke !== 'transparent');
  }

  /* ----------------------------- misc ------------------------------ */

  async copySelectionToClipboard() {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return false;
    try {
      const clones = await Promise.all(objs.map(o => o.clone()));
      const pack = {
        type: 'prosy-objects',
        objects: clones.map(c => c.toObject(['id', 'name']))
      };
      await navigator.clipboard.writeText(JSON.stringify(pack));
      return true;
    } catch (e) {
      return false;
    }
  }

  async pasteFromClipboard() {
    try {
      const raw = await navigator.clipboard.readText();
      const pack = JSON.parse(raw);
      if (!pack || pack.type !== 'prosy-objects' || !Array.isArray(pack.objects)) return false;
      const canvas = this.canvas;
      const loaders = pack.objects.map(o => new Promise(res => {
        canvas.getEnv()?.enlivenObjects?.([o], { canvas }).then(([obj]) => res(obj)).catch(() => res(null));
      }));
      const objs = (await Promise.all(loaders)).filter(Boolean);
      objs.forEach(o => { o.set({ left: (o.left || 0) + 24, top: (o.top || 0) + 24 }); canvas.add(o); });
      if (objs.length) canvas.setActiveObject(objs.length > 1 ? new fabric.ActiveSelection(objs, { canvas }) : objs[0]);
      this._commit();
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ----------------------- clipping mask ------------------------- */

  /**
   * Illustrator-style "Create clipping mask":
   * select the content (e.g. an image) AND a shape stacked on top →
   * right-click → Create clipping mask. The TOPMOST selected shape
   * becomes the mask; the other selected objects are clipped into its
   * silhouette and the shape itself is removed (but kept serialized so
   * "Release / Edit" can bring it back — releasing must unclip, never
   * destroy the shape).
   *
   * Fabric v7 note: clipPath on a bare FabricImage is ignored by the
   * renderer, but clipping a Group works — so image content is wrapped
   * into a single-child group first. The masked result is one unit that
   * moves/scales together.
   */
  async createClipMask() {
    const canvas = this.canvas;
    const objs = canvas.getActiveObjects();
    if (objs.length < 2) return;
    const order = canvas.getObjects();
    const idx = objs.map(o => order.indexOf(o)).filter(i => i >= 0).sort((a, b) => b - a);
    const mask = order[idx[0]];
    const contents = objs.filter(o => o !== mask);
    if (!mask || !contents.length) return;

    const needsWrap = contents.length > 1 || (contents.length === 1 && contents[0].type === 'image');
    let host;
    const addedGroup = [];
    const hm = this.app.historyManager;
    hm.beginBulk();
    try {
      if (needsWrap) {
        this.canvas.discardActiveObject();
        host = new fabric.Group(contents);
        // children must leave the canvas — the Group constructor does not
        contents.forEach(o => this.canvas.remove(o));
        host.set({
          name: 'Masked content',
          custom: { ...(host.custom || {}), maskWrap: contents.length === 1 ? 'single' : 'multi' }
        });
        this.canvas.add(host);
        addedGroup.push(host);
      } else {
        host = contents[0];
      }
      // Keep the mask shape serialized so release/edit can restore it —
      // releasing must unclip, not destroy the shape. Full toObject keeps
      // every visual property (fill, gradient, stroke, rx, custom …).
      const maskData = this._maskForRestore(mask);
      const clip = await this._clipForMask(mask, host);
      host.set('clipPath', clip);
      host.set('custom', { ...(host.custom || {}), _maskData: maskData });
      host.setCoords();
      canvas.remove(mask);
      canvas.discardActiveObject();
      canvas.setActiveObject(host);
      canvas.requestRenderAll();
      this.app.toast?.(`Clipping mask created — content clipped into ${(mask.custom && mask.custom.shapeLabel) || 'shape'}`);
    } catch (e) {
      console.error('createClipMask failed', e);
      addedGroup.forEach(g => canvas.remove(g));
      canvas.requestRenderAll();
      this.app.toast?.('Could not create clipping mask', true);
    } finally {
      hm.endBulk();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  /** serialized, restorable copy of a scene shape used as a mask */
  _maskForRestore(mask) {
    const m = mask.toObject(['custom', 'name']);
    delete m.id;
    delete m.clipPath;
    m.selectable = true;
    m.evented = true;
    m.hasControls = true;
    m.hasBorders = true;
    return m;
  }

  /** position a copy of the mask shape into a host object's local space */
  async _clipForMask(mask, host) {
    const sx = host.scaleX || 1;
    const sy = host.scaleY || 1;
    const clip = await mask.clone();
    clip.set({
      left: (mask.left - (host.left || 0)) / sx,
      top: (mask.top - (host.top || 0)) / sy,
      scaleX: (mask.scaleX || 1) / sx,
      scaleY: (mask.scaleY || 1) / sy,
      originX: 'left',
      originY: 'top',
      strokeWidth: 0,
      stroke: '',
      fill: '#000000',
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      name: undefined
    });
    return clip;
  }

  /* --------- deterministic local↔scene vector math (no matrices) --------- */
  // host.left/top ARE the anchor (top-left for left-origin, centre for
  // centre-origin), and clip children live in pre-scale local units
  // relative to that anchor. All conversions below use plain properties +
  // 2D rotation, so they stay correct even when the host was just dragged
  // through fabric's event machinery.

  _rotate(x, y, deg) {
    const r = ((deg || 0) * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    return { x: x * c - y * s, y: x * s + y * c };
  }

  /** scene → host-local (pre-scale, anchor-relative) */
  _localFromScene(host, scenePt) {
    const off = this._rotate(scenePt.x - host.left, scenePt.y - host.top, -(host.angle || 0));
    return { x: off.x / (host.scaleX || 1), y: off.y / (host.scaleY || 1) };
  }

  /** host-local (pre-scale, anchor-relative) → scene */
  _sceneFromLocal(host, lx, ly) {
    const off = this._rotate(lx * (host.scaleX || 1), ly * (host.scaleY || 1), host.angle || 0);
    return { x: host.left + off.x, y: host.top + off.y };
  }

  /**
   * Current clip geometry → a serializable scene-space shape (where the
   * mask window sits on the page right now, independent of the host).
   */
  _clipSceneData(host) {
    const clip = host.clipPath;
    if (!clip) return null;
    const sx = host.scaleX || 1;
    const sy = host.scaleY || 1;
    const clipW = (clip.width || 0) * (clip.scaleX || 1);
    const clipH = (clip.height || 0) * (clip.scaleY || 1);
    // centre of the clip window, host-local pre-scale, anchor-relative
    const lcx = (clip.left || 0) + clipW / 2;
    const lcy = (clip.top || 0) + clipH / 2;
    const center = this._sceneFromLocal(host, lcx, lcy);
    const sceneSX = (clip.scaleX || 1) * sx;
    const sceneSY = (clip.scaleY || 1) * sy;
    const data = clip.toObject(['custom']);
    delete data.id;
    delete data.clipPath;
    data.left = center.x - (clip.width || 0) * sceneSX / 2;
    data.top = center.y - (clip.height || 0) * sceneSY / 2;
    data.scaleX = sceneSX;
    data.scaleY = sceneSY;
    data.angle = (((host.angle || 0) + (clip.angle || 0)) % 360 + 360) % 360;
    data.originX = 'left';
    data.originY = 'top';
    return data;
  }

  /** re-add the mask shape where the clip window CURRENTLY sits */
  async _restoreMaskShape(maskData, sceneData) {
    if (!sceneData || !this.canvas) return null;
    const origOriginX = (maskData && maskData.originX) || 'left';
    const origOriginY = (maskData && maskData.originY) || 'top';
    const src = maskData
      ? Object.assign(JSON.parse(JSON.stringify(maskData)), {
          left: sceneData.left, top: sceneData.top,
          scaleX: sceneData.scaleX, scaleY: sceneData.scaleY,
          angle: sceneData.angle, originX: 'left', originY: 'top'
        })
      : sceneData;
    return fabric.util.enlivenObjects([src], { canvas: this.canvas })
      .then(([obj]) => {
        if (!obj) return null;
        obj.set({ selectable: true, evented: true, visible: src.visible !== false });
        if (origOriginX !== 'left' || origOriginY !== 'top') {
          const pt = { x: obj.left, y: obj.top };
          obj.set({ originX: origOriginX, originY: origOriginY });
          obj.setPositionByOrigin(pt, 'left', 'top', origOriginX, origOriginY);
        }
        obj.setCoords();
        this.canvas.add(obj);
        this.canvas.requestRenderAll();
        return obj;
      })
      .catch(e => { console.error('restore mask shape failed', e); return null; });
  }

  /**
   * Remove the clipPath (unclip only, content never moves). Single-image
   * wraps are unwrapped back to the raw image at its exact spot; multi-wraps
   * are exploded back to separate objects; the caller decides what to
   * restore/select and when to commit history.
   */
  _releaseCore() {
    const active = this.canvas.getActiveObject();
    if (!active) return null;
    const canvas = this.canvas;
    let content = active;

    const isWrap = active.type === 'group' && active.custom && (active.custom.maskWrap === 'single' || active.custom.maskWrap === 'multi');
    if (isWrap) {
      active.set('clipPath', null);
      active.setCoords();
      if (active.custom.maskWrap === 'single' && active._objects && active._objects.length === 1) {
        content = this._unwrapSingleImage(active);
      } else if (active.custom.maskWrap === 'multi' && active._objects) {
        content = this._explodeGroup(active);
      }
    } else {
      active.set('clipPath', null);
      active.setCoords();
      active.set('custom', { ...(active.custom || {}), _maskData: undefined });
    }
    canvas.requestRenderAll();
    return content;
  }

  /**
   * Detach the single child from a mask-wrap group keeping its exact scene
   * position. The child's scene matrix (which already includes the host
   * group's transform chain) is captured while still inside the group, then
   * the dead group is removed and the child is reparented top-level with
   * decomposed props. No bbox heuristics, so rotation / non-uniform scale /
   * flip / pre-rotated children all stay pixel-exact.
   *
   * Critical detail: in fabric v7, canvas.remove(host) does NOT detach the
   * group's children — child.group keeps pointing at the removed host, and
   * child.parent keeps pointing to host. Fabric v7 relies on child.parent
   * for coordinate math; if left pointing to host, adding to ActiveSelection
   * applies the removed group transform a second time, flinging the image!
   * Both child.group and child.parent must be set to undefined explicitly.
   */
  _unwrapSingleImage(host) {
    const canvas = this.canvas;
    const child = host._objects[0];
    if (!child) return host;
    const sceneMat = child.calcTransformMatrix(); // scene matrix incl. host chain
    canvas.remove(host);
    host._objects = [];
    child.group = undefined; // detach from the removed group
    child.parent = undefined; // Fabric v7 uses .parent for hierarchy!
    const p = fabric.util.qrDecompose(sceneMat);
    child.set({
      // v7 child matrices are centre-anchored: the translate IS the content
      // centre regardless of the stored originX/Y, so reparent centre-origin
      originX: 'center',
      originY: 'center',
      left: p.translateX,
      top: p.translateY,
      scaleX: p.scaleX,
      scaleY: p.scaleY,
      skewX: p.skewX,
      skewY: p.skewY,
      angle: p.angle
    });
    canvas.add(child);
    child.setCoords();
    // restore left/top origin without moving (match pre-mask convention)
    const ctr = { x: child.left, y: child.top };
    child.set({ originX: 'left', originY: 'top' });
    child.setPositionByOrigin(ctr, 'center', 'center', 'left', 'top');
    child.setCoords();
    return child;
  }

  /**
   * Release a clipping mask: unclip ONLY. Content stays exactly where it
   * is; a mask shape that was consumed at create time is restored at the
   * position where the clip window currently sits — nothing jumps apart.
   */
  async releaseClipMask() {
    if (this._maskEdit) { this.app.toast?.('Finish the mask edit first (Esc / Done)'); return; }
    const host = this.canvas.getActiveObject();
    if (!host || !host.clipPath) return;
    const maskData = (host.custom && host.custom._maskData) || null;
    const sceneData = this._clipSceneData(host);
    const hm = this.app.historyManager;
    hm.beginBulk();
    try {
      const content = this._releaseCore();
      if (!content) { hm.endBulk(); return; }
      const mask = maskData ? await this._restoreMaskShape(maskData, sceneData) : null;
      const pool = Array.isArray(content) ? [...content] : [content];
      if (mask) pool.push(mask);
      this.canvas.setActiveObject(pool.length > 1 ? new fabric.ActiveSelection(pool, { canvas: this.canvas }) : pool[0]);
      this.canvas.requestRenderAll();
      this.app.toast?.(mask ? 'Clipping mask released — content and shape stay in place' : 'Clipping mask released');
    } finally {
      hm.endBulk();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  /* ------------------ photo placeholder auto-clip ------------------- */

  promptUserForImage() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/*';
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      input.style.top = '-9999px';
      input.style.opacity = '0';
      document.body.appendChild(input);

      let handled = false;
      const cleanup = () => {
        if (!handled) {
          handled = true;
          if (input.parentNode) input.parentNode.removeChild(input);
        }
      };

      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        cleanup();
        resolve(file || null);
      };

      input.oncancel = () => {
        cleanup();
        resolve(null);
      };

      input.click();
    });
  }

  _readFileAsDataURL(file) {
    return new Promise((resolve) => {
      if (typeof file === 'string') return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  _isPlaceholderShape(obj) {
    if (!obj || obj.visible === false) return false;
    if (obj.width >= 1800 && obj.height >= 1000) return false;
    if (obj.name === 'Background' || obj.name === 'Bg') return false;
    if (obj.type === 'image') return false;
    if (obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text') return false;

    if (obj.custom?.isPhotoPlaceholder) return true;
    if (obj.custom?.maskWrap) return true;
    const n = (obj.name || '').toLowerCase();
    if (n.includes('photo') || n.includes('frame') || n.includes('slot') || n.includes('viewport') || n.includes('screen')) {
      return true;
    }
    if (['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon'].includes(obj.type)) {
      return true;
    }
    return false;
  }

  async promptUploadForPlaceholder(placeholderTarget) {
    if (!placeholderTarget) return null;
    const file = await this.promptUserForImage();
    if (!file) return null;
    return await this.fillPlaceholderWithImage(placeholderTarget, file);
  }

  async fillStandalonePlaceholder(placeholder, fileOrDataUrl) {
    const canvas = this.canvas;
    const hm = this.app.historyManager;
    hm?.beginBulk();
    try {
      const dataUrl = await this._readFileAsDataURL(fileOrDataUrl);
      if (!dataUrl) return null;

      const img = await fabric.FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
      if (!img) return null;

      // Capture original layer z-index so other overlying elements stay on top
      const origIndex = canvas.getObjects().indexOf(placeholder);

      const bbox = placeholder.getBoundingRect();
      const pw = bbox.width || ((placeholder.width || 100) * (placeholder.scaleX || 1));
      const ph = bbox.height || ((placeholder.height || 100) * (placeholder.scaleY || 1));
      const pLeft = bbox.left !== undefined ? bbox.left : (placeholder.left || 0);
      const pTop = bbox.top !== undefined ? bbox.top : (placeholder.top || 0);

      // Cover crop calculation
      const imgW = img.width || 1;
      const imgH = img.height || 1;
      const scale = Math.max(pw / imgW, ph / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;

      const offsetX = (pw - scaledW) / 2;
      const offsetY = (ph - scaledH) / 2;

      img.set({
        left: pLeft + offsetX,
        top: pTop + offsetY,
        scaleX: scale,
        scaleY: scale,
        originX: 'left',
        originY: 'top',
        name: 'Photo'
      });

      const pTag = placeholder.custom?.placeholderTag || placeholder.name;

      // Wrap image into a single-child host group
      const host = new fabric.Group([img]);
      host.set({
        name: `${placeholder.name || 'Photo'} (Clipped)`,
        custom: {
          ...(placeholder.custom || {}),
          isPhotoPlaceholder: true,
          maskWrap: 'single',
          placeholderTag: pTag
        }
      });

      // Remove placeholder and insert host at the exact same z-index in canvas
      canvas.remove(placeholder);
      if (origIndex >= 0) {
        canvas.insertAt(origIndex, host);
      } else {
        canvas.add(host);
      }
      host.setCoords();

      // Create and assign clipPath from the placeholder mask
      const maskData = this._maskForRestore(placeholder);
      const clip = await this._clipForMask(placeholder, host);
      host.set('clipPath', clip);
      host.set('custom', { ...(host.custom || {}), _maskData: maskData });
      host.setCoords();

      canvas.discardActiveObject();
      canvas.setActiveObject(host);

      // Clean up ONLY explicit helper children (like hint camera icons) belonging strictly to this placeholder
      // CRITICAL: NEVER delete any other shape, card, background, group, or photo frame!
      const toRemove = canvas.getObjects().filter(o => {
        if (o === placeholder || o === host || o === img) return false;
        // Never remove any geometry, card, or other photo frame
        if (o.custom?.isPhotoPlaceholder || o.custom?.maskWrap || o.clipPath) return false;
        if (['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon', 'group'].includes(o.type)) return false;

        // Only remove explicit placeholder child elements (like hint icons/text) inside this placeholder
        if (o.custom?.isPhotoPlaceholderChild && pTag && o.custom?.placeholderTag === pTag) {
          try {
            const b = o.getBoundingRect();
            return (b.left >= pLeft - 20 && b.left + b.width <= pLeft + pw + 20 &&
                    b.top >= pTop - 20 && b.top + b.height <= pTop + ph + 20);
          } catch (_) { return false; }
        }
        return false;
      });
      toRemove.forEach(o => canvas.remove(o));

      canvas.requestRenderAll();
      this.app.toast?.('Photo clipped into shape');
      return host;
    } catch (err) {
      console.error('fillStandalonePlaceholder error', err);
      this.app.toast?.('Failed to fill photo placeholder', true);
      return null;
    } finally {
      hm?.endBulk();
      this.app.historyManager?.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  async fillGroupChildPlaceholder(group, child, fileOrDataUrl) {
    const hm = this.app.historyManager;
    hm?.beginBulk();
    try {
      const dataUrl = await this._readFileAsDataURL(fileOrDataUrl);
      if (!dataUrl) return null;

      const imgEl = new Image();
      await new Promise((res, rej) => {
        imgEl.onload = res;
        imgEl.onerror = rej;
        imgEl.src = dataUrl;
      });

      const slotW = (child.width || 100) * (child.scaleX || 1);
      const slotH = (child.height || 100) * (child.scaleY || 1);

      const offscreen = document.createElement('canvas');
      offscreen.width = Math.max(1, Math.round(slotW));
      offscreen.height = Math.max(1, Math.round(slotH));
      const ctx = offscreen.getContext('2d');

      const sRatio = Math.max(offscreen.width / imgEl.width, offscreen.height / imgEl.height);
      const dw = imgEl.width * sRatio;
      const dh = imgEl.height * sRatio;
      const dx = (offscreen.width - dw) / 2;
      const dy = (offscreen.height - dh) / 2;
      ctx.drawImage(imgEl, dx, dy, dw, dh);

      const pattern = new fabric.Pattern({
        source: offscreen,
        repeat: 'no-repeat'
      });

      child.set({
        fill: pattern,
        stroke: null,
        strokeWidth: 0,
        custom: { ...(child.custom || {}), isPhotoPlaceholder: true, isFilled: true }
      });

      if (group._objects) {
        group._objects.forEach(o => {
          const n = (o.name || '').toLowerCase();
          if (n.includes('camera') || n.includes('hint') || n.includes('tap to replace') || n.includes('slot text') || n.includes('viewport hint')) {
            o.set('visible', false);
          }
        });
      }

      group.dirty = true;
      this.canvas.requestRenderAll();
      this.app.toast?.('Photo placed into element');
      return child;
    } catch (err) {
      console.error('fillGroupChildPlaceholder error', err);
      this.app.toast?.('Failed to fill element photo slot', true);
      return null;
    } finally {
      hm?.endBulk();
      this.app.historyManager?.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  async fillMaskedGroup(host, fileOrDataUrl) {
    if (host && host.clipPath && host.type === 'group' && host._objects && host._objects.some(o => o.type === 'image')) {
      return await this.replaceClipMaskImage(host, fileOrDataUrl);
    }
    const maskData = (host.custom && host.custom._maskData) || null;
    const sceneData = this._clipSceneData(host);
    const hm = this.app.historyManager;
    hm?.beginBulk();
    try {
      this.canvas.setActiveObject(host);
      const content = this._releaseCore();
      if (content) {
        const pool = Array.isArray(content) ? content : [content];
        pool.forEach(c => this.canvas.remove(c));
      }
      // _restoreMaskShape already calls canvas.add(), so do NOT add again
      const restoredMask = maskData ? await this._restoreMaskShape(maskData, sceneData) : null;
      if (restoredMask) {
        return await this.fillStandalonePlaceholder(restoredMask, fileOrDataUrl);
      }
    } catch (e) {
      console.error('fillMaskedGroup error', e);
    } finally {
      hm?.endBulk();
    }
    return null;
  }

  /**
   * Replace the image content inside a masked group in-place, without
   * releasing and re-creating the mask. Much more stable than the
   * release→rebuild pipeline.
   */
  async replaceClipMaskImage(host, fileOrDataUrl) {
    if (!host || !host.clipPath) return null;
    const hm = this.app.historyManager;
    hm?.beginBulk();
    try {
      const dataUrl = await this._readFileAsDataURL(fileOrDataUrl);
      if (!dataUrl) return null;
      const newImg = await fabric.FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
      if (!newImg) return null;

      // Find the image child inside the group
      let imgChild = null;
      if (host.type === 'group' && host._objects) {
        imgChild = host._objects.find(o => o.type === 'image');
      }

      if (imgChild) {
        // Replace the image source in-place with cover-crop sizing
        const slotW = (imgChild.width || 100) * (imgChild.scaleX || 1);
        const slotH = (imgChild.height || 100) * (imgChild.scaleY || 1);
        const scale = Math.max(slotW / (newImg.width || 1), slotH / (newImg.height || 1));
        imgChild.setElement(newImg.getElement());
        imgChild.set({
          scaleX: scale,
          scaleY: scale,
          width: newImg.width,
          height: newImg.height
        });
        imgChild.setCoords();
        host.dirty = true;
        this.canvas.requestRenderAll();
        this.app.toast?.('Image replaced inside mask');
      } else {
        // Fallback: release and re-create
        return await this.fillMaskedGroup(host, fileOrDataUrl);
      }
      return host;
    } catch (e) {
      console.error('replaceClipMaskImage error', e);
      this.app.toast?.('Failed to replace masked image', true);
      return null;
    } finally {
      hm?.endBulk();
      this.app.historyManager?.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  async fillPlaceholderWithImage(placeholderTarget, fileOrDataUrl) {
    if (!placeholderTarget) return null;

    let type = 'standalone';
    let obj = null;
    let group = null;
    let child = null;

    if (placeholderTarget.type === 'group-child') {
      type = 'group-child';
      group = placeholderTarget.group;
      child = placeholderTarget.child;
    } else if (placeholderTarget.type === 'masked-group') {
      type = 'masked-group';
      obj = placeholderTarget.obj;
    } else if (placeholderTarget.type === 'standalone') {
      type = 'standalone';
      obj = placeholderTarget.obj;
    } else if (placeholderTarget.group && placeholderTarget.child) {
      type = 'group-child';
      group = placeholderTarget.group;
      child = placeholderTarget.child;
    } else if (placeholderTarget.custom?.maskWrap || (placeholderTarget.clipPath && placeholderTarget.type === 'group')) {
      type = 'masked-group';
      obj = placeholderTarget;
    } else if (placeholderTarget.type === 'group' && placeholderTarget._objects) {
      const pChild = placeholderTarget._objects.find(c => this._isPlaceholderShape(c));
      if (pChild) {
        type = 'group-child';
        group = placeholderTarget;
        child = pChild;
      } else {
        type = 'standalone';
        obj = placeholderTarget;
      }
    } else {
      type = 'standalone';
      obj = placeholderTarget;
    }

    if (type === 'group-child') {
      return await this.fillGroupChildPlaceholder(group, child, fileOrDataUrl);
    } else if (type === 'masked-group') {
      return await this.fillMaskedGroup(obj, fileOrDataUrl);
    } else {
      return await this.fillStandalonePlaceholder(obj, fileOrDataUrl);
    }
  }

  /* ------------------- mask edit (isolation) mode ------------------- */

  /**
   * True mask editing: the clip is temporarily removed and a dashed
   * outline shows the FIXED mask window on the page. The content can now
   * be moved / scaled / rotated freely under that window (like editing
   * contents inside an Illustrator mask). Esc / "Done" re-applies the
   * clip to the window; the content keeps its new composition.
   */
  async editClipMask() {
    if (this._maskEdit) return;
    const host = this.canvas.getActiveObject();
    if (!host || !host.clipPath) return;
    const sceneData = this._clipSceneData(host);
    if (!sceneData) return;
    const origClip = host.clipPath ? JSON.parse(JSON.stringify(host.clipPath.toObject(['custom']))) : null;
    if (origClip) { delete origClip.id; delete origClip.clipPath; }

    this._maskEdit = { host, sceneData, origClip, ghost: null };
    this.app.historyManager.beginBulk();
    try {
      host.set('clipPath', null);
      host.setCoords();
      const [ghost] = await fabric.util.enlivenObjects([sceneData], { canvas: this.canvas });
      if (ghost) {
        ghost.set({
          name: 'Mask outline',
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          fill: 'rgba(123,70,248,0.07)',
          stroke: '#a78bfa',
          strokeWidth: 2,
          strokeDashArray: [8, 6],
          strokeUniform: true,
          opacity: 0.95,
          lockMovementX: true,
          lockMovementY: true
        });
        this.canvas.add(ghost);
        this._maskEdit.ghost = ghost;
      }
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(host);
      this.canvas.requestRenderAll();
      document.dispatchEvent(new CustomEvent('prosy:maskEditChanged', { detail: { editing: true } }));
      this.app.toast?.('Mask edit — move/scale/rotate the content freely; the dashed outline is the mask window. Esc / Done to re-apply.');
    } catch (e) {
      console.error('editClipMask failed', e);
      this.app.historyManager.endBulk();
      this._maskEdit = null;
      document.dispatchEvent(new CustomEvent('prosy:maskEditChanged', { detail: { editing: false } }));
    }
  }

  /** re-apply the mask: window stays where it was, content keeps its new pose */
  async finishMaskEdit() {
    const me = this._maskEdit;
    if (!me) return;
    this._maskEdit = null;
    const hm = this.app.historyManager;
    try {
      const clip = await this._sceneShapeToClip(me.host, me.sceneData);
      me.host.set('clipPath', clip);
      me.host.setCoords();
      if (me.ghost) this.canvas.remove(me.ghost);
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(me.host);
      this.canvas.requestRenderAll();
      this.app.toast?.('Mask re-applied');
    } catch (e) {
      console.error('finishMaskEdit failed', e);
    } finally {
      hm.endBulk();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      document.dispatchEvent(new CustomEvent('prosy:maskEditChanged', { detail: { editing: false } }));
    }
  }

  /** leave edit mode and restore the previous clip geometry (no reframe) */
  async cancelMaskEdit() {
    const me = this._maskEdit;
    if (!me) return;
    this._maskEdit = null;
    const hm = this.app.historyManager;
    try {
      if (me.origClip) {
        const [clip] = await fabric.util.enlivenObjects([me.origClip], { canvas: this.canvas });
        if (clip) {
          clip.set({
            selectable: false, evented: false, hasControls: false, hasBorders: false,
            lockMovementX: true, lockMovementY: true, name: undefined
          });
          me.host.set('clipPath', clip);
          me.host.setCoords();
        }
      }
      if (me.ghost) this.canvas.remove(me.ghost);
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(me.host);
      this.canvas.requestRenderAll();
    } finally {
      hm.endBulk();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
      document.dispatchEvent(new CustomEvent('prosy:maskEditChanged', { detail: { editing: false } }));
    }
  }

  get maskEditing() {
    return !!this._maskEdit;
  }

  /** scene-space window shape → host-local clipPath */
  async _sceneShapeToClip(host, sceneData) {
    const [clip] = await fabric.util.enlivenObjects([sceneData], { canvas: this.canvas });
    const inv = fabric.util.invertTransform(host.calcTransformMatrix());
    const p = fabric.util.transformPoint(new fabric.Point(sceneData.left, sceneData.top), inv);
    clip.set({
      left: p.x,
      top: p.y,
      originX: 'left',
      originY: 'top',
      scaleX: (sceneData.scaleX || 1) / (host.scaleX || 1),
      scaleY: (sceneData.scaleY || 1) / (host.scaleY || 1),
      angle: (((sceneData.angle || 0) - (host.angle || 0)) % 360 + 360) % 360,
      stroke: '',
      strokeWidth: 0,
      strokeDashArray: null,
      fill: '#000000',
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      opacity: 1,
      name: undefined
    });
    return clip;
  }

  hasClipMaskSelection() {
    const objs = this.canvas.getActiveObjects();
    if (objs.length !== 1) return false;
    const o = objs[0];
    if (o.clipPath) return true;
    return o.type === 'group' && !!(o.custom && o.custom.maskWrap) && !!o.clipPath;
  }

  /* ------------------------- hyperlink helpers ------------------------ */

  setHyperlink(url) {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => {
      o.set('custom', { ...(o.custom || {}), hyperlink: url || '' });
    });
    this._commit();
    this.app.toast?.(`Hyperlink ${url ? 'added' : 'removed'}`);
  }

  removeHyperlink() {
    const objs = this.canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => {
      const c = { ...(o.custom || {}) };
      delete c.hyperlink;
      o.set('custom', c);
    });
    this._commit();
    this.app.toast?.('Hyperlink removed');
  }

  /* ------------------------- page helpers -------------------------- */

  addPageAfterCurrent() {
    const pm = this.app.pageManager;
    pm.saveCurrentPage();
    const page = pm.addPage(pm.currentIndex + 1, PageTitle(pm));
    pm.switchPage(pm.pages.indexOf(page));
  }
}

function PageTitle(pm) {
  let n = pm.pages.length + 1;
  return `Page ${n}`;
}
