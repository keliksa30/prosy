/**
 * PERSONA FOLIO — Premium personal portfolio deck.
 * Dark mode, bento grid, soft curves, monochromatic palette with warm accent.
 * Fonts: Outfit (headlines) + Inter (body) + JetBrains Mono (code/labels).
 *
 * 8 pages: Cover, About Me, Photo Gallery, Skills & Services,
 * Project Showcase, Case Study, Testimonials, Contact.
 */
const BG = '#0C0C0F';
const BG_CARD = '#16161A';
const BG_ELEVATED = '#1E1E24';
const WHITE = '#F5F5F7';
const WHITE_70 = 'rgba(245,245,247,0.7)';
const WHITE_40 = 'rgba(245,245,247,0.4)';
const WHITE_12 = 'rgba(245,245,247,0.12)';
const WHITE_06 = 'rgba(245,245,247,0.06)';
const ACCENT = '#E8A838';
const ACCENT_SOFT = 'rgba(232,168,56,0.15)';
const ACCENT_DIM = '#C48E2C';
const ROSE = '#F472B6';
const TEAL = '#2DD4BF';
const VIOLET = '#A78BFA';

const HEAD = 'Outfit';
const SANS = 'Inter';
const MONO = 'JetBrains Mono';

function t(s, { x, y, font = SANS, size = 24, weight = 400, color = WHITE, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text' } = {}) {
  const base = {
    type: width ? 'textbox' : 'i-text',
    text: s, left: x, top: y,
    fontFamily: font, fontSize: size, fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal',
    fill: color, lineHeight: ls, charSpacing: tracking, textAlign: align,
    originX: 'left', originY: 'top', selectable: true, name
  };
  if (width) { base.width = width; base.splitByGrapheme = false; }
  return base;
}

function r({ x, y, w, h, fill = BG_CARD, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
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

function line(x, y, w, color = WHITE_12, h = 1) {
  return r({ x, y, w, h, fill: color, name: 'Divider' });
}

function tag(text, { x, y, fill = ACCENT_SOFT, textColor = ACCENT, font: f = MONO, size = 11 } = {}) {
  return [
    r({ x, y, w: text.length * 8 + 24, h: 28, fill, rx: 6, name: 'Tag' }),
    t(text, { x: x + 12, y: y + 6, font: f, size, weight: 600, color: textColor, tracking: 80 })
  ];
}

function photoFrame({ x, y, w, h, rx = 16, name = 'Photo Frame' }) {
  return r({
    x, y, w, h, fill: BG_ELEVATED, rx, stroke: WHITE_12, strokeWidth: 1, name,
    custom: { isPhotoPlaceholder: true, label: name }
  });
}

export default {
  id: 'pack-persona-folio',
  name: 'Persona Folio',
  theme: ['#0C0C0F', '#E8A838', '#F5F5F7'],
  description: 'Premium personal portfolio — dark, bento grid, warm accent',
  projectName: 'Arif — Personal Portfolio',
  pages: [

    /* ══════════════════════════════════════════════════════════════════
       PAGE 1 · COVER
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          // Top bar
          t('ARIF NUGRAHA', { x: 80, y: 50, font: HEAD, size: 16, weight: 700, color: ACCENT, tracking: 400 }),
          t('PORTFOLIO 2026', { x: 1620, y: 50, font: MONO, size: 13, color: WHITE_40, tracking: 200 }),
          line(80, 85, 1760),

          // Giant hero text
          t('Designer', { x: 80, y: 140, font: HEAD, size: 160, weight: 800, color: WHITE, ls: 0.9 }),
          t('& Creative', { x: 80, y: 310, font: HEAD, size: 160, weight: 800, color: WHITE_40, ls: 0.9 }),
          t('Developer', { x: 80, y: 480, font: HEAD, size: 160, weight: 800, color: ACCENT, ls: 0.9 }),

          // Subtitle
          t('I craft premium digital experiences — from brand identity\nto interactive products that feel alive.', {
            x: 80, y: 680, font: SANS, size: 22, color: WHITE_70, ls: 1.6, width: 700
          }),

          // CTA button
          r({ x: 80, y: 790, w: 240, h: 56, fill: ACCENT, rx: 14, name: 'CTA Button' }),
          t('VIEW WORK →', { x: 130, y: 806, font: HEAD, size: 15, weight: 700, color: BG, tracking: 160 }),

          // Right side — Photo + info cards
          photoFrame({ x: 1100, y: 140, w: 420, h: 520, rx: 20, name: 'Profile Photo' }),

          // Stats bento
          r({ x: 1560, y: 140, w: 280, h: 250, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1, name: 'Stats Card' }),
          t('7+', { x: 1610, y: 180, font: HEAD, size: 72, weight: 800, color: ACCENT }),
          t('Years of\nExperience', { x: 1610, y: 270, font: SANS, size: 18, color: WHITE_70, ls: 1.4 }),

          r({ x: 1560, y: 410, w: 280, h: 250, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1, name: 'Stats Card' }),
          t('80+', { x: 1610, y: 450, font: HEAD, size: 72, weight: 800, color: TEAL }),
          t('Projects\nDelivered', { x: 1610, y: 540, font: SANS, size: 18, color: WHITE_70, ls: 1.4 }),

          // Availability badge
          r({ x: 1100, y: 690, w: 420, h: 60, fill: ACCENT_SOFT, rx: 12, name: 'Badge' }),
          circ({ x: 1120, y: 710, d: 10, fill: '#4ADE80' }),
          t('Available for freelance & contract work', { x: 1145, y: 705, font: SANS, size: 15, weight: 500, color: ACCENT }),

          // Bottom bar
          line(80, 960, 1760),
          t('JAKARTA, INDONESIA · GMT+7', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('SCROLL TO EXPLORE ↓', { x: 1610, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 2 · ABOUT ME
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'About Me',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('01', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('ABOUT ME', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          // Intro text
          t('I believe great design is felt\nbefore it\'s understood.', {
            x: 80, y: 120, font: HEAD, size: 64, weight: 700, color: WHITE, ls: 1.1, width: 1100
          }),

          t('With over seven years of experience across UI/UX design, brand identity, and frontend development, I bring ideas from concept to pixel-perfect reality. I thrive at the intersection of aesthetics and function.', {
            x: 80, y: 310, font: SANS, size: 20, color: WHITE_70, ls: 1.7, width: 900
          }),

          // Photo column
          photoFrame({ x: 1200, y: 120, w: 340, h: 440, rx: 20, name: 'Portrait Photo' }),

          // Bento info cards (2x2 grid)
          r({ x: 80, y: 460, w: 540, h: 200, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('EDUCATION', { x: 120, y: 495, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('B.Des Visual Communication', { x: 120, y: 525, font: HEAD, size: 24, weight: 600, color: WHITE }),
          t('Institut Teknologi Bandung — Class of 2019', { x: 120, y: 565, font: SANS, size: 15, color: WHITE_40 }),
          t('Cum Laude · Top 5%', { x: 120, y: 600, font: MONO, size: 12, color: TEAL, tracking: 100 }),

          r({ x: 660, y: 460, w: 540, h: 200, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('CURRENTLY AT', { x: 700, y: 495, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Senior Product Designer', { x: 700, y: 525, font: HEAD, size: 24, weight: 600, color: WHITE }),
          t('Tokopedia · Design Systems Team', { x: 700, y: 565, font: SANS, size: 15, color: WHITE_40 }),
          t('2023 — PRESENT', { x: 700, y: 600, font: MONO, size: 12, color: ROSE, tracking: 100 }),

          r({ x: 80, y: 690, w: 540, h: 200, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('SPECIALTIES', { x: 120, y: 725, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('UI/UX · Brand Identity\nDesign Systems · Motion', { x: 120, y: 755, font: HEAD, size: 22, weight: 600, color: WHITE, ls: 1.3 }),
          t('FIGMA · FRAMER · REACT · AFTER EFFECTS', { x: 120, y: 830, font: MONO, size: 11, color: VIOLET, tracking: 160 }),

          r({ x: 660, y: 690, w: 540, h: 200, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('PHILOSOPHY', { x: 700, y: 725, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('"Design with empathy, build\nwith precision, iterate\nwith curiosity."', {
            x: 700, y: 755, font: HEAD, size: 22, weight: 600, color: WHITE, ls: 1.3, italic: true
          }),

          // Side accent
          r({ x: 1560, y: 120, w: 280, h: 770, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1, name: 'Sidebar' }),
          t('TOOLKIT', { x: 1600, y: 160, font: MONO, size: 11, color: ACCENT, tracking: 280 }),
          t('Figma\nSketch\nFramer\nAfter Effects\nReact\nNext.js\nTypeScript\nTailwind CSS\nSwift UI\nSupabase', {
            x: 1600, y: 200, font: SANS, size: 16, weight: 500, color: WHITE_70, ls: 2.0
          }),

          line(80, 960, 1760),
          t('02 // PHOTO GALLERY', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('NEXT →', { x: 1720, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 3 · PHOTO GALLERY
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Photo Gallery',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('02', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('GALLERY', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          t('Visual Diary &\nCreative Process', { x: 80, y: 110, font: HEAD, size: 56, weight: 700, color: WHITE, ls: 1.1 }),
          t('A curated collection of personal projects, behind-the-scenes shots,\nand moments of creative exploration.', {
            x: 80, y: 270, font: SANS, size: 18, color: WHITE_40, ls: 1.5
          }),

          // Photo Grid — Bento layout (asymmetric)
          // Row 1: 1 large + 2 stacked
          photoFrame({ x: 80, y: 360, w: 700, h: 540, rx: 18, name: 'Gallery Hero' }),
          t('Featured: Brand Campaign 2026', { x: 110, y: 860, font: MONO, size: 11, color: WHITE_40, tracking: 120 }),

          photoFrame({ x: 810, y: 360, w: 520, h: 260, rx: 16, name: 'Gallery Photo 2' }),
          photoFrame({ x: 810, y: 640, w: 520, h: 260, rx: 16, name: 'Gallery Photo 3' }),

          // Row 1 right column
          photoFrame({ x: 1360, y: 360, w: 480, h: 380, rx: 16, name: 'Gallery Photo 4' }),
          photoFrame({ x: 1360, y: 760, w: 230, h: 140, rx: 12, name: 'Gallery Photo 5' }),
          photoFrame({ x: 1610, y: 760, w: 230, h: 140, rx: 12, name: 'Gallery Photo 6' }),

          // Bottom bar
          line(80, 960, 1760),
          t('DRAG PHOTOS INTO FRAMES TO FILL', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('03 // SKILLS →', { x: 1680, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 4 · SKILLS & SERVICES
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Skills & Services',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('03', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('SKILLS & SERVICES', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          t('What I bring\nto the table.', { x: 80, y: 110, font: HEAD, size: 72, weight: 800, color: WHITE, ls: 1.05 }),

          // Service cards — 3 columns
          // Card 1 — Brand & Identity
          r({ x: 80, y: 310, w: 560, h: 380, fill: BG_CARD, rx: 20, stroke: WHITE_12, strokeWidth: 1 }),
          circ({ x: 120, y: 345, d: 48, fill: ACCENT_SOFT }),
          t('✦', { x: 133, y: 352, font: SANS, size: 24, color: ACCENT }),
          t('Brand & Identity', { x: 120, y: 415, font: HEAD, size: 28, weight: 700, color: WHITE }),
          t('Logo design, visual identity systems, brand guidelines, and cohesive multi-platform branding that tells your story.', {
            x: 120, y: 460, font: SANS, size: 16, color: WHITE_70, ls: 1.6, width: 480
          }),
          ...tag('LOGO', { x: 120, y: 580 }),
          ...tag('IDENTITY', { x: 196, y: 580 }),
          ...tag('GUIDELINES', { x: 292, y: 580 }),
          t('FROM $2,500', { x: 120, y: 630, font: MONO, size: 13, color: ACCENT, tracking: 120 }),

          // Card 2 — UI/UX Design
          r({ x: 680, y: 310, w: 560, h: 380, fill: ACCENT, rx: 20 }),
          circ({ x: 720, y: 345, d: 48, fill: 'rgba(12,12,15,0.2)' }),
          t('◆', { x: 733, y: 352, font: SANS, size: 24, color: BG }),
          t('UI/UX Design', { x: 720, y: 415, font: HEAD, size: 28, weight: 700, color: BG }),
          t('User research, wireframes, high-fidelity prototypes, design systems, and interactive micro-animations.', {
            x: 720, y: 460, font: SANS, size: 16, color: 'rgba(12,12,15,0.75)', ls: 1.6, width: 480
          }),
          ...tag('FIGMA', { x: 720, y: 580, fill: 'rgba(12,12,15,0.15)', textColor: BG }),
          ...tag('PROTOTYPE', { x: 790, y: 580, fill: 'rgba(12,12,15,0.15)', textColor: BG }),
          ...tag('SYSTEMS', { x: 898, y: 580, fill: 'rgba(12,12,15,0.15)', textColor: BG }),
          t('FROM $4,000', { x: 720, y: 630, font: MONO, size: 13, color: BG, tracking: 120 }),

          // Card 3 — Development
          r({ x: 1280, y: 310, w: 560, h: 380, fill: BG_CARD, rx: 20, stroke: WHITE_12, strokeWidth: 1 }),
          circ({ x: 1320, y: 345, d: 48, fill: 'rgba(45,212,191,0.15)' }),
          t('⬡', { x: 1333, y: 352, font: SANS, size: 24, color: TEAL }),
          t('Frontend Dev', { x: 1320, y: 415, font: HEAD, size: 28, weight: 700, color: WHITE }),
          t('React, Next.js, and Framer builds with pixel-perfect CSS, smooth animations, and performance optimization.', {
            x: 1320, y: 460, font: SANS, size: 16, color: WHITE_70, ls: 1.6, width: 480
          }),
          ...tag('REACT', { x: 1320, y: 580, fill: 'rgba(45,212,191,0.15)', textColor: TEAL }),
          ...tag('NEXT.JS', { x: 1390, y: 580, fill: 'rgba(45,212,191,0.15)', textColor: TEAL }),
          ...tag('MOTION', { x: 1472, y: 580, fill: 'rgba(45,212,191,0.15)', textColor: TEAL }),
          t('FROM $3,500', { x: 1320, y: 630, font: MONO, size: 13, color: TEAL, tracking: 120 }),

          // Process bar
          r({ x: 80, y: 730, w: 1760, h: 160, fill: BG_CARD, rx: 18, stroke: WHITE_12, strokeWidth: 1 }),
          t('MY PROCESS', { x: 130, y: 765, font: MONO, size: 12, color: ACCENT, tracking: 260 }),
          t('01 Discovery', { x: 130, y: 800, font: HEAD, size: 20, weight: 600, color: WHITE }),
          t('→', { x: 310, y: 800, font: HEAD, size: 20, color: WHITE_40 }),
          t('02 Strategy', { x: 370, y: 800, font: HEAD, size: 20, weight: 600, color: WHITE }),
          t('→', { x: 540, y: 800, font: HEAD, size: 20, color: WHITE_40 }),
          t('03 Design', { x: 600, y: 800, font: HEAD, size: 20, weight: 600, color: WHITE }),
          t('→', { x: 760, y: 800, font: HEAD, size: 20, color: WHITE_40 }),
          t('04 Develop', { x: 820, y: 800, font: HEAD, size: 20, weight: 600, color: WHITE }),
          t('→', { x: 990, y: 800, font: HEAD, size: 20, color: WHITE_40 }),
          t('05 Launch', { x: 1050, y: 800, font: HEAD, size: 20, weight: 600, color: ACCENT }),
          t('Typically 4–8 weeks from kickoff to delivery.', { x: 130, y: 840, font: SANS, size: 14, color: WHITE_40 }),

          line(80, 960, 1760),
          t('04 // PROJECT SHOWCASE', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('NEXT →', { x: 1720, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 5 · PROJECT SHOWCASE (Grid)
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Projects',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('04', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('SELECTED PROJECTS', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          t('Work that\nspeaks volumes.', { x: 80, y: 110, font: HEAD, size: 64, weight: 800, color: WHITE, ls: 1.05 }),

          // Project Grid — 2x2 bento cards
          // Project 1 — Large left
          r({ x: 80, y: 300, w: 900, h: 420, fill: BG_CARD, rx: 20, stroke: WHITE_12, strokeWidth: 1 }),
          photoFrame({ x: 100, y: 320, w: 500, h: 380, rx: 14, name: 'Project 1 Image' }),
          t('FEATURED', { x: 630, y: 340, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Kopi Nusantara\nBrand Identity', { x: 630, y: 375, font: HEAD, size: 28, weight: 700, color: WHITE, ls: 1.2 }),
          t('Complete brand overhaul for Indonesia\'s fastest-growing specialty coffee chain. From logo to packaging to digital touchpoints.', {
            x: 630, y: 460, font: SANS, size: 15, color: WHITE_70, ls: 1.6, width: 320
          }),
          ...tag('BRANDING', { x: 630, y: 590 }),
          ...tag('PACKAGING', { x: 722, y: 590 }),
          t('2026', { x: 630, y: 650, font: MONO, size: 13, color: WHITE_40, tracking: 120 }),

          // Project 2 — Right
          r({ x: 1010, y: 300, w: 830, h: 420, fill: BG_CARD, rx: 20, stroke: WHITE_12, strokeWidth: 1 }),
          photoFrame({ x: 1030, y: 320, w: 790, h: 240, rx: 14, name: 'Project 2 Image' }),
          t('Rumah Digital — Proptech App', { x: 1040, y: 580, font: HEAD, size: 22, weight: 700, color: WHITE }),
          t('End-to-end mobile UX for property discovery, virtual tours, and mortgage simulation.', {
            x: 1040, y: 615, font: SANS, size: 14, color: WHITE_70, ls: 1.5, width: 760
          }),
          ...tag('UI/UX', { x: 1040, y: 665 }),
          ...tag('MOBILE', { x: 1112, y: 665 }),
          t('2025', { x: 1750, y: 670, font: MONO, size: 13, color: WHITE_40 }),

          // Project 3 — Bottom left
          r({ x: 80, y: 750, w: 580, h: 150, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('Gelora Sports — E-commerce Redesign', { x: 120, y: 780, font: HEAD, size: 20, weight: 600, color: WHITE }),
          t('Responsive web redesign with 42% conversion uplift through streamlined checkout.', {
            x: 120, y: 815, font: SANS, size: 14, color: WHITE_70, width: 500
          }),
          ...tag('WEB', { x: 120, y: 855 }),
          t('2025', { x: 540, y: 860, font: MONO, size: 13, color: WHITE_40 }),

          // Project 4 — Bottom center
          r({ x: 690, y: 750, w: 580, h: 150, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('Batik Modern — Cultural Revival', { x: 730, y: 780, font: HEAD, size: 20, weight: 600, color: WHITE }),
          t('Identity system fusing traditional Indonesian batik motifs with contemporary minimal design.', {
            x: 730, y: 815, font: SANS, size: 14, color: WHITE_70, width: 500
          }),
          ...tag('IDENTITY', { x: 730, y: 855 }),
          t('2024', { x: 1150, y: 860, font: MONO, size: 13, color: WHITE_40 }),

          // Project 5 — Bottom right
          r({ x: 1300, y: 750, w: 540, h: 150, fill: ACCENT, rx: 16 }),
          t('+ 12 More Projects', { x: 1370, y: 790, font: HEAD, size: 24, weight: 700, color: BG }),
          t('View full archive →', { x: 1370, y: 835, font: SANS, size: 15, color: 'rgba(12,12,15,0.6)' }),

          line(80, 960, 1760),
          t('05 // CASE STUDY', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('DEEP DIVE →', { x: 1690, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 6 · CASE STUDY
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Case Study',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('05', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('CASE STUDY', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          // Title section
          ...tag('FEATURED PROJECT', { x: 80, y: 110 }),
          t('Kopi Nusantara', { x: 80, y: 155, font: HEAD, size: 80, weight: 800, color: WHITE }),
          t('A complete brand identity transformation for Indonesia\'s fastest-growing\nspecialty coffee chain — from bean to cup to screen.', {
            x: 80, y: 255, font: SANS, size: 20, color: WHITE_70, ls: 1.6, width: 1000
          }),

          // Hero mockup
          photoFrame({ x: 80, y: 340, w: 1760, h: 300, rx: 18, name: 'Case Study Hero' }),

          // Metrics row
          r({ x: 80, y: 670, w: 420, h: 120, fill: BG_CARD, rx: 14, stroke: WHITE_12, strokeWidth: 1 }),
          t('THE CHALLENGE', { x: 120, y: 695, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Outdated identity failing to resonate with Gen-Z\naudience across 200+ outlets nationwide.', {
            x: 120, y: 720, font: SANS, size: 14, color: WHITE_70, ls: 1.5, width: 360
          }),

          r({ x: 530, y: 670, w: 290, h: 120, fill: BG_CARD, rx: 14, stroke: WHITE_12, strokeWidth: 1 }),
          t('TIMELINE', { x: 570, y: 695, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('8 Weeks', { x: 570, y: 725, font: HEAD, size: 32, weight: 700, color: WHITE }),

          r({ x: 850, y: 670, w: 290, h: 120, fill: BG_CARD, rx: 14, stroke: WHITE_12, strokeWidth: 1 }),
          t('MY ROLE', { x: 890, y: 695, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Lead Designer', { x: 890, y: 725, font: HEAD, size: 28, weight: 700, color: WHITE }),

          r({ x: 1170, y: 670, w: 330, h: 120, fill: ACCENT, rx: 14 }),
          t('RESULT', { x: 1210, y: 695, font: MONO, size: 11, color: BG, tracking: 260 }),
          t('+67% Brand\nRecognition', { x: 1210, y: 720, font: HEAD, size: 28, weight: 700, color: BG, ls: 1.1 }),

          r({ x: 1530, y: 670, w: 310, h: 120, fill: BG_CARD, rx: 14, stroke: WHITE_12, strokeWidth: 1 }),
          t('DELIVERABLES', { x: 1570, y: 695, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Logo · Colors · Type\nPackaging · Digital', { x: 1570, y: 720, font: SANS, size: 15, color: WHITE, ls: 1.5 }),

          // Solution text
          r({ x: 80, y: 820, w: 1760, h: 80, fill: BG_CARD, rx: 14, stroke: WHITE_12, strokeWidth: 1 }),
          t('THE SOLUTION', { x: 120, y: 840, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Designed a modern visual identity rooted in Indonesian heritage — earthy color palette, custom logotype inspired by traditional wayang curves, and a flexible grid system adaptable from coffee cups to digital banners.', {
            x: 300, y: 840, font: SANS, size: 15, color: WHITE_70, ls: 1.5, width: 1480
          }),

          line(80, 960, 1760),
          t('06 // TESTIMONIALS', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('NEXT →', { x: 1720, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 7 · TESTIMONIALS
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Testimonials',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('06', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('TESTIMONIALS', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          t('Kind words from\nclients & collaborators.', { x: 80, y: 110, font: HEAD, size: 64, weight: 700, color: WHITE, ls: 1.1 }),

          // Testimonial Card 1 — Featured
          r({ x: 80, y: 310, w: 880, h: 340, fill: BG_CARD, rx: 20, stroke: WHITE_12, strokeWidth: 1 }),
          t('★★★★★', { x: 130, y: 350, font: SANS, size: 18, color: ACCENT }),
          t('"Arif transformed our entire brand presence. His attention to detail is extraordinary — every pixel has purpose. The new identity increased our app store conversion by 34%."', {
            x: 130, y: 400, font: SANS, size: 18, color: WHITE, ls: 1.6, width: 780, italic: true
          }),
          circ({ x: 130, y: 565, d: 44, fill: BG_ELEVATED }),
          t('Sarah Chen', { x: 190, y: 570, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('CEO, Kopi Nusantara', { x: 190, y: 595, font: SANS, size: 14, color: WHITE_40 }),

          // Testimonial Card 2
          r({ x: 990, y: 310, w: 850, h: 340, fill: BG_CARD, rx: 20, stroke: WHITE_12, strokeWidth: 1 }),
          t('★★★★★', { x: 1040, y: 350, font: SANS, size: 18, color: ACCENT }),
          t('"Working with Arif was seamless. He understood our vision immediately and delivered designs that exceeded our expectations. The design system he built saved us months of engineering time."', {
            x: 1040, y: 400, font: SANS, size: 18, color: WHITE, ls: 1.6, width: 760, italic: true
          }),
          circ({ x: 1040, y: 565, d: 44, fill: BG_ELEVATED }),
          t('Budi Santoso', { x: 1100, y: 570, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('CTO, Rumah Digital', { x: 1100, y: 595, font: SANS, size: 14, color: WHITE_40 }),

          // Testimonial Card 3
          r({ x: 80, y: 680, w: 580, h: 220, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('"His motion design skills are next-level. The micro-interactions he crafted for our app make it feel alive."', {
            x: 130, y: 720, font: SANS, size: 16, color: WHITE_70, ls: 1.6, width: 480, italic: true
          }),
          t('Rina Wijaya · Product Lead, Gelora', { x: 130, y: 845, font: SANS, size: 13, color: WHITE_40 }),

          // Testimonial Card 4
          r({ x: 690, y: 680, w: 580, h: 220, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('"Arif doesn\'t just design — he thinks strategically. His brand work gave us a competitive edge that\'s hard to quantify but impossible to ignore."', {
            x: 740, y: 720, font: SANS, size: 16, color: WHITE_70, ls: 1.6, width: 480, italic: true
          }),
          t('David Tan · Founder, Batik Modern', { x: 740, y: 845, font: SANS, size: 13, color: WHITE_40 }),

          // Stats
          r({ x: 1300, y: 680, w: 540, h: 220, fill: ACCENT, rx: 16 }),
          t('100%', { x: 1360, y: 720, font: HEAD, size: 64, weight: 800, color: BG }),
          t('Client satisfaction rate\nacross all projects', { x: 1360, y: 800, font: SANS, size: 17, color: 'rgba(12,12,15,0.6)', ls: 1.4 }),
          t('40+ REVIEWS · 5.0 AVG', { x: 1360, y: 855, font: MONO, size: 12, color: BG, tracking: 160 }),

          line(80, 960, 1760),
          t('07 // CONTACT', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('LET\'S TALK →', { x: 1680, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    },

    /* ══════════════════════════════════════════════════════════════════
       PAGE 8 · CONTACT
       ══════════════════════════════════════════════════════════════════ */
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('07', { x: 80, y: 50, font: MONO, size: 14, weight: 700, color: ACCENT, tracking: 120 }),
          t('GET IN TOUCH', { x: 130, y: 50, font: HEAD, size: 14, weight: 700, color: WHITE_40, tracking: 400 }),
          line(80, 85, 1760),

          // Big CTA
          t('Let\'s create\nsomething', { x: 80, y: 130, font: HEAD, size: 110, weight: 800, color: WHITE, ls: 0.95 }),
          t('amazing.', { x: 80, y: 380, font: HEAD, size: 110, weight: 800, color: ACCENT, ls: 0.95 }),

          t('I\'m always open to discussing new projects, creative\nideas, or opportunities to be part of your vision.', {
            x: 80, y: 510, font: SANS, size: 22, color: WHITE_70, ls: 1.6, width: 700
          }),

          // Contact cards
          r({ x: 80, y: 620, w: 540, h: 140, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('EMAIL', { x: 120, y: 650, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('hello@arifnugraha.design', { x: 120, y: 680, font: HEAD, size: 24, weight: 600, color: WHITE }),
          t('Response within 24h', { x: 120, y: 720, font: SANS, size: 13, color: WHITE_40 }),

          r({ x: 660, y: 620, w: 540, h: 140, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('PHONE / WHATSAPP', { x: 700, y: 650, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('+62 812 3456 7890', { x: 700, y: 680, font: HEAD, size: 24, weight: 600, color: WHITE }),
          t('Available Mon — Fri, 9AM — 6PM', { x: 700, y: 720, font: SANS, size: 13, color: WHITE_40 }),

          r({ x: 1240, y: 620, w: 600, h: 140, fill: ACCENT, rx: 16 }),
          t('BOOK A CALL', { x: 1280, y: 650, font: MONO, size: 11, color: BG, tracking: 260 }),
          t('Schedule a 30-min intro call', { x: 1280, y: 680, font: HEAD, size: 24, weight: 600, color: BG }),
          t('cal.com/arifnugraha', { x: 1280, y: 720, font: MONO, size: 13, color: 'rgba(12,12,15,0.5)' }),

          // Social row
          r({ x: 80, y: 790, w: 1760, h: 100, fill: BG_CARD, rx: 16, stroke: WHITE_12, strokeWidth: 1 }),
          t('CONNECT WITH ME', { x: 130, y: 820, font: MONO, size: 11, color: ACCENT, tracking: 260 }),
          t('Dribbble', { x: 380, y: 822, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('·', { x: 478, y: 822, font: HEAD, size: 18, color: WHITE_40 }),
          t('Behance', { x: 510, y: 822, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('·', { x: 604, y: 822, font: HEAD, size: 18, color: WHITE_40 }),
          t('LinkedIn', { x: 636, y: 822, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('·', { x: 732, y: 822, font: HEAD, size: 18, color: WHITE_40 }),
          t('Twitter / X', { x: 764, y: 822, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('·', { x: 878, y: 822, font: HEAD, size: 18, color: WHITE_40 }),
          t('GitHub', { x: 910, y: 822, font: HEAD, size: 18, weight: 600, color: WHITE }),
          t('·', { x: 992, y: 822, font: HEAD, size: 18, color: WHITE_40 }),
          t('Instagram', { x: 1024, y: 822, font: HEAD, size: 18, weight: 600, color: WHITE }),

          // Footer
          line(80, 960, 1760),
          t('© 2026 ARIF NUGRAHA. ALL RIGHTS RESERVED.', { x: 80, y: 980, font: MONO, size: 12, color: WHITE_40, tracking: 200 }),
          t('MADE WITH PROSY ♥', { x: 1610, y: 980, font: MONO, size: 12, color: ACCENT, tracking: 200 })
        ]
      }
    }
  ]
};
