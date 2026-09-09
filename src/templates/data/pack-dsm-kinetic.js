/**
 * DSM KINETIC — Creative Technologist & Kinetic Bauhaus Design System.
 * Deep void black, neon yellow (#FCFF2D), electric purple (#7B5CFA), cobalt (#2E66FF), and crisp white.
 * Inspired by Bauhaus typography posters, interactive design system bento grids, and bold kinetic statements.
 */

const VOID_BLACK = '#0A0C10';
const VOID_CARD = '#141720';
const VOID_BORDER = '#232836';
const NEON_YELLOW = '#FCFF2D';
const ELECTRIC_PURPLE = '#7B5CFA';
const COBALT_BLUE = '#2E66FF';
const ACID_MINT = '#33F398';
const WHITE = '#FFFFFF';
const MUTED_GRAY = '#8E98A8';
const LIGHT_GRAY = '#D8DEE9';

const SANS = 'Outfit';
const MONO = 'Space Grotesk';
const SERIF = 'Playfair Display';

function t(s, { x, y, font = MONO, size = 24, weight = 400, color = WHITE, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text' } = {}) {
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

function r({ x, y, w, h, fill = VOID_CARD, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape' }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx,
    fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
}

function c({ x, y, d, fill, stroke = null, strokeWidth = 0, name = 'Circle' }) {
  return {
    type: 'ellipse', left: x, top: y, rx: d / 2, ry: d / 2, fill,
    stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
}

function pill({ x, y, w, h, fill = NEON_YELLOW, text, textColor = VOID_BLACK, textSize = 14, font = MONO, weight = 700, stroke = null, strokeWidth = 0, name = 'Pill' }) {
  return [
    r({ x, y, w, h, fill, rx: h / 2, stroke, strokeWidth, name: `${name} Bg` }),
    {
      type: 'i-text', text,
      left: x + w / 2, top: y + h / 2,
      originX: 'center', originY: 'center',
      fontFamily: font, fontSize: textSize, fontWeight: weight, fill: textColor,
      selectable: true, name: `${name} Text`
    }
  ];
}

export default {
  id: 'pack-dsm-kinetic',
  name: 'DSM Kinetic Bauhaus',
  theme: ['#0A0C10', '#FCFF2D', '#7B5CFA'],
  description: 'Bauhaus creative technologist & kinetic typography poster pack',
  projectName: 'DSM — Kinetic Design System & Portfolio',
  pages: [
    /* 1 · DSM HERO COVER (Inspired by Reference 4) */
    {
      title: '01 · DSM Kinetic Cover',
      canvas_json: {
        backgroundColor: VOID_BLACK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: VOID_BLACK }),
          // Top Nav bar
          r({ x: 120, y: 50, w: 1680, h: 64, fill: VOID_CARD, rx: 20, stroke: VOID_BORDER, strokeWidth: 1.5, name: 'Navbar' }),
          t('DSM // KINETIC', { x: 160, y: 70, font: MONO, size: 20, weight: 700, tracking: 120, color: NEON_YELLOW }),
          ...pill({ x: 360, y: 64, w: 130, h: 36, fill: 'rgba(123,92,250,0.2)', text: 'v3.4 READY', textColor: ELECTRIC_PURPLE, textSize: 11, stroke: ELECTRIC_PURPLE, strokeWidth: 1 }),

          t('MANIFESTO', { x: 860, y: 72, font: MONO, size: 13, weight: 600, color: WHITE }),
          t('DESIGN TOKENS', { x: 1020, y: 72, font: MONO, size: 13, weight: 600, color: MUTED_GRAY }),
          t('SHOWCASE', { x: 1210, y: 72, font: MONO, size: 13, weight: 600, color: MUTED_GRAY }),
          t('EXPERIMENTS', { x: 1360, y: 72, font: MONO, size: 13, weight: 600, color: MUTED_GRAY }),
          ...pill({ x: 1560, y: 58, w: 220, h: 48, fill: NEON_YELLOW, text: 'DOWNLOAD TOKENS ↗', textColor: VOID_BLACK, textSize: 12, weight: 700 }),

          // Geometric Bauhaus Emblems
          c({ x: 120, y: 160, d: 88, fill: ELECTRIC_PURPLE, stroke: WHITE, strokeWidth: 2, name: 'Bauhaus Circle' }),
          t('D', { x: 164, y: 204, font: MONO, size: 40, weight: 800, color: WHITE, originX: 'center', originY: 'center' }),

          r({ x: 230, y: 160, w: 44, h: 88, rx: 0, fill: NEON_YELLOW, name: 'Bauhaus D1' }),
          c({ x: 230, y: 160, d: 88, fill: NEON_YELLOW, name: 'Bauhaus D2' }),
          t('S', { x: 260, y: 204, font: MONO, size: 40, weight: 800, color: VOID_BLACK, originX: 'center', originY: 'center' }),

          r({ x: 340, y: 160, w: 88, h: 88, rx: 24, fill: COBALT_BLUE, name: 'Bauhaus Square' }),
          t('M', { x: 384, y: 204, font: MONO, size: 40, weight: 800, color: WHITE, originX: 'center', originY: 'center' }),

          ...pill({ x: 460, y: 180, w: 280, h: 48, fill: VOID_CARD, text: '✦ 240+ COMPONENTS & PRIMITIVES', textColor: WHITE, textSize: 11, stroke: VOID_BORDER, strokeWidth: 1.5 }),

          // Big Kinetic Headline
          t('O  ->', { x: 120, y: 280, font: MONO, size: 76, weight: 700, color: WHITE }),
          ...pill({ x: 380, y: 290, w: 280, h: 72, fill: ELECTRIC_PURPLE, text: 'build  ↗', textColor: WHITE, textSize: 44, weight: 700 }),
          t('beautiful', { x: 690, y: 280, font: SERIF, size: 84, italic: true, weight: 700, color: NEON_YELLOW }),

          r({ x: 1060, y: 295, w: 220, h: 62, rx: 31, fill: ACID_MINT, name: 'Speech Bubble' }),
          t('craft // 2026', { x: 1170, y: 326, font: MONO, size: 20, weight: 700, color: VOID_BLACK, originX: 'center', originY: 'center' }),

          t('product  faster.', { x: 120, y: 390, font: SANS, size: 92, weight: 800, color: WHITE, tracking: -20 }),

          t('A radical design system & creative tech toolkit engineered for digital craftspeople, product visionaries, and interactive web creators.', {
            x: 125, y: 520, font: MONO, size: 20, weight: 400, color: MUTED_GRAY, width: 780, ls: 1.5
          }),

          ...pill({ x: 125, y: 640, w: 260, h: 60, fill: NEON_YELLOW, text: 'GET DSM TOKENS ↗', textColor: VOID_BLACK, textSize: 15, weight: 800 }),
          ...pill({ x: 410, y: 640, w: 220, h: 60, fill: VOID_CARD, text: 'READ MANIFESTO', textColor: WHITE, textSize: 14, stroke: VOID_BORDER, strokeWidth: 1.5 }),

          // Bottom specs matrix
          r({ x: 125, y: 750, w: 860, h: 140, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('CORE PRIMITIVES', { x: 160, y: 775, font: MONO, size: 11, weight: 700, color: NEON_YELLOW, tracking: 120 }),
          t('Figma & Token Studio', { x: 160, y: 800, font: SANS, size: 22, weight: 700, color: WHITE }),
          t('Multi-brand JSON schema', { x: 160, y: 835, font: MONO, size: 13, color: MUTED_GRAY }),

          r({ x: 440, y: 770, w: 1, h: 100, fill: VOID_BORDER }),

          t('REACT & CANVAS', { x: 480, y: 775, font: MONO, size: 11, weight: 700, color: ELECTRIC_PURPLE, tracking: 120 }),
          t('Tailwind + CSS Tokens', { x: 480, y: 800, font: SANS, size: 22, weight: 700, color: WHITE }),
          t('Zero runtime overhead', { x: 480, y: 835, font: MONO, size: 13, color: MUTED_GRAY }),

          r({ x: 740, y: 770, w: 1, h: 100, fill: VOID_BORDER }),

          t('MOTION CURVES', { x: 780, y: 775, font: MONO, size: 11, weight: 700, color: ACID_MINT, tracking: 120 }),
          t('Kinetic Spring Lib', { x: 780, y: 800, font: SANS, size: 22, weight: 700, color: WHITE }),
          t('Fluid 60fps physics', { x: 780, y: 835, font: MONO, size: 13, color: MUTED_GRAY }),

          // Right Hero Visual Terminal
          r({ x: 1040, y: 160, w: 760, h: 730, fill: VOID_CARD, rx: 32, stroke: VOID_BORDER, strokeWidth: 1.5, name: 'Hero Visual Box' }),

          r({ x: 1040, y: 160, w: 760, h: 56, fill: '#191D28', rx: 32, stroke: VOID_BORDER, strokeWidth: 1 }),
          c({ x: 1070, y: 182, d: 12, fill: '#FF5F56' }),
          c({ x: 1090, y: 182, d: 12, fill: '#FFBD2E' }),
          c({ x: 1110, y: 182, d: 12, fill: '#27C93F' }),
          t('dsm-kinetic // core-engine.ts', { x: 1145, y: 180, font: MONO, size: 12, weight: 600, color: MUTED_GRAY }),

          r({ x: 1075, y: 245, w: 690, h: 220, fill: '#0E1118', rx: 20, stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }),
          t('// TOKENS IMPORT', { x: 1105, y: 270, font: MONO, size: 12, color: MUTED_GRAY }),
          t('import { kineticSpring, bezierBounce } from "@dsm/motion";\nimport { neonYellow, electricPurple } from "@dsm/palette";\n\nexport const heroTransition = kineticSpring({\n  stiffness: 420, damping: 28, mass: 1.2\n});', {
            x: 1105, y: 300, font: MONO, size: 15, color: LIGHT_GRAY, ls: 1.6
          }),

          r({ x: 1075, y: 490, w: 330, h: 360, fill: ELECTRIC_PURPLE, rx: 24 }),
          t('COLOR PRIMITIVE', { x: 1105, y: 520, font: MONO, size: 12, weight: 700, color: 'rgba(255,255,255,0.7)', tracking: 120 }),
          t('#7B5CFA', { x: 1105, y: 545, font: MONO, size: 36, weight: 800, color: WHITE }),
          t('RGB (123, 92, 250)\nHSL (252°, 94%, 67%)', { x: 1105, y: 600, font: MONO, size: 13, color: 'rgba(255,255,255,0.85)', ls: 1.5 }),
          ...pill({ x: 1105, y: 770, w: 140, h: 42, fill: WHITE, text: 'COPIED ✓', textColor: VOID_BLACK, textSize: 12, weight: 700 }),

          r({ x: 1435, y: 490, w: 330, h: 360, fill: NEON_YELLOW, rx: 24 }),
          t('ACCENT SIGNAL', { x: 1465, y: 520, font: MONO, size: 12, weight: 700, color: 'rgba(10,12,16,0.6)', tracking: 120 }),
          t('#FCFF2D', { x: 1465, y: 545, font: MONO, size: 36, weight: 800, color: VOID_BLACK }),
          t('High-contrast neon yellow\nengineered for maximum eye\nretention in dark interfaces.', {
            x: 1465, y: 600, font: SANS, size: 15, color: VOID_BLACK, ls: 1.4, width: 270
          }),
          ...pill({ x: 1465, y: 770, w: 140, h: 42, fill: VOID_BLACK, text: 'SIGNAL TOK', textColor: NEON_YELLOW, textSize: 12, weight: 700 })
        ]
      }
    },

    /* 2 · KINETIC MANIFESTO POSTER (Inspired by Reference 5) */
    {
      title: '02 · Kinetic Poster Statement',
      canvas_json: {
        backgroundColor: NEON_YELLOW,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: NEON_YELLOW }),
          t('[ + ]', { x: 120, y: 70, font: MONO, size: 16, weight: 700, color: VOID_BLACK }),
          t('DSM // KINETIC MANIFESTO 01', { x: 200, y: 70, font: MONO, size: 14, weight: 800, tracking: 160, color: VOID_BLACK }),
          t('SERIAL NO. 883-2026', { x: 1650, y: 70, font: MONO, size: 14, weight: 700, color: VOID_BLACK, align: 'right' }),
          t('[ + ]', { x: 1770, y: 70, font: MONO, size: 16, weight: 700, color: VOID_BLACK, align: 'right' }),

          t('I', { x: 120, y: 160, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),
          ...pill({ x: 260, y: 190, w: 340, h: 100, fill: ELECTRIC_PURPLE, text: 'never', textColor: WHITE, textSize: 62, font: SERIF, weight: 700, stroke: VOID_BLACK, strokeWidth: 3 }),
          t('dreamed', { x: 650, y: 160, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),

          t('about success.', { x: 120, y: 320, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),

          t('I worked', { x: 120, y: 480, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),
          ...pill({ x: 740, y: 510, w: 180, h: 100, fill: VOID_BLACK, text: '→', textColor: NEON_YELLOW, textSize: 68, weight: 800 }),
          t('for it.', { x: 960, y: 480, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),

          r({ x: 120, y: 670, w: 1680, h: 3, fill: VOID_BLACK }),

          ...pill({ x: 120, y: 720, w: 260, h: 56, fill: VOID_BLACK, text: '#business // craft', textColor: WHITE, textSize: 16, weight: 700 }),
          t('Discipline over motivation.\nExecution over contemplation.', {
            x: 120, y: 800, font: MONO, size: 16, weight: 600, color: VOID_BLACK, ls: 1.5
          }),

          t('ATTRIBUTION', { x: 620, y: 720, font: MONO, size: 12, weight: 800, tracking: 160, color: 'rgba(10,12,16,0.6)' }),
          t('Estée Lauder', { x: 620, y: 750, font: SERIF, size: 36, weight: 700, color: VOID_BLACK }),
          t('Pioneering Founder, Creative Force & Visionary', { x: 620, y: 800, font: MONO, size: 14, color: VOID_BLACK }),

          t('KINETIC SERIES', { x: 1200, y: 720, font: MONO, size: 12, weight: 800, tracking: 160, color: 'rgba(10,12,16,0.6)' }),
          t('Poster Edition 04 / 12', { x: 1200, y: 750, font: SANS, size: 28, weight: 800, color: VOID_BLACK }),
          t('Hand-pulled silkscreen + digital generative code\nTypeset in Outfit & Space Grotesk', {
            x: 1200, y: 795, font: MONO, size: 14, color: VOID_BLACK, ls: 1.4
          }),

          t('[ + ]', { x: 120, y: 920, font: MONO, size: 16, weight: 700, color: VOID_BLACK }),
          t('© 2026 DSM CREATIVE TECH LAB', { x: 960, y: 920, font: MONO, size: 12, weight: 700, tracking: 200, color: VOID_BLACK, align: 'center' }),
          t('[ + ]', { x: 1770, y: 920, font: MONO, size: 16, weight: 700, color: VOID_BLACK, align: 'right' })
        ]
      }
    },

    /* 3 · DESIGN SYSTEM & TOKEN MATRIX */
    {
      title: '03 · Design System Tokens',
      canvas_json: {
        backgroundColor: VOID_BLACK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: VOID_BLACK }),
          ...pill({ x: 120, y: 60, w: 180, h: 34, fill: VOID_CARD, text: '✦ ARCHITECTURE', textColor: NEON_YELLOW, textSize: 11, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('Design Tokens & Primitives', { x: 120, y: 110, font: SANS, size: 48, weight: 800, color: WHITE }),
          t('Immutable atomic design primitives powering multi-platform consistency.', {
            x: 120, y: 170, font: MONO, size: 16, color: MUTED_GRAY, width: 700
          }),
          ...pill({ x: 1560, y: 110, w: 240, h: 50, fill: ELECTRIC_PURPLE, text: 'EXPORT TOKENS.JSON ↗', textColor: WHITE, textSize: 13, weight: 700 }),

          r({ x: 120, y: 230, w: 540, h: 380, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('COLOR HIERARCHY', { x: 160, y: 260, font: MONO, size: 12, weight: 700, color: NEON_YELLOW, tracking: 120 }),
          t('High-energy semantic accents', { x: 160, y: 285, font: SANS, size: 20, weight: 700, color: WHITE }),

          r({ x: 160, y: 330, w: 100, h: 100, rx: 16, fill: NEON_YELLOW }),
          t('NEON\n#FCFF2D', { x: 160, y: 445, font: MONO, size: 11, weight: 700, color: WHITE }),

          r({ x: 280, y: 330, w: 100, h: 100, rx: 16, fill: ELECTRIC_PURPLE }),
          t('ELECTRIC\n#7B5CFA', { x: 280, y: 445, font: MONO, size: 11, weight: 700, color: WHITE }),

          r({ x: 400, y: 330, w: 100, h: 100, rx: 16, fill: COBALT_BLUE }),
          t('COBALT\n#2E66FF', { x: 400, y: 445, font: MONO, size: 11, weight: 700, color: WHITE }),

          r({ x: 520, y: 330, w: 100, h: 100, rx: 16, fill: ACID_MINT }),
          t('ACID MINT\n#33F398', { x: 520, y: 445, font: MONO, size: 11, weight: 700, color: WHITE }),

          t('Contrast ratio: AAA certified (8.6:1 on #0A0C10)', { x: 160, y: 560, font: MONO, size: 12, color: MUTED_GRAY }),

          r({ x: 690, y: 230, w: 540, h: 380, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('TYPOGRAPHIC SCALE', { x: 730, y: 260, font: MONO, size: 12, weight: 700, color: ACID_MINT, tracking: 120 }),
          t('Major Third (1.250) Geometric', { x: 730, y: 285, font: SANS, size: 20, weight: 700, color: WHITE }),

          t('Display 84px / Bold', { x: 730, y: 340, font: SANS, size: 36, weight: 800, color: WHITE }),
          t('Headline 32px / Medium', { x: 730, y: 400, font: SANS, size: 24, weight: 600, color: LIGHT_GRAY }),
          t('Body 18px / Regular Outfit', { x: 730, y: 450, font: SANS, size: 18, weight: 400, color: MUTED_GRAY }),
          t('Code 14px / Space Grotesk Mono', { x: 730, y: 495, font: MONO, size: 14, weight: 600, color: NEON_YELLOW }),
          t('Fluid clamp(2rem, 5vw, 6rem) responsive math', { x: 730, y: 560, font: MONO, size: 12, color: MUTED_GRAY }),

          r({ x: 1260, y: 230, w: 540, h: 380, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('SPACING & RADIUS', { x: 1300, y: 260, font: MONO, size: 12, weight: 700, color: COBALT_BLUE, tracking: 120 }),
          t('8-Point Grid System', { x: 1300, y: 285, font: SANS, size: 20, weight: 700, color: WHITE }),

          r({ x: 1300, y: 340, w: 32, h: 32, fill: COBALT_BLUE, rx: 8 }),
          t('4px / 8px / 16px', { x: 1350, y: 346, font: MONO, size: 14, color: WHITE }),

          r({ x: 1300, y: 390, w: 48, h: 48, fill: ELECTRIC_PURPLE, rx: 12 }),
          t('24px / 32px / 48px', { x: 1370, y: 402, font: MONO, size: 14, color: WHITE }),

          r({ x: 1300, y: 455, w: 64, h: 64, fill: NEON_YELLOW, rx: 16 }),
          t('64px / 96px / 128px', { x: 1390, y: 475, font: MONO, size: 14, color: WHITE }),

          t('Corner Radius tokens: sm(8), md(16), lg(28), pill(999)', { x: 1300, y: 560, font: MONO, size: 12, color: MUTED_GRAY }),

          r({ x: 120, y: 640, w: 1680, h: 240, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('KINETIC EASING CURVES', { x: 160, y: 670, font: MONO, size: 12, weight: 700, color: NEON_YELLOW, tracking: 120 }),
          t('Fluid Bezier & Physical Springs', { x: 160, y: 695, font: SANS, size: 24, weight: 700, color: WHITE }),
          t('cubic-bezier(0.16, 1, 0.3, 1) // Ultra-smooth deceleration\ncubic-bezier(0.34, 1.56, 0.64, 1) // Tactile overshoot snap\nspring({ tension: 380, friction: 30 }) // Responsive tactile feel', {
            x: 160, y: 740, font: MONO, size: 14, color: LIGHT_GRAY, ls: 1.6
          }),

          r({ x: 1000, y: 670, w: 760, h: 180, fill: '#0E1118', rx: 20, stroke: VOID_BORDER, strokeWidth: 1 }),
          t('0.0', { x: 1020, y: 815, font: MONO, size: 11, color: MUTED_GRAY }),
          t('1.0', { x: 1720, y: 815, font: MONO, size: 11, color: MUTED_GRAY }),
          t('// REALTIME SPRING SIMULATION (60 FPS)', { x: 1020, y: 690, font: MONO, size: 11, color: ACID_MINT, tracking: 100 }),
          r({ x: 1020, y: 800, w: 700, h: 2, fill: 'rgba(255,255,255,0.1)' }),
          ...pill({ x: 1540, y: 720, w: 150, h: 36, fill: ACID_MINT, text: 'INTERACTIVE', textColor: VOID_BLACK, textSize: 11, weight: 700 })
        ]
      }
    },

    /* 4 · SELECTED WORKS & TECH SHOWCASE */
    {
      title: '04 · Selected Works Showcase',
      canvas_json: {
        backgroundColor: VOID_BLACK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: VOID_BLACK }),
          ...pill({ x: 120, y: 60, w: 180, h: 34, fill: VOID_CARD, text: '✦ PORTFOLIO 2026', textColor: NEON_YELLOW, textSize: 11, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('Selected Engineered Works', { x: 120, y: 110, font: SANS, size: 48, weight: 800, color: WHITE }),
          t('High-performance web applications, generative shaders, and kinetic design systems.', {
            x: 120, y: 170, font: MONO, size: 16, color: MUTED_GRAY, width: 800
          }),

          // Card 1
          r({ x: 120, y: 230, w: 540, h: 640, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          r({ x: 145, y: 255, w: 490, h: 280, fill: '#1B1F2D', rx: 20, stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }),
          t('WEBGL / THREE.JS', { x: 165, y: 275, font: MONO, size: 11, weight: 700, color: NEON_YELLOW, tracking: 100 }),
          t('HYPERCANVAS', { x: 165, y: 320, font: SANS, size: 36, weight: 800, color: WHITE }),
          t('Realtime 3D generative layout engine capable of rendering 100k particles at 120hz.', {
            x: 165, y: 375, font: SANS, size: 14, color: MUTED_GRAY, width: 450, ls: 1.4
          }),
          t('01 // SHADER SYSTEM', { x: 145, y: 560, font: MONO, size: 12, weight: 700, color: ELECTRIC_PURPLE }),
          t('HyperCanvas 3D Studio', { x: 145, y: 585, font: SANS, size: 24, weight: 700, color: WHITE }),
          t('Awarded Site of the Day (Awwwards) & FWA of the Month.', { x: 145, y: 620, font: SANS, size: 14, color: MUTED_GRAY, width: 480 }),
          ...pill({ x: 145, y: 680, w: 180, h: 46, fill: NEON_YELLOW, text: 'LIVE PREVIEW ↗', textColor: VOID_BLACK, textSize: 12, weight: 700 }),
          ...pill({ x: 340, y: 680, w: 160, h: 46, fill: VOID_BLACK, text: 'GITHUB ★ 4.8K', textColor: WHITE, textSize: 12, stroke: VOID_BORDER, strokeWidth: 1 }),

          // Card 2
          r({ x: 690, y: 230, w: 540, h: 640, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          r({ x: 715, y: 255, w: 490, h: 280, fill: '#251A3A', rx: 20, stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }),
          t('REACT / RUST WASM', { x: 735, y: 275, font: MONO, size: 11, weight: 700, color: ACID_MINT, tracking: 100 }),
          t('QUANTUM FLOW', { x: 735, y: 320, font: SANS, size: 36, weight: 800, color: WHITE }),
          t('Realtime collaborative data canvas with zero-latency CRDT state synchronization.', {
            x: 735, y: 375, font: SANS, size: 14, color: MUTED_GRAY, width: 450, ls: 1.4
          }),
          t('02 // COLLABORATION', { x: 715, y: 560, font: MONO, size: 12, weight: 700, color: ACID_MINT }),
          t('Quantum Flow Canvas', { x: 715, y: 585, font: SANS, size: 24, weight: 700, color: WHITE }),
          t('Deployed across 40+ engineering organizations worldwide.', { x: 715, y: 620, font: SANS, size: 14, color: MUTED_GRAY, width: 480 }),
          ...pill({ x: 715, y: 680, w: 180, h: 46, fill: ACID_MINT, text: 'LIVE PREVIEW ↗', textColor: VOID_BLACK, textSize: 12, weight: 700 }),
          ...pill({ x: 910, y: 680, w: 160, h: 46, fill: VOID_BLACK, text: 'GITHUB ★ 3.2K', textColor: WHITE, textSize: 12, stroke: VOID_BORDER, strokeWidth: 1 }),

          // Card 3
          r({ x: 1260, y: 230, w: 540, h: 640, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          r({ x: 1285, y: 255, w: 490, h: 280, fill: '#14273E', rx: 20, stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }),
          t('CREATIVE CODE / GLSL', { x: 1305, y: 275, font: MONO, size: 11, weight: 700, color: COBALT_BLUE, tracking: 100 }),
          t('NEURAL TYPE', { x: 1305, y: 320, font: SANS, size: 36, weight: 800, color: WHITE }),
          t('Generative variable typography deformed dynamically by real-time audio feeds.', {
            x: 1305, y: 375, font: SANS, size: 14, color: MUTED_GRAY, width: 450, ls: 1.4
          }),
          t('03 // EXPERIMENTAL', { x: 1285, y: 560, font: MONO, size: 12, weight: 700, color: COBALT_BLUE }),
          t('Neural Kinetic Typography', { x: 1285, y: 585, font: SANS, size: 24, weight: 700, color: WHITE }),
          t('Exhibited at Tokyo Media Arts Festival 2026.', { x: 1285, y: 620, font: SANS, size: 14, color: MUTED_GRAY, width: 480 }),
          ...pill({ x: 1285, y: 680, w: 180, h: 46, fill: COBALT_BLUE, text: 'LIVE PREVIEW ↗', textColor: WHITE, textSize: 12, weight: 700 }),
          ...pill({ x: 1480, y: 680, w: 160, h: 46, fill: VOID_BLACK, text: 'GITHUB ★ 6.1K', textColor: WHITE, textSize: 12, stroke: VOID_BORDER, strokeWidth: 1 }),

          t('✦ ALL PROJECTS OPEN SOURCE UNDER MIT LICENSE  ·  SYSTEM ARCHITECTURE AUDITED FOR ZERO-DEPENDENCY INTEGRATION', {
            x: 960, y: 915, font: MONO, size: 12, weight: 700, color: MUTED_GRAY, align: 'center', tracking: 120
          })
        ]
      }
    },

    /* 5 · GEOMETRIC GALLERY & EXPERIMENTS */
    {
      title: '05 · Kinetic Experiments Gallery',
      canvas_json: {
        backgroundColor: VOID_BLACK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: VOID_BLACK }),
          t('KINETIC LAB // EXPERIMENTS', { x: 120, y: 60, font: MONO, size: 13, weight: 700, color: NEON_YELLOW, tracking: 160 }),
          t('Generative Lab & Interactive Experiments', { x: 120, y: 95, font: SANS, size: 44, weight: 800, color: WHITE }),

          // 6-Cell Masonry Bento Gallery
          r({ x: 120, y: 170, w: 540, h: 330, fill: NEON_YELLOW, rx: 24 }),
          t('EXPERIMENT #01', { x: 155, y: 200, font: MONO, size: 12, weight: 700, color: VOID_BLACK, tracking: 120 }),
          t('Raymarching\nDistance Fields', { x: 155, y: 230, font: SANS, size: 36, weight: 900, color: VOID_BLACK }),
          t('GLSL fragment shaders simulating fractal non-Euclidean geometries in 60fps WebGL.', {
            x: 155, y: 345, font: MONO, size: 13, color: VOID_BLACK, width: 460, ls: 1.4
          }),
          ...pill({ x: 155, y: 425, w: 140, h: 40, fill: VOID_BLACK, text: 'RUN SHADER ↗', textColor: NEON_YELLOW, textSize: 11, weight: 700 }),

          r({ x: 690, y: 170, w: 540, h: 330, fill: ELECTRIC_PURPLE, rx: 24 }),
          t('EXPERIMENT #02', { x: 725, y: 200, font: MONO, size: 12, weight: 700, color: WHITE, tracking: 120 }),
          t('Spatial Audio\nBinaural Panning', { x: 725, y: 230, font: SANS, size: 36, weight: 900, color: WHITE }),
          t('WebAudio HRTF spatial positioning mapped to mouse cursor velocities.', {
            x: 725, y: 345, font: MONO, size: 13, color: 'rgba(255,255,255,0.8)', width: 460, ls: 1.4
          }),
          ...pill({ x: 725, y: 425, w: 140, h: 40, fill: WHITE, text: 'PLAY AUDIO 🔊', textColor: VOID_BLACK, textSize: 11, weight: 700 }),

          r({ x: 1260, y: 170, w: 540, h: 330, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('EXPERIMENT #03', { x: 1295, y: 200, font: MONO, size: 12, weight: 700, color: ACID_MINT, tracking: 120 }),
          t('WASM Physics\nVerlet Integration', { x: 1295, y: 230, font: SANS, size: 36, weight: 900, color: WHITE }),
          t('Cloth tearing simulation computing 50,000 springs in Rust WebAssembly.', {
            x: 1295, y: 345, font: MONO, size: 13, color: MUTED_GRAY, width: 460, ls: 1.4
          }),
          ...pill({ x: 1295, y: 425, w: 140, h: 40, fill: ACID_MINT, text: 'TEST RUST ⚙️', textColor: VOID_BLACK, textSize: 11, weight: 700 }),

          r({ x: 120, y: 530, w: 540, h: 350, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('EXPERIMENT #04', { x: 155, y: 560, font: MONO, size: 12, weight: 700, color: COBALT_BLUE, tracking: 120 }),
          t('Boids Flocking\nSwarm Behavior', { x: 155, y: 590, font: SANS, size: 36, weight: 900, color: WHITE }),
          t('Craig Reynolds emergent flocking rules rendered using instanced matrices.', {
            x: 155, y: 705, font: MONO, size: 13, color: MUTED_GRAY, width: 460, ls: 1.4
          }),
          ...pill({ x: 155, y: 795, w: 140, h: 40, fill: COBALT_BLUE, text: 'VIEW SWARM ↗', textColor: WHITE, textSize: 11, weight: 700 }),

          r({ x: 690, y: 530, w: 540, h: 350, fill: ACID_MINT, rx: 24 }),
          t('EXPERIMENT #05', { x: 725, y: 560, font: MONO, size: 12, weight: 700, color: VOID_BLACK, tracking: 120 }),
          t('Variable Font\nAudio Reactive', { x: 725, y: 590, font: SANS, size: 36, weight: 900, color: VOID_BLACK }),
          t('FFT audio spectrum driving font-variation-settings wght, wdth, and slnt in realtime.', {
            x: 725, y: 705, font: MONO, size: 13, color: VOID_BLACK, width: 460, ls: 1.4
          }),
          ...pill({ x: 725, y: 795, w: 140, h: 40, fill: VOID_BLACK, text: 'MODULATE 🎵', textColor: ACID_MINT, textSize: 11, weight: 700 }),

          r({ x: 1260, y: 530, w: 540, h: 350, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('EXPERIMENT #06', { x: 1295, y: 560, font: MONO, size: 12, weight: 700, color: NEON_YELLOW, tracking: 120 }),
          t('Marching Cubes\nIsosurface Mesh', { x: 1295, y: 590, font: SANS, size: 36, weight: 900, color: WHITE }),
          t('Dynamic voxel metaball extraction generated inside a WebWorker pipeline.', {
            x: 1295, y: 705, font: MONO, size: 13, color: MUTED_GRAY, width: 460, ls: 1.4
          }),
          ...pill({ x: 1295, y: 795, w: 140, h: 40, fill: NEON_YELLOW, text: 'EXTRACT 3D ↗', textColor: VOID_BLACK, textSize: 11, weight: 700 })
        ]
      }
    },

    /* 6 · TERMINAL & INQUIRIES */
    {
      title: '06 · Kinetic Terminal & Booking',
      canvas_json: {
        backgroundColor: VOID_BLACK,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: VOID_BLACK }),
          r({ x: 120, y: 80, w: 1680, h: 840, fill: VOID_CARD, rx: 36, stroke: VOID_BORDER, strokeWidth: 1.5 }),

          ...pill({ x: 180, y: 140, w: 220, h: 36, fill: '#0E1118', text: '● SYSTEM ONLINE // AVAIL Q3', textColor: ACID_MINT, textSize: 11, stroke: ACID_MINT, strokeWidth: 1 }),
          t('Initiate\nCreative Tech\nCollaboration.', {
            x: 180, y: 200, font: SANS, size: 68, weight: 900, color: WHITE, ls: 1.05
          }),
          t('Partnering with ambitious founders, product design teams, and progressive agencies to engineer iconic digital experiences.', {
            x: 180, y: 460, font: MONO, size: 18, color: MUTED_GRAY, width: 620, ls: 1.5
          }),

          t('SERVICES & CAPABILITIES', { x: 180, y: 580, font: MONO, size: 12, weight: 700, color: NEON_YELLOW, tracking: 160 }),
          t('✦ Design Systems Architecture (Tokens, Multi-brand)\n✦ High-Fidelity Interactive Prototyping\n✦ WebGL / 3D Canvas / Generative Code\n✦ Technical Advisory & Design Ops Consulting', {
            x: 180, y: 615, font: SANS, size: 16, color: LIGHT_GRAY, ls: 1.7
          }),

          t('hello@dsm-kinetic.tech  ·  github.com/dsm-kinetic  ·  x.com/dsm_kinetic', {
            x: 180, y: 780, font: MONO, size: 14, weight: 600, color: NEON_YELLOW
          }),

          r({ x: 920, y: 140, w: 820, h: 720, fill: '#0A0C10', rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),

          r({ x: 920, y: 140, w: 820, h: 54, fill: '#141720', rx: 28, stroke: VOID_BORDER, strokeWidth: 1 }),
          c({ x: 950, y: 162, d: 12, fill: '#FF5F56' }),
          c({ x: 970, y: 162, d: 12, fill: '#FFBD2E' }),
          c({ x: 990, y: 162, d: 12, fill: '#27C93F' }),
          t('bash -- inquiry-session-q3.sh', { x: 1020, y: 160, font: MONO, size: 12, color: MUTED_GRAY }),

          t('dsm@terminal:~$ ./connect --role "Product Lead" --intent "Design System"', {
            x: 960, y: 230, font: MONO, size: 14, color: NEON_YELLOW
          }),
          t('Initializing handshake protocol...\n[✓] Architecture slot: RESERVED\n[✓] Security token: VERIFIED\n[✓] Calendar sync: AVAILABLE', {
            x: 960, y: 270, font: MONO, size: 14, color: ACID_MINT, ls: 1.6
          }),

          t('CLIENT / ORGANISATION', { x: 960, y: 380, font: MONO, size: 11, weight: 700, color: MUTED_GRAY }),
          r({ x: 960, y: 405, w: 740, h: 56, fill: '#141720', rx: 14, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('Stripe / Vercel / Independent Studio', { x: 985, y: 422, font: MONO, size: 15, color: WHITE }),

          t('DIRECT EMAIL', { x: 960, y: 485, font: MONO, size: 11, weight: 700, color: MUTED_GRAY }),
          r({ x: 960, y: 510, w: 740, h: 56, fill: '#141720', rx: 14, stroke: VOID_BORDER, strokeWidth: 1.5 }),
          t('lead@studio.design', { x: 985, y: 527, font: MONO, size: 15, color: WHITE }),

          t('ESTIMATED TIMELINE & BUDGET', { x: 960, y: 590, font: MONO, size: 11, weight: 700, color: MUTED_GRAY }),
          ...pill({ x: 960, y: 615, w: 180, h: 42, fill: ELECTRIC_PURPLE, text: '✦ 4–8 Weeks', textColor: WHITE, textSize: 12 }),
          ...pill({ x: 1160, y: 615, w: 180, h: 42, fill: '#141720', text: '8–16 Weeks', textColor: MUTED_GRAY, textSize: 12, stroke: VOID_BORDER, strokeWidth: 1 }),
          ...pill({ x: 1360, y: 615, w: 180, h: 42, fill: '#141720', text: 'Retainer / Advisory', textColor: MUTED_GRAY, textSize: 12, stroke: VOID_BORDER, strokeWidth: 1 }),

          ...pill({ x: 960, y: 710, w: 740, h: 64, fill: NEON_YELLOW, text: 'DISPATCH TRANSMISSION ↗', textColor: VOID_BLACK, textSize: 15, weight: 800 }),
          t('Average reply time: < 4 hours. PGP key available on request.', {
            x: 1330, y: 795, font: MONO, size: 12, color: MUTED_GRAY, align: 'center'
          })
        ]
      }
    }
  ]
};
