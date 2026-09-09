/**
 * LUMINA FOLIO — Premium minimalist light-mode personal portfolio.
 * Inspired by modern Swiss design, high-contrast typography, crisp borders, and electric cobalt accent.
 * Fonts: Outfit (Headlines) + Inter (Body) + JetBrains Mono (Labels/Stats).
 *
 * 8 pages:
 * 01 · Cover / Hero
 * 02 · About & Philosophy
 * 03 · Selected Works (3-Col Grid)
 * 04 · Deep-Dive Case Study
 * 05 · Visual Journal & Photogrid
 * 06 · Capabilities & Stack
 * 07 · Career Journey & Experience
 * 08 · Contact & Colophon
 */

const BG = '#F8F9FA';
const WHITE = '#FFFFFF';
const CARD_BG = '#FFFFFF';
const CARD_SUBTLE = '#F1F3F5';
const INK = '#0F172A';
const INK_MUTED = '#475569';
const INK_LIGHT = '#94A3B8';
const BORDER = '#E2E8F0';
const BORDER_STRONG = '#CBD5E1';
const ACCENT = '#2563EB';
const ACCENT_SOFT = '#EFF6FF';
const ACCENT_BORDER = '#BFDBFE';
const SUCCESS = '#10B981';
const SUCCESS_SOFT = '#ECFDF5';

const HEAD = 'Outfit';
const SANS = 'Inter';
const MONO = 'JetBrains Mono';

function t(s, { x, y, font = SANS, size = 24, weight = 400, color = INK, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text', custom = null } = {}) {
  const base = {
    type: width ? 'textbox' : 'i-text',
    text: s, left: x, top: y,
    fontFamily: font, fontSize: size, fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal',
    fill: color, lineHeight: ls, charSpacing: tracking, textAlign: align,
    originX: 'left', originY: 'top', selectable: true, name
  };
  if (width) { base.width = width; base.splitByGrapheme = false; }
  if (custom) base.custom = custom;
  return base;
}

function r({ x, y, w, h, fill = CARD_BG, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
  const obj = {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx,
    fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
  if (custom) obj.custom = custom;
  return obj;
}

function circ({ x, y, d, fill, stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
  const obj = {
    type: 'ellipse', left: x, top: y, rx: d / 2, ry: d / 2, fill,
    stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
  if (custom) obj.custom = custom;
  return obj;
}

function line(x, y, w, color = BORDER, h = 1) {
  return r({ x, y, w, h, fill: color, name: 'Divider' });
}

function tag(text, { x, y, fill = ACCENT_SOFT, textColor = ACCENT, font = MONO, size = 11, border = ACCENT_BORDER } = {}) {
  const w = text.length * 8 + 24;
  return [
    r({ x, y, w, h: 28, fill, rx: 6, stroke: border, strokeWidth: 1, name: 'Tag Box' }),
    t(text, { x: x + 12, y: y + 6, font, size, weight: 600, color: textColor, tracking: 80, name: 'Tag Label' })
  ];
}

function photoFrame({ x, y, w, h, rx = 20, fill = '#EAECEF', stroke = BORDER, strokeWidth = 1, name = 'Photo Frame' } = {}) {
  return r({
    x, y, w, h, fill, rx, stroke, strokeWidth, name,
    custom: { isPhotoPlaceholder: true, label: name }
  });
}

function btn({ x, y, w, h, fill = ACCENT, rx = 12, text, textColor = WHITE, textSize = 15, textWeight = 700, font = HEAD, stroke = null, strokeWidth = 0, name = 'Button' }) {
  return [
    r({ x, y, w, h, fill, rx, stroke, strokeWidth, name: `${name} Bg` }),
    {
      type: 'i-text', text,
      left: x + w / 2, top: y + h / 2,
      originX: 'center', originY: 'center',
      fontFamily: font, fontSize: textSize, fontWeight: textWeight, fill: textColor,
      selectable: true, name: `${name} Text`
    }
  ];
}

export default {
  id: 'pack-lumina-folio',
  name: 'Lumina Folio',
  theme: ['#F8F9FA', '#2563EB', '#0F172A'],
  description: 'Clean light mode personal portfolio — modern Swiss typography, crisp borders, cobalt accent',
  projectName: 'Julian Vane — Personal Portfolio',
  pages: [

    /* ══════════════════════════════════════════════════════════════════
       PAGE 1 · COVER / HERO
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          // Background canvas
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header Bar
          r({ x: 100, y: 50, w: 42, h: 42, fill: INK, rx: 10, name: 'Monogram' }),
          t('JV', { x: 111, y: 60, font: HEAD, size: 18, weight: 800, color: WHITE }),
          t('JULIAN VANE', { x: 156, y: 62, font: HEAD, size: 15, weight: 700, color: INK, tracking: 160 }),
          t('// PRODUCT DESIGNER & TECHNOLOGIST', { x: 285, y: 63, font: MONO, size: 12, color: INK_LIGHT, tracking: 100 }),

          // Status Badge (Top Right)
          r({ x: 1470, y: 50, w: 350, h: 42, fill: SUCCESS_SOFT, rx: 21, stroke: '#A7F3D0', strokeWidth: 1 }),
          circ({ x: 1490, y: 66, d: 10, fill: SUCCESS }),
          t('AVAILABLE FOR WORK · Q2 2026', { x: 1512, y: 64, font: MONO, size: 11, weight: 700, color: '#065F46', tracking: 120 }),

          line(100, 115, 1720),

          // Main Headline
          t('Crafting digital\nexperiences with\nclarity & intent.', {
            x: 100, y: 170, font: HEAD, size: 94, weight: 800, color: INK, ls: 1.05
          }),

          // Subtitle Paragraph
          t('Senior Product Designer & Creative Technologist with 8+ years\nbuilding thoughtful software, scalable design systems, and\nintelligent user interfaces for global industry leaders.', {
            x: 100, y: 510, font: SANS, size: 21, color: INK_MUTED, ls: 1.6, width: 780
          }),

          // CTA Buttons
          ...btn({ x: 100, y: 660, w: 260, h: 56, fill: ACCENT, rx: 14, text: 'EXPLORE WORKS ↓', textColor: WHITE, textSize: 14, font: MONO }),
          ...btn({ x: 380, y: 660, w: 220, h: 56, fill: WHITE, rx: 14, text: 'DOWNLOAD CV ↗', textColor: INK, textSize: 14, font: MONO, stroke: BORDER_STRONG, strokeWidth: 1.5 }),

          // Metrics Strip (Bottom Left)
          r({ x: 100, y: 770, w: 840, h: 140, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('8+', { x: 150, y: 800, font: HEAD, size: 48, weight: 800, color: ACCENT }),
          t('YEARS CRAFTING\nDIGITAL PRODUCTS', { x: 150, y: 855, font: MONO, size: 11, weight: 600, color: INK_MUTED, ls: 1.3 }),

          line(390, 800, 1, BORDER, 80),

          t('34+', { x: 440, y: 800, font: HEAD, size: 48, weight: 800, color: INK }),
          t('ENTERPRISE &\nCONSUMER SHIPS', { x: 440, y: 855, font: MONO, size: 11, weight: 600, color: INK_MUTED, ls: 1.3 }),

          line(680, 800, 1, BORDER, 80),

          t('12M', { x: 730, y: 800, font: HEAD, size: 48, weight: 800, color: INK }),
          t('ACTIVE MONTHLY\nUSERS IMPACTED', { x: 730, y: 855, font: MONO, size: 11, weight: 600, color: INK_MUTED, ls: 1.3 }),

          // Right Hero Portrait Card
          r({ x: 1040, y: 170, w: 780, h: 740, fill: WHITE, rx: 28, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 1070, y: 200, w: 720, h: 600, rx: 20, name: 'Hero Portrait' }),

          // Caption underneath photo
          t('JULIAN VANE · STUDIO PORTRAIT 2026', { x: 1080, y: 830, font: MONO, size: 12, weight: 600, color: INK_MUTED, tracking: 160 }),
          t('SAN FRANCISCO, CA', { x: 1640, y: 830, font: MONO, size: 12, weight: 600, color: INK_LIGHT, tracking: 120 }),

          // Bottom Bar
          line(100, 970, 1720),
          t('© 2026 JULIAN VANE. ALL RIGHTS RESERVED.', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('SCROLL FOR ABOUT & SELECTED PROJECTS ↓', { x: 1400, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 2 · ABOUT & PHILOSOPHY
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'About & Philosophy',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('01', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('ABOUT & PHILOSOPHY', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          // Intro Large
          t('Designing at the nexus\nof human intuition and\nsoftware architecture.', {
            x: 100, y: 120, font: HEAD, size: 58, weight: 800, color: INK, ls: 1.15
          }),

          // Paragraph Bio
          t('Over the past 8 years, I have collaborated with visionary founders, design-led enterprises, and high-velocity engineering teams to transform ambiguous problems into elegant, production-grade solutions.', {
            x: 100, y: 340, font: SANS, size: 19, color: INK_MUTED, ls: 1.7, width: 860
          }),
          t('My approach bridges product strategy, systematic visual design, and real front-end execution. I believe the best interfaces are those that disappear into the flow of human thought.', {
            x: 100, y: 440, font: SANS, size: 19, color: INK_MUTED, ls: 1.7, width: 860
          }),

          // 3 Philosophy Bento Cards
          r({ x: 100, y: 570, w: 270, h: 350, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('01', { x: 130, y: 605, font: MONO, size: 20, weight: 800, color: ACCENT }),
          t('Intentional\nSimplicity', { x: 130, y: 645, font: HEAD, size: 24, weight: 700, color: INK, ls: 1.2 }),
          t('Removing every gratuitous pixel so the core user goal is effortless, focused, and intuitive.', {
            x: 130, y: 730, font: SANS, size: 15, color: INK_MUTED, ls: 1.6, width: 210
          }),

          r({ x: 395, y: 570, w: 270, h: 350, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('02', { x: 425, y: 605, font: MONO, size: 20, weight: 800, color: ACCENT }),
          t('Systematic\nRigor', { x: 425, y: 645, font: HEAD, size: 24, weight: 700, color: INK, ls: 1.2 }),
          t('Designing robust component ecosystems and multi-tier tokens that scale seamlessly across platforms.', {
            x: 425, y: 730, font: SANS, size: 15, color: INK_MUTED, ls: 1.6, width: 210
          }),

          r({ x: 690, y: 570, w: 270, h: 350, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('03', { x: 720, y: 605, font: MONO, size: 20, weight: 800, color: ACCENT }),
          t('Living Code &\nCraft', { x: 720, y: 645, font: HEAD, size: 24, weight: 700, color: INK, ls: 1.2 }),
          t('Bridging Figma and React directly to guarantee 60fps micro-interactions and accessibility compliance.', {
            x: 720, y: 730, font: SANS, size: 15, color: INK_MUTED, ls: 1.6, width: 210
          }),

          // Right Column: Photo + Credentials
          photoFrame({ x: 1040, y: 120, w: 780, h: 430, rx: 24, name: 'Workspace Photo' }),

          // Credentials Bento Box
          r({ x: 1040, y: 570, w: 780, h: 350, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('BACKGROUND & CREDENTIALS', { x: 1080, y: 605, font: MONO, size: 12, weight: 700, color: ACCENT, tracking: 180 }),

          t('B.S. Symbolic Systems (Human-Computer Interaction)', { x: 1080, y: 645, font: HEAD, size: 20, weight: 700, color: INK }),
          t('Stanford University · Class of 2018 · Departmental Honors', { x: 1080, y: 675, font: SANS, size: 15, color: INK_MUTED }),

          line(1080, 715, 700),

          t('CURRENT AFFILIATIONS', { x: 1080, y: 740, font: MONO, size: 12, weight: 700, color: ACCENT, tracking: 180 }),
          t('Staff Product Designer @ Lattice Labs (SF)', { x: 1080, y: 775, font: HEAD, size: 18, weight: 600, color: INK }),
          t('Visiting Mentor @ Interaction Design Association (IxDA)', { x: 1080, y: 805, font: SANS, size: 15, color: INK_MUTED }),
          t('Angel Investor & Design Advisor to early-stage dev-tool startups', { x: 1080, y: 835, font: SANS, size: 15, color: INK_MUTED }),

          // Footer
          line(100, 970, 1720),
          t('02 // SELECTED WORKS', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('NEXT: PROJECT SHOWCASE →', { x: 1500, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 3 · SELECTED WORKS (3-COLUMN PROJECT GRID)
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Selected Works',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('02', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('SELECTED WORKS // 2024–2026', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          t('Handcrafted Digital Products & Systems', { x: 100, y: 110, font: HEAD, size: 48, weight: 800, color: INK }),
          t('A collection of flagship software, generative AI interfaces, and design architectures.', {
            x: 100, y: 165, font: SANS, size: 17, color: INK_MUTED
          }),

          // Project Card 1
          r({ x: 100, y: 220, w: 550, h: 710, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 120, y: 240, w: 510, h: 320, rx: 16, name: 'Helix Project Mockup' }),
          ...tag('AI WORKSPACE · SAAS', { x: 130, y: 580, fill: ACCENT_SOFT, textColor: ACCENT, border: ACCENT_BORDER }),
          t('Helix — AI Knowledge Workspace', { x: 130, y: 625, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Reinvented organizational knowledge with an autonomous canvas that links docs, code, and team communications.', {
            x: 130, y: 665, font: SANS, size: 15, color: INK_MUTED, ls: 1.5, width: 490
          }),
          line(130, 755, 490),
          t('Lead Designer · 9 Mos', { x: 130, y: 775, font: MONO, size: 12, color: INK_LIGHT }),
          t('VIEW CASE STUDY ↗', { x: 480, y: 775, font: MONO, size: 12, weight: 700, color: ACCENT }),

          // Project Card 2
          r({ x: 685, y: 220, w: 550, h: 710, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 705, y: 240, w: 510, h: 320, rx: 16, name: 'Strata Project Mockup' }),
          ...tag('FINTECH · WEBGL DATA', { x: 715, y: 580, fill: '#F0FDF4', textColor: '#16A34A', border: '#BBF7D0' }),
          t('Strata — Institutional Portfolio OS', { x: 715, y: 625, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Real-time portfolio management console processing over $4.2B in weekly transactions with sub-40ms latency visualizers.', {
            x: 715, y: 665, font: SANS, size: 15, color: INK_MUTED, ls: 1.5, width: 490
          }),
          line(715, 755, 490),
          t('Principal UX · React 19', { x: 715, y: 775, font: MONO, size: 12, color: INK_LIGHT }),
          t('VIEW LIVE SITE ↗', { x: 1085, y: 775, font: MONO, size: 12, weight: 700, color: '#16A34A' }),

          // Project Card 3
          r({ x: 1270, y: 220, w: 550, h: 710, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 1290, y: 240, w: 510, h: 320, rx: 16, name: 'Prism Project Mockup' }),
          ...tag('DESIGN SYSTEM · TOOLING', { x: 1300, y: 580, fill: '#FAF5FF', textColor: '#9333EA', border: '#E9D5FF' }),
          t('Prism — Multi-Brand Token System', { x: 1300, y: 625, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Automated token pipeline translating Figma variables directly to iOS, Android, and Web components across 28 squads.', {
            x: 1300, y: 665, font: SANS, size: 15, color: INK_MUTED, ls: 1.5, width: 490
          }),
          line(1300, 755, 490),
          t('Core Architecture', { x: 1300, y: 775, font: MONO, size: 12, color: INK_LIGHT }),
          t('VIEW SPECIFICATION ↗', { x: 1640, y: 775, font: MONO, size: 12, weight: 700, color: '#9333EA' }),

          // Footer
          line(100, 970, 1720),
          t('DRAG ANY SCREENSHOT ONTO MOCKUP SLOTS TO AUTO-MASK', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('03 // DEEP DIVE CASE STUDY →', { x: 1470, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 4 · DEEP DIVE CASE STUDY
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Case Study',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('03', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('FEATURED CASE STUDY // HELIX AI', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          t('Helix: Transforming Knowledge Work\nwith Ambient Agentic Canvas', {
            x: 100, y: 110, font: HEAD, size: 48, weight: 800, color: INK, ls: 1.1
          }),

          // Metadata Tag Pills (Right Aligned)
          r({ x: 1200, y: 110, w: 620, h: 80, fill: WHITE, rx: 16, stroke: BORDER, strokeWidth: 1.5 }),
          t('ROLE: LEAD PRODUCT DESIGNER', { x: 1230, y: 130, font: MONO, size: 11, weight: 700, color: INK_MUTED }),
          t('PLATFORM: WEB & DESKTOP (MACOS)', { x: 1230, y: 155, font: MONO, size: 11, weight: 700, color: INK_MUTED }),
          t('TIMELINE: 9 MONTHS', { x: 1520, y: 130, font: MONO, size: 11, weight: 700, color: ACCENT }),
          t('STATUS: ACQUIRED ($42M)', { x: 1520, y: 155, font: MONO, size: 11, weight: 700, color: '#16A34A' }),

          // Hero Interface Mockup Frame
          r({ x: 100, y: 220, w: 1720, h: 480, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          // Window titlebar dots
          circ({ x: 130, y: 245, d: 12, fill: '#FF5F56' }),
          circ({ x: 152, y: 245, d: 12, fill: '#FFBD2E' }),
          circ({ x: 174, y: 245, d: 12, fill: '#27C93F' }),
          t('https://app.helix.ai/workspace/canvas-v2', { x: 220, y: 243, font: MONO, size: 12, color: INK_LIGHT }),
          photoFrame({ x: 120, y: 275, w: 1680, h: 405, rx: 16, name: 'Helix High-Res Dashboard Screenshot' }),

          // 3 Column Strategic Breakdown
          r({ x: 100, y: 725, w: 550, h: 215, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('THE PROBLEM & USER FRICTION', { x: 130, y: 750, font: MONO, size: 11, weight: 700, color: '#DC2626', tracking: 140 }),
          t('Context Switching Tax', { x: 130, y: 775, font: HEAD, size: 22, weight: 700, color: INK }),
          t('Knowledge workers toggled across 8+ disconnected tabs every hour, losing 4.2 hours weekly to redundant searching and copy-pasting.', {
            x: 130, y: 815, font: SANS, size: 14, color: INK_MUTED, ls: 1.5, width: 490
          }),

          r({ x: 685, y: 725, w: 550, h: 215, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('THE ARCHITECTURAL SOLUTION', { x: 715, y: 750, font: MONO, size: 11, weight: 700, color: ACCENT, tracking: 140 }),
          t('Infinite Context Canvas', { x: 715, y: 775, font: HEAD, size: 22, weight: 700, color: INK }),
          t('Engineered a multi-threaded spatial canvas where AI assistants proactively pull relevant docs, code snippets, and chats into modular node cards.', {
            x: 715, y: 815, font: SANS, size: 14, color: INK_MUTED, ls: 1.5, width: 490
          }),

          r({ x: 1270, y: 725, w: 550, h: 215, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('MEASURED BUSINESS OUTCOME', { x: 1300, y: 750, font: MONO, size: 11, weight: 700, color: '#16A34A', tracking: 140 }),
          t('3.2x Engagement & Growth', { x: 1300, y: 775, font: HEAD, size: 22, weight: 700, color: INK }),
          t('+64% weekly user retention, 280,000 monthly active workspaces, and 98.4% CSAT score resulting in acquisition within 14 months of public launch.', {
            x: 1300, y: 815, font: SANS, size: 14, color: INK_MUTED, ls: 1.5, width: 490
          }),

          // Footer
          line(100, 970, 1720),
          t('04 // PHOTO JOURNAL & VISUAL GALLERY', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('NEXT: GALLERY GRID →', { x: 1530, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 5 · PHOTO JOURNAL / VISUAL GALLERY
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Photo Journal',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('04', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('VISUAL JOURNAL // PROCESS & TRAVELS', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          t('Curated Imagery & Explorations', { x: 100, y: 110, font: HEAD, size: 48, weight: 800, color: INK }),
          t('Documenting physical prototyping, studio environments, typography specimens, and field observations.', {
            x: 100, y: 165, font: SANS, size: 17, color: INK_MUTED
          }),

          // Asymmetric Light Mode Bento Photo Grid
          // Hero Photo Left
          r({ x: 100, y: 220, w: 740, h: 710, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 120, y: 240, w: 700, h: 580, rx: 18, name: 'Main Visual Journal Shot' }),
          t('STUDIO ARCHIVE · TOKYO EXPEDITION 2025', { x: 130, y: 845, font: MONO, size: 12, weight: 700, color: INK }),
          t('Exploration of tactile minimalism, papercraft, and micro-architecture.', { x: 130, y: 875, font: SANS, size: 14, color: INK_MUTED }),

          // Right Grid: 4 Photos
          // Top row right (2 cards)
          r({ x: 870, y: 220, w: 460, h: 340, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 885, y: 235, w: 430, h: 250, rx: 14, name: 'Journal Slot B' }),
          t('01 // PHYSICAL PROTOTYPE', { x: 895, y: 505, font: MONO, size: 11, weight: 700, color: ACCENT }),
          t('CNC milled aluminum chassis for desk timer', { x: 895, y: 525, font: SANS, size: 13, color: INK_MUTED }),

          r({ x: 1360, y: 220, w: 460, h: 340, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 1375, y: 235, w: 430, h: 250, rx: 14, name: 'Journal Slot C' }),
          t('02 // EDITORIAL PRINT SPECIMEN', { x: 1385, y: 505, font: MONO, size: 11, weight: 700, color: ACCENT }),
          t('Risograph printed monograph on Swiss posters', { x: 1385, y: 525, font: SANS, size: 13, color: INK_MUTED }),

          // Bottom row right (2 cards)
          r({ x: 870, y: 590, w: 460, h: 340, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 885, y: 605, w: 430, h: 250, rx: 14, name: 'Journal Slot D' }),
          t('03 // 3D PROCEDURAL SHADER', { x: 895, y: 875, font: MONO, size: 11, weight: 700, color: ACCENT }),
          t('Real-time GLSL caustics rendered in browser', { x: 895, y: 895, font: SANS, size: 13, color: INK_MUTED }),

          r({ x: 1360, y: 590, w: 460, h: 340, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          photoFrame({ x: 1375, y: 605, w: 430, h: 250, rx: 14, name: 'Journal Slot E' }),
          t('04 // DESIGN SYSTEM TOKENS', { x: 1385, y: 875, font: MONO, size: 11, weight: 700, color: ACCENT }),
          t('Semantic color contrast validation chart', { x: 1385, y: 895, font: SANS, size: 13, color: INK_MUTED }),

          // Footer
          line(100, 970, 1720),
          t('ALL PHOTOGRAPHS AND ARTIFACTS BY JULIAN VANE', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('05 // SKILLS & CAPABILITIES →', { x: 1470, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 6 · CAPABILITIES & TECH STACK
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Capabilities',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('05', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('CAPABILITIES & TOOLING // WHAT I BRING', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          t('End-to-End Product Craftsmanship', { x: 100, y: 110, font: HEAD, size: 48, weight: 800, color: INK }),
          t('From initial customer interviews to shipping performant TypeScript components.', {
            x: 100, y: 165, font: SANS, size: 17, color: INK_MUTED
          }),

          // 4 Big Capability Bento Cards (2x2 Grid)
          // Card 1: Product Design
          r({ x: 100, y: 220, w: 840, h: 340, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          r({ x: 140, y: 250, w: 48, h: 48, fill: ACCENT_SOFT, rx: 12, stroke: ACCENT_BORDER, strokeWidth: 1 }),
          t('❖', { x: 154, y: 258, font: SANS, size: 24, color: ACCENT }),
          t('Product Strategy & UX Architecture', { x: 210, y: 260, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Conducting user research, mapping service blueprints, and architecting multi-state user journeys that turn complex technical workflows into crystal-clear actions.', {
            x: 140, y: 320, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 750
          }),
          line(140, 420, 760),
          t('CORE PRACTICES', { x: 140, y: 440, font: MONO, size: 11, weight: 700, color: ACCENT, tracking: 160 }),
          t('User Journeys · Information Architecture · Rapid Wireframing · Usability Testing · Northstar Vision Decks', {
            x: 140, y: 470, font: SANS, size: 14, weight: 600, color: INK
          }),

          // Card 2: Design Systems
          r({ x: 980, y: 220, w: 840, h: 340, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          r({ x: 1020, y: 250, w: 48, h: 48, fill: '#FAF5FF', rx: 12, stroke: '#E9D5FF', strokeWidth: 1 }),
          t('✦', { x: 1034, y: 258, font: SANS, size: 24, color: '#9333EA' }),
          t('Scalable Design Systems & Ops', { x: 1090, y: 260, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Building institutional-grade component libraries, token schemas, and semantic theming systems that synchronize seamlessly with production GitHub repositories.', {
            x: 1020, y: 320, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 750
          }),
          line(1020, 420, 760),
          t('CORE PRACTICES', { x: 1020, y: 440, font: MONO, size: 11, weight: 700, color: '#9333EA', tracking: 160 }),
          t('Design Tokens (W3C) · Component Governance · WCAG 2.2 AAA Accessibility · Documentation & Tooling', {
            x: 1020, y: 470, font: SANS, size: 14, weight: 600, color: INK
          }),

          // Card 3: Creative Frontend
          r({ x: 100, y: 590, w: 840, h: 340, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          r({ x: 140, y: 620, w: 48, h: 48, fill: '#F0FDF4', rx: 12, stroke: '#BBF7D0', strokeWidth: 1 }),
          t('⚡', { x: 154, y: 628, font: SANS, size: 24, color: '#16A34A' }),
          t('Creative Frontend & Prototyping', { x: 210, y: 630, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Writing production React, Next.js, and Tailwind code. Crafting interactive prototypes that feel alive with Spring physics, fluid gestures, and 60fps animations.', {
            x: 140, y: 690, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 750
          }),
          line(140, 790, 760),
          t('CORE STACK', { x: 140, y: 810, font: MONO, size: 11, weight: 700, color: '#16A34A', tracking: 160 }),
          t('React 19 · Next.js · TypeScript · Tailwind CSS · Framer Motion · Three.js / WebGL · Vite', {
            x: 140, y: 840, font: SANS, size: 14, weight: 600, color: INK
          }),

          // Card 4: AI & Agentic Interfaces
          r({ x: 980, y: 590, w: 840, h: 340, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          r({ x: 1020, y: 620, w: 48, h: 48, fill: '#FFFBEB', rx: 12, stroke: '#FDE68A', strokeWidth: 1 }),
          t('⚙', { x: 1034, y: 628, font: SANS, size: 24, color: '#D97706' }),
          t('AI Ergonomics & Human-AI Collaboration', { x: 1090, y: 630, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Designing interfaces for non-deterministic AI outputs: proactive suggestions, real-time confidence scores, ambient tool calls, and spatial canvas interactions.', {
            x: 1020, y: 690, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 750
          }),
          line(1020, 790, 760),
          t('CORE STACK', { x: 1020, y: 810, font: MONO, size: 11, weight: 700, color: '#D97706', tracking: 160 }),
          t('LLM Workflows · Human-in-the-loop UX · Streaming State Managers · Conversational Patterns', {
            x: 1020, y: 840, font: SANS, size: 14, weight: 600, color: INK
          }),

          // Footer
          line(100, 970, 1720),
          t('TOOLS: FIGMA · VS CODE · GITHUB · LINEAR · NOTION · RAYCAST', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('06 // CAREER TIMELINE →', { x: 1510, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 7 · CAREER JOURNEY & EXPERIENCE
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Experience',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('06', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('CAREER JOURNEY // TIMELINE & ROLES', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          t('Track Record of High-Impact Leadership', { x: 100, y: 110, font: HEAD, size: 48, weight: 800, color: INK }),
          t('Eight years of progressive experience across product design, design leadership, and frontend architecture.', {
            x: 100, y: 165, font: SANS, size: 17, color: INK_MUTED
          }),

          // Timeline Table Cards
          // Role 1
          r({ x: 100, y: 220, w: 1720, h: 155, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('2023 — PRESENT', { x: 140, y: 245, font: MONO, size: 12, weight: 700, color: ACCENT, tracking: 120 }),
          t('Staff Product Designer', { x: 140, y: 275, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Lattice Labs · San Francisco, CA', { x: 140, y: 315, font: SANS, size: 15, color: INK_MUTED }),
          t('Leading the core AI experience and developer tools suite. Architected the unified canvas UI adopted by over 280 enterprise customers. Mentoring a squad of 7 designers.', {
            x: 580, y: 260, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 950
          }),
          ...tag('STAFF LEVEL', { x: 1620, y: 250, fill: ACCENT_SOFT, textColor: ACCENT }),

          // Role 2
          r({ x: 100, y: 400, w: 1720, h: 155, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('2021 — 2023', { x: 140, y: 425, font: MONO, size: 12, weight: 700, color: INK_MUTED, tracking: 120 }),
          t('Senior Product Designer', { x: 140, y: 455, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Linear Technology · Remote', { x: 140, y: 495, font: SANS, size: 15, color: INK_MUTED }),
          t('Crafted desktop keyboard-first workflows, custom filters, and multi-asset roadmaps. Reduced task creation time from 14s to 2.8s. Championed dark/light token design system.', {
            x: 580, y: 440, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 950
          }),
          ...tag('SENIOR IC', { x: 1620, y: 430, fill: CARD_SUBTLE, textColor: INK_MUTED, border: BORDER }),

          // Role 3
          r({ x: 100, y: 580, w: 1720, h: 155, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('2019 — 2021', { x: 140, y: 605, font: MONO, size: 12, weight: 700, color: INK_MUTED, tracking: 120 }),
          t('Product Designer II', { x: 140, y: 635, font: HEAD, size: 26, weight: 700, color: INK }),
          t('Stripe · Seattle, WA', { x: 140, y: 675, font: SANS, size: 15, color: INK_MUTED }),
          t('Redesigned customer billing invoices and international localized payment methods. Increased conversion by 4.8% across 32 emerging markets.', {
            x: 580, y: 620, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 950
          }),
          ...tag('PRODUCT DESIGN', { x: 1600, y: 610, fill: CARD_SUBTLE, textColor: INK_MUTED, border: BORDER }),

          // Role 4
          r({ x: 100, y: 760, w: 1720, h: 155, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('2018 — 2019', { x: 140, y: 785, font: MONO, size: 12, weight: 700, color: INK_MUTED, tracking: 120 }),
          t('Interaction Designer', { x: 140, y: 815, font: HEAD, size: 26, weight: 700, color: INK }),
          t('IDEO · Palo Alto, CA', { x: 140, y: 855, font: SANS, size: 15, color: INK_MUTED }),
          t('Prototyped forward-looking automotive consoles, spatial augmented reality concepts, and medical device hardware interfaces for Fortune 50 clients.', {
            x: 580, y: 800, font: SANS, size: 16, color: INK_MUTED, ls: 1.6, width: 950
          }),
          ...tag('CONSULTING', { x: 1620, y: 790, fill: CARD_SUBTLE, textColor: INK_MUTED, border: BORDER }),

          // Footer
          line(100, 970, 1720),
          t('REFERENCES AVAILABLE UPON REQUEST', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('07 // CONTACT & GET IN TOUCH →', { x: 1460, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 8 · CONTACT & COLOPHON
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: BG }),

          // Header
          t('07', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT }),
          t('GET IN TOUCH // INQUIRIES & COMMISSIONS', { x: 140, y: 50, font: HEAD, size: 14, weight: 700, color: INK_MUTED, tracking: 240 }),
          line(100, 85, 1720),

          // Big Invitation Headline
          t('Let\'s build something\nremarkable together.', {
            x: 100, y: 130, font: HEAD, size: 84, weight: 800, color: INK, ls: 1.05
          }),

          t('Currently considering select consulting advisory roles, strategic redesigns,\nand leadership opportunities for Q2 / Q3 2026.', {
            x: 100, y: 340, font: SANS, size: 21, color: INK_MUTED, ls: 1.6, width: 850
          }),

          // Contact Cards (3 Columns)
          // Card 1: Email
          r({ x: 100, y: 460, w: 550, h: 220, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          t('DIRECT INQUIRIES', { x: 140, y: 495, font: MONO, size: 11, weight: 700, color: ACCENT, tracking: 180 }),
          t('julian@vane.design', { x: 140, y: 535, font: HEAD, size: 28, weight: 700, color: INK }),
          t('Expected response time: within 24 hours', { x: 140, y: 585, font: SANS, size: 14, color: INK_MUTED }),
          t('SEND MESSAGE ↗', { x: 140, y: 630, font: MONO, size: 12, weight: 700, color: ACCENT }),

          // Card 2: Calendar Booking
          r({ x: 685, y: 460, w: 550, h: 220, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          t('OFFICE HOURS', { x: 725, y: 495, font: MONO, size: 11, weight: 700, color: '#16A34A', tracking: 180 }),
          t('cal.com/julianvane', { x: 725, y: 535, font: HEAD, size: 28, weight: 700, color: INK }),
          t('Schedule a 30-min intro chat or portfolio review', { x: 725, y: 585, font: SANS, size: 14, color: INK_MUTED }),
          t('BOOK SESSION ↗', { x: 725, y: 630, font: MONO, size: 12, weight: 700, color: '#16A34A' }),

          // Card 3: Location & Phone
          r({ x: 1270, y: 460, w: 550, h: 220, fill: WHITE, rx: 24, stroke: BORDER, strokeWidth: 1.5 }),
          t('LOCATION & CALLS', { x: 1310, y: 495, font: MONO, size: 11, weight: 700, color: INK_MUTED, tracking: 180 }),
          t('San Francisco, CA', { x: 1310, y: 535, font: HEAD, size: 28, weight: 700, color: INK }),
          t('+1 (415) 890-2341 · Pacific Standard Time (GMT-7)', { x: 1310, y: 585, font: SANS, size: 14, color: INK_MUTED }),
          t('MON — FRI, 9AM — 6PM PST', { x: 1310, y: 630, font: MONO, size: 12, weight: 700, color: INK_MUTED }),

          // Social Link Row (Pills)
          r({ x: 100, y: 720, w: 1720, h: 100, fill: WHITE, rx: 20, stroke: BORDER, strokeWidth: 1.5 }),
          t('CONNECT ACROSS NETWORKS:', { x: 140, y: 760, font: MONO, size: 11, weight: 700, color: INK_MUTED, tracking: 160 }),
          t('LinkedIn', { x: 420, y: 758, font: HEAD, size: 18, weight: 600, color: INK }),
          t('·', { x: 518, y: 758, font: HEAD, size: 18, color: INK_LIGHT }),
          t('Twitter / X', { x: 550, y: 758, font: HEAD, size: 18, weight: 600, color: INK }),
          t('·', { x: 664, y: 758, font: HEAD, size: 18, color: INK_LIGHT }),
          t('GitHub', { x: 696, y: 758, font: HEAD, size: 18, weight: 600, color: INK }),
          t('·', { x: 778, y: 758, font: HEAD, size: 18, color: INK_LIGHT }),
          t('Read.cv', { x: 810, y: 758, font: HEAD, size: 18, weight: 600, color: INK }),
          t('·', { x: 902, y: 758, font: HEAD, size: 18, color: INK_LIGHT }),
          t('Substack', { x: 934, y: 758, font: HEAD, size: 18, weight: 600, color: INK }),
          t('·', { x: 1032, y: 758, font: HEAD, size: 18, color: INK_LIGHT }),
          t('Dribbble', { x: 1064, y: 758, font: HEAD, size: 18, weight: 600, color: INK }),

          // Footer
          line(100, 970, 1720),
          t('DESIGNED & TYPESET WITH PROSY · BUILT WITH INTEGRITY', { x: 100, y: 995, font: MONO, size: 12, color: INK_LIGHT, tracking: 160 }),
          t('BACK TO TOP ↑', { x: 1610, y: 995, font: MONO, size: 12, color: ACCENT, tracking: 140 })
        ]
      }
    }
  ]
};
