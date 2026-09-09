/**
 * On-canvas corner-radius handle for rounded rectangles.
 *
 * When a rect (with a visible radius) is selected, an extra control sits
 * on the arc centre of its top-right corner. Dragging it left increases
 * the radius (until the rect becomes a pill), dragging it back to the
 * corner edge drives it to 0. rx/ry always stay equal (uniform radius,
 * in the object's local units, so it behaves correctly under scale).
 *
 * The control is a fabric.Control attached to each rect instance's
 * `controls` map; visibility is driven by selection + rx so it never
 * collides with the corner scale handles (hidden while rx ≈ 0).
 */
import * as fabric from 'fabric';

const MIN_VISIBLE_RX_PX = 4; // screen px of radius before the handle appears

let shared = null;

function getControl() {
  if (shared) return shared;

  // Position: local coords relative to the object's origin point
  // (origin 'left'/'top' for rects) at the arc centre of the top-right
  // corner: (width - rx, rx). Like fabric's own path controls we map
  // through viewport × calcTransformMatrix.
  const positionHandler = function positionHandler(_dim, _finalMatrix, obj) {
    const rx = Math.max(0, obj.rx || 0);
    const vpt = obj.canvas ? obj.canvas.viewportTransform : fabric.iMatrix;
    const pt = new fabric.Point((obj.width || 0) - rx, rx);
    return pt.transform(fabric.util.multiplyTransformMatrices(vpt, obj.calcTransformMatrix()));
  };

  const actionHandler = function actionHandler(_eventData, transform, x, y) {
    const obj = transform.target;
    if (!obj) return false;
    let local;
    try {
      // scene pointer → object local (pre-scale) units
      local = fabric.util.sendPointToPlane(new fabric.Point(x, y), undefined, obj.calcTransformMatrix());
    } catch (e) {
      return false;
    }
    // Distance of the pointer from the right edge along the top edge.
    // At the arc centre (width - rx) this reads the current rx.
    const max = Math.max(0, Math.min(obj.width, obj.height) / 2);
    let r = (obj.width || 0) - local.x;
    r = Math.min(Math.max(0, Math.round(r * 2) / 2), max);
    if ((obj.rx || 0) !== r) {
      obj.set({ rx: r, ry: r });
      obj.dirty = true;
      obj.setCoords();
      if (obj.canvas) obj.canvas.requestRenderAll();
    }
    return true;
  };

  // Small ring with a dot so it reads as a draggable handle on any fill.
  // NOTE: like fabric's own control renderers, the context is translated
  // to the control centre by commonRenderProps — draw around (0,0).
  const render = function renderRadiusHandle(ctx, left, top, styleOverride, fabricObject) {
    ctx.save();
    const { xSize, ySize } = this.commonRenderProps(ctx, left, top, fabricObject, styleOverride);
    const rr = (Math.min(xSize, ySize) || 12) / 2;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(0, 0, rr * 0.58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(123,70,248,0.95)';
    ctx.beginPath();
    ctx.arc(0, 0, rr * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  shared = new fabric.Control({
    x: 0,
    y: 0,
    actionName: 'cornerRadius',
    cursorStyle: 'crosshair',
    sizeX: 13,
    sizeY: 13,
    cornerSize: 13,
    positionHandler,
    actionHandler,
    render
  });
  return shared;
}

/** Attach the radius control to a rect instance (idempotent, hidden by default). */
export function ensureRadiusControl(obj) {
  if (!obj || obj.type !== 'rect' || !obj.controls || obj.controls.cornerRadius) return;
  obj.controls.cornerRadius = getControl();
  obj.setControlVisible('cornerRadius', false);
}

/** Show the handle only when the radius is actually visible on screen. */
export function refreshRadiusControl(obj) {
  if (!obj || obj.type !== 'rect' || !obj.controls || !obj.controls.cornerRadius) return;
  const visualRx = (obj.rx || 0) * Math.abs(obj.scaleX || 1);
  const selectable = obj.selectable !== false && obj.evented !== false && obj.visible !== false;
  obj.setControlVisible('cornerRadius', !!selectable && visualRx >= MIN_VISIBLE_RX_PX);
}

/**
 * Wire the app canvas: attach on every added rect (incl. revived from
 * JSON / clones) and refresh visibility on selection & edits.
 */
export function installRadiusControls(canvas) {
  canvas.on('object:added', (e) => {
    const o = e.target;
    if (o && o.type === 'rect') {
      ensureRadiusControl(o);
      if (canvas.getActiveObject() === o) refreshRadiusControl(o);
    }
  });

  const refreshActive = () => {
    canvas.getActiveObjects().forEach(o => {
      if (o.type === 'rect') refreshRadiusControl(o);
    });
  };
  canvas.on('selection:created', refreshActive);
  canvas.on('selection:updated', refreshActive);
  canvas.on('selection:cleared', refreshActive);
  canvas.on('object:modified', refreshActive);
  document.addEventListener('prosy:objectEdited', refreshActive);
  document.addEventListener('prosy:pageSwitched', refreshActive);
}
