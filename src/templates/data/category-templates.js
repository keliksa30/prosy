/**
 * CATEGORY TEMPLATES — Curated single-page templates categorized by:
 * - Covers (Minimal Serif, Kinetic Poster)
 * - Galleries & Photogrids (Staggered Lookbook, 3-Column Bento)
 * - Table of Contents (Numbered Minimalist Index, Bento Directory)
 * - Project & Karya Showcases (Bestseller Grid, Split Case Study)
 */

const CREAM_BG = '#FAF6EE';
const CREAM_CARD = '#F4EFE6';
const INK = '#1C1917';
const INK_SOFT = '#44403C';
const TERRACOTTA = '#D95C3C';
const NEON_YELLOW = '#FCFF2D';
const ELECTRIC_PURPLE = '#7B5CFA';
const VOID_BLACK = '#0A0C10';
const VOID_CARD = '#141720';
const VOID_BORDER = '#232836';
const WHITE = '#FFFFFF';
const MUTED = 'rgba(28,25,23,0.55)';
const BORDER_LIGHT = 'rgba(28,25,23,0.08)';

const SERIF = 'Playfair Display';
const SANS = 'Outfit';
const MONO = 'Space Grotesk';

function t(s, { x, y, font = SANS, size = 24, weight = 400, color = INK, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text', custom = null } = {}) {
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
  if (custom) base.custom = custom;
  return base;
}

function r({ x, y, w, h, fill = INK, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
  const obj = {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx,
    fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
  if (custom) obj.custom = custom;
  return obj;
}

function c({ x, y, d, fill, stroke = null, strokeWidth = 0, name = 'Circle' }) {
  return {
    type: 'ellipse', left: x, top: y, rx: d / 2, ry: d / 2, fill,
    stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true, name
  };
}

function pill({ x, y, w, h, fill = INK, text, textColor = WHITE, textSize = 14, font = MONO, weight = 700, stroke = null, strokeWidth = 0, name = 'Pill' }) {
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

function photoPlaceholder({ x, y, w, h, rx = 24, fill = '#EBE5DA', stroke = BORDER_LIGHT, label = 'PHOTO FRAME', tag = 'Photo' }) {
  const boxName = `${tag} Box`;
  return [
    r({
      x, y, w, h, fill, rx, stroke, strokeWidth: 1.5, name: boxName,
      custom: { isPhotoPlaceholder: true, placeholderTag: boxName, label }
    })
  ];
}

export const CATEGORIES = [
  { id: 'all', name: 'All Packs' },
  { id: 'covers', name: 'Covers' },
  { id: 'galleries', name: 'Galleries & Photogrids' },
  { id: 'toc', name: 'Table of Contents' },
  { id: 'showcase', name: 'Project & Karya Showcases' }
];

export const CATEGORY_TEMPLATES = [
  /* ========================================================================
   * COVERS
   * ======================================================================== */
  {
    id: 'cover-editorial-serif',
    category: 'covers',
    title: 'Minimal Serif Editorial Cover',
    description: 'Clean luxury serif layout with large typography and warm palette',
    canvas_json: {
      backgroundColor: CREAM_BG,
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
        t('PORTFOLIO // SELECTED WORKS 2026', { x: 120, y: 80, font: MONO, size: 13, weight: 700, tracking: 160, color: TERRACOTTA }),
        t('AURELIA\n& CO.', { x: 120, y: 130, font: SERIF, size: 110, weight: 700, ls: 1.0, color: INK }),
        r({ x: 120, y: 390, w: 1680, h: 2, fill: INK }),
        t('Architecture, Editorial Design & Brand Direction', { x: 120, y: 430, font: SANS, size: 28, weight: 600, color: INK }),
        t('Documenting 8 years of spatial design, publication craft, and identity systems built for cultural institutions and architectural practices across Europe and Asia.', {
          x: 120, y: 490, font: SANS, size: 20, color: INK_SOFT, width: 850, ls: 1.6
        }),
        ...photoPlaceholder({ x: 1040, y: 430, w: 760, h: 420, rx: 32, fill: CREAM_CARD, label: 'FEATURED ARCHITECTURE PHOTO' }),
        ...pill({ x: 120, y: 640, w: 220, h: 56, fill: INK, text: 'EXPLORE ARCHIVE ↗', textColor: WHITE, textSize: 13, font: MONO, weight: 700 }),
        t('✦ VOLUME IV · ISSUE 08 · EDITION 2026', { x: 120, y: 920, font: MONO, size: 13, weight: 600, color: MUTED })
      ]
    }
  },
  {
    id: 'cover-kinetic-poster',
    category: 'covers',
    title: 'Kinetic Poster Statement Cover',
    description: 'Neon yellow bold kinetic poster with high contrast typography',
    canvas_json: {
      backgroundColor: NEON_YELLOW,
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: NEON_YELLOW }),
        t('[ + ]', { x: 120, y: 70, font: MONO, size: 16, weight: 700, color: VOID_BLACK }),
        t('KINETIC LAB // PORTFOLIO 2026', { x: 200, y: 70, font: MONO, size: 14, weight: 800, tracking: 160, color: VOID_BLACK }),
        t('SERIAL NO. 09-KNT', { x: 1770, y: 70, font: MONO, size: 14, weight: 700, color: VOID_BLACK, align: 'right' }),

        t('I', { x: 120, y: 160, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),
        ...pill({ x: 260, y: 190, w: 340, h: 100, fill: ELECTRIC_PURPLE, text: 'never', textColor: WHITE, textSize: 62, font: SERIF, weight: 700, stroke: VOID_BLACK, strokeWidth: 3 }),
        t('dreamed', { x: 650, y: 160, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),
        t('about success.', { x: 120, y: 320, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),
        t('I worked', { x: 120, y: 480, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),
        ...pill({ x: 740, y: 510, w: 180, h: 100, fill: VOID_BLACK, text: '→', textColor: NEON_YELLOW, textSize: 68, weight: 800 }),
        t('for it.', { x: 960, y: 480, font: SANS, size: 140, weight: 900, color: VOID_BLACK }),

        r({ x: 120, y: 670, w: 1680, h: 3, fill: VOID_BLACK }),
        ...pill({ x: 120, y: 720, w: 260, h: 56, fill: VOID_BLACK, text: '#business // craft', textColor: WHITE, textSize: 16, weight: 700 }),
        t('Creative Technology, GLSL Shaders & Kinetic Interfaces', { x: 420, y: 735, font: SANS, size: 24, weight: 700, color: VOID_BLACK }),
        t('Exhibited globally · Engineered for maximum visual retention.', { x: 420, y: 775, font: MONO, size: 15, color: VOID_BLACK })
      ]
    }
  },
  {
    id: 'cover-persona-dark',
    category: 'covers',
    title: 'Dark Persona Portfolio Cover',
    description: 'Impactful personal portfolio hero with large typography, stats bento, and portrait frame',
    canvas_json: {
      backgroundColor: '#0C0C0F',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#0C0C0F' }),
        t('ARIF NUGRAHA', { x: 120, y: 60, font: SANS, size: 16, weight: 700, color: '#E8A838', tracking: 360 }),
        t('PORTFOLIO 2026', { x: 1600, y: 60, font: MONO, size: 13, color: 'rgba(245,245,247,0.4)', tracking: 160 }),
        r({ x: 120, y: 95, w: 1680, h: 1, fill: 'rgba(245,245,247,0.12)' }),
        t('Designer', { x: 120, y: 150, font: SANS, size: 150, weight: 800, color: '#F5F5F7', ls: 0.9 }),
        t('& Creative', { x: 120, y: 310, font: SANS, size: 150, weight: 800, color: 'rgba(245,245,247,0.4)', ls: 0.9 }),
        t('Developer', { x: 120, y: 470, font: SANS, size: 150, weight: 800, color: '#E8A838', ls: 0.9 }),
        t('I craft premium digital experiences — from brand identity to interactive products that feel alive.', {
          x: 120, y: 660, font: SANS, size: 22, color: 'rgba(245,245,247,0.7)', width: 680, ls: 1.6
        }),
        ...pill({ x: 120, y: 780, w: 220, h: 56, fill: '#E8A838', text: 'VIEW WORK →', textColor: '#0C0C0F', textSize: 14, font: SANS, weight: 700 }),
        ...photoPlaceholder({ x: 1050, y: 150, w: 450, h: 540, rx: 24, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'PORTRAIT PHOTO' }),
        r({ x: 1540, y: 150, w: 260, h: 250, fill: '#16161A', rx: 20, stroke: 'rgba(245,245,247,0.12)', strokeWidth: 1 }),
        t('7+', { x: 1580, y: 190, font: SANS, size: 68, weight: 800, color: '#E8A838' }),
        t('Years of\nExperience', { x: 1580, y: 280, font: SANS, size: 18, color: 'rgba(245,245,247,0.7)', ls: 1.4 }),
        r({ x: 1540, y: 430, w: 260, h: 260, fill: '#16161A', rx: 20, stroke: 'rgba(245,245,247,0.12)', strokeWidth: 1 }),
        t('80+', { x: 1580, y: 470, font: SANS, size: 68, weight: 800, color: '#2DD4BF' }),
        t('Projects\nDelivered', { x: 1580, y: 560, font: SANS, size: 18, color: 'rgba(245,245,247,0.7)', ls: 1.4 }),
        r({ x: 1050, y: 720, w: 450, h: 60, fill: 'rgba(232,168,56,0.15)', rx: 14 }),
        c({ x: 1080, y: 742, d: 12, fill: '#4ADE80' }),
        t('Available for freelance & contract projects', { x: 1110, y: 738, font: SANS, size: 15, weight: 600, color: '#E8A838' }),
        r({ x: 120, y: 960, w: 1680, h: 1, fill: 'rgba(245,245,247,0.12)' }),
        t('JAKARTA, INDONESIA · GMT+7', { x: 120, y: 980, font: MONO, size: 12, color: 'rgba(245,245,247,0.4)', tracking: 160 }),
        t('SCROLL TO EXPLORE ↓', { x: 1630, y: 980, font: MONO, size: 12, color: 'rgba(245,245,247,0.4)', tracking: 160 })
      ]
    }
  },
  {
    id: 'cover-lumina-light',
    category: 'covers',
    title: 'Lumina Swiss Light Cover',
    description: 'Clean, light-mode minimalist hero with bold typography, portrait frame, and metric counters',
    canvas_json: {
      backgroundColor: '#F8F9FA',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#F8F9FA' }),
        r({ x: 100, y: 50, w: 42, h: 42, fill: '#0F172A', rx: 10 }),
        t('JV', { x: 111, y: 60, font: SANS, size: 18, weight: 800, color: '#FFFFFF' }),
        t('JULIAN VANE', { x: 156, y: 62, font: SANS, size: 15, weight: 700, color: '#0F172A', tracking: 160 }),
        t('// PRODUCT DESIGNER & TECHNOLOGIST', { x: 285, y: 63, font: MONO, size: 12, color: '#94A3B8', tracking: 100 }),
        r({ x: 1470, y: 50, w: 350, h: 42, fill: '#ECFDF5', rx: 21, stroke: '#A7F3D0', strokeWidth: 1 }),
        c({ x: 1490, y: 66, d: 10, fill: '#10B981' }),
        t('AVAILABLE FOR WORK · Q2 2026', { x: 1512, y: 64, font: MONO, size: 11, weight: 700, color: '#065F46', tracking: 120 }),
        r({ x: 100, y: 115, w: 1720, h: 1, fill: '#E2E8F0' }),
        t('Crafting digital\nexperiences with\nclarity & intent.', {
          x: 100, y: 170, font: SANS, size: 94, weight: 800, color: '#0F172A', ls: 1.05
        }),
        t('Senior Product Designer & Creative Technologist with 8+ years building thoughtful software, scalable design systems, and intelligent user interfaces.', {
          x: 100, y: 510, font: SANS, size: 21, color: '#475569', ls: 1.6, width: 780
        }),
        ...pill({ x: 100, y: 660, w: 260, h: 56, fill: '#2563EB', text: 'EXPLORE WORKS ↓', textColor: '#FFFFFF', textSize: 14, font: MONO }),
        ...pill({ x: 380, y: 660, w: 220, h: 56, fill: '#FFFFFF', text: 'DOWNLOAD CV ↗', textColor: '#0F172A', textSize: 14, font: MONO, stroke: '#CBD5E1', strokeWidth: 1.5 }),
        r({ x: 100, y: 770, w: 840, h: 140, fill: '#FFFFFF', rx: 20, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        t('8+', { x: 150, y: 800, font: SANS, size: 48, weight: 800, color: '#2563EB' }),
        t('YEARS CRAFTING\nDIGITAL PRODUCTS', { x: 150, y: 855, font: MONO, size: 11, weight: 600, color: '#475569', ls: 1.3 }),
        r({ x: 390, y: 800, w: 1, h: 80, fill: '#E2E8F0' }),
        t('34+', { x: 440, y: 800, font: SANS, size: 48, weight: 800, color: '#0F172A' }),
        t('ENTERPRISE &\nCONSUMER SHIPS', { x: 440, y: 855, font: MONO, size: 11, weight: 600, color: '#475569', ls: 1.3 }),
        r({ x: 680, y: 800, w: 1, h: 80, fill: '#E2E8F0' }),
        t('12M', { x: 730, y: 800, font: SANS, size: 48, weight: 800, color: '#0F172A' }),
        t('ACTIVE MONTHLY\nUSERS IMPACTED', { x: 730, y: 855, font: MONO, size: 11, weight: 600, color: '#475569', ls: 1.3 }),
        r({ x: 1040, y: 170, w: 780, h: 740, fill: '#FFFFFF', rx: 28, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 1070, y: 200, w: 720, h: 600, rx: 20, fill: '#EAECEF', stroke: '#E2E8F0', label: 'HERO PORTRAIT PHOTO' }),
        t('JULIAN VANE · STUDIO PORTRAIT 2026', { x: 1080, y: 830, font: MONO, size: 12, weight: 600, color: '#475569', tracking: 160 }),
        t('SAN FRANCISCO, CA', { x: 1640, y: 830, font: MONO, size: 12, weight: 600, color: '#94A3B8', tracking: 120 }),
        r({ x: 100, y: 970, w: 1720, h: 1, fill: '#E2E8F0' }),
        t('© 2026 JULIAN VANE. ALL RIGHTS RESERVED.', { x: 100, y: 995, font: MONO, size: 12, color: '#94A3B8', tracking: 160 }),
        t('SCROLL FOR ABOUT & SELECTED PROJECTS ↓', { x: 1400, y: 995, font: MONO, size: 12, color: '#2563EB', tracking: 140 })
      ]
    }
  },

  /* ========================================================================
   * GALLERIES & PHOTOGRIDS
   * ======================================================================== */
  {
    id: 'gallery-staggered-lookbook',
    category: 'galleries',
    title: 'Staggered Lookbook Photogrid',
    description: '5-photo rounded portrait masonry grid with badges and editorial quote',
    canvas_json: {
      backgroundColor: CREAM_BG,
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
        t('LOOKBOOK EDITORIAL // AUTUMN 2026', { x: 120, y: 60, font: MONO, size: 12, weight: 700, tracking: 160, color: TERRACOTTA }),
        t('Make Your Fashion Look More Charming', { x: 960, y: 100, font: SERIF, size: 54, weight: 700, color: INK, align: 'center' }),

        ...photoPlaceholder({ x: 120, y: 210, w: 300, h: 480, rx: 28, fill: '#FDEBED', label: 'LOOK 01 · TRENCH' }),
        t('SILK OVERCOAT', { x: 125, y: 705, font: MONO, size: 12, weight: 700, color: INK }),

        ...photoPlaceholder({ x: 450, y: 210, w: 310, h: 360, rx: 28, fill: '#FFF9E6', label: 'LOOK 02 · ACCESSORY' }),
        c({ x: 425, y: 185, d: 50, fill: '#E8A631', stroke: WHITE, strokeWidth: 3 }),
        t('✳️', { x: 450, y: 210, font: SANS, size: 20, align: 'center' }),

        ...photoPlaceholder({ x: 790, y: 190, w: 340, h: 540, rx: 32, fill: CREAM_CARD, label: 'HERO LOOK · EVENING' }),
        c({ x: 1070, y: 160, d: 90, fill: TERRACOTTA, stroke: WHITE, strokeWidth: 3 }),
        t('PREMIUM\n2026', { x: 1115, y: 195, font: MONO, size: 11, weight: 700, color: WHITE, align: 'center' }),

        ...photoPlaceholder({ x: 1160, y: 270, w: 310, h: 360, rx: 28, fill: '#EBF2EE', label: 'LOOK 04 · KNITWEAR' }),
        ...photoPlaceholder({ x: 1500, y: 210, w: 300, h: 480, rx: 28, fill: '#FFF9E6', label: 'LOOK 05 · SUITING' }),

        r({ x: 300, y: 810, w: 1320, h: 110, fill: WHITE, rx: 24, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
        t('“Style is a deeply personal language of proportion, texture, and restraint.”', {
          x: 960, y: 835, font: SERIF, size: 20, italic: true, color: INK, align: 'center'
        }),
        t('— ELENA MORGAN · CREATIVE DIRECTOR', {
          x: 960, y: 885, font: MONO, size: 11, weight: 700, tracking: 160, color: TERRACOTTA, align: 'center'
        })
      ]
    }
  },
  {
    id: 'gallery-3col-masonry',
    category: 'galleries',
    title: '3-Column Bento Portfolio Photogrid',
    description: 'Asymmetric 6-card masonry gallery with titles, tags, and year stamps',
    canvas_json: {
      backgroundColor: '#0D0F14',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#0D0F14' }),
        t('GALLERY & ARCHIVE // 2024–2026', { x: 120, y: 60, font: MONO, size: 13, weight: 700, color: NEON_YELLOW, tracking: 160 }),
        t('Selected Visual Commissions', { x: 120, y: 95, font: SANS, size: 44, weight: 800, color: WHITE }),

        ...photoPlaceholder({ x: 120, y: 180, w: 530, h: 380, rx: 24, fill: '#161922', stroke: VOID_BORDER, label: 'PROJECT A · BRAND IDENTITY' }),
        t('01 // VIRTUE COFFEE BRANDING', { x: 125, y: 580, font: MONO, size: 13, weight: 700, color: NEON_YELLOW }),
        t('Visual identity, sustainable packaging & interior signage for specialty roaster.', { x: 125, y: 605, font: SANS, size: 14, color: '#8E98A8', width: 500 }),

        ...photoPlaceholder({ x: 120, y: 670, w: 530, h: 250, rx: 24, fill: '#161922', stroke: VOID_BORDER, label: 'PROJECT B · PACKAGING' }),

        ...photoPlaceholder({ x: 690, y: 180, w: 530, h: 260, rx: 24, fill: '#161922', stroke: VOID_BORDER, label: 'PROJECT C · EDITORIAL BOOK' }),
        ...photoPlaceholder({ x: 690, y: 470, w: 530, h: 450, rx: 24, fill: '#161922', stroke: VOID_BORDER, label: 'PROJECT D · 3D STILL LIFE' }),
        t('02 // SCULPTURAL DIGITAL CERAMICS', { x: 695, y: 935, font: MONO, size: 13, weight: 700, color: ELECTRIC_PURPLE }),

        ...photoPlaceholder({ x: 1260, y: 180, w: 540, h: 440, rx: 24, fill: '#161922', stroke: VOID_BORDER, label: 'PROJECT E · MOBILE APPLICATION' }),
        t('03 // ATLAS FINTECH APP', { x: 1265, y: 640, font: MONO, size: 13, weight: 700, color: '#33F398' }),
        t('Complete design system and mobile UI for global wealth management.', { x: 1265, y: 665, font: SANS, size: 14, color: '#8E98A8', width: 500 }),
        ...photoPlaceholder({ x: 1260, y: 720, w: 540, h: 200, rx: 24, fill: '#161922', stroke: VOID_BORDER, label: 'PROJECT F · WEBGL HERO' })
      ]
    }
  },
  {
    id: 'gallery-persona-bento',
    category: 'galleries',
    title: 'Personal Portfolio Bento Gallery',
    description: 'Asymmetric dark bento photogrid for creative work, photography & behind-the-scenes',
    canvas_json: {
      backgroundColor: '#0C0C0F',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#0C0C0F' }),
        t('VISUAL DIARY // 2026', { x: 120, y: 60, font: MONO, size: 13, weight: 700, color: '#E8A838', tracking: 160 }),
        t('Curated Works & Creative Moments', { x: 120, y: 95, font: SANS, size: 44, weight: 800, color: WHITE }),
        ...photoPlaceholder({ x: 120, y: 180, w: 720, h: 560, rx: 24, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'FEATURED EDITORIAL HERO' }),
        t('FEATURED // BRAND CAMPAIGN 2026', { x: 130, y: 760, font: MONO, size: 12, weight: 700, color: '#E8A838' }),
        t('Art direction & visual storytelling across Tokyo & Milan', { x: 130, y: 785, font: SANS, size: 14, color: 'rgba(245,245,247,0.6)' }),
        ...photoPlaceholder({ x: 870, y: 180, w: 480, h: 265, rx: 20, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'PHOTO SLOT B' }),
        ...photoPlaceholder({ x: 870, y: 475, w: 480, h: 265, rx: 20, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'PHOTO SLOT C' }),
        ...photoPlaceholder({ x: 1380, y: 180, w: 420, h: 360, rx: 20, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'PHOTO SLOT D' }),
        ...photoPlaceholder({ x: 1380, y: 570, w: 195, h: 170, rx: 16, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'PHOTO E' }),
        ...photoPlaceholder({ x: 1605, y: 570, w: 195, h: 170, rx: 16, fill: '#1E1E24', stroke: 'rgba(245,245,247,0.12)', label: 'PHOTO F' }),
        r({ x: 120, y: 940, w: 1680, h: 1, fill: 'rgba(245,245,247,0.12)' }),
        t('DRAG IMAGES ONTO ANY SHAPE OR PHOTO FRAME TO AUTO-MASK', { x: 120, y: 965, font: MONO, size: 12, color: 'rgba(245,245,247,0.4)', tracking: 160 })
      ]
    }
  },
  {
    id: 'gallery-lumina-journal',
    category: 'galleries',
    title: 'Lumina Minimalist Visual Journal',
    description: 'Clean light-mode 5-photo grid for studio shots, physical prototypes & architecture',
    canvas_json: {
      backgroundColor: '#F8F9FA',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#F8F9FA' }),
        t('VISUAL JOURNAL // PROCESS & TRAVELS', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: '#2563EB', tracking: 160 }),
        t('Curated Imagery & Explorations', { x: 100, y: 95, font: SANS, size: 44, weight: 800, color: '#0F172A' }),
        r({ x: 100, y: 180, w: 740, h: 740, fill: '#FFFFFF', rx: 24, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 120, y: 200, w: 700, h: 600, rx: 18, fill: '#EAECEF', stroke: '#E2E8F0', label: 'MAIN VISUAL JOURNAL SHOT' }),
        t('STUDIO ARCHIVE · TOKYO EXPEDITION', { x: 130, y: 830, font: MONO, size: 12, weight: 700, color: '#0F172A' }),
        t('Exploration of tactile minimalism, papercraft & micro-architecture', { x: 130, y: 855, font: SANS, size: 14, color: '#475569' }),
        r({ x: 870, y: 180, w: 460, h: 355, fill: '#FFFFFF', rx: 20, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 885, y: 195, w: 430, h: 260, rx: 14, fill: '#EAECEF', stroke: '#E2E8F0', label: 'PHYSICAL PROTOTYPE' }),
        t('01 // PHYSICAL PROTOTYPE', { x: 895, y: 480, font: MONO, size: 11, weight: 700, color: '#2563EB' }),
        t('CNC milled aluminum chassis for desk timer', { x: 895, y: 502, font: SANS, size: 13, color: '#475569' }),
        r({ x: 1360, y: 180, w: 460, h: 355, fill: '#FFFFFF', rx: 20, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 1375, y: 195, w: 430, h: 260, rx: 14, fill: '#EAECEF', stroke: '#E2E8F0', label: 'PRINT SPECIMEN' }),
        t('02 // PRINT SPECIMEN', { x: 1385, y: 480, font: MONO, size: 11, weight: 700, color: '#2563EB' }),
        t('Risograph printed monograph on Swiss typography', { x: 1385, y: 502, font: SANS, size: 13, color: '#475569' }),
        r({ x: 870, y: 565, w: 460, h: 355, fill: '#FFFFFF', rx: 20, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 885, y: 580, w: 430, h: 260, rx: 14, fill: '#EAECEF', stroke: '#E2E8F0', label: '3D SHADER' }),
        t('03 // 3D PROCEDURAL SHADER', { x: 895, y: 865, font: MONO, size: 11, weight: 700, color: '#2563EB' }),
        t('Real-time GLSL caustics rendered in browser', { x: 895, y: 887, font: SANS, size: 13, color: '#475569' }),
        r({ x: 1360, y: 565, w: 460, h: 355, fill: '#FFFFFF', rx: 20, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 1375, y: 580, w: 430, h: 260, rx: 14, fill: '#EAECEF', stroke: '#E2E8F0', label: 'DESIGN TOKENS' }),
        t('04 // DESIGN SYSTEM TOKENS', { x: 1385, y: 865, font: MONO, size: 11, weight: 700, color: '#2563EB' }),
        t('Semantic color contrast validation chart', { x: 1385, y: 887, font: SANS, size: 13, color: '#475569' }),
        r({ x: 100, y: 955, w: 1720, h: 1, fill: '#E2E8F0' }),
        t('DRAG IMAGES DIRECTLY ONTO FRAMES TO CLIP MASK', { x: 100, y: 980, font: MONO, size: 12, color: '#94A3B8', tracking: 160 })
      ]
    }
  },

  /* ========================================================================
   * TABLE OF CONTENTS (TOC)
   * ======================================================================== */
  {
    id: 'toc-minimalist-numbered',
    category: 'toc',
    title: 'Numbered Minimalist Index',
    description: 'Refined editorial table of contents with section numbers and summaries',
    canvas_json: {
      backgroundColor: CREAM_BG,
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
        t('TABLE OF CONTENTS', { x: 120, y: 80, font: MONO, size: 14, weight: 700, tracking: 200, color: TERRACOTTA }),
        t('Index of Works & Chapters', { x: 120, y: 120, font: SERIF, size: 56, weight: 700, color: INK }),
        r({ x: 120, y: 200, w: 1680, h: 2, fill: INK }),

        t('01', { x: 120, y: 250, font: MONO, size: 36, weight: 800, color: TERRACOTTA }),
        t('Brand Direction & Philosophy', { x: 240, y: 255, font: SERIF, size: 28, weight: 700, color: INK }),
        t('Core values, aesthetic manifesto, and sustainable material sourcing', { x: 240, y: 295, font: SANS, size: 16, color: INK_SOFT }),
        t('p. 04', { x: 1750, y: 255, font: MONO, size: 20, weight: 700, color: INK, align: 'right' }),
        r({ x: 120, y: 350, w: 1680, h: 1, fill: BORDER_LIGHT }),

        t('02', { x: 120, y: 390, font: MONO, size: 36, weight: 800, color: TERRACOTTA }),
        t('Sculptural Objects & Furniture', { x: 240, y: 395, font: SERIF, size: 28, weight: 700, color: INK }),
        t('Limited-run seating, travertine plinths, and borosilicate lighting', { x: 240, y: 435, font: SANS, size: 16, color: INK_SOFT }),
        t('p. 16', { x: 1750, y: 395, font: MONO, size: 20, weight: 700, color: INK, align: 'right' }),
        r({ x: 120, y: 490, w: 1680, h: 1, fill: BORDER_LIGHT }),

        t('03', { x: 120, y: 530, font: MONO, size: 36, weight: 800, color: TERRACOTTA }),
        t('Editorial Lookbook & Silhouettes', { x: 240, y: 535, font: SERIF, size: 28, weight: 700, color: INK }),
        t('Autumn/Winter lookbook captured on 35mm film across southern Italy', { x: 240, y: 575, font: SANS, size: 16, color: INK_SOFT }),
        t('p. 32', { x: 1750, y: 535, font: MONO, size: 20, weight: 700, color: INK, align: 'right' }),
        r({ x: 120, y: 630, w: 1680, h: 1, fill: BORDER_LIGHT }),

        t('04', { x: 120, y: 670, font: MONO, size: 36, weight: 800, color: TERRACOTTA }),
        t('Architecture & Spatial Installations', { x: 240, y: 675, font: SERIF, size: 28, weight: 700, color: INK }),
        t('Commercial spaces, pop-up pavilions, and runway scenography', { x: 240, y: 715, font: SANS, size: 16, color: INK_SOFT }),
        t('p. 48', { x: 1750, y: 675, font: MONO, size: 20, weight: 700, color: INK, align: 'right' }),
        r({ x: 120, y: 770, w: 1680, h: 1, fill: BORDER_LIGHT }),

        t('05', { x: 120, y: 810, font: MONO, size: 36, weight: 800, color: TERRACOTTA }),
        t('Exhibitions, Awards & Contacts', { x: 240, y: 815, font: SERIF, size: 28, weight: 700, color: INK }),
        t('Studio locations, representation, and bespoke commission guidelines', { x: 240, y: 855, font: SANS, size: 16, color: INK_SOFT }),
        t('p. 64', { x: 1750, y: 815, font: MONO, size: 20, weight: 700, color: INK, align: 'right' })
      ]
    }
  },
  {
    id: 'toc-bento-directory',
    category: 'toc',
    title: 'Bento Grid Visual Directory',
    description: 'Modern card-based table of contents with preview thumbnails and tags',
    canvas_json: {
      backgroundColor: '#0F1117',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#0F1117' }),
        t('DIRECTORY & OUTLINE // 2026', { x: 120, y: 60, font: MONO, size: 13, weight: 700, color: NEON_YELLOW, tracking: 160 }),
        t('Project Portfolio Directory', { x: 120, y: 95, font: SANS, size: 48, weight: 800, color: WHITE }),

        r({ x: 120, y: 180, w: 395, h: 680, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 145, y: 205, w: 345, h: 280, rx: 20, fill: '#181C26', stroke: VOID_BORDER, label: 'CHAPTER 01 PHOTO' }),
        t('01', { x: 150, y: 520, font: MONO, size: 32, weight: 800, color: NEON_YELLOW }),
        t('Design Systems', { x: 150, y: 565, font: SANS, size: 24, weight: 700, color: WHITE }),
        t('Multi-brand tokens, atomic component libraries, and Figma tooling.', { x: 150, y: 605, font: SANS, size: 14, color: '#8E98A8', width: 335, ls: 1.4 }),
        ...pill({ x: 150, y: 780, w: 335, h: 48, fill: '#1E2332', text: 'EXPLORE SECTION ↗', textColor: WHITE, textSize: 12 }),

        r({ x: 545, y: 180, w: 395, h: 680, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 570, y: 205, w: 345, h: 280, rx: 20, fill: '#181C26', stroke: VOID_BORDER, label: 'CHAPTER 02 PHOTO' }),
        t('02', { x: 575, y: 520, font: MONO, size: 32, weight: 800, color: ELECTRIC_PURPLE }),
        t('Creative Coding', { x: 575, y: 565, font: SANS, size: 24, weight: 700, color: WHITE }),
        t('WebGL shaders, interactive 3D canvas physics, and generative art.', { x: 575, y: 605, font: SANS, size: 14, color: '#8E98A8', width: 335, ls: 1.4 }),
        ...pill({ x: 575, y: 780, w: 335, h: 48, fill: '#1E2332', text: 'EXPLORE SECTION ↗', textColor: WHITE, textSize: 12 }),

        r({ x: 970, y: 180, w: 395, h: 680, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 995, y: 205, w: 345, h: 280, rx: 20, fill: '#181C26', stroke: VOID_BORDER, label: 'CHAPTER 03 PHOTO' }),
        t('03', { x: 1000, y: 520, font: MONO, size: 32, weight: 800, color: '#33F398' }),
        t('Product Strategy', { x: 1000, y: 565, font: SANS, size: 24, weight: 700, color: WHITE }),
        t('Zero-to-one product architecture, venture incubation, and UX metrics.', { x: 1000, y: 605, font: SANS, size: 14, color: '#8E98A8', width: 335, ls: 1.4 }),
        ...pill({ x: 1000, y: 780, w: 335, h: 48, fill: '#1E2332', text: 'EXPLORE SECTION ↗', textColor: WHITE, textSize: 12 }),

        r({ x: 1395, y: 180, w: 395, h: 680, fill: VOID_CARD, rx: 28, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 1420, y: 205, w: 345, h: 280, rx: 20, fill: '#181C26', stroke: VOID_BORDER, label: 'CHAPTER 04 PHOTO' }),
        t('04', { x: 1425, y: 520, font: MONO, size: 32, weight: 800, color: '#2E66FF' }),
        t('Writing & Talks', { x: 1425, y: 565, font: SANS, size: 24, weight: 700, color: WHITE }),
        t('Keynote presentations, conference essays, and open-source whitepapers.', { x: 1425, y: 605, font: SANS, size: 14, color: '#8E98A8', width: 335, ls: 1.4 }),
        ...pill({ x: 1425, y: 780, w: 335, h: 48, fill: '#1E2332', text: 'EXPLORE SECTION ↗', textColor: WHITE, textSize: 12 })
      ]
    }
  },

  /* ========================================================================
   * PROJECT & KARYA SHOWCASES
   * ======================================================================== */
  {
    id: 'showcase-bestsellers-grid',
    category: 'showcase',
    title: 'Bestsellers & Karya Product Grid',
    description: '4-card product showcase with price tags, badges, and action buttons',
    canvas_json: {
      backgroundColor: CREAM_BG,
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
        t('FEATURED KARYA // SHOP & EDITIONS', { x: 120, y: 60, font: MONO, size: 13, weight: 700, color: TERRACOTTA, tracking: 160 }),
        t('Iconic Pieces & Limited Editions', { x: 120, y: 95, font: SERIF, size: 52, weight: 700, color: INK }),

        r({ x: 120, y: 180, w: 395, h: 680, fill: '#FFF9E6', rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 145, y: 205, w: 345, h: 350, rx: 20, fill: '#F5ECCB', label: 'PIECE 01 · SCULPTURE' }),
        t('Luma Frosted Glass Lamp', { x: 150, y: 580, font: SERIF, size: 22, weight: 700, color: INK }),
        t('$180.00 USD', { x: 150, y: 640, font: MONO, size: 20, weight: 700, color: INK }),
        ...pill({ x: 150, y: 770, w: 335, h: 52, fill: INK, text: 'VIEW DETAILS ↗', textColor: WHITE, textSize: 13 }),

        r({ x: 545, y: 180, w: 395, h: 680, fill: '#FDEBED', rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 570, y: 205, w: 345, h: 350, rx: 20, fill: '#F2D3D8', label: 'PIECE 02 · ACOUSTIC' }),
        t('Tune Wireless Sound Pod', { x: 575, y: 580, font: SERIF, size: 22, weight: 700, color: INK }),
        t('$240.00 USD', { x: 575, y: 640, font: MONO, size: 20, weight: 700, color: INK }),
        ...pill({ x: 575, y: 770, w: 335, h: 52, fill: INK, text: 'VIEW DETAILS ↗', textColor: WHITE, textSize: 13 }),

        r({ x: 970, y: 180, w: 395, h: 680, fill: '#EBF2EE', rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 995, y: 205, w: 345, h: 350, rx: 20, fill: '#D3E2D8', label: 'PIECE 03 · SEATING' }),
        t('Wave Velvet Armchair', { x: 1000, y: 580, font: SERIF, size: 22, weight: 700, color: INK }),
        t('$420.00 USD', { x: 1000, y: 640, font: MONO, size: 20, weight: 700, color: INK }),
        ...pill({ x: 1000, y: 770, w: 335, h: 52, fill: INK, text: 'VIEW DETAILS ↗', textColor: WHITE, textSize: 13 }),

        r({ x: 1395, y: 180, w: 395, h: 680, fill: CREAM_CARD, rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 1420, y: 205, w: 345, h: 350, rx: 20, fill: '#E5DDCF', label: 'PIECE 04 · CERAMIC' }),
        t('Shell Matte Stoneware Vase', { x: 1425, y: 580, font: SERIF, size: 22, weight: 700, color: INK }),
        t('$95.00 USD', { x: 1425, y: 640, font: MONO, size: 20, weight: 700, color: INK }),
        ...pill({ x: 1425, y: 770, w: 335, h: 52, fill: INK, text: 'VIEW DETAILS ↗', textColor: WHITE, textSize: 13 })
      ]
    }
  },
  {
    id: 'showcase-split-case-study',
    category: 'showcase',
    title: 'Split Project Case Study',
    description: 'In-depth single project showcase with challenge, solution, and impact metrics',
    canvas_json: {
      backgroundColor: '#0B0D12',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#0B0D12' }),
        t('CASE STUDY // 2026', { x: 120, y: 60, font: MONO, size: 12, weight: 700, color: '#33F398', tracking: 160 }),
        t('Aether Fintech — Global Wealth Experience', { x: 120, y: 95, font: SANS, size: 48, weight: 800, color: WHITE }),

        ...photoPlaceholder({ x: 120, y: 180, w: 860, h: 700, rx: 32, fill: '#141824', stroke: VOID_BORDER, label: 'FULL INTERFACE APPLICATION MOCKUP' }),

        r({ x: 1020, y: 180, w: 780, h: 210, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        t('THE CHALLENGE', { x: 1060, y: 210, font: MONO, size: 12, weight: 700, color: NEON_YELLOW, tracking: 120 }),
        t('Modernizing Legacy Multi-Asset Portfolio Management', { x: 1060, y: 235, font: SANS, size: 22, weight: 700, color: WHITE }),
        t('Replace 12 fragmented banking interfaces with a singular, high-performance web console capable of sub-millisecond stock and crypto order execution.', {
          x: 1060, y: 275, font: SANS, size: 15, color: '#8E98A8', width: 700, ls: 1.5
        }),

        r({ x: 1020, y: 420, w: 780, h: 210, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        t('THE ARCHITECTURE & SOLUTION', { x: 1060, y: 450, font: MONO, size: 12, weight: 700, color: ELECTRIC_PURPLE, tracking: 120 }),
        t('WebGL Data Visualization & Unified Design System', { x: 1060, y: 475, font: SANS, size: 22, weight: 700, color: WHITE }),
        t('Built on custom React 19 architecture with WebWorkers offloading chart calculations, paired with an accessible dark-mode first design system.', {
          x: 1060, y: 515, font: SANS, size: 15, color: '#8E98A8', width: 700, ls: 1.5
        }),

        r({ x: 1020, y: 660, w: 780, h: 220, fill: VOID_CARD, rx: 24, stroke: VOID_BORDER, strokeWidth: 1.5 }),
        t('MEASURED BUSINESS IMPACT', { x: 1060, y: 690, font: MONO, size: 12, weight: 700, color: '#33F398', tracking: 120 }),

        t('+340%', { x: 1060, y: 730, font: SANS, size: 48, weight: 900, color: WHITE }),
        t('Daily active trading volume', { x: 1060, y: 795, font: MONO, size: 12, color: '#8E98A8' }),

        t('42ms', { x: 1320, y: 730, font: SANS, size: 48, weight: 900, color: '#33F398' }),
        t('Median chart render latency', { x: 1320, y: 795, font: MONO, size: 12, color: '#8E98A8' }),

        t('$1.8B', { x: 1560, y: 730, font: SANS, size: 48, weight: 900, color: WHITE }),
        t('AUM onboarded in 90 days', { x: 1560, y: 795, font: MONO, size: 12, color: '#8E98A8' })
      ]
    }
  },
  {
    id: 'showcase-persona-works',
    category: 'showcase',
    title: 'Personal Portfolio Project Cards',
    description: 'Modern 3-column project showcase cards with category tags, mockups, and live links',
    canvas_json: {
      backgroundColor: '#0C0C0F',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#0C0C0F' }),
        t('FEATURED PROJECTS // 2025–2026', { x: 120, y: 60, font: MONO, size: 13, weight: 700, color: '#E8A838', tracking: 160 }),
        t('Handcrafted Digital Products & Systems', { x: 120, y: 95, font: SANS, size: 44, weight: 800, color: WHITE }),

        // Card 1
        r({ x: 120, y: 180, w: 530, h: 680, fill: '#16161A', rx: 24, stroke: 'rgba(245,245,247,0.12)', strokeWidth: 1 }),
        ...photoPlaceholder({ x: 140, y: 200, w: 490, h: 320, rx: 16, fill: '#1E1E24', label: 'PROJECT MOCKUP 1' }),
        t('FINTECH · WEB & MOBILE', { x: 150, y: 550, font: MONO, size: 11, weight: 700, color: '#E8A838', tracking: 160 }),
        t('Aura — Smart Financial OS', { x: 150, y: 580, font: SANS, size: 26, weight: 700, color: WHITE }),
        t('An AI-driven wealth advisor designed for high-net-worth creators. 400K+ MAU, $12M seed round.', {
          x: 150, y: 625, font: SANS, size: 15, color: 'rgba(245,245,247,0.6)', width: 470, ls: 1.5
        }),
        t('READ CASE STUDY ↗', { x: 150, y: 810, font: MONO, size: 13, weight: 700, color: '#E8A838', tracking: 120 }),

        // Card 2
        r({ x: 695, y: 180, w: 530, h: 680, fill: '#16161A', rx: 24, stroke: 'rgba(245,245,247,0.12)', strokeWidth: 1 }),
        ...photoPlaceholder({ x: 715, y: 200, w: 490, h: 320, rx: 16, fill: '#1E1E24', label: 'PROJECT MOCKUP 2' }),
        t('ECOMMERCE · 3D WEBGL', { x: 725, y: 550, font: MONO, size: 11, weight: 700, color: '#2DD4BF', tracking: 160 }),
        t('Kinetics — Kinetic Footwear', { x: 725, y: 580, font: SANS, size: 26, weight: 700, color: WHITE }),
        t('Interactive 3D configurator and e-commerce experience winning Awwwards Site of the Month.', {
          x: 725, y: 625, font: SANS, size: 15, color: 'rgba(245,245,247,0.6)', width: 470, ls: 1.5
        }),
        t('VIEW LIVE SITE ↗', { x: 725, y: 810, font: MONO, size: 13, weight: 700, color: '#2DD4BF', tracking: 120 }),

        // Card 3
        r({ x: 1270, y: 180, w: 530, h: 680, fill: '#16161A', rx: 24, stroke: 'rgba(245,245,247,0.12)', strokeWidth: 1 }),
        ...photoPlaceholder({ x: 1290, y: 200, w: 490, h: 320, rx: 16, fill: '#1E1E24', label: 'PROJECT MOCKUP 3' }),
        t('DESIGN SYSTEM · TOOLING', { x: 1300, y: 550, font: MONO, size: 11, weight: 700, color: '#F472B6', tracking: 160 }),
        t('Prism — Multi-Brand Tokens', { x: 1300, y: 580, font: SANS, size: 26, weight: 700, color: WHITE }),
        t('Cross-platform design token architecture powering 24 products and 180+ engineering teams.', {
          x: 1300, y: 625, font: SANS, size: 15, color: 'rgba(245,245,247,0.6)', width: 470, ls: 1.5
        }),
        t('VIEW DOCUMENTATION ↗', { x: 1300, y: 810, font: MONO, size: 13, weight: 700, color: '#F472B6', tracking: 120 })
      ]
    }
  },
  {
    id: 'showcase-lumina-projects',
    category: 'showcase',
    title: 'Lumina Flagship Project Cards',
    description: 'Clean light-mode 3-column project showcase with metadata tags, mockups, and case study links',
    canvas_json: {
      backgroundColor: '#F8F9FA',
      objects: [
        r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#F8F9FA' }),
        t('SELECTED WORKS // 2024–2026', { x: 100, y: 50, font: MONO, size: 14, weight: 700, color: '#2563EB', tracking: 160 }),
        t('Handcrafted Digital Products & Systems', { x: 100, y: 95, font: SANS, size: 44, weight: 800, color: '#0F172A' }),

        // Card 1
        r({ x: 100, y: 180, w: 550, h: 740, fill: '#FFFFFF', rx: 24, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 120, y: 200, w: 510, h: 330, rx: 16, fill: '#EAECEF', stroke: '#E2E8F0', label: 'HELIX MOCKUP' }),
        t('AI WORKSPACE · SAAS', { x: 130, y: 555, font: MONO, size: 11, weight: 700, color: '#2563EB', tracking: 140 }),
        t('Helix — AI Knowledge Canvas', { x: 130, y: 585, font: SANS, size: 26, weight: 700, color: '#0F172A' }),
        t('Reinvented organizational knowledge with an autonomous spatial canvas linking docs, code, and team communications.', {
          x: 130, y: 630, font: SANS, size: 15, color: '#475569', width: 490, ls: 1.5
        }),
        r({ x: 130, y: 730, w: 490, h: 1, fill: '#E2E8F0' }),
        t('Lead Designer · 9 Mos', { x: 130, y: 760, font: MONO, size: 12, color: '#94A3B8' }),
        t('VIEW CASE STUDY ↗', { x: 480, y: 760, font: MONO, size: 12, weight: 700, color: '#2563EB' }),

        // Card 2
        r({ x: 685, y: 180, w: 550, h: 740, fill: '#FFFFFF', rx: 24, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 705, y: 200, w: 510, h: 330, rx: 16, fill: '#EAECEF', stroke: '#E2E8F0', label: 'STRATA MOCKUP' }),
        t('FINTECH · WEBGL DATA', { x: 715, y: 555, font: MONO, size: 11, weight: 700, color: '#16A34A', tracking: 140 }),
        t('Strata — Institutional Portfolio OS', { x: 715, y: 585, font: SANS, size: 26, weight: 700, color: '#0F172A' }),
        t('Real-time portfolio management console processing over $4.2B in weekly transactions with sub-40ms latency visualizers.', {
          x: 715, y: 630, font: SANS, size: 15, color: '#475569', width: 490, ls: 1.5
        }),
        r({ x: 715, y: 730, w: 490, h: 1, fill: '#E2E8F0' }),
        t('Principal UX · React 19', { x: 715, y: 760, font: MONO, size: 12, color: '#94A3B8' }),
        t('VIEW LIVE SITE ↗', { x: 1085, y: 760, font: MONO, size: 12, weight: 700, color: '#16A34A' }),

        // Card 3
        r({ x: 1270, y: 180, w: 550, h: 740, fill: '#FFFFFF', rx: 24, stroke: '#E2E8F0', strokeWidth: 1.5 }),
        ...photoPlaceholder({ x: 1290, y: 200, w: 510, h: 330, rx: 16, fill: '#EAECEF', stroke: '#E2E8F0', label: 'PRISM MOCKUP' }),
        t('DESIGN SYSTEM · TOOLING', { x: 1300, y: 555, font: MONO, size: 11, weight: 700, color: '#9333EA', tracking: 140 }),
        t('Prism — Multi-Brand Tokens', { x: 1300, y: 585, font: SANS, size: 26, weight: 700, color: '#0F172A' }),
        t('Automated token pipeline translating Figma variables directly to iOS, Android, and Web components across 28 squads.', {
          x: 1300, y: 630, font: SANS, size: 15, color: '#475569', width: 490, ls: 1.5
        }),
        r({ x: 1300, y: 730, w: 490, h: 1, fill: '#E2E8F0' }),
        t('Core Architecture', { x: 1300, y: 760, font: MONO, size: 12, color: '#94A3B8' }),
        t('VIEW SPECIFICATION ↗', { x: 1640, y: 760, font: MONO, size: 12, weight: 700, color: '#9333EA' })
      ]
    }
  }
];
