import * as fabric from 'fabric';
import QRCode from 'qrcode';

/**
 * Standard ISO/IEC 18004 Compliant QRCode Generator for Prosy
 * Generates crisp vector SVG / High-DPI Canvas images that are 100% scannable
 * by any smartphone camera (iOS Camera, Google Lens, Android).
 */
export class QRCodeGenerator {
  /**
   * Generates an SVG string representation of a QR Code.
   */
  static async generateSVG(text, {
    size = 256,
    color = '#000000',
    background = '#ffffff',
    margin = 2,
    errorCorrectionLevel = 'M'
  } = {}) {
    const bg = background === 'transparent' ? '#0000' : background;
    return await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: color,
        light: bg
      }
    });
  }

  /**
   * Generates a Data URL for the QR Code.
   */
  static async generateDataURL(text, {
    size = 256,
    color = '#000000',
    background = '#ffffff',
    margin = 2,
    errorCorrectionLevel = 'M'
  } = {}) {
    const bg = background === 'transparent' ? '#00000000' : background;
    return await QRCode.toDataURL(text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: color,
        light: bg
      }
    });
  }

  /**
   * Generates an HTML Canvas element with the QR Code.
   */
  static async generateCanvas(text, {
    size = 256,
    color = '#000000',
    background = '#ffffff',
    margin = 2,
    errorCorrectionLevel = 'M'
  } = {}) {
    const canvas = document.createElement('canvas');
    const bg = background === 'transparent' ? '#00000000' : background;
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: color,
        light: bg
      }
    });
    return canvas;
  }

  /**
   * Generates a Fabric.js Image object directly on the canvas.
   */
  static async createFabricQR(text, {
    size = 200,
    color = '#000000',
    background = '#ffffff',
    left = 200,
    top = 200
  } = {}) {
    // Generate high-DPI canvas (2x) for retina sharpness
    const dpr = 2;
    const canvas = await QRCodeGenerator.generateCanvas(text, {
      size: Math.round(size * dpr),
      color,
      background,
      margin: 2,
      errorCorrectionLevel: 'M'
    });

    const img = new fabric.FabricImage(canvas, {
      left,
      top,
      scaleX: 1 / dpr,
      scaleY: 1 / dpr,
      originX: 'left',
      originY: 'top',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.12)',
        blur: 16,
        offsetX: 0,
        offsetY: 6
      })
    });

    img.isQRCode = true;
    img.name = 'QR Code';
    img.qrData = {
      text,
      color,
      background,
      size
    };
    img.custom = img.custom || {};
    img.custom.hyperlink = text; // automatically makes it clickable in exported PDF!
    return img;
  }
}
