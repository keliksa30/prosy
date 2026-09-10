/**
 * PRODUCT LAUNCH & BRAND DECK
 * Hardware/software showcases with device frame placeholders, specs, and feature tiers.
 */
const BG = '#121418';
const SURFACE = '#1a1d24';
const INK = '#ffffff';
const MUTED = '#94a3b8';
const VIOLET = '#8b5cf6';
const MINT = '#10b981';
const BORDER = '#262a34';

const SANS = 'Inter';
const HEAD = 'Outfit';

function t(s, { x, y, font = SANS, size = 20, weight = 400, color = INK, ls = 1, tracking = 0, align = 'left', width = null } = {}) {
  const base = {
    type: width ? 'textbox' : 'i-text',
    text: s, left: x, top: y, fontFamily: font, fontSize: size, fontWeight: weight,
    fill: color, lineHeight: ls, charSpacing: tracking, textAlign: align,
    originX: 'left', originY: 'top', selectable: true
  };
  if (width) { base.width = width; base.splitByGrapheme = false; }
  return base;
}

function r({ x, y, w, h, fill = INK, rx = 0, stroke = null, strokeWidth = 0 }) {
  return { type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true };
}

function img({ x, y, w, h, rx = 0 }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#262a34',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-product-launch',
  name: 'Product Launch & Brand Deck',
  theme: [BG, VIOLET, MINT, SURFACE],
  description: 'Product release deck: device mockup frames, technical specifications, and tier breakdowns.',
  projectName: 'Aura One — Product Launch',
  pages: [
    // Slide 1: Product Keynote Hero
    {
      title: 'Keynote Hero',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 100, y: 70, w: 140, h: 32, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('NEW RELEASE', { x: 170, y: 78, font: SANS, size: 11, weight: 700, color: MINT, align: 'center', originX: 'center', tracking: 120 }),

          t('AURA ONE', { x: 100, y: 260, font: HEAD, size: 100, weight: 700, color: INK }),
          t('Spatial Acoustic Mastery.', { x: 100, y: 380, font: HEAD, size: 48, weight: 400, color: VIOLET }),
          t('Engineered from machined titanium and custom 45mm beryllium drivers. Studio-grade reference sound wherever you roam.', { x: 100, y: 470, font: SANS, size: 20, color: MUTED, ls: 1.5, width: 620 }),

          r({ x: 100, y: 620, w: 220, h: 56, rx: 28, fill: VIOLET }),
          t('Pre-order · $399', { x: 210, y: 638, font: SANS, size: 16, weight: 700, color: INK, align: 'center', originX: 'center' }),

          // Device Mockup Holder
          r({ x: 920, y: 140, w: 900, h: 800, rx: 24, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 960, y: 180, w: 820, h: 720, rx: 16 })
        ]
      }
    },
    // Slide 2: Hardware Features & Materials
    {
      title: 'Industrial Design',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('01 / ARCHITECTURE', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: VIOLET, tracking: 140 }),
          t('Uncompromising Materials & Acoustic Geometry', { x: 100, y: 110, font: HEAD, size: 48, weight: 700, color: INK }),

          // Feature 1
          r({ x: 100, y: 220, w: 540, h: 640, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 130, y: 250, w: 480, h: 360, rx: 12 }),
          t('Grade 5 Titanium Chassis', { x: 140, y: 640, font: HEAD, size: 24, weight: 600, color: INK }),
          t('Aerospace-grade strength at just 245 grams. Zero resonance distortion across the audible spectrum.', { x: 140, y: 680, font: SANS, size: 15, color: MUTED, ls: 1.4, width: 460 }),

          // Feature 2
          r({ x: 680, y: 220, w: 540, h: 640, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 710, y: 250, w: 480, h: 360, rx: 12 }),
          t('Beryllium Dynamic Core', { x: 720, y: 640, font: HEAD, size: 24, weight: 600, color: INK }),
          t('Ultra-rigid low-mass diaphragm delivers instantaneous transient response from 5Hz sub-bass to 44kHz highs.', { x: 720, y: 680, font: SANS, size: 15, color: MUTED, ls: 1.4, width: 460 }),

          // Feature 3
          r({ x: 1260, y: 220, w: 560, h: 640, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 1290, y: 250, w: 500, h: 360, rx: 12 }),
          t('Adaptive Hybrid ANC', { x: 1300, y: 640, font: HEAD, size: 24, weight: 600, color: INK }),
          t('8 outward and inward beamforming mics cancel up to 42dB of environmental noise with zero ear pressure.', { x: 1300, y: 680, font: SANS, size: 15, color: MUTED, ls: 1.4, width: 480 })
        ]
      }
    },
    // Slide 3: Software & Ecosystem (Phone/Laptop Frame)
    {
      title: 'Digital Companion App',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('02 / COMPANION SOFTWARE', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: MINT, tracking: 140 }),
          t('Seamless Orchestration Across All Platforms', { x: 100, y: 110, font: HEAD, size: 48, weight: 700, color: INK }),

          // iPhone Frame Mockup placeholder
          r({ x: 100, y: 200, w: 380, h: 720, rx: 48, fill: '#000000', stroke: '#334155', strokeWidth: 4 }),
          r({ x: 120, y: 220, w: 340, h: 680, rx: 36, fill: SURFACE }),
          img({ x: 130, y: 270, w: 320, h: 610, rx: 24 }),
          t('Aura OS Mobile', { x: 290, y: 235, font: SANS, size: 12, weight: 600, color: MUTED, align: 'center', originX: 'center' }),

          // Laptop / Desktop Frame Mockup placeholder
          r({ x: 540, y: 240, w: 1280, h: 680, rx: 20, fill: '#0a0d12', stroke: '#334155', strokeWidth: 3 }),
          r({ x: 560, y: 260, w: 1240, h: 620, rx: 12, fill: SURFACE }),
          img({ x: 580, y: 280, w: 1200, h: 580, rx: 8 }),
          t('Studio Equalizer & Head-Tracking Console for macOS & Windows', { x: 1180, y: 940, font: SANS, size: 14, color: MUTED, align: 'center', originX: 'center' })
        ]
      }
    },
    // Slide 4: Tech Specs & Pricing
    {
      title: 'Specs & Availability',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('03 / TECHNICAL SPECIFICATIONS', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: VIOLET, tracking: 140 }),
          t('Engineered for Audiophiles. Built for Daily Life.', { x: 100, y: 110, font: HEAD, size: 48, weight: 700, color: INK }),

          // Specs Table
          r({ x: 100, y: 220, w: 1040, h: 660, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Acoustic Driver', { x: 140, y: 270, font: SANS, size: 16, weight: 600, color: MUTED }),
          t('45mm Beryllium-coated diaphragm', { x: 540, y: 270, font: SANS, size: 16, weight: 600, color: INK }),

          r({ x: 140, y: 320, w: 960, h: 1, fill: BORDER }),
          t('Frequency Response', { x: 140, y: 350, font: SANS, size: 16, weight: 600, color: MUTED }),
          t('5 Hz – 44,000 Hz (Hi-Res Wireless Certified)', { x: 540, y: 350, font: SANS, size: 16, weight: 600, color: INK }),

          r({ x: 140, y: 400, w: 960, h: 1, fill: BORDER }),
          t('Battery Endurance', { x: 140, y: 430, font: SANS, size: 16, weight: 600, color: MUTED }),
          t('48 Hours (ANC On) / 60 Hours (Standard)', { x: 540, y: 430, font: SANS, size: 16, weight: 600, color: INK }),

          r({ x: 140, y: 480, w: 960, h: 1, fill: BORDER }),
          t('Connectivity', { x: 140, y: 510, font: SANS, size: 16, weight: 600, color: MUTED }),
          t('Bluetooth 5.4, LDAC, aptX Lossless, USB-C 32-bit/384kHz DAC', { x: 540, y: 510, font: SANS, size: 16, weight: 600, color: INK }),

          r({ x: 140, y: 560, w: 960, h: 1, fill: BORDER }),
          t('Weight & Form', { x: 140, y: 590, font: SANS, size: 16, weight: 600, color: MUTED }),
          t('245 grams · Foldable with magnetic hardshell case', { x: 540, y: 590, font: SANS, size: 16, weight: 600, color: INK }),

          // Pricing Box
          r({ x: 1200, y: 220, w: 620, h: 660, rx: 20, fill: SURFACE, stroke: VIOLET, strokeWidth: 2 }),
          t('RETAIL AVAILABILITY', { x: 1260, y: 280, font: SANS, size: 13, weight: 700, color: VIOLET, tracking: 120 }),
          t('$399 USD', { x: 1260, y: 330, font: HEAD, size: 64, weight: 700, color: INK }),
          t('Includes Headphones, USB-C Audio Cable, 3.5mm Adapter, and Leather Carry Case.', { x: 1260, y: 430, font: SANS, size: 16, color: MUTED, ls: 1.5, width: 500 }),

          r({ x: 1260, y: 560, w: 500, h: 64, rx: 32, fill: VIOLET }),
          t('Order at aura.audio/buy', { x: 1510, y: 580, font: SANS, size: 17, weight: 700, color: INK, align: 'center', originX: 'center' }),

          t('Worldwide Shipping Starts October 14, 2026', { x: 1260, y: 670, font: SANS, size: 14, color: MINT, weight: 600 })
        ]
      }
    }
  ]
};
