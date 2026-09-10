import * as fabric from 'fabric';

/**
 * RadiusControl — Figma-Style 4-Corner Radius System for Prosy
 *
 * Provides:
 * 1. Independent 4-corner radii (Top-Left, Top-Right, Bottom-Right, Bottom-Left)
 * 2. On-canvas interactive circular corner radius handles on all 4 corners
 * 3. Alt-key or independent mode for editing a single corner
 * 4. Automatic history tracking and properties panel sync
 */

export function getCornerRadii(obj) {
  const maxR = Math.min((obj.width || 0) / 2, (obj.height || 0) / 2);
  if (Array.isArray(obj.cornerRadii) && obj.cornerRadii.length === 4) {
    return obj.cornerRadii.map(r => Math.max(0, Math.min(maxR, Number(r) || 0)));
  }
  const r = Math.max(0, Math.min(maxR, Number(obj.rx) || 0));
  return [r, r, r, r];
}

let patchedRectRender = false;

function patchRectRender() {
  if (patchedRectRender) return;
  patchedRectRender = true;

  fabric.Rect.prototype._render = function(ctx) {
    const w = this.width || 0;
    const h = this.height || 0;
    const hw = -w / 2;
    const hh = -h / 2;
    const [tl, tr, br, bl] = getCornerRadii(this);

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(hw, hh, w, h, [tl, tr, br, bl]);
    } else {
      ctx.moveTo(hw + tl, hh);
      ctx.lineTo(hw + w - tr, hh);
      ctx.quadraticCurveTo(hw + w, hh, hw + w, hh + tr);
      ctx.lineTo(hw + w, hh + h - br);
      ctx.quadraticCurveTo(hw + w, hh + h, hw + w - br, hh + h);
      ctx.lineTo(hw + bl, hh + h);
      ctx.quadraticCurveTo(hw, hh + h, hw, hh + h - bl);
      ctx.lineTo(hw, hh + tl);
      ctx.quadraticCurveTo(hw, hh, hw + tl, hh);
    }
    ctx.closePath();
    this._renderPaintInOrder(ctx);
  };
}

// Render clean Figma-style circular handle (white circle with purple border)
function renderCircleHandle(ctx, left, top) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(left, top, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#7b46f8';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function createRadiusAction(cornerIndex) {
  return function(eventData, transform, x, y) {
    const target = transform.target;
    if (!target || target.type !== 'rect') return false;

    let localPoint;
    try {
      localPoint = fabric.util.transformPoint(
        new fabric.Point(x, y),
        fabric.util.invertTransform(target.calcTransformMatrix())
      );
    } catch (_) {
      return false;
    }

    const w = target.width || 0;
    const h = target.height || 0;
    const maxR = Math.min(w / 2, h / 2);

    let dist = 0;
    if (cornerIndex === 0) { // TL (-w/2, -h/2)
      const dx = localPoint.x - (-w / 2);
      const dy = localPoint.y - (-h / 2);
      dist = (dx + dy) / 2;
    } else if (cornerIndex === 1) { // TR (w/2, -h/2)
      const dx = (w / 2) - localPoint.x;
      const dy = localPoint.y - (-h / 2);
      dist = (dx + dy) / 2;
    } else if (cornerIndex === 2) { // BR (w/2, h/2)
      const dx = (w / 2) - localPoint.x;
      const dy = (h / 2) - localPoint.y;
      dist = (dx + dy) / 2;
    } else if (cornerIndex === 3) { // BL (-w/2, h/2)
      const dx = localPoint.x - (-w / 2);
      const dy = (h / 2) - localPoint.y;
      dist = (dx + dy) / 2;
    }

    const newR = Math.round(Math.max(0, Math.min(maxR, dist)));
    const current = getCornerRadii(target);

    // Alt key or explicit independent mode adjusts single corner; otherwise all corners
    const isSingle = eventData.altKey || Boolean(target._independentCorners);
    if (isSingle) {
      current[cornerIndex] = newR;
      target.cornerRadii = [...current];
      target._independentCorners = true;
    } else {
      target.cornerRadii = [newR, newR, newR, newR];
      target.rx = newR;
      target.ry = newR;
    }

    target.dirty = true;
    if (target.canvas) target.canvas.requestRenderAll();
    document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { source: 'canvas-radius', target } }));
    return true;
  };
}

function handleRadiusMouseUp(eventData, transform) {
  const app = typeof window !== 'undefined' ? window.__editorApp : null;
  if (app?.historyManager) {
    app.historyManager.saveState();
  }
  document.dispatchEvent(new CustomEvent('prosy:objectEdited', { detail: { target: transform.target } }));
}

const CORNER_HANDLES = [
  {
    key: 'cr_tl',
    index: 0,
    x: -0.5,
    y: -0.5,
    pos: (dim, obj) => {
      const [tl] = getCornerRadii(obj);
      const inset = Math.max(14, Math.min(dim.x / 2 - 4, dim.y / 2 - 4, tl + 6));
      return { x: -dim.x / 2 + inset, y: -dim.y / 2 + inset };
    }
  },
  {
    key: 'cr_tr',
    index: 1,
    x: 0.5,
    y: -0.5,
    pos: (dim, obj) => {
      const [, tr] = getCornerRadii(obj);
      const inset = Math.max(14, Math.min(dim.x / 2 - 4, dim.y / 2 - 4, tr + 6));
      return { x: dim.x / 2 - inset, y: -dim.y / 2 + inset };
    }
  },
  {
    key: 'cr_br',
    index: 2,
    x: 0.5,
    y: 0.5,
    pos: (dim, obj) => {
      const [, , br] = getCornerRadii(obj);
      const inset = Math.max(14, Math.min(dim.x / 2 - 4, dim.y / 2 - 4, br + 6));
      return { x: dim.x / 2 - inset, y: dim.y / 2 - inset };
    }
  },
  {
    key: 'cr_bl',
    index: 3,
    x: -0.5,
    y: 0.5,
    pos: (dim, obj) => {
      const [, , , bl] = getCornerRadii(obj);
      const inset = Math.max(14, Math.min(dim.x / 2 - 4, dim.y / 2 - 4, bl + 6));
      return { x: -dim.x / 2 + inset, y: dim.y / 2 - inset };
    }
  }
];

export function ensureRadiusControl(obj) {
  if (!obj || obj.type !== 'rect') return;
  if (!obj.controls) obj.controls = {};

  patchRectRender();

  CORNER_HANDLES.forEach(cfg => {
    if (obj.controls[cfg.key]) return;
    obj.controls[cfg.key] = new fabric.Control({
      x: cfg.x,
      y: cfg.y,
      cursorStyle: 'crosshair',
      actionName: 'cornerRadius',
      actionHandler: createRadiusAction(cfg.index),
      mouseUpHandler: handleRadiusMouseUp,
      getVisibility: function(fabricObject) {
        if (!fabricObject || fabricObject.type !== 'rect') return false;
        return (fabricObject.width || 0) >= 30 && (fabricObject.height || 0) >= 30;
      },
      positionHandler: function(dim, finalMatrix, fabricObject) {
        const p = cfg.pos(dim, fabricObject);
        return new fabric.Point(p.x, p.y).transform(finalMatrix);
      },
      render: renderCircleHandle
    });
  });
}

export function refreshRadiusControl(obj) {
  if (!obj || obj.type !== 'rect') return;
  ensureRadiusControl(obj);
  CORNER_HANDLES.forEach(cfg => {
    const isVis = (obj.width || 0) >= 30 && (obj.height || 0) >= 30;
    obj.setControlVisible(cfg.key, isVis);
  });
}

export function installRadiusControls(canvas) {
  patchRectRender();

  canvas.on('object:added', (e) => {
    const o = e.target;
    if (o && o.type === 'rect') {
      ensureRadiusControl(o);
      if (canvas.getActiveObject() === o) refreshRadiusControl(o);
    }
  });

  const refreshActive = () => {
    canvas.getActiveObjects().forEach(o => {
      if (o && o.type === 'rect') refreshRadiusControl(o);
    });
  };

  canvas.on('selection:created', refreshActive);
  canvas.on('selection:updated', refreshActive);
  canvas.on('selection:cleared', refreshActive);
  canvas.on('object:modified', refreshActive);
  document.addEventListener('prosy:objectEdited', refreshActive);
  document.addEventListener('prosy:pageSwitched', refreshActive);
}
