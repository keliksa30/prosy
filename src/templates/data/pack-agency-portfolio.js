/**
 * CREATIVE AGENCY PORTFOLIO
 * Asymmetrical masonry layouts, full-bleed imagery, editorial typography.
 */
const BG = '#f9f8f6';
const SURFACE = '#f0ede6';
const INK = '#111111';
const MUTED = '#71717a';
const COBALT = '#1a44ff';
const BORDER = '#e2ded5';

const SANS = 'Inter';
const HEAD = 'Playfair Display';

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
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#ded9cf',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-agency-portfolio',
  name: 'Creative Agency Portfolio',
  theme: [BG, INK, COBALT, SURFACE],
  description: 'Design studio showcase: masonry grid, full-bleed imagery, asymmetrical editorial layouts.',
  projectName: 'Atelier Nouveau — Studio Portfolio',
  pages: [
    // Slide 1: Cover
    {
      title: 'Studio Cover',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('ATELIER NOUVEAU', { x: 100, y: 80, font: SANS, size: 16, weight: 700, color: INK, tracking: 160 }),
          t('INDEX / 2026', { x: 1720, y: 80, font: SANS, size: 14, weight: 600, color: MUTED }),

          t('Direction,\nIdentity &\nDigital Form.', { x: 100, y: 260, font: HEAD, size: 110, weight: 400, color: INK, ls: 0.95 }),
          t('We are an independent creative practice operating at the intersection of brand architecture, sensory web experiences, and physical typography.', { x: 100, y: 660, font: SANS, size: 22, color: MUTED, ls: 1.5, width: 620 }),

          r({ x: 100, y: 790, w: 200, h: 56, rx: 0, fill: INK }),
          t('Explore Works', { x: 200, y: 808, font: SANS, size: 14, weight: 600, color: BG, align: 'center', originX: 'center', tracking: 80 }),

          // Asymmetric imagery
          img({ x: 960, y: 160, w: 500, h: 720, rx: 0 }),
          img({ x: 1490, y: 300, w: 330, h: 480, rx: 0 })
        ]
      }
    },
    // Slide 2: Masonry Selected Works
    {
      title: 'Selected Works',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('01 / PORTFOLIO', { x: 100, y: 70, font: SANS, size: 13, weight: 700, color: COBALT, tracking: 140 }),
          t('Selected Commissions', { x: 100, y: 110, font: HEAD, size: 48, color: INK }),

          // Card 1 (Large left)
          img({ x: 100, y: 200, w: 580, h: 560, rx: 0 }),
          t('L’Ombre Perfumery', { x: 100, y: 780, font: HEAD, size: 24, weight: 600, color: INK }),
          t('Brand Identity & Packaging · Paris', { x: 100, y: 815, font: SANS, size: 14, color: MUTED }),

          // Card 2 (Top center)
          img({ x: 720, y: 200, w: 540, h: 360, rx: 0 }),
          t('Komorebi Spatial Audio', { x: 720, y: 580, font: HEAD, size: 24, weight: 600, color: INK }),
          t('Hardware Design & Interactive Web · Tokyo', { x: 720, y: 615, font: SANS, size: 14, color: MUTED }),

          // Card 3 (Bottom center)
          img({ x: 720, y: 680, w: 540, h: 220, rx: 0 }),

          // Card 4 (Right tall)
          img({ x: 1300, y: 200, w: 520, h: 620, rx: 0 }),
          t('Vogue Scandinavia 2026', { x: 1300, y: 840, font: HEAD, size: 24, weight: 600, color: INK }),
          t('Editorial Art Direction & Digital Issue · Stockholm', { x: 1300, y: 875, font: SANS, size: 14, color: MUTED })
        ]
      }
    },
    // Slide 3: Case Study Spotlight
    {
      title: 'Case Study Spotlight',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('CASE STUDY', { x: 100, y: 80, font: SANS, size: 12, weight: 700, color: COBALT, tracking: 160 }),
          t('Vogue Scandinavia — Redefining Fashion in the Digital Realm', { x: 100, y: 120, font: HEAD, size: 44, color: INK }),

          // Full bleed imagery banner
          img({ x: 100, y: 200, w: 1720, h: 540, rx: 0 }),

          r({ x: 100, y: 780, w: 480, h: 160, fill: SURFACE }),
          t('The Objective', { x: 130, y: 805, font: SANS, size: 16, weight: 700, color: INK }),
          t('Create an eco-friendly digital-first quarterly publication with custom kinetic typography.', { x: 130, y: 840, font: SANS, size: 14, color: MUTED, width: 420 }),

          r({ x: 620, y: 780, w: 480, h: 160, fill: SURFACE }),
          t('The Solution', { x: 650, y: 805, font: SANS, size: 16, weight: 700, color: INK }),
          t('A web-native editorial engine built on WebGL shaders, achieving 94% user engagement time.', { x: 650, y: 840, font: SANS, size: 14, color: MUTED, width: 420 }),

          r({ x: 1140, y: 780, w: 680, h: 160, fill: INK }),
          t('Key Metrics', { x: 1180, y: 805, font: SANS, size: 16, weight: 700, color: BG }),
          t('+340% Global Subscribers · Awwwards Site of the Month · European Design Gold', { x: 1180, y: 845, font: HEAD, size: 18, color: '#d4d4d8', width: 600 })
        ]
      }
    },
    // Slide 4: Philosophy & Contact
    {
      title: 'Philosophy & Connect',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('03 / APPROACH', { x: 100, y: 80, font: SANS, size: 12, weight: 700, color: COBALT, tracking: 160 }),
          t('“Simplicity is not the absence of clutter, that’s a consequence of simplicity. Simplicity somehow essentially describes the purpose and place of an object and surface.”', {
            x: 100, y: 160, font: HEAD, size: 48, color: INK, ls: 1.25, width: 1100
          }),

          r({ x: 100, y: 520, w: 320, h: 180, fill: SURFACE }),
          t('01. Inquiry', { x: 130, y: 550, font: SANS, size: 18, weight: 700, color: INK }),
          t('Deep dive into brand heritage, competitive landscape, and cultural touchpoints.', { x: 130, y: 590, font: SANS, size: 14, color: MUTED, width: 260 }),

          r({ x: 460, y: 520, w: 320, h: 180, fill: SURFACE }),
          t('02. Reduction', { x: 490, y: 550, font: SANS, size: 18, weight: 700, color: INK }),
          t('Eliminating visual noise to uncover the singular iconic signature of the product.', { x: 490, y: 590, font: SANS, size: 14, color: MUTED, width: 260 }),

          r({ x: 820, y: 520, w: 320, h: 180, fill: SURFACE }),
          t('03. Craft', { x: 850, y: 550, font: SANS, size: 18, weight: 700, color: INK }),
          t('Obsessive execution spanning typography, micro-interactions, and materiality.', { x: 850, y: 590, font: SANS, size: 14, color: MUTED, width: 260 }),

          // Contact Box
          r({ x: 1240, y: 380, w: 580, h: 480, fill: INK }),
          t('Initiate a Dialogue', { x: 1300, y: 440, font: HEAD, size: 36, color: BG }),
          t('We accept 6 commissions per year to preserve our uncompromising standard of craft.', { x: 1300, y: 510, font: SANS, size: 16, color: '#a1a1aa', width: 460, ls: 1.5 }),
          t('hello@atelier-nouveau.com', { x: 1300, y: 640, font: SANS, size: 22, weight: 600, color: BG }),
          t('Paris · Zurich · Tokyo', { x: 1300, y: 740, font: SANS, size: 15, color: '#71717a' })
        ]
      }
    }
  ]
};
