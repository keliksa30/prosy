/**
 * STUDIO TODAY — editorial portfolio, deep green + cream + mustard.
 * Modern editorial aesthetic: Playfair Display + Inter + Space Grotesk.
 */
const GREEN = '#0C3A2E';
const GREEN_D = '#08281F';
const CREAM = '#F4EFE3';
const CREAM_SOFT = '#ECE6D8';
const MUSTARD = '#E9B44C';
const INK = '#14201B';
const MUTED_INK = 'rgba(20,32,27,0.65)';
const MUTED_CREAM = 'rgba(244,239,227,0.65)';
const BORDER_CREAM = 'rgba(244,239,227,0.2)';
const BORDER_INK = 'rgba(20,32,27,0.15)';

const SERIF = 'Playfair Display';
const SANS = 'Inter';
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

function r({ x, y, w, h, fill = GREEN, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape' }) {
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

function btn({ x, y, w, h, fill = MUSTARD, rx = 12, text, textColor = INK, textSize = 18, textWeight = 600, font = SANS }) {
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

const KICK = { font: MONO, size: 16, tracking: 280, weight: 600 };

export default {
  id: 'pack-studio-today',
  name: 'Studio Today',
  theme: ['#0c3a2e', '#f4efe3', '#e9b44c'],
  description: 'Editorial design portfolio',
  projectName: 'Studio Today — Portfolio',
  pages: [
    /* ------------------------------- 1 · COVER ------------------------------ */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: GREEN,
        objects: [
          // Background graphic elements
          c({ x: 1380, y: 80, d: 420, fill: GREEN_D }),
          c({ x: 1480, y: 160, d: 260, fill: CREAM }),
          r({ x: 1640, y: 220, w: 64, h: 64, fill: MUSTARD, rx: 12 }),

          // Header
          t('STUDIO TODAY', { x: 120, y: 100, ...KICK, color: MUSTARD }),
          t('EDITION 2026', { x: 1620, y: 100, ...KICK, color: MUTED_CREAM, align: 'right' }),
          line(120, 150, 1680, BORDER_CREAM, 1.5),

          // Main Headline
          t('Design, with\npurpose.', { x: 120, y: 280, font: SERIF, size: 148, weight: 400, color: CREAM, ls: 1.05 }),

          // Subtitle & Value Statement
          t('A design practice focused on brand identities, digital products, and editorial systems for ambitious teams across Southeast Asia.', {
            x: 120, y: 660, font: SANS, size: 28, color: MUTED_CREAM, ls: 1.5, width: 920
          }),

          // Divider
          line(120, 860, 1680, BORDER_CREAM, 1.5),

          // Footer info
          t('SELECTED WORKS · VOL. 02', { x: 120, y: 910, ...KICK, size: 15, color: MUSTARD }),
          t('JAKARTA / SINGAPORE', { x: 1500, y: 910, ...KICK, size: 15, color: MUTED_CREAM, align: 'right' })
        ]
      }
    },
    /* ------------------------------- 2 · ABOUT ------------------------------ */
    {
      title: 'About',
      canvas_json: {
        backgroundColor: CREAM,
        objects: [
          // Header
          t('01 — ABOUT THE STUDIO', { x: 120, y: 100, ...KICK, color: GREEN }),
          line(120, 150, 1680, BORDER_INK, 1.5),

          // Left Column: Bold statement
          t('I turn complex ideas into clear visual stories.', {
            x: 120, y: 220, font: SERIF, size: 84, weight: 400, color: INK, ls: 1.1, width: 720
          }),
          r({ x: 120, y: 640, w: 48, h: 48, rx: 8, fill: MUSTARD }),
          t('Founded on the belief that enduring design is rooted in clarity, research, and relentless typographic craft.', {
            x: 190, y: 642, font: SANS, size: 24, color: MUTED_INK, ls: 1.5, width: 640
          }),

          // Right Column: Bio & Experience Card
          r({ x: 960, y: 220, w: 840, h: 680, rx: 24, fill: '#FFFFFF', stroke: BORDER_INK, strokeWidth: 1 }),
          t('PRACTICE & BACKGROUND', { x: 1020, y: 270, ...KICK, color: GREEN }),
          t('Over eight years partnering with innovative startups and heritage brands to build identities that command attention and scale effortlessly.', {
            x: 1020, y: 320, font: SANS, size: 24, color: INK, ls: 1.55, width: 720
          }),
          line(1020, 440, 720, BORDER_INK, 1.5),

          t('EXPERIENCE', { x: 1020, y: 480, ...KICK, size: 14, color: MUSTARD }),
          t('2023 — Present', { x: 1020, y: 520, font: MONO, size: 18, color: MUTED_INK }),
          t('Design Director · Studio Today', { x: 1240, y: 518, font: SANS, size: 20, weight: 600, color: INK }),

          t('2020 — 2023', { x: 1020, y: 590, font: MONO, size: 18, color: MUTED_INK }),
          t('Senior Brand Designer · Mono&Co', { x: 1240, y: 588, font: SANS, size: 20, weight: 600, color: INK }),

          t('2018 — 2020', { x: 1020, y: 660, font: MONO, size: 18, color: MUTED_INK }),
          t('Visual Designer · Aruna Labs', { x: 1240, y: 658, font: SANS, size: 20, weight: 600, color: INK }),

          line(1020, 740, 720, BORDER_INK, 1.5),
          t('CORE DISCIPLINES', { x: 1020, y: 775, ...KICK, size: 13, color: GREEN }),
          t('Brand Identity   ·   Editorial Systems   ·   Packaging   ·   Digital Strategy', {
            x: 1020, y: 810, font: SANS, size: 18, weight: 500, color: MUTED_INK
          })
        ]
      }
    },
    /* ------------------------------- 3 · INDEX ------------------------------ */
    {
      title: 'Selected works',
      canvas_json: {
        backgroundColor: CREAM,
        objects: [
          // Header
          t('02 — SELECTED WORKS', { x: 120, y: 100, ...KICK, color: GREEN }),
          t('Index of Projects', { x: 120, y: 150, font: SERIF, size: 84, color: INK }),
          line(120, 280, 1680, BORDER_INK, 2),

          // Project 1
          t('01', { x: 120, y: 350, font: MONO, size: 36, weight: 600, color: MUSTARD }),
          t('Field Notes Journal', { x: 260, y: 340, font: SERIF, size: 56, color: INK }),
          r({ x: 1140, y: 346, w: 220, h: 38, rx: 19, fill: GREEN }),
          t('EDITORIAL / PRINT', { x: 1170, y: 356, font: MONO, size: 13, weight: 600, color: CREAM, tracking: 160 }),
          t('2026', { x: 1680, y: 352, font: MONO, size: 22, color: MUTED_INK }),
          line(120, 460, 1680, BORDER_INK, 1.5),

          // Project 2
          t('02', { x: 120, y: 530, font: MONO, size: 36, weight: 600, color: MUSTARD }),
          t('Kopi Nusantara', { x: 260, y: 520, font: SERIF, size: 56, color: INK }),
          r({ x: 1140, y: 526, w: 220, h: 38, rx: 19, fill: GREEN }),
          t('PACKAGING / BRAND', { x: 1162, y: 536, font: MONO, size: 13, weight: 600, color: CREAM, tracking: 160 }),
          t('2025', { x: 1680, y: 532, font: MONO, size: 22, color: MUTED_INK }),
          line(120, 640, 1680, BORDER_INK, 1.5),

          // Project 3
          t('03', { x: 120, y: 710, font: MONO, size: 36, weight: 600, color: MUSTARD }),
          t('Aruna Interface', { x: 260, y: 700, font: SERIF, size: 56, color: INK }),
          r({ x: 1140, y: 706, w: 220, h: 38, rx: 19, fill: GREEN }),
          t('DIGITAL / SYSTEM', { x: 1172, y: 716, font: MONO, size: 13, weight: 600, color: CREAM, tracking: 160 }),
          t('2024', { x: 1680, y: 712, font: MONO, size: 22, color: MUTED_INK }),
          line(120, 820, 1680, BORDER_INK, 1.5),

          // Footer note
          t('ALL WORKS DESIGNED & DIRECTED BY STUDIO TODAY', { x: 120, y: 890, ...KICK, size: 14, color: MUTED_INK })
        ]
      }
    },
    /* ------------------------------- 4 · CASE 01 ------------------------------ */
    {
      title: 'Field Notes',
      canvas_json: {
        backgroundColor: CREAM,
        objects: [
          // Header
          t('03 — CASE STUDY 01', { x: 120, y: 100, ...KICK, color: GREEN }),
          t('Field Notes Journal', { x: 120, y: 150, font: SERIF, size: 84, color: INK }),

          // Left Showcase Card
          r({ x: 120, y: 280, w: 920, h: 640, rx: 24, fill: GREEN }),
          r({ x: 180, y: 340, w: 800, h: 520, rx: 16, fill: GREEN_D }),
          c({ x: 740, y: 400, d: 180, fill: MUSTARD }),
          r({ x: 800, y: 460, w: 80, h: 80, fill: CREAM, rx: 12 }),
          t('FIELD NOTES', { x: 240, y: 760, font: SERIF, size: 48, color: CREAM }),
          t('QUARTERLY ISSUE N° 04', { x: 240, y: 820, font: MONO, size: 16, color: MUSTARD, tracking: 220 }),

          // Right Content Details
          t('THE BRIEF & EXECUTION', { x: 1120, y: 290, ...KICK, color: GREEN }),
          t('A publishing identity for an independent design journal — type-led, honest, built on a single flexible grid.', {
            x: 1120, y: 340, font: SANS, size: 30, color: INK, ls: 1.5, width: 680
          }),
          line(1120, 520, 680, BORDER_INK, 1.5),

          t('CHALLENGE', { x: 1120, y: 560, ...KICK, size: 14, color: MUSTARD }),
          t('Create an archival identity that translates tactile printed paper sensibilities into an engaging digital reading platform.', {
            x: 1120, y: 595, font: SANS, size: 20, color: MUTED_INK, ls: 1.55, width: 680
          }),

          t('OUTCOME', { x: 1120, y: 710, ...KICK, size: 14, color: MUSTARD }),
          t('Over 18,000 copies distributed worldwide across 14 independent bookstores and galleries.', {
            x: 1120, y: 745, font: SANS, size: 20, color: MUTED_INK, ls: 1.55, width: 680
          }),

          line(1120, 850, 680, BORDER_INK, 1.5),
          t('DISCIPLINES: BRAND IDENTITY · EDITORIAL · ART DIRECTION · TYPOGRAPHY', {
            x: 1120, y: 890, ...KICK, size: 13, color: MUTED_INK
          })
        ]
      }
    },
    /* ------------------------------- 5 · CASE 02 ------------------------------ */
    {
      title: 'Kopi Nusantara',
      canvas_json: {
        backgroundColor: INK,
        objects: [
          // Header
          t('04 — CASE STUDY 02', { x: 120, y: 100, ...KICK, color: MUSTARD }),
          t('Kopi Nusantara', { x: 120, y: 150, font: SERIF, size: 84, color: CREAM }),

          // Left Showcase Frame
          r({ x: 120, y: 280, w: 760, h: 640, rx: 24, fill: CREAM }),
          r({ x: 160, y: 320, w: 680, h: 560, rx: 16, fill: CREAM_SOFT }),
          c({ x: 410, y: 440, d: 180, fill: GREEN }),
          t('KOPI NUSANTARA', { x: 260, y: 660, font: SERIF, size: 44, color: GREEN, weight: 600 }),
          t('EST. 1987 — BOGOR, WEST JAVA', { x: 330, y: 720, font: MONO, size: 16, color: INK, tracking: 200 }),

          // Right Details Column
          t('HERITAGE PACKAGING SYSTEM', { x: 960, y: 290, ...KICK, color: MUSTARD }),
          t('Packaging & visual identity for an Indonesian single-origin coffee roastery.', {
            x: 960, y: 340, font: SERIF, size: 46, color: CREAM, ls: 1.2, width: 800
          }),
          t('Story-led packaging where every label is an informative map of its origin — elevation, washing technique, and the smallholder farmers behind each harvest.', {
            x: 960, y: 530, font: SANS, size: 24, color: MUTED_CREAM, ls: 1.55, width: 800
          }),

          // Stat Pills
          r({ x: 960, y: 690, w: 240, h: 100, rx: 16, fill: '#1F2E28' }),
          t('12', { x: 1000, y: 710, font: MONO, size: 36, weight: 700, color: MUSTARD }),
          t('Single Origins', { x: 1000, y: 755, font: SANS, size: 16, color: MUTED_CREAM }),

          r({ x: 1230, y: 690, w: 240, h: 100, rx: 16, fill: '#1F2E28' }),
          t('+48%', { x: 1270, y: 710, font: MONO, size: 36, weight: 700, color: MUSTARD }),
          t('Retail Lift', { x: 1270, y: 755, font: SANS, size: 16, color: MUTED_CREAM }),

          line(960, 850, 840, BORDER_CREAM, 1.5),
          t('SCOPE: PACKAGING ARCHITECTURE · LABEL SYSTEM · ILLUSTRATION', {
            x: 960, y: 890, ...KICK, size: 13, color: MUTED_CREAM
          })
        ]
      }
    },
    /* ------------------------------- 6 · CONTACT ------------------------------ */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: GREEN,
        objects: [
          // Header
          t('05 — INQUIRIES & COLLABORATIONS', { x: 120, y: 100, ...KICK, color: MUSTARD }),
          line(120, 150, 1680, BORDER_CREAM, 1.5),

          // Left: Big Headline
          t('Let’s make\nsomething\nlasting.', { x: 120, y: 260, font: SERIF, size: 132, color: CREAM, ls: 1.05 }),
          t('Currently booking projects for Q3/Q4 2026. Whether building a new brand from zero or redesigning a flagship product, let’s talk.', {
            x: 120, y: 720, font: SANS, size: 24, color: MUTED_CREAM, ls: 1.55, width: 720
          }),

          // Right Contact Card
          r({ x: 960, y: 260, w: 840, h: 620, rx: 24, fill: GREEN_D, stroke: BORDER_CREAM, strokeWidth: 1.5 }),
          t('DIRECT INQUIRIES', { x: 1040, y: 320, ...KICK, color: MUSTARD }),
          t('hello@studiotoday.id', { x: 1040, y: 370, font: MONO, size: 36, weight: 600, color: CREAM, tracking: 60 }),

          line(1040, 460, 680, BORDER_CREAM, 1.5),

          t('STUDIO LOCATIONS', { x: 1040, y: 500, ...KICK, size: 14, color: MUSTARD }),
          t('Jakarta — Senopati No. 42\nSingapore — 18 Robinson Rd', {
            x: 1040, y: 540, font: SANS, size: 20, color: MUTED_CREAM, ls: 1.6
          }),

          t('FOLLOW & CONNECT', { x: 1420, y: 500, ...KICK, size: 14, color: MUSTARD }),
          t('Instagram  /studiotoday\nBehance    /studiotoday\nLinkedIn   /studio-today', {
            x: 1420, y: 540, font: MONO, size: 17, color: CREAM, ls: 1.6
          }),

          ...btn({ x: 1040, y: 720, w: 320, h: 64, fill: MUSTARD, rx: 32, text: 'Start a Project →', textColor: INK, textSize: 19, textWeight: 700 }),

          // Footer
          line(120, 960, 1680, BORDER_CREAM, 1.5),
          t('© 2026 STUDIO TODAY · ALL RIGHTS RESERVED', { x: 120, y: 990, ...KICK, size: 13, color: MUTED_CREAM })
        ]
      }
    }
  ]
};
