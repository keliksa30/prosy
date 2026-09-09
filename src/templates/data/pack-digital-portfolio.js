/**
 * DIGITAL PORTFOLIO — clean, light, oversized type + electric blue.
 * Modern minimal aesthetic: Space Grotesk + Inter + IBM Plex Mono.
 */
const PAPER = '#F8F9FA';
const PAPER_CARD = '#FFFFFF';
const INK = '#0F1117';
const INK_LIGHT = '#1C202E';
const BLUE = '#2563EB';
const BLUE_LIGHT = '#60A5FA';
const GRAY = 'rgba(15,17,23,0.6)';
const MUTED_PAPER = 'rgba(248,249,250,0.65)';
const BORDER = 'rgba(15,17,23,0.12)';
const BORDER_PAPER = 'rgba(248,249,250,0.18)';

const HEAD = 'Space Grotesk';
const SANS = 'Inter';
const MONO = 'IBM Plex Mono';

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

function line(x, y, w, color = BORDER, h = 1.5) {
  return r({ x, y, w, h, fill: color });
}

function btn({ x, y, w, h, fill = BLUE, rx = 12, text, textColor = PAPER, textSize = 15, textWeight = 600, font = HEAD }) {
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
  id: 'pack-digital-portfolio',
  name: 'Digital Portfolio',
  theme: ['#f8f9fa', '#0f1117', '#2563eb'],
  description: 'Minimal, type-led design portfolio',
  projectName: 'Raka — Digital Portfolio',
  pages: [
    /* 1 · COVER */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: PAPER,
        objects: [
          t('RAKA PRATAMA', { x: 120, y: 90, font: HEAD, size: 20, weight: 700, color: INK, tracking: 320 }),
          t('FOLIO // 2026 EDITION', { x: 1470, y: 90, font: MONO, size: 16, color: GRAY, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('Creative\nTechnologist', { x: 120, y: 220, font: HEAD, size: 130, weight: 700, color: INK, ls: 0.95 }),
          t('Designing high-performance digital products, fintech workflows, and scalable token systems at the intersection of design, code, and human behavior.', { x: 120, y: 550, font: SANS, size: 24, color: GRAY, ls: 1.6, width: 880 }),

          ...btn({ x: 120, y: 680, w: 260, h: 56, fill: BLUE, rx: 14, text: 'VIEW SELECTED WORK →', textColor: PAPER, textSize: 14, textWeight: 600, font: HEAD }),

          r({ x: 1200, y: 220, w: 600, h: 516, fill: PAPER_CARD, rx: 20, stroke: BORDER, strokeWidth: 1 }),
          t('CORE CAPABILITIES', { x: 1250, y: 265, font: MONO, size: 13, color: BLUE, tracking: 240 }),
          t('Digital Product Architecture', { x: 1250, y: 300, font: HEAD, size: 26, weight: 600, color: INK }),
          t('End-to-end design from zero-to-one product framing down to interactive component specifications and production testing.', { x: 1250, y: 345, font: SANS, size: 17, color: GRAY, ls: 1.5, width: 500 }),

          line(1250, 435, 500, BORDER, 1),

          t('Design Systems & Engineering', { x: 1250, y: 470, font: HEAD, size: 26, weight: 600, color: INK }),
          t('Multi-platform design token infrastructure, synchronized from Figma directly into React, iOS, and Android repositories.', { x: 1250, y: 515, font: SANS, size: 17, color: GRAY, ls: 1.5, width: 500 }),
          t('STACK: REACT · TYPESCRIPT · FIGMA · MOTION', { x: 1250, y: 655, font: MONO, size: 13, color: BLUE, tracking: 180 }),

          c({ x: 1110, y: 460, d: 24, fill: BLUE }),

          line(120, 930, 1680, BORDER, 1),
          t('JAKARTA & SINGAPORE (GMT+7)', { x: 120, y: 955, font: MONO, size: 15, color: GRAY, tracking: 220 }),
          t('SCROLL TO NAVIGATE ↓', { x: 1520, y: 955, font: MONO, size: 15, color: GRAY, tracking: 220 })
        ]
      }
    },
    /* 2 · ABOUT */
    {
      title: 'About',
      canvas_json: {
        backgroundColor: PAPER,
        objects: [
          t('01 / BACKGROUND & PERSPECTIVE', { x: 120, y: 90, font: HEAD, size: 16, weight: 700, color: BLUE, tracking: 320 }),
          t('8+ YEARS EXPERIENCE', { x: 1510, y: 90, font: MONO, size: 15, color: GRAY, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('I’m Raka — I design and code products with obsessive attention to craft, speed, and real-world utility.', { x: 120, y: 190, font: HEAD, size: 56, weight: 600, color: INK, ls: 1.15, width: 1500 }),
          t('Over the past eight years, I have helped early-stage ventures find product-market fit and enterprise platforms scale to millions of transacting users across Southeast Asia.', { x: 120, y: 370, font: SANS, size: 22, color: GRAY, ls: 1.6, width: 1200 }),

          /* 3 Balanced Cards */
          r({ x: 120, y: 520, w: 520, h: 330, rx: 18, fill: INK }),
          t('LOCATION & TIMEZONE', { x: 160, y: 560, font: MONO, size: 13, color: BLUE_LIGHT, tracking: 260 }),
          t('Jakarta · Remote', { x: 160, y: 600, font: HEAD, size: 32, weight: 600, color: PAPER }),
          t('Operating comfortably across GMT+7 / GMT+8 hours with proven async collaboration practices for distributed global teams.', { x: 160, y: 660, font: SANS, size: 18, color: MUTED_PAPER, ls: 1.5, width: 440 }),
          t('ENGLISH · INDONESIAN', { x: 160, y: 790, font: MONO, size: 14, color: BLUE_LIGHT, tracking: 200 }),

          r({ x: 700, y: 520, w: 520, h: 330, rx: 18, fill: BLUE }),
          t('CURRENT MISSION', { x: 740, y: 560, font: MONO, size: 13, color: PAPER, tracking: 260 }),
          t('Design Lead @ Kita', { x: 740, y: 600, font: HEAD, size: 32, weight: 600, color: PAPER }),
          t('Directing consumer wallet flows, identity onboarding security, and cross-platform motion design tokens for 2.4M monthly active users.', { x: 740, y: 660, font: SANS, size: 18, color: PAPER, ls: 1.5, width: 440 }),
          t('SERIES B FINTECH · 2024—PRES', { x: 740, y: 790, font: MONO, size: 14, color: PAPER, tracking: 200 }),

          r({ x: 1280, y: 520, w: 520, h: 330, rx: 18, fill: PAPER_CARD, stroke: BORDER, strokeWidth: 1 }),
          t('ENGAGEMENT SCOPES', { x: 1320, y: 560, font: MONO, size: 13, color: BLUE, tracking: 260 }),
          t('Select Advisory', { x: 1320, y: 600, font: HEAD, size: 32, weight: 600, color: INK }),
          t('Accepting selective Q3/Q4 advising roles, design system code audits, and technical product sprint intensives for ambitious tech teams.', { x: 1320, y: 660, font: SANS, size: 18, color: GRAY, ls: 1.5, width: 440 }),
          t('ADVISING · WORKSHOPS · AUDITS', { x: 1320, y: 790, font: MONO, size: 14, color: INK, tracking: 200 }),

          line(120, 930, 1680, BORDER, 1),
          t('INDEX: 02 // SELECTED WORK', { x: 120, y: 955, font: MONO, size: 15, color: GRAY, tracking: 220 }),
          t('EXPLORE PROJECTS →', { x: 1520, y: 955, font: MONO, size: 15, color: BLUE, tracking: 220 })
        ]
      }
    },
    /* 3 · SELECTED WORK */
    {
      title: 'Selected work',
      canvas_json: {
        backgroundColor: PAPER,
        objects: [
          t('02 / SELECTED RECENT WORK', { x: 120, y: 90, font: HEAD, size: 16, weight: 700, color: BLUE, tracking: 320 }),
          t('SHIPPED 2024—2026', { x: 1530, y: 90, font: MONO, size: 15, color: GRAY, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          /* Row 01 */
          t('01', { x: 120, y: 225, font: MONO, size: 28, weight: 700, color: BLUE }),
          t('Kita Pay Mobile', { x: 220, y: 200, font: HEAD, size: 68, weight: 700, color: INK }),
          t('Consumer Fintech Platform · 60-Second KYC Onboarding', { x: 220, y: 285, font: SANS, size: 20, color: GRAY }),
          t('2025 · FULL SYSTEM', { x: 1320, y: 235, font: MONO, size: 16, color: GRAY, tracking: 160 }),
          t('→', { x: 1740, y: 215, font: HEAD, size: 48, color: BLUE }),
          line(120, 365, 1680, BORDER, 1),

          /* Row 02 */
          t('02', { x: 120, y: 455, font: MONO, size: 28, weight: 700, color: BLUE }),
          t('Aruna Motion Engine', { x: 220, y: 430, font: HEAD, size: 68, weight: 700, color: INK }),
          t('Unified Spring Physics & Multi-Platform Design Tokens', { x: 220, y: 515, font: SANS, size: 20, color: GRAY }),
          t('2024 · INFRASTRUCTURE', { x: 1320, y: 465, font: MONO, size: 16, color: GRAY, tracking: 160 }),
          t('→', { x: 1740, y: 445, font: HEAD, size: 48, color: BLUE }),
          line(120, 595, 1680, BORDER, 1),

          /* Row 03 */
          t('03', { x: 120, y: 685, font: MONO, size: 28, weight: 700, color: BLUE }),
          t('Toko Commerce Suite', { x: 220, y: 660, font: HEAD, size: 68, weight: 700, color: INK }),
          t('Headless Merchant Dashboard & Lightning 1-Click Checkout', { x: 220, y: 745, font: SANS, size: 20, color: GRAY }),
          t('2023 · WEB APP', { x: 1320, y: 695, font: MONO, size: 16, color: GRAY, tracking: 160 }),
          t('→', { x: 1740, y: 675, font: HEAD, size: 48, color: BLUE }),
          line(120, 825, 1680, BORDER, 1),

          line(120, 930, 1680, BORDER, 1),
          t('DETAILED CASE STUDIES INCLUDED', { x: 120, y: 955, font: MONO, size: 15, color: GRAY, tracking: 220 }),
          t('CASE STUDY 01: KITA PAY →', { x: 1460, y: 955, font: MONO, size: 15, color: BLUE, tracking: 220 })
        ]
      }
    },
    /* 4 · CASE: KITA */
    {
      title: 'Kita Pay',
      canvas_json: {
        backgroundColor: PAPER,
        objects: [
          t('03 / CASE STUDY 01', { x: 120, y: 90, font: HEAD, size: 16, weight: 700, color: BLUE, tracking: 320 }),
          t('FINTECH REGULATORY TRANSFORMATION', { x: 1370, y: 90, font: MONO, size: 15, color: GRAY, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('Kita Pay Mobile', { x: 120, y: 170, font: HEAD, size: 84, weight: 700, color: INK }),
          t('Transforming complex financial KYC verification into an intuitive, camera-first mobile experience.', { x: 120, y: 265, font: SANS, size: 22, color: GRAY, width: 1200 }),

          /* Hero Visual Banner */
          r({ x: 120, y: 340, w: 1680, h: 340, rx: 20, fill: INK }),
          c({ x: 960, y: 510, d: 220, fill: BLUE }),
          r({ x: 800, y: 475, w: 320, h: 70, rx: 14, fill: PAPER }),
          t('● ● ●   Instant Verification', { x: 830, y: 497, font: SANS, size: 20, weight: 600, color: INK }),
          t('REDUCED KYC VERIFICATION TIME FROM 3 DAYS TO 60 SECONDS', { x: 160, y: 625, font: MONO, size: 13, color: BLUE_LIGHT, tracking: 220 }),

          /* Bottom Highlights Card */
          r({ x: 120, y: 710, w: 1680, h: 180, rx: 18, fill: PAPER_CARD, stroke: BORDER, strokeWidth: 1 }),
          t('PROBLEM & IMPACT', { x: 160, y: 740, font: MONO, size: 13, color: BLUE, tracking: 240 }),
          t('Legacy registration required 40+ manual inputs and suffered a 60% abandonment rate. By implementing automated on-device camera OCR, interactive feedback, and concise human micro-copy, completion rate surged by 38%, unlocking 2.4M active users.', { x: 160, y: 775, font: SANS, size: 18, color: INK, ls: 1.5, width: 1180 }),
          ...btn({ x: 1420, y: 770, w: 220, h: 50, fill: BLUE, rx: 12, text: 'DEEP DIVE →', textColor: PAPER, textSize: 13, textWeight: 600, font: HEAD }),

          line(120, 930, 1680, BORDER, 1),
          t('ROLE: LEAD PRODUCT DESIGNER', { x: 120, y: 955, font: MONO, size: 15, color: GRAY, tracking: 220 }),
          t('NEXT: ARUNA MOTION SYSTEM →', { x: 1440, y: 955, font: MONO, size: 15, color: BLUE, tracking: 220 })
        ]
      }
    },
    /* 5 · CASE: ARUNA */
    {
      title: 'Aruna App',
      canvas_json: {
        backgroundColor: INK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: INK }),
          t('03 / CASE STUDY 02', { x: 120, y: 90, font: HEAD, size: 16, weight: 700, color: BLUE_LIGHT, tracking: 320 }),
          t('SYSTEMS INFRASTRUCTURE', { x: 1480, y: 90, font: MONO, size: 15, color: MUTED_PAPER, tracking: 200 }),
          line(120, 135, 1680, BORDER_PAPER, 1),

          t('Aruna Motion & Tokens', { x: 120, y: 170, font: HEAD, size: 84, weight: 700, color: PAPER }),
          t('Building a unified multi-brand token system and motion runtime engine for 4 engineering teams.', { x: 120, y: 265, font: SANS, size: 22, color: MUTED_PAPER, width: 1200 }),

          /* Bento Card 1 - Blue */
          r({ x: 120, y: 340, w: 810, h: 480, rx: 20, fill: BLUE }),
          t('TOKEN ENGINE', { x: 170, y: 385, font: MONO, size: 14, color: PAPER, tracking: 260 }),
          t('64 Spacing Tokens\n120 Semantic Colors\n32 Type Primitives', { x: 170, y: 430, font: HEAD, size: 40, weight: 700, color: PAPER, ls: 1.2 }),
          t('Directly synchronized from Figma tokens into production CSS variables and React Native theme files via automated CI pipelines.', { x: 170, y: 610, font: SANS, size: 18, color: PAPER, ls: 1.5, width: 700 }),
          t('AUTOMATED CI/CD EXPORT', { x: 170, y: 760, font: MONO, size: 13, color: PAPER, tracking: 200 }),

          /* Bento Card 2 - Dark Translucent */
          r({ x: 990, y: 340, w: 810, h: 480, rx: 20, fill: INK_LIGHT, stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('MOTION RUNTIME', { x: 1040, y: 385, font: MONO, size: 14, color: BLUE_LIGHT, tracking: 260 }),
          t('Calibrated Physics Engine', { x: 1040, y: 430, font: HEAD, size: 36, weight: 700, color: PAPER }),
          t('cubic-bezier(0.22, 1, 0.36, 1) — 300ms', { x: 1040, y: 490, font: MONO, size: 20, color: BLUE_LIGHT }),
          t('A single calibrated easing curve implemented across all mobile micro-interactions, reducing perceived latency by 31% without frame drops.', { x: 1040, y: 550, font: SANS, size: 18, color: MUTED_PAPER, ls: 1.5, width: 700 }),
          r({ x: 1040, y: 740, w: 260, h: 40, rx: 8, fill: 'rgba(255,255,255,0.08)' }),
          t('import { motion } from "@aruna/ui"', { x: 1055, y: 750, font: MONO, size: 12, color: PAPER }),

          line(120, 930, 1680, BORDER_PAPER, 1),
          t('YEAR: 2024 · ARUNA LABS', { x: 120, y: 955, font: MONO, size: 15, color: MUTED_PAPER, tracking: 220 }),
          t('CONTACT & AVAILABILITY →', { x: 1470, y: 955, font: MONO, size: 15, color: BLUE_LIGHT, tracking: 220 })
        ]
      }
    },
    /* 6 · CONTACT */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BLUE,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BLUE }),
          t('04 / INQUIRIES & COLLABORATION', { x: 120, y: 90, font: HEAD, size: 16, weight: 700, color: PAPER, tracking: 320 }),
          t('CURRENT STATUS: OPEN FOR SELECT WORK', { x: 1350, y: 90, font: MONO, size: 15, color: PAPER, tracking: 200 }),
          line(120, 135, 1680, 'rgba(255,255,255,0.25)', 1),

          t('Let’s build something remarkable together.', { x: 120, y: 180, font: HEAD, size: 84, weight: 700, color: PAPER, width: 1400 }),

          /* Direct Contact Card */
          r({ x: 120, y: 340, w: 820, h: 540, rx: 20, fill: PAPER_CARD }),
          t('DIRECT INQUIRIES', { x: 170, y: 390, font: MONO, size: 14, color: BLUE, tracking: 260 }),
          t('hello@rakapratama.com', { x: 170, y: 435, font: HEAD, size: 40, weight: 700, color: INK }),
          t('+62 812 8899 0123', { x: 170, y: 510, font: MONO, size: 24, color: GRAY }),
          line(170, 580, 720, BORDER, 1),
          t('LOCATION', { x: 170, y: 620, font: MONO, size: 13, color: BLUE, tracking: 240 }),
          t('Jakarta Selatan, Indonesia · Available worldwide for async remote engagements.', { x: 170, y: 655, font: SANS, size: 18, color: INK, width: 680 }),
          ...btn({ x: 170, y: 770, w: 260, h: 54, fill: BLUE, rx: 12, text: 'SEND PROJECT EMAIL →', textColor: PAPER, textSize: 14, textWeight: 600, font: HEAD }),

          /* Services & Profiles Card */
          r({ x: 980, y: 340, w: 820, h: 540, rx: 20, fill: INK }),
          t('SERVICES & CAPACITIES', { x: 1030, y: 390, font: MONO, size: 14, color: BLUE_LIGHT, tracking: 260 }),
          t('How we can collaborate:', { x: 1030, y: 430, font: HEAD, size: 32, weight: 600, color: PAPER }),

          r({ x: 1030, y: 490, w: 720, h: 90, rx: 12, fill: INK_LIGHT, stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('PRODUCT DESIGN LEADERSHIP', { x: 1060, y: 510, font: MONO, size: 13, color: BLUE_LIGHT, tracking: 200 }),
          t('Zero-to-one product conception, wireframing, high-fidelity prototypes, and user testing.', { x: 1060, y: 538, font: SANS, size: 15, color: PAPER }),

          r({ x: 1030, y: 600, w: 720, h: 90, rx: 12, fill: INK_LIGHT, stroke: BORDER_PAPER, strokeWidth: 1 }),
          t('DESIGN SYSTEMS & TOKEN PIPELINES', { x: 1060, y: 620, font: MONO, size: 13, color: BLUE_LIGHT, tracking: 200 }),
          t('Token architecture, cross-platform component libraries, and Storybook documentation.', { x: 1060, y: 648, font: SANS, size: 15, color: PAPER }),

          t('PROFILES: GITHUB · TWITTER / X · LINKEDIN · READCV', { x: 1030, y: 760, font: MONO, size: 15, color: MUTED_PAPER, tracking: 160 }),

          line(120, 930, 1680, 'rgba(255,255,255,0.25)', 1),
          t('© 2026 RAKA PRATAMA. ALL RIGHTS RESERVED.', { x: 120, y: 955, font: MONO, size: 15, color: PAPER, tracking: 220 }),
          t('BACK TO COVER ↑', { x: 1540, y: 955, font: MONO, size: 15, color: PAPER, tracking: 220 })
        ]
      }
    }
  ]
};

