import * as fabric from 'fabric';
import * as StackBlur from 'stackblur-canvas';

/**
 * EffectsRenderer — Figma-Style Visual Effects for Prosy
 * Provides:
 * 1. Background Blur (Frosted Glass / Glassmorphism) with Mobile Safari fallback
 * 2. Gaussian Blur (True Object Diffusion) with Mobile Safari fallback
 * 3. Outer Glow (Luminescent Neon Aura)
 *
 * 100% decoupled from Drop Shadow (`obj.shadow`).
 * Fully cross-browser compatible (iOS Safari, Android Chrome, desktop browsers).
 */

let installed = false;
let _supportsFilter = null;

/**
 * Detects if the browser's CanvasRenderingContext2D genuinely supports and executes
 * the CSS filter property (e.g. Chrome, Firefox).
 * Safari on iOS / iPadOS does not implement ctx.filter and simply ignores it.
 */
export function supportsCanvasFilter() {
  if (_supportsFilter !== null) return _supportsFilter;
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx || typeof ctx.filter !== 'string') {
      _supportsFilter = false;
      return false;
    }
    ctx.filter = 'blur(2px)';
    if (ctx.filter !== 'blur(2px)') {
      _supportsFilter = false;
      return false;
    }

    // Verify browser actually renders the blur operation to canvas pixels
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2, 2);
    const c2 = document.createElement('canvas');
    c2.width = 4;
    c2.height = 4;
    const ctx2 = c2.getContext('2d', { willReadFrequently: true });
    ctx2.filter = 'blur(2px)';
    ctx2.drawImage(c, 0, 0);
    const data = ctx2.getImageData(0, 0, 4, 4).data;
    // When filter actually diffuses pixels, neighboring pixel (3, 0) receives diffused color
    _supportsFilter = Boolean(data[12] > 0 || (data[0] < 250 && data[0] > 0));
    return _supportsFilter;
  } catch (e) {
    _supportsFilter = false;
    return false;
  }
}

// Reusable scratch canvases to eliminate allocations and garbage collection spikes
let _blurScratch = null;
let _blurScratchCtx = null;
function getBlurScratch(w, h) {
  if (!_blurScratch) {
    _blurScratch = document.createElement('canvas');
    _blurScratchCtx = _blurScratch.getContext('2d', { willReadFrequently: true });
  }
  if (_blurScratch.width !== w || _blurScratch.height !== h) {
    _blurScratch.width = w;
    _blurScratch.height = h;
  }
  return { canvas: _blurScratch, ctx: _blurScratchCtx };
}

let _bgSampleCanvas = null;
let _bgSampleCtx = null;
function getBgSampleCanvas(w, h) {
  if (!_bgSampleCanvas) {
    _bgSampleCanvas = document.createElement('canvas');
    _bgSampleCtx = _bgSampleCanvas.getContext('2d', { willReadFrequently: true });
  }
  if (_bgSampleCanvas.width !== w || _bgSampleCanvas.height !== h) {
    _bgSampleCanvas.width = w;
    _bgSampleCanvas.height = h;
  }
  return { canvas: _bgSampleCanvas, ctx: _bgSampleCtx };
}

let _gaussianBuffer = null;
let _gaussianBufferCtx = null;
function getGaussianBuffer(w, h) {
  if (!_gaussianBuffer) {
    _gaussianBuffer = document.createElement('canvas');
    _gaussianBufferCtx = _gaussianBuffer.getContext('2d', { willReadFrequently: true });
  }
  if (_gaussianBuffer.width !== w || _gaussianBuffer.height !== h) {
    _gaussianBuffer.width = w;
    _gaussianBuffer.height = h;
  }
  return { canvas: _gaussianBuffer, ctx: _gaussianBufferCtx };
}

/**
 * Fast CPU StackBlur fallback with intelligent 2x downsampling on mobile
 * for ultra-fast, buttery smooth 60fps rendering.
 */
export function applyFastBlur(canvas, width, height, radius) {
  const r = Math.round(radius);
  if (r <= 0 || width <= 0 || height <= 0) return;

  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth <= 768 ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
  );

  const shouldDownsample = isMobile || (width * height > 250 * 250);
  const downScale = shouldDownsample ? 0.5 : 1.0;

  if (downScale < 1.0) {
    const sw = Math.max(2, Math.round(width * downScale));
    const sh = Math.max(2, Math.round(height * downScale));
    const { canvas: sc, ctx: sctx } = getBlurScratch(sw, sh);
    sctx.clearRect(0, 0, sw, sh);
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'medium';
    sctx.drawImage(canvas, 0, 0, width, height, 0, 0, sw, sh);

    const effRadius = Math.max(1, Math.min(50, Math.round(r * downScale)));
    try {
      StackBlur.canvasRGBA(sc, 0, 0, sw, sh, effRadius);
    } catch (e) {
      console.warn('StackBlur downscale fallback error:', e);
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sc, 0, 0, sw, sh, 0, 0, width, height);
  } else {
    try {
      StackBlur.canvasRGBA(canvas, 0, 0, width, height, Math.min(50, r));
    } catch (e) {
      console.warn('StackBlur fallback error:', e);
    }
  }
}

/**
 * Shared effects rendering interceptor for Fabric objects and Groups
 */
function executeEffectsDraw(obj, origDraw, ctx, forClipping, context) {
  if (forClipping) {
    return origDraw.call(obj, ctx, forClipping, context);
  }

  // A. Outer Glow Effect (Independent neon luminescent aura)
  if (obj._glowActive && obj._glowRadius > 0) {
    ctx.save();
    ctx.shadowColor = obj._glowColor || '#00F0FF';
    ctx.shadowBlur = Math.round(obj._glowRadius * 2);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    if (typeof obj._render === 'function') {
      obj._render(ctx);
    } else {
      ctx.fillStyle = obj._glowColor || '#00F0FF';
      ctx.beginPath();
      _traceObjectGeometry(obj, ctx);
      ctx.fill();
    }
    ctx.restore();
  }

  // B. Background Blur (Frosted Glass / Backdrop Sampling ala Figma)
  const blurRadius = Math.max(0, obj._blurRadius || obj._blurValue || 0);
  if (obj._blurType === 'background' && blurRadius > 0) {
    const targetCanvas = obj.canvas || obj.group?.canvas || context?.canvas || null;
    const lowerCanvas = targetCanvas?.lowerCanvasEl || targetCanvas?.getElement?.() || ctx.canvas;

    if (lowerCanvas && lowerCanvas.width > 0 && lowerCanvas.height > 0) {
      ctx.save();
      // 1. Clip to the object's geometry in local space
      ctx.beginPath();
      _traceObjectGeometry(obj, ctx);
      ctx.clip();

      // 2. Sample underlying canvas backdrop
      const scale = targetCanvas?.getRetinaScaling ? targetCanvas.getRetinaScaling() : (window.devicePixelRatio || 1);

      // Calculate bounding box on canvas in device pixels to sample only the required region
      let sx = 0, sy = 0, sw = lowerCanvas.width, sh = lowerCanvas.height;
      const bbox = (typeof obj.getBoundingRect === 'function') ? obj.getBoundingRect() : null;
      if (bbox) {
        const pad = Math.ceil(blurRadius * scale * 2);
        sx = Math.max(0, Math.floor(bbox.left * scale - pad));
        sy = Math.max(0, Math.floor(bbox.top * scale - pad));
        const ex = Math.min(lowerCanvas.width, Math.ceil((bbox.left + bbox.width) * scale + pad));
        const ey = Math.min(lowerCanvas.height, Math.ceil((bbox.top + bbox.height) * scale + pad));
        const isMobile = typeof window !== 'undefined' && (
          window.innerWidth <= 768 ||
          /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
        );
        const maxDim = isMobile ? 800 : 2048;
        sw = Math.min(sw, maxDim);
        sh = Math.min(sh, maxDim);

        if (sw > 0 && sh > 0) {
          // Copy to sampleCanvas first: solves WebKit canvas self-draw feedback bug on iOS/Safari
          const { canvas: sampleCanvas, ctx: sampleCtx } = getBgSampleCanvas(sw, sh);
          sampleCtx.clearRect(0, 0, sw, sh);
          sampleCtx.drawImage(lowerCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

          ctx.save();
          ctx.resetTransform();

          if (supportsCanvasFilter()) {
            ctx.filter = `blur(${blurRadius * scale}px)`;
            ctx.drawImage(sampleCanvas, 0, 0, sw, sh, sx, sy, sw, sh);
            ctx.filter = 'none';
          } else {
            // Mobile Safari / iOS fallback: StackBlur on sample canvas
            applyFastBlur(sampleCanvas, sw, sh, blurRadius * scale);
            ctx.drawImage(sampleCanvas, 0, 0, sw, sh, sx, sy, sw, sh);
          }

          ctx.restore();
        }

        ctx.restore();
      }
    }
  }

  // C. Gaussian Blur on Object
  let resetBlur = false;
  let didCustomBlurDraw = false;

  if (obj._blurType === 'gaussian' && blurRadius > 0) {
    if (supportsCanvasFilter()) {
      ctx.filter = `blur(${blurRadius}px)`;
      resetBlur = true;
    } else {
      // Mobile Safari / iOS fallback:
      // Render object into an offscreen canvas with blur padding, blur it, and draw to ctx
      const w = Math.ceil(obj.width || 100);
      const h = Math.ceil(obj.height || 100);
      const pad = Math.ceil(blurRadius * 3);
      const isMobile = typeof window !== 'undefined' && (
        window.innerWidth <= 768 ||
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
      );
      const maxDim = isMobile ? 800 : 2048;
      const bufW = Math.min(maxDim, w + pad * 2);
      const bufH = Math.min(maxDim, h + pad * 2);

      if (bufW > 0 && bufH > 0 && bufW < 4000 && bufH < 4000) {
        const { canvas: gCanvas, ctx: gCtx } = getGaussianBuffer(bufW, bufH);
        gCtx.clearRect(0, 0, bufW, bufH);
        gCtx.save();
        gCtx.translate(bufW / 2, bufH / 2);

        // Draw object into offscreen buffer
        origDraw.call(obj, gCtx, forClipping, context);
        gCtx.restore();

        // Apply fast blur to offscreen buffer
        applyFastBlur(gCanvas, bufW, bufH, blurRadius);

        // Draw blurred buffer to main ctx at center
        ctx.drawImage(gCanvas, -bufW / 2, -bufH / 2);
        didCustomBlurDraw = true;
      }
    }
  }

  if (!didCustomBlurDraw) {
    origDraw.call(obj, ctx, forClipping, context);
  }

  if (resetBlur) {
    ctx.filter = 'none';
  }
}

export function installEffectsRenderer() {
  if (installed) return;
  installed = true;

  const FabricObjectProto = fabric.FabricObject.prototype;
  if (FabricObjectProto._effectsInstalled) return;
  FabricObjectProto._effectsInstalled = true;

  // 1. Serialization — include effects properties
  const origToObject = FabricObjectProto.toObject;
  FabricObjectProto.toObject = function(propertiesToInclude = []) {
    const extra = [
      '_blurType', '_blurRadius', '_blurValue', '_glowActive', '_glowColor', '_glowRadius',
      'isQRCode', 'isCodeSnippet', 'codeData', 'cornerRadii', '_independentCorners'
    ];
    const merged = Array.from(new Set([...(propertiesToInclude || []), ...extra]));
    return origToObject.call(this, merged);
  };

  // 2. Bypass cache when visual effects are active
  const origShouldCache = FabricObjectProto.shouldCache;
  FabricObjectProto.shouldCache = function() {
    if (this._glowActive || (this._blurType && this._blurType !== 'none' && (this._blurRadius > 0 || this._blurValue > 0))) {
      return false;
    }
    return origShouldCache ? origShouldCache.call(this) : false;
  };

  // 3. Intercept drawObject for all Fabric shapes, text, paths, and images
  const origDrawObject = FabricObjectProto.drawObject;
  FabricObjectProto.drawObject = function(ctx, forClipping, context) {
    return executeEffectsDraw(this, origDrawObject, ctx, forClipping, context);
  };

  // 4. Intercept drawObject and shouldCache for Groups
  const GroupProto = fabric.Group.prototype;
  if (GroupProto) {
    const origGroupShouldCache = GroupProto.shouldCache;
    GroupProto.shouldCache = function() {
      if (this._glowActive || (this._blurType && this._blurType !== 'none' && (this._blurRadius > 0 || this._blurValue > 0))) {
        return false;
      }
      return origGroupShouldCache ? origGroupShouldCache.call(this) : false;
    };

    const origGroupDraw = GroupProto.drawObject;
    GroupProto.drawObject = function(ctx, forClipping, context) {
      return executeEffectsDraw(this, origGroupDraw, ctx, forClipping, context);
    };
  }
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
      // Fallback for older iOS Safari without ctx.roundRect
      const [tl, tr, br, bl] = radii;
      const x = -hw, y = -hh;
      ctx.moveTo(x + tl, y);
      ctx.lineTo(x + w - tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
      ctx.lineTo(x + w, y + h - br);
      ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      ctx.lineTo(x + bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
      ctx.lineTo(x, y + tl);
      ctx.quadraticCurveTo(x, y, x + tl, y);
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
  obj._blurValue = obj._blurRadius;

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
