/**
 * CHROMA — Creative Director / Visual Artist
 * Bold colors, large images, overlapping elements.
 */
const BG = '#ff3366'; // Vibrant Pink
const INK = '#ffffff';
const SECONDARY = '#2b2d42'; // Dark Navy

const SANS = 'Inter';

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

function r({ x, y, w, h, fill = SECONDARY, rx = 0 }) {
  return { type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill, originX: 'left', originY: 'top', selectable: true };
}

function img({ x, y, w, h, rx = 0 }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#edf2f4',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-chroma',
  name: 'Chroma Creative',
  theme: ['#ff3366', '#ffffff', '#2b2d42'],
  description: 'Bold, vibrant, and unconventional portfolio for visual artists.',
  projectName: 'Chroma Portfolio',
  pages: [
    {
      title: 'Hero',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('ART DIRECTOR', { x: -50, y: 300, font: SANS, size: 240, weight: 900, color: 'rgba(255,255,255,0.1)', tracking: -200 }),
          
          img({ x: 600, y: 100, w: 720, h: 880 }),
          
          r({ x: 450, y: 700, w: 400, h: 250 }),
          t('I CREATE\nVISUAL\nNOISE', { x: 480, y: 730, font: SANS, size: 56, weight: 800, ls: 1, color: INK }),
          
          t('Markus Vance', { x: 100, y: 100, font: SANS, size: 24, weight: 700 }),
          t('Portfolio 2026', { x: 100, y: 140, font: SANS, size: 16 }),
          
          t('Scroll to explore →', { x: 100, y: 950, font: SANS, size: 18, weight: 600 })
        ]
      }
    },
    {
      title: 'Gallery Grid',
      canvas_json: {
        backgroundColor: SECONDARY,
        objects: [
          t('SELECTED WORKS', { x: 100, y: 100, font: SANS, size: 64, weight: 800, color: INK }),
          
          img({ x: 100, y: 250, w: 500, h: 700 }),
          img({ x: 650, y: 250, w: 500, h: 320 }),
          img({ x: 650, y: 620, w: 500, h: 330 }),
          img({ x: 1200, y: 250, w: 600, h: 700 }),
          
          t('01. Neon Dreams', { x: 100, y: 970, font: SANS, size: 16, weight: 700, color: BG }),
          t('02. Cyberpunk UI', { x: 650, y: 590, font: SANS, size: 16, weight: 700, color: BG }),
          t('03. Abstract 3D', { x: 1200, y: 970, font: SANS, size: 16, weight: 700, color: BG }),
        ]
      }
    },
    {
      title: 'Showcase',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          img({ x: 0, y: 0, w: 1920, h: 1080 }),
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: 'rgba(255,51,102,0.8)' }),
          
          t('NEON DREAMS', { x: 100, y: 400, font: SANS, size: 140, weight: 900, color: INK, tracking: -50 }),
          t('Campaign Direction // 2026', { x: 100, y: 560, font: SANS, size: 24, weight: 700, color: INK }),
          
          t('An exploration of light, shadow, and artificial colors in an urban environment. We wanted to push the boundaries of what is considered "natural" lighting.', { x: 100, y: 640, font: SANS, size: 24, color: INK, ls: 1.5, width: 800 })
        ]
      }
    },
    {
      title: 'Services',
      canvas_json: {
        backgroundColor: SECONDARY,
        objects: [
          t('WHAT I DO', { x: 100, y: 100, font: SANS, size: 64, weight: 800, color: BG }),
          
          r({ x: 100, y: 300, w: 500, h: 400, fill: INK }),
          t('Art Direction', { x: 140, y: 340, font: SANS, size: 36, weight: 800, color: SECONDARY }),
          t('Leading creative vision for campaigns, brands, and editorial pieces. Ensuring every visual element aligns with the core narrative.', { x: 140, y: 420, font: SANS, size: 18, color: SECONDARY, ls: 1.5, width: 420 }),
          
          r({ x: 710, y: 300, w: 500, h: 400, fill: INK }),
          t('Visual Identity', { x: 750, y: 340, font: SANS, size: 36, weight: 800, color: SECONDARY }),
          t('Crafting bold, memorable brand identities from scratch. Logos, typography systems, and color palettes that demand attention.', { x: 750, y: 420, font: SANS, size: 18, color: SECONDARY, ls: 1.5, width: 420 }),
          
          r({ x: 1320, y: 300, w: 500, h: 400, fill: INK }),
          t('3D & Motion', { x: 1360, y: 340, font: SANS, size: 36, weight: 800, color: SECONDARY }),
          t('Bringing static ideas to life through experimental 3D modeling, texturing, and dynamic motion graphics.', { x: 1360, y: 420, font: SANS, size: 18, color: SECONDARY, ls: 1.5, width: 420 }),
        ]
      }
    },
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: INK,
        objects: [
          t('READY TO MAKE\nSOME NOISE?', { x: 100, y: 300, font: SANS, size: 120, weight: 900, color: BG, ls: 1, tracking: -50 }),
          
          t('Let\'s collaborate.', { x: 100, y: 650, font: SANS, size: 36, weight: 800, color: SECONDARY }),
          t('hello@markusvance.art', { x: 100, y: 720, font: SANS, size: 48, weight: 800, color: BG }),
          
          t('Instagram ↗', { x: 1200, y: 730, font: SANS, size: 24, weight: 700, color: SECONDARY }),
          t('Behance ↗', { x: 1400, y: 730, font: SANS, size: 24, weight: 700, color: SECONDARY }),
        ]
      }
    }
  ]
};
