/**
 * NEO STUDIO — dark tech portfolio, ink + lime + slate, bento grids.
 * High-performance tech aesthetic: Space Grotesk + Inter + IBM Plex Mono.
 */
const BG = '#090D14';
const PANEL = '#121824';
const PANEL_LIGHT = '#1A2234';
const LIME = '#C8F542';
const LIME_DIM = 'rgba(200, 245, 66, 0.12)';
const CLOUD = '#EDF2F7';
const MUTED = 'rgba(237, 242, 247, 0.65)';
const BORDER = 'rgba(237, 242, 247, 0.12)';
const BORDER_LIME = 'rgba(200, 245, 66, 0.25)';

const SANS = 'Space Grotesk';
const BODY = 'Inter';
const MONO = 'IBM Plex Mono';

function t(s, { x, y, font = SANS, size = 24, weight = 400, color = CLOUD, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text' } = {}) {
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

function r({ x, y, w, h, fill = PANEL, rx = 18, stroke = null, strokeWidth = 0, name = 'Shape' }) {
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

function btn({ x, y, w, h, fill = LIME, rx = 14, text, textColor = BG, textSize = 15, textWeight = 700, font = MONO }) {
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
  id: 'pack-neo-studio',
  name: 'Neo Studio',
  theme: ['#090d14', '#c8f542', '#121824'],
  description: 'Dark product-design portfolio',
  projectName: 'Neo Studio — Portfolio',
  pages: [
    /* 1 · COVER */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),
          c({ x: 1450, y: -100, d: 500, fill: 'rgba(200,245,66,0.06)' }),

          /* Top Bar */
          r({ x: 120, y: 90, w: 14, h: 14, rx: 7, fill: LIME }),
          t('NEO® / SYSTEMS LAB', { x: 145, y: 88, font: MONO, size: 16, weight: 600, color: LIME, tracking: 260 }),
          t('LEAD PRODUCT DESIGNER · 2026 ARCHIVE', { x: 1380, y: 88, font: MONO, size: 15, color: MUTED, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          /* Left Hero Column */
          t('Product designer\nbuilding tools that\nfeel inevitable.', { x: 120, y: 210, font: SANS, size: 88, weight: 600, color: CLOUD, ls: 1.05 }),
          t('Specializing in complex fintech workflows, enterprise design systems, and mathematical motion choreography.', { x: 120, y: 530, font: BODY, size: 22, color: MUTED, ls: 1.6, width: 720 }),

          ...btn({ x: 120, y: 640, w: 260, h: 54, fill: LIME, rx: 14, text: 'EXPLORE CASE STUDIES →', textColor: BG, textSize: 14, textWeight: 700, font: MONO }),

          r({ x: 120, y: 740, w: 720, h: 120, rx: 18, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('CURRENT STATUS', { x: 155, y: 770, font: MONO, size: 13, color: LIME, tracking: 260 }),
          t('● Available for select Q3/Q4 contracts & advisory roles', { x: 155, y: 805, font: BODY, size: 18, color: CLOUD }),

          /* Right Bento Grid */
          r({ x: 920, y: 210, w: 420, h: 300, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('SPECIALIZATION', { x: 960, y: 245, font: MONO, size: 14, color: LIME, tracking: 240 }),
          t('Design Systems &\nMicro-Interactions', { x: 960, y: 285, font: SANS, size: 28, weight: 600, color: CLOUD }),
          t('Figma Tokens · Radix · CSS Engine · React Components', { x: 960, y: 380, font: BODY, size: 16, color: MUTED, width: 340 }),

          r({ x: 1380, y: 210, w: 420, h: 300, rx: 20, fill: PANEL, stroke: BORDER_LIME, strokeWidth: 1 }),
          t('TELEMETRY', { x: 1420, y: 245, font: MONO, size: 14, color: LIME, tracking: 240 }),
          t('2.4M+', { x: 1420, y: 285, font: SANS, size: 56, weight: 700, color: LIME }),
          t('Monthly active users across shipped products in SE Asia.', { x: 1420, y: 375, font: BODY, size: 17, color: CLOUD, width: 340 }),

          r({ x: 920, y: 550, w: 880, h: 310, rx: 20, fill: PANEL_LIGHT, stroke: BORDER, strokeWidth: 1 }),
          t('FEATURED DEPLOYMENT · 2025', { x: 960, y: 585, font: MONO, size: 14, color: LIME, tracking: 260 }),
          t('KitaPay 3.0: 60-Second Instant Mobile Onboarding', { x: 960, y: 625, font: SANS, size: 32, weight: 600, color: CLOUD }),
          t('Re-architected the entire identification and biometric pipeline, reducing activation churn from 60% down to 14% with automated OCR validation.', { x: 960, y: 685, font: BODY, size: 19, color: MUTED, ls: 1.5, width: 800 }),
          t('STACK: REACT NATIVE · FIGMA TOKENS · RIVE MOTION', { x: 960, y: 790, font: MONO, size: 13, color: LIME, tracking: 180 }),

          /* Footer */
          line(120, 930, 1680, BORDER, 1),
          t('INDEX: 01 // OVERVIEW', { x: 120, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 }),
          t('SCROLL TO NAVIGATE ↓', { x: 1520, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 })
        ]
      }
    },
    /* 2 · OVERVIEW / STATS */
    {
      title: 'Overview',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('01 — PERFORMANCE OVERVIEW', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: LIME, tracking: 360 }),
          t('CUMULATIVE METRICS · 2024—2026', { x: 1410, y: 90, font: MONO, size: 15, color: MUTED, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          /* Left Column Hero */
          t('07', { x: 120, y: 180, font: SANS, size: 160, weight: 700, color: LIME }),
          t('End-to-end digital products\ndesigned and shipped to production.', { x: 120, y: 370, font: SANS, size: 36, weight: 500, color: CLOUD, ls: 1.2, width: 680 }),
          t('From zero-to-one developer tools to consumer fintech apps serving millions, every interface is engineered with measurable business rigor.', { x: 120, y: 490, font: BODY, size: 20, color: MUTED, ls: 1.6, width: 660 }),

          r({ x: 120, y: 640, w: 680, h: 220, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('CORE COMPETENCY MATRIX', { x: 160, y: 675, font: MONO, size: 13, color: LIME, tracking: 240 }),
          t('• Systems Architecture: Token schemas, multi-brand theming\n• Quantitative Research: Funnel analytics, A/B validation\n• Micro-Interaction Design: Spring physics, frame-rate budget', { x: 160, y: 715, font: BODY, size: 17, color: CLOUD, ls: 1.7 }),

          /* Right Stats Bento Grid */
          r({ x: 860, y: 180, w: 290, h: 240, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('4.9★', { x: 900, y: 225, font: SANS, size: 54, weight: 700, color: LIME }),
          t('AVG APP RATING', { x: 900, y: 310, font: MONO, size: 14, color: MUTED, tracking: 240 }),
          t('Across 85,000+ public reviews on iOS and Play Store.', { x: 900, y: 345, font: BODY, size: 15, color: CLOUD, width: 220 }),

          r({ x: 1180, y: 180, w: 290, h: 240, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('2.4M', { x: 1220, y: 225, font: SANS, size: 54, weight: 700, color: LIME }),
          t('MONTHLY ACTIVE', { x: 1220, y: 310, font: MONO, size: 14, color: MUTED, tracking: 240 }),
          t('High-frequency daily fintech transacting users.', { x: 1220, y: 345, font: BODY, size: 15, color: CLOUD, width: 220 }),

          r({ x: 1500, y: 180, w: 300, h: 240, rx: 20, fill: LIME }),
          t('12', { x: 1540, y: 225, font: SANS, size: 54, weight: 800, color: BG }),
          t('DESIGN AWARDS', { x: 1540, y: 310, font: MONO, size: 14, color: BG, tracking: 240 }),
          t('Red Dot, Webby Nominee & Awwwards Site of the Day.', { x: 1540, y: 345, font: BODY, size: 15, color: BG, width: 230 }),

          /* Big Impact Banner */
          r({ x: 860, y: 460, w: 940, h: 400, rx: 24, fill: PANEL_LIGHT, stroke: BORDER_LIME, strokeWidth: 1 }),
          t('HIGHLIGHT CASE STUDY', { x: 910, y: 505, font: MONO, size: 14, color: LIME, tracking: 260 }),
          t('▲ 38%', { x: 910, y: 545, font: SANS, size: 68, weight: 700, color: LIME }),
          t('Conversion lift after comprehensive redesign of KitaPay’s identity verification & onboarding pipeline.', { x: 910, y: 640, font: BODY, size: 24, weight: 500, color: CLOUD, ls: 1.4, width: 840 }),
          t('KYC failure dropoff dropped from 60% to 14% within 30 days of production rollout.', { x: 910, y: 725, font: BODY, size: 18, color: MUTED, width: 840 }),
          ...btn({ x: 910, y: 780, w: 220, h: 48, fill: LIME, rx: 12, text: 'READ CASE STUDY →', textColor: BG, textSize: 13, textWeight: 700, font: MONO }),

          /* Footer */
          line(120, 930, 1680, BORDER, 1),
          t('INDEX: 02 // KITAPAY ONBOARDING', { x: 120, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 }),
          t('NEXT: CASE 01 →', { x: 1560, y: 955, font: MONO, size: 15, color: LIME, tracking: 220 })
        ]
      }
    },
    /* 3 · CASE 01: KITAPAY */
    {
      title: 'KitaPay',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('CASE 01 — FINTECH ARCHITECTURE', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: LIME, tracking: 360 }),
          t('TIMELINE: 8 WEEKS (DISCOVERY TO GA)', { x: 1380, y: 90, font: MONO, size: 15, color: MUTED, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('KitaPay Onboarding Flow', { x: 120, y: 170, font: SANS, size: 84, weight: 600, color: CLOUD }),
          t('Turning a cumbersome 9-step regulatory hurdle into a fast, transparent camera-first mobile experience.', { x: 120, y: 265, font: BODY, size: 22, color: MUTED, width: 1200 }),

          /* Left Visual Box */
          r({ x: 120, y: 340, w: 820, h: 540, rx: 24, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          c({ x: 530, y: 570, d: 240, fill: LIME_DIM }),
          c({ x: 530, y: 570, d: 150, fill: LIME }),
          {
            type: 'i-text', text: 'FAST KYC',
            left: 530, top: 560, originX: 'center', originY: 'center',
            fontFamily: SANS, fontSize: 26, fontWeight: 700, fill: BG, selectable: true, name: 'Badge'
          },
          {
            type: 'i-text', text: '0.8s OCR SPEED',
            left: 530, top: 595, originX: 'center', originY: 'center',
            fontFamily: MONO, fontSize: 13, fontWeight: 600, fill: BG, charSpacing: 180, selectable: true, name: 'Subtitle'
          },
          t('LIVE BIOMETRIC VALIDATION INTERFACE', { x: 160, y: 830, font: MONO, size: 14, color: LIME, tracking: 260 }),

          /* Right Details Card */
          r({ x: 980, y: 340, w: 820, h: 540, rx: 24, fill: PANEL_LIGHT, stroke: BORDER, strokeWidth: 1 }),
          t('THE CHALLENGE & SOLUTION', { x: 1030, y: 385, font: MONO, size: 14, color: LIME, tracking: 260 }),
          t('60% of prospective Indonesian retail users abandoned registration due to cryptic error codes during National ID (KTP) photo uploads. We replaced the manual multi-step form with real-time on-device edge detection, instant haptic feedback, and plain-language guidance.', { x: 1030, y: 425, font: BODY, size: 20, color: CLOUD, ls: 1.6, width: 720 }),

          line(1030, 560, 720, BORDER, 1),

          t('RESULTS SUMMARY', { x: 1030, y: 595, font: MONO, size: 13, color: LIME, tracking: 240 }),
          t('+38% Onboarding Completion Rate', { x: 1030, y: 625, font: SANS, size: 22, weight: 600, color: CLOUD }),
          t('Reduced user support verification tickets by 72% in month one.', { x: 1030, y: 660, font: BODY, size: 16, color: MUTED, width: 700 }),

          t('DESIGN LEADERSHIP', { x: 1030, y: 710, font: MONO, size: 13, color: LIME, tracking: 240 }),
          t('Conducted 24 field usability interviews across Jakarta & Surabaya.', { x: 1030, y: 740, font: BODY, size: 16, color: MUTED, width: 700 }),

          ...btn({ x: 1030, y: 795, w: 260, h: 48, fill: LIME, rx: 12, text: 'VIEW FIGMA WORKFLOW →', textColor: BG, textSize: 13, textWeight: 700, font: MONO }),

          /* Footer */
          line(120, 930, 1680, BORDER, 1),
          t('ROLE: LEAD PRODUCT DESIGNER', { x: 120, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 }),
          t('NEXT: MOTION LANGUAGE →', { x: 1480, y: 955, font: MONO, size: 15, color: LIME, tracking: 220 })
        ]
      }
    },
    /* 4 · CASE 02: MOTION SYSTEM */
    {
      title: 'Motion system',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('CASE 02 — DESIGN SYSTEM INFRASTRUCTURE', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: LIME, tracking: 360 }),
          t('COLLABORATION: ARUNA LABS', { x: 1440, y: 90, font: MONO, size: 15, color: MUTED, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('A Motion Language for Aruna', { x: 120, y: 170, font: SANS, size: 84, weight: 600, color: CLOUD }),
          t('Standardizing timing curves, choreographic spatial tokens, and GPU-accelerated interaction primitives.', { x: 120, y: 265, font: BODY, size: 22, color: MUTED, width: 1200 }),

          /* 4 Balanced Cards in Horizontal Row */
          /* Card 1 */
          r({ x: 120, y: 350, w: 395, h: 480, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('01 // PHYSICS', { x: 160, y: 390, font: MONO, size: 14, color: LIME, tracking: 240 }),
          t('Natural Curves', { x: 160, y: 430, font: SANS, size: 30, weight: 600, color: CLOUD }),
          t('cubic-bezier\n(0.22, 1, 0.36, 1)', { x: 160, y: 490, font: MONO, size: 18, color: LIME, ls: 1.4 }),
          t('Custom calibrated spring curves tuned for fluid mobile gestures and zero visual disorientation.', { x: 160, y: 570, font: BODY, size: 17, color: MUTED, ls: 1.5, width: 315 }),
          t('60 FPS GUARANTEED', { x: 160, y: 770, font: MONO, size: 13, color: LIME, tracking: 200 }),

          /* Card 2 */
          r({ x: 545, y: 350, w: 395, h: 480, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('02 // SCALABILITY', { x: 585, y: 390, font: MONO, size: 14, color: LIME, tracking: 240 }),
          t('64 Tokens', { x: 585, y: 430, font: SANS, size: 30, weight: 600, color: CLOUD }),
          t('$motion-duration-sm\n$motion-ease-spring', { x: 585, y: 490, font: MONO, size: 18, color: LIME, ls: 1.4 }),
          t('Cross-platform token exports seamlessly consumed by iOS, Android, Web, and React Native teams.', { x: 585, y: 570, font: BODY, size: 17, color: MUTED, ls: 1.5, width: 315 }),
          t('4 PLATFORMS SYNCED', { x: 585, y: 770, font: MONO, size: 13, color: LIME, tracking: 200 }),

          /* Card 3 */
          r({ x: 970, y: 350, w: 395, h: 480, rx: 20, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('03 // EFFICIENCY', { x: 1010, y: 390, font: MONO, size: 14, color: LIME, tracking: 240 }),
          t('−31% Dev Time', { x: 1010, y: 430, font: SANS, size: 30, weight: 600, color: CLOUD }),
          t('Zero handoff drift', { x: 1010, y: 490, font: MONO, size: 18, color: LIME }),
          t('Engineers copy production-ready code straight from the interactive Storybook motion playground.', { x: 1010, y: 570, font: BODY, size: 17, color: MUTED, ls: 1.5, width: 315 }),
          t('MEASURED OVER 6 SPRINTS', { x: 1010, y: 770, font: MONO, size: 13, color: LIME, tracking: 200 }),

          /* Card 4 - Lime Highlight */
          r({ x: 1395, y: 350, w: 405, h: 480, rx: 20, fill: LIME }),
          t('04 // TOOLING', { x: 1435, y: 390, font: MONO, size: 14, color: BG, tracking: 240 }),
          t('Orbit Engine', { x: 1435, y: 430, font: SANS, size: 30, weight: 700, color: BG }),
          t('Inspect & debug animations in real-time.', { x: 1435, y: 490, font: SANS, size: 20, weight: 600, color: BG, ls: 1.3, width: 325 }),
          t('A proprietary internal developer inspector tool built on top of Chrome DevTools Protocol to step frame-by-frame.', { x: 1435, y: 570, font: BODY, size: 17, color: BG, ls: 1.5, width: 325 }),
          ...btn({ x: 1435, y: 750, w: 220, h: 46, fill: BG, rx: 10, text: 'DOCUMENTATION →', textColor: LIME, textSize: 13, textWeight: 700, font: MONO }),

          /* Footer */
          line(120, 930, 1680, BORDER, 1),
          t('YEAR: 2025 · ARUNA LABS', { x: 120, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 }),
          t('NEXT: OPERATING PRINCIPLES →', { x: 1450, y: 955, font: MONO, size: 15, color: LIME, tracking: 220 })
        ]
      }
    },
    /* 5 · APPROACH */
    {
      title: 'Approach',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('03 — OPERATING PRINCIPLES', { x: 120, y: 90, font: MONO, size: 16, weight: 600, color: LIME, tracking: 360 }),
          t('DISCIPLINED RIGOR', { x: 1520, y: 90, font: MONO, size: 15, color: MUTED, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('Research → Systems → Motion.', { x: 120, y: 170, font: SANS, size: 76, weight: 600, color: CLOUD }),
          t('How I collaborate with product managers, founders, and engineering teams to ship reliable software.', { x: 120, y: 260, font: BODY, size: 22, color: MUTED, width: 1200 }),

          /* 4 Approach Bento Cards */
          r({ x: 120, y: 330, w: 395, h: 260, rx: 18, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('01', { x: 155, y: 365, font: MONO, size: 24, weight: 700, color: LIME }),
          t('User Empathy', { x: 155, y: 405, font: SANS, size: 24, weight: 600, color: CLOUD }),
          t('Talk directly to real users. Never design strictly from aggregated surveys without contextual observational testing.', { x: 155, y: 450, font: BODY, size: 16, color: MUTED, ls: 1.5, width: 325 }),

          r({ x: 545, y: 330, w: 395, h: 260, rx: 18, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('02', { x: 580, y: 365, font: MONO, size: 24, weight: 700, color: LIME }),
          t('Shared Prototypes', { x: 580, y: 405, font: SANS, size: 24, weight: 600, color: CLOUD }),
          t('Prototype with real production data. Discover edge cases and keyboard traps early rather than during launch week.', { x: 580, y: 450, font: BODY, size: 16, color: MUTED, ls: 1.5, width: 325 }),

          r({ x: 970, y: 330, w: 395, h: 260, rx: 18, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('03', { x: 1005, y: 365, font: MONO, size: 24, weight: 700, color: LIME }),
          t('Design Tokens First', { x: 1005, y: 405, font: SANS, size: 24, weight: 600, color: CLOUD }),
          t('Define spacing, typography, radii, and semantic color scales before drawing high-fidelity mockups.', { x: 1005, y: 450, font: BODY, size: 16, color: MUTED, ls: 1.5, width: 325 }),

          r({ x: 1395, y: 330, w: 405, h: 260, rx: 18, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('04', { x: 1430, y: 365, font: MONO, size: 24, weight: 700, color: LIME }),
          t('Telemetry & Loops', { x: 1430, y: 405, font: SANS, size: 24, weight: 600, color: CLOUD }),
          t('Instrument event funnels, watch heatmaps, and rapidly iterate on conversion micro-friction post-release.', { x: 1430, y: 450, font: BODY, size: 16, color: MUTED, ls: 1.5, width: 325 }),

          /* Wide Tech Stack Card */
          r({ x: 120, y: 620, w: 1680, h: 260, rx: 20, fill: PANEL_LIGHT, stroke: BORDER, strokeWidth: 1 }),
          t('DAILY PRODUCTION TOOLING & TECH STACK', { x: 170, y: 660, font: MONO, size: 14, color: LIME, tracking: 280 }),
          t('Figma · FigJam · Principle · After Effects · Rive · React · Next.js · TypeScript · Tailwind · Storybook · Playwright', { x: 170, y: 705, font: MONO, size: 22, color: CLOUD, ls: 1.5, width: 1580 }),
          t('Bridging design fidelity and engineering reality with clean git pull requests and shared design tokens.', { x: 170, y: 780, font: BODY, size: 18, color: MUTED, width: 1200 }),

          /* Footer */
          line(120, 930, 1680, BORDER, 1),
          t('METHODOLOGY // COMPLETE', { x: 120, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 }),
          t('GET IN TOUCH →', { x: 1540, y: 955, font: MONO, size: 15, color: LIME, tracking: 220 })
        ]
      }
    },
    /* 6 · CONTACT */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),
          r({ x: 120, y: 90, w: 14, h: 14, rx: 7, fill: LIME }),
          t('04 — INQUIRIES & COLLABORATION', { x: 145, y: 88, font: MONO, size: 16, weight: 600, color: LIME, tracking: 260 }),
          t('RESPONSIVE WITHIN 24 HOURS', { x: 1430, y: 88, font: MONO, size: 15, color: MUTED, tracking: 200 }),
          line(120, 135, 1680, BORDER, 1),

          t('Have a product that needs\na sharp, decisive edge?', { x: 120, y: 180, font: SANS, size: 84, weight: 600, color: CLOUD }),

          /* Left Card */
          r({ x: 120, y: 340, w: 820, h: 540, rx: 24, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('DIRECT CHANNELS', { x: 170, y: 390, font: MONO, size: 14, color: LIME, tracking: 260 }),
          t('neo@studio.design', { x: 170, y: 440, font: MONO, size: 44, weight: 700, color: LIME }),
          t('Response time: Under 24 hours for verified project briefs.', { x: 170, y: 520, font: BODY, size: 18, color: MUTED }),
          line(170, 580, 720, BORDER, 1),
          t('CONNECT & VERIFIED ACCOUNTS', { x: 170, y: 620, font: MONO, size: 14, color: LIME, tracking: 240 }),
          t('GitHub: @neo-design   ·   X / Twitter: @neostudio\nLinkedIn: in/neodesign   ·   Substack: neo.craft', { x: 170, y: 660, font: MONO, size: 18, color: CLOUD, ls: 1.6 }),
          ...btn({ x: 170, y: 770, w: 260, h: 52, fill: LIME, rx: 12, text: 'BOOK INTRO CALL (15M) →', textColor: BG, textSize: 13, textWeight: 700, font: MONO }),

          /* Right Card */
          r({ x: 980, y: 340, w: 820, h: 540, rx: 24, fill: PANEL_LIGHT, stroke: BORDER_LIME, strokeWidth: 1 }),
          t('COLLABORATION SCOPES', { x: 1030, y: 390, font: MONO, size: 14, color: LIME, tracking: 260 }),
          t('Selected engagement models:', { x: 1030, y: 435, font: SANS, size: 28, weight: 600, color: CLOUD }),

          r({ x: 1030, y: 490, w: 720, h: 100, rx: 14, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('01 · DESIGN SYSTEM RETROFIT', { x: 1060, y: 515, font: MONO, size: 13, color: LIME, tracking: 200 }),
          t('4 to 6 weeks. Audit existing debt, build unified token schema, ship Storybook components.', { x: 1060, y: 545, font: BODY, size: 16, color: CLOUD }),

          r({ x: 1030, y: 610, w: 720, h: 100, rx: 14, fill: PANEL, stroke: BORDER, strokeWidth: 1 }),
          t('02 · ZERO-TO-ONE PRODUCT LAUNCH', { x: 1060, y: 635, font: MONO, size: 13, color: LIME, tracking: 200 }),
          t('8 to 12 weeks. Full user discovery, wireframes, interactive high-fidelity prototype, and QA.', { x: 1060, y: 665, font: BODY, size: 16, color: CLOUD }),

          t('Currently accepting 2 select client partnerships for upcoming quarters.', { x: 1030, y: 750, font: BODY, size: 16, color: MUTED }),

          /* Footer */
          line(120, 930, 1680, BORDER, 1),
          t('© 2026 NEO STUDIO. ALL RIGHTS RESERVED.', { x: 120, y: 955, font: MONO, size: 15, color: MUTED, tracking: 220 }),
          t('JAKARTA // SINGAPORE // REMOTE', { x: 1460, y: 955, font: MONO, size: 15, color: MUTED, tracking: 200 })
        ]
      }
    }
  ]
};

