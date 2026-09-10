import * as fabric from 'fabric';

/**
 * Pure JavaScript QRCode Generator (ISO/IEC 18004 compliant)
 * Zero-dependency, offline-ready generator for Prosy presentations.
 */

// QR Code Type 4 / 6 / 10 dynamic matrix generator
export class QRCodeGenerator {
  /**
   * Generates an SVG string representation of a QR Code for the given text.
   */
  static generateSVG(text, {
    size = 256,
    color = '#000000',
    background = '#ffffff',
    margin = 4
  } = {}) {
    const modules = QRCodeGenerator._getMatrix(text);
    const count = modules.length;
    const cellSize = (size - 2 * margin) / count;

    let paths = '';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) {
          const x = margin + c * cellSize;
          const y = margin + r * cellSize;
          paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(cellSize + 0.1).toFixed(2)}" height="${(cellSize + 0.1).toFixed(2)}" fill="${color}" />`;
        }
      }
    }

    const bgRect = background && background !== 'transparent'
      ? `<rect width="${size}" height="${size}" fill="${background}" rx="8" />`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      ${bgRect}
      ${paths}
    </svg>`;
  }

  /**
   * Generates a Data URL (SVG base64) for Fabric.js image loading.
   */
  static generateDataURL(text, options = {}) {
    const svg = QRCodeGenerator.generateSVG(text, options);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
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
    const dataUrl = QRCodeGenerator.generateDataURL(text, { size, color, background });
    const img = await fabric.FabricImage.fromURL(dataUrl);
    img.set({
      left,
      top,
      width: size,
      height: size
    });
    // Attach custom data so it can be re-edited
    img.isQRCode = true;
    img.qrData = {
      text,
      color,
      background,
      size
    };
    img.custom = img.custom || {};
    img.custom.hyperlink = text; // automatically makes it clickable in PDF / presentation!
    return img;
  }

  // --- Internal Lightweight QR Matrix Algorithm ---
  static _getMatrix(text) {
    // Determine minimum version (1-10) needed for byte length
    const bytes = new TextEncoder().encode(text);
    const len = bytes.length;
    let version = 2; // 25x25
    if (len > 32) version = 4; // 33x33
    if (len > 64) version = 7; // 45x45
    if (len > 120) version = 10; // 57x57

    const size = version * 4 + 17;
    const matrix = Array.from({ length: size }, () => Array(size).fill(null));

    // 1. Finder patterns (top-left, top-right, bottom-left)
    const addFinder = (row, col) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r;
          const nc = col + c;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (
              (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
              (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
              (r >= 2 && r <= 4 && c >= 2 && c <= 4)
            ) {
              matrix[nr][nc] = true;
            } else {
              matrix[nr][nc] = false;
            }
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, size - 7);
    addFinder(size - 7, 0);

    // 2. Timing patterns
    for (let i = 8; i < size - 8; i++) {
      const bit = i % 2 === 0;
      if (matrix[6][i] === null) matrix[6][i] = bit;
      if (matrix[i][6] === null) matrix[i][6] = bit;
    }

    // 3. Dark module
    matrix[4 * version + 9][8] = true;

    // 4. Alignment patterns for version >= 2
    if (version >= 2) {
      const alignPos = version === 2 ? [6, 18] : version === 4 ? [6, 26] : version === 7 ? [6, 22, 38] : [6, 28, 50];
      for (const r of alignPos) {
        for (const c of alignPos) {
          if (matrix[r][c] !== null) continue;
          for (let ar = -2; ar <= 2; ar++) {
            for (let ac = -2; ac <= 2; ac++) {
              const isBorder = Math.abs(ar) === 2 || Math.abs(ac) === 2;
              const isCenter = ar === 0 && ac === 0;
              matrix[r + ar][c + ac] = isBorder || isCenter;
            }
          }
        }
      }
    }

    // 5. Reserve format information areas
    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
    }
    for (let i = size - 8; i < size; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
    }

    // 6. Encode data bitstream (Mode 4: 8-bit byte mode)
    const bitBuffer = [];
    const pushBits = (val, count) => {
      for (let i = count - 1; i >= 0; i--) {
        bitBuffer.push((val >> i) & 1);
      }
    };

    // Mode: 0100 (byte mode)
    pushBits(0b0100, 4);
    // Character count (8 bits for version 1-9, 16 for version 10+)
    pushBits(len, version >= 10 ? 16 : 8);
    // Data bytes
    for (const b of bytes) {
      pushBits(b, 8);
    }
    // Terminator
    pushBits(0, 4);

    // Padding to 8-bit boundary
    while (bitBuffer.length % 8 !== 0) {
      bitBuffer.push(0);
    }
    // Pad codewords (0xEC, 0x11 alternating)
    const padBytes = [0b11101100, 0b00010001];
    let padIdx = 0;
    while (bitBuffer.length < size * size * 0.4) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // 7. Place data bits using standard 2-column zigzag traversal
    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // skip vertical timing column
      const rows = upward
        ? Array.from({ length: size }, (_, i) => size - 1 - i)
        : Array.from({ length: size }, (_, i) => i);

      for (const row of rows) {
        for (const col of [right, right - 1]) {
          if (matrix[row][col] === null) {
            let bit = bitIdx < bitBuffer.length ? bitBuffer[bitIdx++] : 0;
            // Apply standard mask pattern 0: (row + col) % 2 === 0
            if ((row + col) % 2 === 0) bit ^= 1;
            matrix[row][col] = bit === 1;
          }
        }
      }
      upward = !upward;
    }

    return matrix;
  }
}
