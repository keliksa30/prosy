/**
 * AURELIA — professional product-designer portfolio.
 * Elegant luxury tech aesthetic: Playfair Display + Inter + Space Grotesk.
 * Palette: warm paper + deep ink + violet accent.
 */
const INK = '#14151C';
const INK_SOFT = '#1E202B';
const PAPER = '#F7F5F0';
const PAPER_2 = '#EDEAE3';
const PAPER_WHITE = '#FFFFFF';
const VIOLET = '#7B46F8';
const VIOLET_LIGHT = '#9B72F9';
const PINK = '#FA51A2';
const MUTED_INK = 'rgba(20,21,28,0.65)';
const MUTED_PAPER = 'rgba(247,245,240,0.65)';
const BORDER_INK = 'rgba(20,21,28,0.12)';
const BORDER_PAPER = 'rgba(247,245,240,0.18)';

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

function btn({ x, y, w, h, fill = VIOLET, rx = 28, stroke = null, strokeWidth = 0, text, textColor = '#ffffff', textSize = 15, textWeight = 600, font = MONO }) {
  return [
    r({ x, y, w, h, fill, rx, stroke, strokeWidth, name: 'Button Background' }),
    {
      type: 'i-text', text,
      left: x + w / 2, top: y + h / 2,
      originX: 'center', originY: 'center',
      fontFamily: font, fontSize: textSize, fontWeight: textWeight, fill: textColor,
      selectable: true, name: 'Button Label'
    }
  ];
}

function chip(x, y, label, { fill = INK, textColor = PAPER, stroke = null } = {}) {
  const w = 36 + label.length * 12;
  return [
    r({ x, y, w, h: 42, rx: 21, fill, stroke, strokeWidth: stroke ? 1 : 0 }),
    {
      type: 'i-text', text: label,
      left: x + w / 2, top: y + 21,
      originX: 'center', originY: 'center',
      fontFamily: MONO, fontSize: 14, fontWeight: 500, fill: textColor,
      selectable: true, name: 'Chip Label'
    }
  ];
}

export default {
  id: 'pack-aurelia',
  name: 'Aurelia',
  theme: ['#14151c', '#f7f5f0', '#7b46f8'],
  description: 'Professional designer portfolio',
  projectName: 'Aurelia — Product Designer',
  pages: [
    /* ------------------------------ 1 · COVER ------------------------------ */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: INK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: INK }),
          c({ x: 1400, y: -100, d: 520, fill: 'rgba(123,70,248,0.14)' }),
          c({ x: -100, y: 650, d: 420, fill: 'rgba(250,81,162,0.08)' }),

          t('PORTFOLIO · 2026 EDITION', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: VIOLET_LIGHT, tracking: 360 }),
          t('SENIOR PRODUCT DESIGNER', { x: 1480, y: 90, font: MONO, size: 15, color: MUTED_PAPER, tracking: 220 }),
          line(120, 135, 1680, BORDER_PAPER, 1),

          t('Design that ships,\nnot just shines.', { x: 120, y: 220, font: SERIF, size: 110, weight: 400, color: PAPER, ls: 1.02 }),
          t('I’m Aurelia — a product designer turning ambiguous, messy problems into crisp, measurable software. Over 7 years across fintech, SaaS, and marketplaces; shipped 40+ products with real users.', { x: 120, y: 520, font: SANS, size: 23, color: MUTED_PAPER, ls: 1.6, width: 880 }),

          ...btn({ x: 120, y: 680, w: 260, h: 56, fill: VIOLET, rx: 28, text: 'SEE SELECTED WORK →', textColor: '#ffffff', textSize: 14, textWeight: 600, font: MONO }),
          ...btn({ x: 410, y: 680, w: 180, h: 56, fill: 'transparent', rx: 28, stroke: PAPER, strokeWidth: 1.5, text: 'ABOUT ME', textColor: PAPER, textSize: 14, textWeight: 600, font: MONO }),

          /* Right Hero Graphic Frame */
          r({ x: 1140, y: 220, w: 660, h: 516, rx: 24, fill: INK_SOFT, stroke: BORDER_PAPER, strokeWidth: 1 }),
          c({ x: 1470, y: 440, d: 260, fill: 'rgba(123,70,248,0.22)' }),
          c({ x: 1470, y: 440, d: 150, fill: VIOLET }),
          {
            type: 'i-text', text: '40+',
            left: 1470, top: 430, originX: 'center', originY: 'center',
            fontFamily: SERIF, fontSize: 44, fontWeight: 700, fill: '#ffffff', selectable: true, name: 'Stat'
          },
          {
            type: 'i-text', text: 'PRODUCTS SHIPPED',
            left: 1470, top: 470, originX: 'center', originY: 'center',
            fontFamily: MONO, fontSize: 13, fill: PAPER, charSpacing: 240, selectable: true, name: 'Stat Sub'
          },
          t('AMSTERDAM, NL · AVAILABLE FOR SELECT ENGAGEMENTS', { x: 1180, y: 680, font: MONO, size: 13, color: VIOLET_LIGHT, tracking: 180 }),

          line(120, 930, 1680, BORDER_PAPER, 1),
          t('AURELIA LARSON · LEAD PRODUCT DESIGNER', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_PAPER, tracking: 220 }),
          t('SCROLL TO EXPLORE ↓', { x: 1520, y: 955, font: MONO, size: 15, color: MUTED_PAPER, tracking: 220 })
        ]
      }
    },
    /* ------------------------------ 2 · ABOUT ------------------------------ */
    {
      title: 'About',
      canvas_json: {
        backgroundColor: PAPER,
        objects: [
          t('01 / BACKGROUND & EXPERTISE', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: VIOLET, tracking: 360 }),
          t('7+ YEARS IN DIGITAL PRODUCTS', { x: 1460, y: 90, font: MONO, size: 15, color: MUTED_INK, tracking: 200 }),
          line(120, 135, 1680, BORDER_INK, 1),

          t('Nice to meet you.', { x: 120, y: 180, font: SERIF, size: 84, color: INK }),
          t('Based in Amsterdam, I partner with founders and product teams to design software people genuinely enjoy using. I care deeply about research-grounded decisions, transparent design critique, and interfaces that feel effortless.', { x: 120, y: 310, font: SANS, size: 22, color: MUTED_INK, ls: 1.6, width: 880 }),

          t('CORE PILLARS', { x: 120, y: 460, font: MONO, size: 14, color: VIOLET, tracking: 260 }),
          r({ x: 120, y: 495, w: 880, h: 65, rx: 12, fill: PAPER_2 }),
          t('01', { x: 150, y: 518, font: MONO, size: 16, weight: 700, color: VIOLET }),
          t('Product Strategy & Continuous User Discovery', { x: 200, y: 516, font: SANS, size: 18, weight: 600, color: INK }),

          r({ x: 120, y: 575, w: 880, h: 65, rx: 12, fill: PAPER_2 }),
          t('02', { x: 150, y: 598, font: MONO, size: 16, weight: 700, color: VIOLET }),
          t('End-to-End UX/UI Architecture & Design Systems', { x: 200, y: 596, font: SANS, size: 18, weight: 600, color: INK }),

          r({ x: 120, y: 655, w: 880, h: 65, rx: 12, fill: PAPER_2 }),
          t('03', { x: 150, y: 678, font: MONO, size: 16, weight: 700, color: VIOLET }),
          t('Cross-Functional Handoff & Quantitative Validation', { x: 200, y: 676, font: SANS, size: 18, weight: 600, color: INK }),

          /* Right Designer Frame */
          r({ x: 1080, y: 180, w: 720, h: 540, rx: 24, fill: INK }),
          c({ x: 1440, y: 380, d: 220, fill: VIOLET }),
          {
            type: 'i-text', text: 'AURELIA',
            left: 1440, top: 380, originX: 'center', originY: 'center',
            fontFamily: SERIF, fontSize: 34, fontWeight: 700, fill: '#ffffff', selectable: true, name: 'Monogram'
          },
          t('“The best interfaces feel as if they could not have been designed any other way.”', { x: 1140, y: 540, font: SERIF, size: 22, italic: true, color: PAPER, ls: 1.4, width: 600 }),
          t('— SENIOR STAFF DESIGN PHILOSOPHY', { x: 1140, y: 630, font: MONO, size: 13, color: VIOLET_LIGHT, tracking: 220 }),

          /* 4 Proof Metric Columns */
          line(120, 755, 1680, BORDER_INK, 1),
          t('7+', { x: 120, y: 780, font: SERIF, size: 64, weight: 700, color: INK }),
          t('Years in Product Design', { x: 120, y: 860, font: SANS, size: 16, color: MUTED_INK }),

          t('40+', { x: 540, y: 780, font: SERIF, size: 64, weight: 700, color: INK }),
          t('Products Shipped to Users', { x: 540, y: 860, font: SANS, size: 16, color: MUTED_INK }),

          t('12', { x: 960, y: 780, font: SERIF, size: 64, weight: 700, color: INK }),
          t('Design Mentions & Awards', { x: 960, y: 860, font: SANS, size: 16, color: MUTED_INK }),

          t('98%', { x: 1380, y: 780, font: SERIF, size: 64, weight: 700, color: INK }),
          t('Client Satisfaction Rate', { x: 1380, y: 860, font: SANS, size: 16, color: MUTED_INK }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('INDEX: 02 // SELECTED WORK', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('EXPLORE CASE STUDIES →', { x: 1480, y: 955, font: MONO, size: 15, color: VIOLET, tracking: 220 })
        ]
      }
    },
    /* -------------------------- 3 · SELECTED WORK -------------------------- */
    {
      title: 'Selected work',
      canvas_json: {
        backgroundColor: PAPER_2,
        objects: [
          t('02 / SELECTED WORK', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: VIOLET, tracking: 360 }),
          t('4 FEATURED PROJECTS', { x: 1540, y: 90, font: MONO, size: 15, color: MUTED_INK, tracking: 200 }),
          line(120, 135, 1680, BORDER_INK, 1),

          /* Card 01 - Nova Bank */
          r({ x: 120, y: 180, w: 810, h: 330, rx: 20, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          r({ x: 155, y: 215, w: 300, h: 260, rx: 14, fill: '#E8ECF5' }),
          c({ x: 305, y: 345, d: 110, fill: VIOLET }),
          t('NOVA BANK · 2026', { x: 485, y: 220, font: MONO, size: 13, color: VIOLET, tracking: 220 }),
          t('Fintech onboarding that cut drop-off by 42%', { x: 485, y: 255, font: SERIF, size: 28, color: INK, ls: 1.25, width: 310 }),
          t('UX Research · Biometric Verification · Mobile', { x: 485, y: 390, font: SANS, size: 15, color: MUTED_INK, width: 310 }),
          t('CASE STUDY 01 →', { x: 485, y: 445, font: MONO, size: 14, weight: 600, color: VIOLET }),

          /* Card 02 - Briefly */
          r({ x: 990, y: 180, w: 810, h: 330, rx: 20, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          r({ x: 1025, y: 215, w: 300, h: 260, rx: 14, fill: '#F5ECF0' }),
          c({ x: 1175, y: 345, d: 110, fill: PINK }),
          t('BRIEFLY · 2025', { x: 1355, y: 220, font: MONO, size: 13, color: PINK, tracking: 220 }),
          t('Reimagining creative critique for remote teams', { x: 1355, y: 255, font: SERIF, size: 28, color: INK, ls: 1.25, width: 310 }),
          t('SaaS · Collaborative Canvas · Design Systems', { x: 1355, y: 390, font: SANS, size: 15, color: MUTED_INK, width: 310 }),
          t('CASE STUDY 02 →', { x: 1355, y: 445, font: MONO, size: 14, weight: 600, color: PINK }),

          /* Card 03 - Marketly */
          r({ x: 120, y: 550, w: 810, h: 330, rx: 20, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          r({ x: 155, y: 585, w: 300, h: 260, rx: 14, fill: '#E5ECE7' }),
          c({ x: 305, y: 715, d: 110, fill: '#2F6D5C' }),
          t('MARKETLY · 2024', { x: 485, y: 590, font: MONO, size: 13, color: '#2F6D5C', tracking: 220 }),
          t('From checkout friction to a calm shopping ritual', { x: 485, y: 625, font: SERIF, size: 28, color: INK, ls: 1.25, width: 310 }),
          t('Commerce · Conversion Funnel · Rapid Checkout', { x: 485, y: 760, font: SANS, size: 15, color: MUTED_INK, width: 310 }),
          t('CASE STUDY 03 →', { x: 485, y: 815, font: MONO, size: 14, weight: 600, color: '#2F6D5C' }),

          /* Card 04 - Atlas UI */
          r({ x: 990, y: 550, w: 810, h: 330, rx: 20, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          r({ x: 1025, y: 585, w: 300, h: 260, rx: 14, fill: INK }),
          c({ x: 1175, y: 715, d: 110, fill: VIOLET_LIGHT }),
          t('ATLAS UI · 2023', { x: 1355, y: 590, font: MONO, size: 13, color: VIOLET, tracking: 220 }),
          t('A living design system serving 30 product teams', { x: 1355, y: 625, font: SERIF, size: 28, color: INK, ls: 1.25, width: 310 }),
          t('Design Ops · Multi-Brand Tokens · Documentation', { x: 1355, y: 760, font: SANS, size: 15, color: MUTED_INK, width: 310 }),
          t('CASE STUDY 04 →', { x: 1355, y: 815, font: MONO, size: 14, weight: 600, color: VIOLET }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('CASE STUDY ARCHIVE', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('DEEP DIVE: NOVA BANK →', { x: 1480, y: 955, font: MONO, size: 15, color: VIOLET, tracking: 220 })
        ]
      }
    },
    /* --------------------------- 4 · CASE STUDY ---------------------------- */
    {
      title: 'Case study',
      canvas_json: {
        backgroundColor: PAPER,
        objects: [
          t('03 / CASE STUDY 01', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: VIOLET, tracking: 360 }),
          t('FINTECH TRANSFORMATION', { x: 1490, y: 90, font: MONO, size: 15, color: MUTED_INK, tracking: 200 }),
          line(120, 135, 1680, BORDER_INK, 1),

          t('Nova Bank — Onboarding that users finish', { x: 120, y: 170, font: SERIF, size: 76, color: INK }),
          t('Redesigning the customer verification journey to eliminate anxiety, reduce ticket escalations, and accelerate account opening.', { x: 120, y: 265, font: SANS, size: 22, color: MUTED_INK, width: 1200 }),

          /* Left Column Details */
          r({ x: 120, y: 340, w: 780, h: 540, rx: 20, fill: PAPER_2, stroke: BORDER_INK, strokeWidth: 1 }),
          t('THE CHALLENGE', { x: 160, y: 380, font: MONO, size: 14, color: VIOLET, tracking: 260 }),
          t('Only 61% of new applicants completed digital verification; support tickets regarding cryptic ID scan errors represented 44% of all call center volume. Customers felt stranded at the finish line.', { x: 160, y: 415, font: SANS, size: 18, color: INK, ls: 1.5, width: 700 }),

          line(160, 520, 700, BORDER_INK, 1),

          t('KEY MILESTONES', { x: 160, y: 550, font: MONO, size: 14, color: VIOLET, tracking: 260 }),
          t('01 · Discovery', { x: 160, y: 585, font: MONO, size: 16, weight: 700, color: INK }),
          t('18 customer interviews and full journey mapping across 3 KYC paths.', { x: 160, y: 615, font: SANS, size: 16, color: MUTED_INK, width: 700 }),

          t('02 · Prototype & Test', { x: 160, y: 665, font: MONO, size: 16, weight: 700, color: INK }),
          t('5 iterative testing rounds with 45 real retail users before engineering.', { x: 160, y: 695, font: SANS, size: 16, color: MUTED_INK, width: 700 }),

          t('03 · Measurable Outcome', { x: 160, y: 745, font: MONO, size: 16, weight: 700, color: INK }),
          t('Onboarding completion increased to 91%; ID verification tickets dropped 63%.', { x: 160, y: 775, font: SANS, size: 16, color: MUTED_INK, width: 700 }),

          /* Right Column Interactive App Frame */
          r({ x: 940, y: 340, w: 860, h: 540, rx: 24, fill: INK }),
          r({ x: 970, y: 370, w: 800, h: 48, rx: 12, fill: 'rgba(255,255,255,0.08)' }),
          c({ x: 995, y: 394, d: 16, fill: '#FF5F57' }),
          c({ x: 1025, y: 394, d: 16, fill: '#FEBC2E' }),
          c({ x: 1055, y: 394, d: 16, fill: '#28C840' }),
          t('novabank.app/onboarding/verify', { x: 1090, y: 384, font: MONO, size: 14, color: 'rgba(255,255,255,0.6)' }),

          t('Verify Your Identity', { x: 1040, y: 460, font: SERIF, size: 36, color: PAPER }),
          t('Please scan your photo ID in a well-lit area. Your data is encrypted end-to-end.', { x: 1040, y: 520, font: SANS, size: 18, color: MUTED_PAPER, width: 660 }),

          r({ x: 1040, y: 590, w: 660, h: 140, rx: 16, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }),
          t('DOCUMENT SCANNER READY', { x: 1080, y: 625, font: MONO, size: 14, color: VIOLET_LIGHT, tracking: 240 }),
          t('Position ID Card within the frame · Instant auto-detection active', { x: 1080, y: 665, font: SANS, size: 16, color: PAPER }),

          ...btn({ x: 1040, y: 770, w: 260, h: 52, fill: VIOLET, rx: 26, text: 'CAPTURE & VERIFY →', textColor: '#ffffff', textSize: 14, textWeight: 600, font: MONO }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('TIMELINE: 14 WEEKS · ROLE: LEAD PRODUCT DESIGNER', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('GALLERY & ARCHIVE →', { x: 1500, y: 955, font: MONO, size: 15, color: VIOLET, tracking: 220 })
        ]
      }
    },
    /* ----------------------------- 5 · GALLERY ----------------------------- */
    {
      title: 'Gallery',
      canvas_json: {
        backgroundColor: INK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: INK }),
          t('04 / ARCHIVE & EXPERIMENTS', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: PINK, tracking: 360 }),
          t('SIDE PROJECTS & LAB EXPERIMENTS', { x: 1420, y: 90, font: MONO, size: 15, color: MUTED_PAPER, tracking: 200 }),
          line(120, 135, 1680, BORDER_PAPER, 1),

          t('Gallery & Explorations', { x: 120, y: 170, font: SERIF, size: 76, color: PAPER }),
          t('Self-initiated tools, experimental motion prototypes, and typography studies outside client work.', { x: 120, y: 260, font: SANS, size: 22, color: MUTED_PAPER, width: 1200 }),

          /* 3 Featured Cards */
          r({ x: 120, y: 340, w: 520, h: 360, rx: 20, fill: VIOLET }),
          t('SYSTEM ARCHITECTURE', { x: 160, y: 380, font: MONO, size: 13, color: PAPER, tracking: 240 }),
          t('Atlas UI Engine', { x: 160, y: 420, font: SERIF, size: 36, color: '#ffffff' }),
          t('A headless component library generating automated accessibility audits in CI.', { x: 160, y: 480, font: SANS, size: 18, color: PAPER, ls: 1.5, width: 440 }),
          t('GITHUB REPO · 2.1K STARS', { x: 160, y: 640, font: MONO, size: 13, color: PAPER, tracking: 180 }),

          r({ x: 700, y: 340, w: 520, h: 360, rx: 20, fill: INK_SOFT, stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('MOTION PROTOTYPING', { x: 740, y: 380, font: MONO, size: 13, color: PINK, tracking: 240 }),
          t('Spatial Gestures', { x: 740, y: 420, font: SERIF, size: 36, color: PAPER }),
          t('Exploring fluid spring physics on visionOS and responsive touch surfaces.', { x: 740, y: 480, font: SANS, size: 18, color: MUTED_PAPER, ls: 1.5, width: 440 }),
          t('FIGMA COMMUNITY RESOURCE', { x: 740, y: 640, font: MONO, size: 13, color: PINK, tracking: 180 }),

          r({ x: 1280, y: 340, w: 520, h: 360, rx: 20, fill: '#243242', stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('EDITORIAL DESIGN', { x: 1320, y: 380, font: MONO, size: 13, color: VIOLET_LIGHT, tracking: 240 }),
          t('Type Specimens', { x: 1320, y: 420, font: SERIF, size: 36, color: PAPER }),
          t('Curated pairing specimens celebrating contemporary Dutch and Swiss type foundries.', { x: 1320, y: 480, font: SANS, size: 18, color: MUTED_PAPER, ls: 1.5, width: 440 }),
          t('PRINTED PUBLICATION · 2025', { x: 1320, y: 640, font: MONO, size: 13, color: VIOLET_LIGHT, tracking: 180 }),

          /* Bottom Highlights Row */
          r({ x: 120, y: 730, w: 395, h: 150, rx: 16, fill: 'rgba(255,255,255,0.05)' }),
          t('EXPERIMENT 01', { x: 150, y: 760, font: MONO, size: 13, color: VIOLET_LIGHT }),
          t('Micro-Audio Feedback System', { x: 150, y: 795, font: SANS, size: 17, weight: 600, color: PAPER }),
          t('Haptic audio clicks for desktop web apps.', { x: 150, y: 830, font: SANS, size: 14, color: MUTED_PAPER }),

          r({ x: 545, y: 730, w: 395, h: 150, rx: 16, fill: 'rgba(255,255,255,0.05)' }),
          t('EXPERIMENT 02', { x: 575, y: 760, font: MONO, size: 13, color: PINK }),
          t('Color Contrast Palette Matrix', { x: 575, y: 795, font: SANS, size: 17, weight: 600, color: PAPER }),
          t('APCA-compliant perceptual gamut tool.', { x: 575, y: 830, font: SANS, size: 14, color: MUTED_PAPER }),

          r({ x: 970, y: 730, w: 395, h: 150, rx: 16, fill: 'rgba(255,255,255,0.05)' }),
          t('EXPERIMENT 03', { x: 1000, y: 760, font: MONO, size: 13, color: VIOLET_LIGHT }),
          t('Variable Font Weight Slider', { x: 1000, y: 795, font: SANS, size: 17, weight: 600, color: PAPER }),
          t('CSS font-variation playground.', { x: 1000, y: 830, font: SANS, size: 14, color: MUTED_PAPER }),

          r({ x: 1395, y: 730, w: 405, h: 150, rx: 16, fill: 'rgba(255,255,255,0.05)' }),
          t('EXPERIMENT 04', { x: 1425, y: 760, font: MONO, size: 13, color: PINK }),
          t('Icon Set Generator', { x: 1425, y: 795, font: SANS, size: 17, weight: 600, color: PAPER }),
          t('SVG optimizer and sprite sheet builder.', { x: 1425, y: 830, font: SANS, size: 14, color: MUTED_PAPER }),

          line(120, 930, 1680, BORDER_PAPER, 1),
          t('PROTOTYPES AVAILABLE ON GITHUB', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_PAPER, tracking: 220 }),
          t('SERVICES & PROCESS →', { x: 1480, y: 955, font: MONO, size: 15, color: VIOLET_LIGHT, tracking: 220 })
        ]
      }
    },
    /* --------------------------- 6 · SERVICES ------------------------------ */
    {
      title: 'Services & process',
      canvas_json: {
        backgroundColor: PAPER_2,
        objects: [
          t('05 / METHODOLOGY', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: VIOLET, tracking: 360 }),
          t('STRUCTURED DELIVERABLES', { x: 1480, y: 90, font: MONO, size: 15, color: MUTED_INK, tracking: 200 }),
          line(120, 135, 1680, BORDER_INK, 1),

          t('Services & Process', { x: 120, y: 170, font: SERIF, size: 76, color: INK }),

          /* 3 Process Rows */
          r({ x: 120, y: 270, w: 1680, h: 150, rx: 16, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          t('01', { x: 160, y: 310, font: SERIF, size: 48, weight: 700, color: VIOLET }),
          t('Discover & Clarify', { x: 260, y: 315, font: SERIF, size: 34, color: INK }),
          t('FOUNDATIONAL DISCOVERY', { x: 260, y: 365, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('Qualitative user interviews, funnel telemetry auditing, and stakeholder workshops boiled down into a razor-sharp product thesis and success metrics.', { x: 740, y: 315, font: SANS, size: 18, color: INK, ls: 1.5, width: 720 }),
          t('DELIVERABLE\nProblem Framing Brief', { x: 1480, y: 315, font: MONO, size: 14, color: VIOLET, ls: 1.4 }),

          r({ x: 120, y: 445, w: 1680, h: 150, rx: 16, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          t('02', { x: 160, y: 485, font: SERIF, size: 48, weight: 700, color: VIOLET }),
          t('Design & Prototype', { x: 260, y: 490, font: SERIF, size: 34, color: INK }),
          t('ITERATIVE CRAFT', { x: 260, y: 540, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('User journey mapping, wireframing, high-fidelity responsive component mockups, and interactive clickable prototypes tested with real customers.', { x: 740, y: 490, font: SANS, size: 18, color: INK, ls: 1.5, width: 720 }),
          t('DELIVERABLE\nInteractive Figma File', { x: 1480, y: 490, font: MONO, size: 14, color: VIOLET, ls: 1.4 }),

          r({ x: 120, y: 620, w: 1680, h: 150, rx: 16, fill: PAPER_WHITE, stroke: BORDER_INK, strokeWidth: 1 }),
          t('03', { x: 160, y: 660, font: SERIF, size: 48, weight: 700, color: VIOLET }),
          t('Deliver & Measure', { x: 260, y: 665, font: SERIF, size: 34, color: INK }),
          t('ENGINEERING ALIGNMENT', { x: 260, y: 715, font: MONO, size: 13, color: MUTED_INK, tracking: 240 }),
          t('Pixel-perfect design tokens, specs, Storybook component QA, and post-launch metric tracking to ensure measurable conversion uplift.', { x: 740, y: 665, font: SANS, size: 18, color: INK, ls: 1.5, width: 720 }),
          t('DELIVERABLE\nProduction Token Spec', { x: 1480, y: 665, font: MONO, size: 14, color: VIOLET, ls: 1.4 }),

          /* Tooling Row */
          line(120, 800, 1680, BORDER_INK, 1),
          t('CORE TOOLS', { x: 120, y: 835, font: MONO, size: 15, weight: 600, color: VIOLET, tracking: 260 }),
          ...chip(270, 825, 'Figma', { fill: INK, textColor: PAPER }),
          ...chip(400, 825, 'Framer', { fill: INK, textColor: PAPER }),
          ...chip(540, 825, 'ProtoPie', { fill: INK, textColor: PAPER }),
          ...chip(690, 825, 'React & Storybook', { fill: INK, textColor: PAPER }),
          ...chip(910, 825, 'Notion & Linear', { fill: INK, textColor: PAPER }),
          ...chip(1120, 825, 'Maze Testing', { fill: INK, textColor: PAPER }),

          line(120, 930, 1680, BORDER_INK, 1),
          t('AVAILABILITY FOR Q3/Q4', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_INK, tracking: 220 }),
          t('START A CONVERSATION →', { x: 1480, y: 955, font: MONO, size: 15, color: VIOLET, tracking: 220 })
        ]
      }
    },
    /* ------------------------------ 7 · CONTACT ---------------------------- */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: '#161124',
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#161124' }),
          c({ x: 1350, y: -200, d: 700, fill: 'rgba(123,70,248,0.22)' }),
          c({ x: -200, y: 600, d: 600, fill: 'rgba(250,81,162,0.12)' }),

          t('06 / INQUIRIES & AVAILABILITY', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: PINK, tracking: 360 }),
          t('REPLY TIME: WITHIN 24 HOURS', { x: 1460, y: 90, font: MONO, size: 15, color: MUTED_PAPER, tracking: 200 }),
          line(120, 135, 1680, BORDER_PAPER, 1),

          t('Let’s build something\ngreat together.', { x: 120, y: 190, font: SERIF, size: 88, color: PAPER, ls: 1.04 }),

          /* Direct Contact Card */
          r({ x: 120, y: 350, w: 820, h: 530, rx: 24, fill: INK_SOFT, stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('DIRECT INQUIRIES', { x: 170, y: 395, font: MONO, size: 14, color: VIOLET_LIGHT, tracking: 260 }),
          t('hello@aurelia.design', { x: 170, y: 440, font: MONO, size: 40, weight: 700, color: PAPER }),
          t('+31 20 890 2341', { x: 170, y: 515, font: MONO, size: 24, color: MUTED_PAPER }),
          line(170, 580, 720, BORDER_PAPER, 1),
          t('STUDIO LOCATION', { x: 170, y: 620, font: MONO, size: 13, color: VIOLET_LIGHT, tracking: 240 }),
          t('Keizersgracht 421, Amsterdam · Netherlands\nAvailable for on-site kickoffs in Europe & remote worldwide.', { x: 170, y: 655, font: SANS, size: 18, color: PAPER, ls: 1.5, width: 680 }),
          ...btn({ x: 170, y: 770, w: 260, h: 54, fill: VIOLET, rx: 27, text: 'SEND PROJECT BRIEF →', textColor: '#ffffff', textSize: 14, textWeight: 600, font: MONO }),

          /* Capabilities & Socials Card */
          r({ x: 980, y: 350, w: 820, h: 530, rx: 24, fill: 'rgba(255,255,255,0.04)', stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('CURRENT SCOPES & AVAILABILITY', { x: 1030, y: 395, font: MONO, size: 14, color: PINK, tracking: 260 }),
          t('Currently booking select advisory roles and full-time senior design leadership.', { x: 1030, y: 440, font: SERIF, size: 32, color: PAPER, ls: 1.25, width: 700 }),

          r({ x: 1030, y: 540, w: 720, h: 100, rx: 14, fill: 'rgba(255,255,255,0.06)' }),
          t('RECOMMENDED ENGAGEMENT FORMATS', { x: 1060, y: 565, font: MONO, size: 13, color: VIOLET_LIGHT, tracking: 200 }),
          t('Design System Architecture · 0-to-1 Product Sprints · UX Transformation', { x: 1060, y: 595, font: SANS, size: 17, weight: 600, color: PAPER }),

          t('CHANNELS: DRIBBBLE · BEHANCE · LINKEDIN · READCV', { x: 1030, y: 690, font: MONO, size: 15, color: MUTED_PAPER, tracking: 160 }),
          ...btn({ x: 1030, y: 770, w: 220, h: 54, fill: 'transparent', rx: 27, stroke: PAPER, strokeWidth: 1.5, text: 'DOWNLOAD CV ↓', textColor: PAPER, textSize: 14, textWeight: 600, font: MONO }),

          line(120, 930, 1680, BORDER_PAPER, 1),
          t('© 2026 AURELIA LARSON. ALL RIGHTS RESERVED.', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_PAPER, tracking: 220 }),
          t('AMSTERDAM // WORLDWIDE', { x: 1500, y: 955, font: MONO, size: 15, color: MUTED_PAPER, tracking: 200 })
        ]
      }
    }
  ]
};

