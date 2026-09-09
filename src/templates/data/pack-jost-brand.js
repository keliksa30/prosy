/**
 * JOST BRAND — warm brand studio, cream + ink + terracotta.
 * Modern editorial aesthetic: Playfair Display + Outfit + Space Grotesk.
 */
const INK = '#1D1915';
const INK_DARK = '#14110E';
const CREAM = '#F6F0E5';
const CREAM_SOFT = '#EDE5D6';
const RUST = '#D9542B';
const RUST_LIGHT = '#F17B57';
const SAGE = '#3F5244';
const MUTED_CREAM = 'rgba(246,240,229,0.7)';
const MUTED_INK = 'rgba(29,25,21,0.65)';
const BORDER_CREAM = 'rgba(246,240,229,0.2)';
const BORDER_INK = 'rgba(29,25,21,0.12)';

const SERIF = 'Playfair Display';
const SANS = 'Outfit';
const MONO = 'Space Grotesk';

function t(s, { x, y, font = SANS, size = 24, weight = 400, color = INK, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text' } = {}) {
  const base = {
    type: width ? 'textbox' : 'i-text',
    text: s, left: x, top: y,
    fontFamily: font, fontSize: size, fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal',
    fill: color, lineHeight: ls, charSpacing: tracking, textAlign: align,
    originX: 'left', originY: 'top', selectable: true, name
  };
  if (width) {
    base.width = width;
    base.splitByGrapheme = false;
  }
  return base;
}

function r({ x, y, w, h, fill = INK, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape' }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx,
    fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
}

function c({ x, y, d, fill, stroke = null, strokeWidth = 0, name = 'Shape' }) {
  return {
    type: 'ellipse', left: x, top: y, rx: d / 2, ry: d / 2, fill,
    stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
}

function line(x, y, w, color = BORDER_INK, h = 1.5) {
  return r({ x, y, w, h, fill: color });
}

function btn({ x, y, w, h, fill = RUST, rx = 28, text, textColor = CREAM, textSize = 16, textWeight = 600, font = MONO }) {
  return [
    r({ x, y, w, h, fill, rx, name: 'Button Background' }),
    {
      type: 'i-text', text,
      left: x + w / 2, top: y + h / 2,
      originX: 'center', originY: 'center',
      fontFamily: font, fontSize: textSize, fontWeight: textWeight, fill: textColor,
      selectable: true, name: 'Button Label'
    }
  ];
}

export default {
  id: 'pack-jost-brand',
  name: 'Jost Brand',
  theme: ['#1d1915', '#f6f0e5', '#d9542b'],
  description: 'Warm, confident brand portfolio',
  projectName: 'Jost Brand — Portfolio',
  pages: [
    /* 1 · COVER */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: INK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: INK }),
          t('BRAND IDENTITY & ART DIRECTION', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: RUST_LIGHT, tracking: 360 }),
          t('JAKARTA · VOL. 04 / 2026', { x: 1510, y: 90, font: MONO, size: 16, color: MUTED_CREAM, tracking: 240 }),
          line(120, 135, 1680, BORDER_CREAM, 1),
          t('JOST\nBRAND', { x: 120, y: 200, font: SERIF, size: 190, weight: 400, color: CREAM, ls: 0.95 }),
          r({ x: 120, y: 690, w: 220, h: 10, fill: RUST, rx: 5 }),
          t('EST. 2019 · SENOPATI STUDIO', { x: 120, y: 730, font: MONO, size: 16, color: MUTED_CREAM, tracking: 260 }),

          t('A boutique brand studio crafting identities that endure.', { x: 1060, y: 220, font: SERIF, size: 44, color: CREAM, ls: 1.25, width: 720 }),
          t('We partner with ambitious founders across Southeast Asia to translate bold vision into timeless brand systems, tactile packaging, and digital flagship experiences.', { x: 1060, y: 400, font: SANS, size: 22, color: MUTED_CREAM, ls: 1.6, width: 680 }),
          ...btn({ x: 1060, y: 550, w: 280, h: 56, fill: RUST, rx: 28, text: 'EXPLORE PORTFOLIO →', textColor: CREAM, textSize: 15, textWeight: 600, font: MONO }),

          r({ x: 1060, y: 670, w: 720, h: 160, fill: INK_DARK, rx: 16, stroke: BORDER_CREAM, strokeWidth: 1 }),
          t('SELECTED CLIENTS', { x: 1100, y: 700, font: MONO, size: 14, color: RUST_LIGHT, tracking: 260 }),
          t('Pasar Raya · Sunda Skincare · Kopi Sinar · Arta Living · Nusa Goods', { x: 1100, y: 740, font: SANS, size: 20, color: CREAM, width: 640 }),

          line(120, 930, 1680, BORDER_CREAM, 1),
          t('© 2026 JOST BRAND STUDIO', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_CREAM, tracking: 220 }),
          t('SCROLL TO NAVIGATE ↓', { x: 1515, y: 955, font: MONO, size: 15, color: MUTED_CREAM, tracking: 220 })
        ]
      }
    },
    /* 2 · STUDIO */
    {
      title: 'Studio',
      canvas_json: {
        backgroundColor: CREAM,
        objects: [
          t('01 — STUDIO MANIFESTO', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: RUST, tracking: 360 }),
          t('JAKARTA · BALI · SG', { x: 1540, y: 90, font: MONO, size: 16, color: MUTED_INK, tracking: 240 }),
          line(120, 135, 1680, BORDER_INK, 1),

          t('Small team.\nBig impact.', { x: 120, y: 180, font: SERIF, size: 100, color: INK, ls: 1.05 }),
          t('We partner with founders who value uncompromising craft — from the foundational strategic narrative to the tactile grain of physical packaging.', { x: 120, y: 440, font: SANS, size: 22, color: MUTED_INK, ls: 1.6, width: 680 }),

          r({ x: 120, y: 580, w: 325, h: 260, fill: CREAM_SOFT, rx: 16, stroke: BORDER_INK, strokeWidth: 1 }),
          t('PILLAR 01', { x: 150, y: 610, font: MONO, size: 14, color: RUST, tracking: 260 }),
          t('Contextual Design', { x: 150, y: 645, font: SERIF, size: 28, color: INK }),
          t('Every visual system is rooted in deep cultural and commercial context, never borrowed trends.', { x: 150, y: 700, font: SANS, size: 17, color: MUTED_INK, ls: 1.5, width: 265 }),

          r({ x: 475, y: 580, w: 325, h: 260, fill: CREAM_SOFT, rx: 16, stroke: BORDER_INK, strokeWidth: 1 }),
          t('PILLAR 02', { x: 505, y: 610, font: MONO, size: 14, color: RUST, tracking: 260 }),
          t('Living Systems', { x: 505, y: 645, font: SERIF, size: 28, color: INK }),
          t('We deliver dynamic multi-platform design systems that scale effortlessly across print and code.', { x: 505, y: 700, font: SANS, size: 17, color: MUTED_INK, ls: 1.5, width: 265 }),

          r({ x: 880, y: 180, w: 920, h: 420, fill: INK, rx: 20 }),
          t('FOUNDED 2019 · SENOPATI, JAKARTA', { x: 940, y: 225, font: MONO, size: 15, color: RUST_LIGHT, tracking: 300 }),
          t('Crafting modern legacy brands that outlast algorithm cycles.', { x: 940, y: 275, font: SERIF, size: 48, color: CREAM, ls: 1.2, width: 800 }),
          line(940, 420, 800, BORDER_CREAM, 1),
          t('42+ Brands Built', { x: 940, y: 460, font: MONO, size: 22, weight: 600, color: CREAM }),
          t('From seed-stage startups to century-old market leaders.', { x: 940, y: 500, font: SANS, size: 17, color: MUTED_CREAM, width: 340 }),
          t('18 Design Awards', { x: 1360, y: 460, font: MONO, size: 22, weight: 600, color: CREAM }),
          t('Tokyo TDC, D&AD Shortlist, and Golden Pin Design Marks.', { x: 1360, y: 500, font: SANS, size: 17, color: MUTED_CREAM, width: 340 }),

          r({ x: 880, y: 630, w: 445, h: 210, fill: SAGE, rx: 16 }),
          t('BRAND STRATEGY', { x: 920, y: 665, font: MONO, size: 14, color: CREAM, tracking: 260 }),
          t('Positioning, narrative, naming, and architectural alignment.', { x: 920, y: 710, font: SANS, size: 19, color: CREAM, ls: 1.5, width: 365 }),

          r({ x: 1355, y: 630, w: 445, h: 210, fill: RUST, rx: 16 }),
          t('VISUAL IDENTITY', { x: 1395, y: 665, font: MONO, size: 14, color: CREAM, tracking: 260 }),
          t('Custom logotypes, packaging, spatial signage, and web guidelines.', { x: 1395, y: 710, font: SANS, size: 19, color: CREAM, ls: 1.5, width: 365 }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('STUDIO DIRECTORY', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('PROCESS & PORTFOLIO →', { x: 1500, y: 955, font: MONO, size: 15, color: RUST, tracking: 220 })
        ]
      }
    },
    /* 3 · WORK 01 */
    {
      title: 'Pasar Raya',
      canvas_json: {
        backgroundColor: CREAM,
        objects: [
          t('02 — SELECTED WORK', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: RUST, tracking: 360 }),
          t('CASE STUDY 01 OF 02', { x: 1530, y: 90, font: MONO, size: 16, color: MUTED_INK, tracking: 240 }),
          line(120, 135, 1680, BORDER_INK, 1),

          t('Pasar Raya Nusantara', { x: 120, y: 170, font: SERIF, size: 88, color: INK }),
          t('Modernizing an iconic heritage marketplace across identity, retail signage, and packaging.', { x: 120, y: 275, font: SANS, size: 22, color: MUTED_INK, width: 1100 }),

          r({ x: 120, y: 340, w: 900, h: 540, fill: INK, rx: 20 }),
          c({ x: 570, y: 610, d: 240, fill: RUST }),
          {
            type: 'i-text', text: 'PASAR RAYA',
            left: 570, top: 590, originX: 'center', originY: 'center',
            fontFamily: SERIF, fontSize: 44, fontWeight: 700, fill: CREAM, selectable: true, name: 'Brand Badge'
          },
          {
            type: 'i-text', text: 'NUSANTARA · EST. 1974',
            left: 570, top: 635, originX: 'center', originY: 'center',
            fontFamily: MONO, fontSize: 14, fill: CREAM, charSpacing: 300, selectable: true, name: 'Brand Subtitle'
          },
          t('RETAIL SIGNAGE & PACKAGING SUITE', { x: 160, y: 830, font: MONO, size: 14, color: RUST_LIGHT, tracking: 260 }),

          r({ x: 1060, y: 340, w: 740, h: 540, fill: CREAM_SOFT, rx: 20, stroke: BORDER_INK, strokeWidth: 1 }),
          t('SCOPE & TRANSFORMATION', { x: 1110, y: 385, font: MONO, size: 15, color: RUST, tracking: 280 }),
          t('A legendary shopping landmark needed to reclaim its place in contemporary Jakarta culture. We created a dynamic bilingual typographic system, a bold primary palette inspired by Indonesian spices, and a unified packaging family for 180+ local artisanal food makers.', { x: 1110, y: 430, font: SANS, size: 20, color: INK, ls: 1.6, width: 640 }),

          line(1110, 580, 640, BORDER_INK, 1),
          t('CLIENT', { x: 1110, y: 615, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('PT Pasar Raya Bersaudara', { x: 1110, y: 640, font: SANS, size: 19, weight: 600, color: INK }),

          t('SERVICES', { x: 1420, y: 615, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('Identity, Signage, 200+ SKU Packs', { x: 1420, y: 640, font: SANS, size: 19, weight: 600, color: INK }),

          t('YEAR', { x: 1110, y: 700, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('2025 — 2026', { x: 1110, y: 725, font: SANS, size: 19, weight: 600, color: INK }),

          t('AWARD', { x: 1420, y: 700, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('Tokyo TDC Annual Book 2025', { x: 1420, y: 725, font: SANS, size: 19, weight: 600, color: INK }),

          ...btn({ x: 1110, y: 790, w: 260, h: 50, fill: INK, rx: 10, text: 'VIEW FULL ARCHIVE →', textColor: CREAM, textSize: 14, textWeight: 600, font: MONO }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('PREVIOUS: MANIFESTO', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('NEXT: SUNDA SKINCARE →', { x: 1480, y: 955, font: MONO, size: 15, color: RUST, tracking: 220 })
        ]
      }
    },
    /* 4 · WORK 02 */
    {
      title: 'Sunda Skincare',
      canvas_json: {
        backgroundColor: SAGE,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: SAGE }),
          t('02 — SELECTED WORK', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: CREAM, tracking: 360 }),
          t('CASE STUDY 02 OF 02', { x: 1530, y: 90, font: MONO, size: 16, color: MUTED_CREAM, tracking: 240 }),
          line(120, 135, 1680, BORDER_CREAM, 1),

          t('Sunda Skincare', { x: 120, y: 170, font: SERIF, size: 96, color: CREAM }),
          t('Jamu botanical heritage elevated into clinical dermatology.', { x: 120, y: 280, font: SANS, size: 24, color: MUTED_CREAM, width: 850 }),

          t('Sunda synthesizes sacred Sundanese herbal wisdom with dermatological actives. We shaped their brand philosophy, crafted botanical woodcut linework, engineered FSC stone paper boxes, and delivered an interactive apothecary experience.', { x: 120, y: 380, font: SANS, size: 22, color: CREAM, ls: 1.6, width: 840 }),

          r({ x: 120, y: 550, w: 400, h: 200, fill: 'rgba(246,240,229,0.08)', rx: 16, stroke: BORDER_CREAM, strokeWidth: 1 }),
          t('01 · PACKAGING ARCHITECTURE', { x: 150, y: 580, font: MONO, size: 14, color: RUST_LIGHT, tracking: 260 }),
          t('Tactile Materiality', { x: 150, y: 615, font: SERIF, size: 26, color: CREAM }),
          t('Custom embossed amber bottles and compostable mycelium packaging.', { x: 150, y: 660, font: SANS, size: 17, color: MUTED_CREAM, width: 340 }),

          r({ x: 550, y: 550, w: 410, h: 200, fill: 'rgba(246,240,229,0.08)', rx: 16, stroke: BORDER_CREAM, strokeWidth: 1 }),
          t('02 · DIGITAL APOTHECARY', { x: 580, y: 580, font: MONO, size: 14, color: RUST_LIGHT, tracking: 260 }),
          t('Interactive Diagnostic', { x: 580, y: 615, font: SERIF, size: 26, color: CREAM }),
          t('Online skin diagnostic quiz recommending customized ritual routines.', { x: 580, y: 660, font: SANS, size: 17, color: MUTED_CREAM, width: 350 }),

          r({ x: 1040, y: 180, w: 760, h: 690, fill: CREAM, rx: 24 }),
          t('BOTANICAL ARCHIVE · VOL. II', { x: 1100, y: 230, font: MONO, size: 15, color: RUST, tracking: 300 }),
          c({ x: 1420, y: 450, d: 240, fill: SAGE }),
          c({ x: 1420, y: 450, d: 130, fill: RUST }),
          {
            type: 'i-text', text: 'SUNDA',
            left: 1420, top: 450, originX: 'center', originY: 'center',
            fontFamily: SERIF, fontSize: 30, fontWeight: 700, fill: CREAM, selectable: true, name: 'Emblem'
          },
          t('“The packaging feels like a treasured ceramic artifact on your bathroom shelf.”', { x: 1100, y: 660, font: SERIF, size: 24, italic: true, color: INK, ls: 1.4, width: 640 }),
          t('— INDONESIA BEAUTY & WELLNESS AWARDS 2025', { x: 1100, y: 770, font: MONO, size: 14, color: MUTED_INK, tracking: 240 }),

          line(120, 930, 1680, BORDER_CREAM, 1),
          t('BRAND · PACKAGING · DIGITAL · 2025', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_CREAM, tracking: 220 }),
          t('METHODOLOGY & PROCESS →', { x: 1460, y: 955, font: MONO, size: 15, color: CREAM, tracking: 220 })
        ]
      }
    },
    /* 5 · PROCESS */
    {
      title: 'Process',
      canvas_json: {
        backgroundColor: CREAM,
        objects: [
          t('03 — METHODOLOGY', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: RUST, tracking: 360 }),
          t('STRUCTURED RIGOR', { x: 1540, y: 90, font: MONO, size: 16, color: MUTED_INK, tracking: 240 }),
          line(120, 135, 1680, BORDER_INK, 1),

          t('A disciplined path from idea to enduring brand.', { x: 120, y: 170, font: SERIF, size: 68, color: INK, width: 1400 }),

          /* Phase 01 */
          r({ x: 120, y: 280, w: 1680, h: 175, fill: CREAM_SOFT, rx: 16, stroke: BORDER_INK, strokeWidth: 1 }),
          t('01', { x: 160, y: 325, font: MONO, size: 48, weight: 700, color: RUST }),
          t('Listen & Discover', { x: 270, y: 325, font: SERIF, size: 36, color: INK }),
          t('IMMERSION PHASE', { x: 270, y: 380, font: MONO, size: 13, color: MUTED_INK, tracking: 260 }),
          t('Founder workshops, qualitative market listening, competitive whitespace mapping, and crystallizing the single truth behind the brand.', { x: 740, y: 330, font: SANS, size: 19, color: INK, ls: 1.5, width: 680 }),
          t('DELIVERABLE\nStrategic Foundation Doc', { x: 1480, y: 330, font: MONO, size: 15, color: RUST, ls: 1.4 }),

          /* Phase 02 */
          r({ x: 120, y: 485, w: 1680, h: 175, fill: CREAM_SOFT, rx: 16, stroke: BORDER_INK, strokeWidth: 1 }),
          t('02', { x: 160, y: 530, font: MONO, size: 48, weight: 700, color: RUST }),
          t('Shape the Identity', { x: 270, y: 530, font: SERIF, size: 36, color: INK }),
          t('CREATIVE EXPLORATION', { x: 270, y: 585, font: MONO, size: 13, color: MUTED_INK, tracking: 260 }),
          t('Bespoke wordmarks, typographic hierarchy, responsive color palettes, motion principles, and physical packaging prototypes tested in real life.', { x: 740, y: 535, font: SANS, size: 19, color: INK, ls: 1.5, width: 680 }),
          t('DELIVERABLE\nLiving Identity System', { x: 1480, y: 535, font: MONO, size: 15, color: RUST, ls: 1.4 }),

          /* Phase 03 */
          r({ x: 120, y: 690, w: 1680, h: 175, fill: CREAM_SOFT, rx: 16, stroke: BORDER_INK, strokeWidth: 1 }),
          t('03', { x: 160, y: 735, font: MONO, size: 48, weight: 700, color: RUST }),
          t('Build & Roll Out', { x: 270, y: 735, font: SERIF, size: 36, color: INK }),
          t('PRODUCTION & LAUNCH', { x: 270, y: 790, font: MONO, size: 13, color: MUTED_INK, tracking: 260 }),
          t('Print-ready press supervision, digital design token export, interactive online guidelines, and vendor onboarding for zero loss in translation.', { x: 740, y: 740, font: SANS, size: 19, color: INK, ls: 1.5, width: 680 }),
          t('DELIVERABLE\nCloud Brand Portal & Files', { x: 1480, y: 740, font: MONO, size: 15, color: RUST, ls: 1.4 }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('AVERAGE TIMELINE: 8 TO 12 WEEKS', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('COMMENCE CONVERSATION →', { x: 1450, y: 955, font: MONO, size: 15, color: RUST, tracking: 220 })
        ]
      }
    },
    /* 6 · CONTACT */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: RUST,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: RUST }),
          t('04 — INQUIRIES', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: CREAM, tracking: 360 }),
          t('CURRENT STATUS: ACCEPTING Q3/Q4 COMMISSIONS', { x: 1270, y: 90, font: MONO, size: 16, color: CREAM, tracking: 200 }),
          line(120, 135, 1680, BORDER_CREAM, 1),

          t('Let’s build something enduring together.', { x: 120, y: 180, font: SERIF, size: 84, color: CREAM, width: 1400 }),

          /* Direct Inquiry Box */
          r({ x: 120, y: 340, w: 860, h: 540, fill: INK, rx: 20 }),
          t('PRIMARY CONTACT', { x: 170, y: 390, font: MONO, size: 14, color: RUST_LIGHT, tracking: 280 }),
          t('hello@jostbrand.co', { x: 170, y: 440, font: MONO, size: 42, weight: 700, color: CREAM }),
          t('+62 811 900 118', { x: 170, y: 520, font: MONO, size: 26, color: MUTED_CREAM, tracking: 120 }),
          line(170, 590, 760, BORDER_CREAM, 1),
          t('SENOPATI STUDIO', { x: 170, y: 630, font: MONO, size: 14, color: RUST_LIGHT, tracking: 280 }),
          t('Level 14, Senopati Tower · Jl. Senopati No. 88\nJakarta Selatan 12190, Indonesia', { x: 170, y: 670, font: SANS, size: 20, color: CREAM, ls: 1.5, width: 680 }),
          ...btn({ x: 170, y: 770, w: 260, h: 54, fill: RUST, rx: 27, text: 'SEND PROJECT BRIEF →', textColor: CREAM, textSize: 14, textWeight: 600, font: MONO }),

          /* Studio Availability Box */
          r({ x: 1020, y: 340, w: 780, h: 540, fill: CREAM, rx: 20 }),
          t('STUDIO POLICY', { x: 1070, y: 390, font: MONO, size: 14, color: RUST, tracking: 280 }),
          t('We take on a maximum of 4 brand partners per quarter.', { x: 1070, y: 435, font: SERIF, size: 36, color: INK, ls: 1.2, width: 680 }),
          t('This cap guarantees full partner attention, rigorous strategic immersion, and flawless craftsmanship from day one to launch.', { x: 1070, y: 540, font: SANS, size: 20, color: MUTED_INK, ls: 1.6, width: 680 }),

          r({ x: 1070, y: 670, w: 680, h: 150, fill: CREAM_SOFT, rx: 14, stroke: BORDER_INK, strokeWidth: 1 }),
          t('RECOMMENDED ENGAGEMENT SIZES', { x: 1100, y: 700, font: MONO, size: 13, color: RUST, tracking: 240 }),
          t('Full Identity Systems · Packaging Suites · Rebranding Programs', { x: 1100, y: 735, font: SANS, size: 18, weight: 600, color: INK }),
          t('Average project budget starts from $12,000 USD / IDR 180M.', { x: 1100, y: 770, font: SANS, size: 16, color: MUTED_INK }),

          line(120, 930, 1680, BORDER_CREAM, 1),
          t('© 2026 JOST BRAND STUDIO. ALL RIGHTS RESERVED.', { x: 120, y: 955, font: MONO, size: 15, color: CREAM, tracking: 220 }),
        ]
      }
    }
  ]
};

