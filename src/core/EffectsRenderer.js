import * as fabric from 'fabric';

/**
 * EffectsRenderer — Figma-Style Visual Effects for Prosy
 * Provides:
 * 1. Background Blur (Frosted Glass / Glassmorphism)
 * 2. Gaussian Blur (True Object Diffusion)
 * 3. Outer Glow (Luminescent Neon Aura)
 *
 * 100% decoupled from Drop Shadow (`obj.shadow`).
 */

let installed = false;

export function installEffectsRenderer() {
  if (installed) return;
  installed = true;

  const FabricObjectProto = fabric.FabricObject.prototype;

  // 1. Serialization — include effects properties
  const origToObject = FabricObjectProto.toObject;
  FabricObjectProto.toObject = function(propertiesToInclude = []) {
    const extra = [
      '_blurType', '_blurRadius', '_glowActive', '_glowColor', '_glowRadius',
      'isQRCode', 'isCodeSnippet', 'codeData', 'cornerRadii', '_independentCorners'
    ];
    const merged = Array.from(new Set([...(propertiesToInclude || []), ...extra]));
    return origToObject.call(this, merged);
  };

  // 2. Bypass cache when visual effects are active (prevents bounding box clipping & enables backdrop sampling)
  const origShouldCache = FabricObjectProto.shouldCache;
  FabricObjectProto.shouldCache = function() {
    if (this._glowActive || (this._blurType && this._blurType !== 'none' && this._blurRadius > 0)) {
      return false;
    }
    return origShouldCache ? origShouldCache.call(this) : false;
  };

  // 3. Intercept drawObject for all Fabric shapes, text, paths, images, and groups
  const origDrawObject = FabricObjectProto.drawObject;
  FabricObjectProto.drawObject = function(ctx, forClipping, context) {
    if (forClipping) {
      return origDrawObject.call(this, ctx, forClipping, context);
    }

    // A. Outer Glow Effect (Independent neon luminescent aura)
    if (this._glowActive && this._glowRadius > 0) {
      ctx.save();
      ctx.shadowColor = this._glowColor || '#00F0FF';
      ctx.shadowBlur = Math.round(this._glowRadius * 2);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      if (typeof this._render === 'function') {
        this._render(ctx);
      } else {
        ctx.fillStyle = this._glowColor || '#00F0FF';
        ctx.beginPath();
        _traceObjectGeometry(this, ctx);
        ctx.fill();
      }
      ctx.restore();
    }

    // B. Background Blur (Frosted Glass / Backdrop Sampling ala Figma)
    if (this._blurType === 'background' && this._blurRadius > 0) {
      const lowerCanvas = this.canvas?.lowerCanvasEl || this.canvas?.getElement?.();
      if (lowerCanvas) {
        ctx.save();
        // 1. Clip to the object's geometry in local space
        ctx.beginPath();
        _traceObjectGeometry(this, ctx);
        ctx.clip();

        // 2. Sample and blur underlying canvas backdrop
        const scale = this.canvas?.getRetinaScaling ? this.canvas.getRetinaScaling() : 1;
        ctx.filter = `blur(${this._blurRadius * scale}px)`;
        ctx.save();
        ctx.resetTransform();
        ctx.drawImage(lowerCanvas, 0, 0, lowerCanvas.width, lowerCanvas.height);
        ctx.restore();
        ctx.filter = 'none';
        ctx.restore();
      }
    }

    // C. Gaussian Blur on Object
    let resetBlur = false;
    if (this._blurType === 'gaussian' && this._blurRadius > 0) {
      ctx.filter = `blur(${this._blurRadius}px)`;
      resetBlur = true;
    }

    // Call standard draw (draws fills, strokes, text, paths, images)
    origDrawObject.call(this, ctx, forClipping, context);

    if (resetBlur) {
      ctx.filter = 'none';
    }
  };
}

/**
 * Traces the 2D path geometry of an object centered at (0, 0)
 */
export function _traceObjectGeometry(obj, ctx) {
  if (typeof obj._renderPathCommands === 'function') {
    obj._renderPathCommands(ctx);
    return;
  }
  const w = obj.width || 100;
  const h = obj.height || 100;
  const hw = w / 2;
  const hh = h / 2;

  if (obj.type === 'rect') {
    const maxR = Math.min(hw, hh);
    const radii = (Array.isArray(obj.cornerRadii) && obj.cornerRadii.length === 4)
      ? obj.cornerRadii.map(r => Math.max(0, Math.min(maxR, r || 0)))
      : [Math.min(obj.rx || 0, maxR), Math.min(obj.rx || 0, maxR), Math.min(obj.rx || 0, maxR), Math.min(obj.rx || 0, maxR)];

    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-hw, -hh, w, h, radii);
    } else {
      ctx.rect(-hw, -hh, w, h);
    }
  } else if (obj.type === 'circle') {
    ctx.arc(0, 0, obj.radius || hw, 0, Math.PI * 2);
  } else if (obj.type === 'ellipse') {
    ctx.ellipse(0, 0, obj.rx || hw, obj.ry || hh, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(-hw, -hh, w, h);
  }
}

/**
 * Apply Blur Effect (Gaussian or Background Frosted Glass) to an object
 */
export function applyBlurEffect(obj, type, radius) {
  obj._blurType = type; // 'none' | 'gaussian' | 'background'
  obj._blurRadius = Math.max(0, radius || 0);

  const needsDirectCanvas = (type === 'background' || type === 'gaussian' || obj._glowActive);
  obj.objectCaching = !needsDirectCanvas;
  obj.dirty = true;
}

/**
 * Apply Outer Glow Effect to an object
 */
export function applyGlowEffect(obj, active, color, radius) {
  obj._glowActive = Boolean(active);
  obj._glowColor = color || '#00F0FF';
  obj._glowRadius = Math.max(1, radius || 20);

  const needsDirectCanvas = (obj._glowActive || obj._blurType === 'background' || obj._blurType === 'gaussian');
  obj.objectCaching = !needsDirectCanvas;
  obj.dirty = true;
}

// Automatically install on load
installEffectsRenderer();
