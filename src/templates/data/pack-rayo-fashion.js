/**
 * RAYO FASHION & INTERIOR STUDIO — Retro-pop pastel luxury & editorial lookbook.
 * Soft butter cream, blush pink, terracotta, warm charcoal, and sage accents.
 * Inspired by modern fashion lookbooks, bento product showcases, and editorial layouts.
 */

const CREAM_BG = '#FBF8F3';
const CREAM_CARD = '#F4EFE6';
const BLUSH_BG = '#FDEBED';
const BLUSH_CARD = '#F8D8DC';
const BUTTER_BG = '#FFF9E6';
const BUTTER_CARD = '#FBECC4';
const SAGE_BG = '#EBF2EE';
const SAGE_CARD = '#D2E3D8';
const CHARCOAL = '#1C1917';
const CHARCOAL_SOFT = '#44403C';
const TERRACOTTA = '#D95C3C';
const TERRACOTTA_LIGHT = '#F37859';
const MUSTARD = '#E8A631';
const BORDER_LIGHT = 'rgba(28,25,23,0.08)';
const BORDER_MEDIUM = 'rgba(28,25,23,0.15)';

const SERIF = 'Playfair Display';
const SANS = 'Outfit';
const MONO = 'Space Grotesk';

function t(s, { x, y, font = SANS, size = 24, weight = 400, color = CHARCOAL, ls = 1.3, tracking = 0, align = 'left', italic = false, width = null, name = 'Text', custom = null } = {}) {
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

function r({ x, y, w, h, fill = CHARCOAL, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
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

function pill({ x, y, w, h, fill = CHARCOAL, text, textColor = '#FFFFFF', textSize = 14, font = MONO, weight = 600, stroke = null, strokeWidth = 0, name = 'Pill' }) {
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

function photoPlaceholder({ x, y, w, h, rx = 24, fill = '#EBE5DA', stroke = BORDER_LIGHT, label = 'PHOTO FRAME', tag = 'Editorial Frame' }) {
  const boxName = `${tag} Box`;
  return [
    r({
      x, y, w, h, fill, rx, stroke, strokeWidth: 1.5, name: boxName,
      custom: { isPhotoPlaceholder: true, placeholderTag: boxName, label }
    })
  ];
}

export default {
  id: 'pack-rayo-fashion',
  name: 'Rayo Fashion & Objects',
  theme: ['#FAF6EE', '#E06A55', '#1E1B18'],
  description: 'Retro pop pastel editorial lookbook & product showcase',
  projectName: 'Rayo Studio — Fashion & Objects',
  pages: [
    /* 1 · COVER & HERO CATALOG */
    {
      title: '01 · Cover & Hero Catalog',
      canvas_json: {
        backgroundColor: CREAM_BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG, name: 'Background' }),
          // Top Nav bar
          r({ x: 120, y: 50, w: 1680, h: 64, fill: '#FFFFFF', rx: 32, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Navbar Container' }),
          t('RAYO', { x: 160, y: 68, font: SERIF, size: 26, weight: 700, tracking: 200, color: CHARCOAL, name: 'Logo Brand' }),
          t('STUDIO · EDITION 2026', { x: 260, y: 74, font: MONO, size: 12, weight: 600, tracking: 150, color: TERRACOTTA, name: 'Logo Sub' }),

          // Nav items
          t('COLLECTIONS', { x: 800, y: 73, font: MONO, size: 13, weight: 600, tracking: 100, color: CHARCOAL }),
          t('LOOKBOOK', { x: 960, y: 73, font: MONO, size: 13, weight: 600, tracking: 100, color: CHARCOAL_SOFT }),
          t('SPACES & OBJECTS', { x: 1100, y: 73, font: MONO, size: 13, weight: 600, tracking: 100, color: CHARCOAL_SOFT }),
          t('ARCHIVE', { x: 1300, y: 73, font: MONO, size: 13, weight: 600, tracking: 100, color: CHARCOAL_SOFT }),
          ...pill({ x: 1620, y: 58, w: 160, h: 48, fill: CHARCOAL, text: 'EXPLORE ↗', textColor: '#FFFFFF', textSize: 13, font: MONO, weight: 600, name: 'Nav CTA' }),

          // Hero Left Typography
          ...pill({ x: 120, y: 170, w: 220, h: 36, fill: BLUSH_BG, text: '✦ NEW LUXURY 2026', textColor: TERRACOTTA, textSize: 12, font: MONO, weight: 700, stroke: BLUSH_CARD, strokeWidth: 1.5, name: 'Hero Pill' }),
          t('Elevate\nYour Space\n& Identity.', {
            x: 120, y: 226, font: SERIF, size: 78, weight: 700, color: CHARCOAL, ls: 1.05, tracking: -10, name: 'Hero Title'
          }),
          t('A curated collection bridging sculptural furniture, avant-garde silhouettes, and tactile materials designed for modern living.', {
            x: 125, y: 520, font: SANS, size: 20, weight: 400, color: CHARCOAL_SOFT, ls: 1.5, width: 540, name: 'Hero Description'
          }),

          // CTAs and stats
          ...pill({ x: 125, y: 640, w: 210, h: 56, fill: TERRACOTTA, text: 'VIEW LOOKBOOK ↗', textColor: '#FFFFFF', textSize: 14, font: MONO, weight: 700, name: 'Hero CTA Primary' }),
          ...pill({ x: 355, y: 640, w: 180, h: 56, fill: '#FFFFFF', text: 'ORDER CATALOG', textColor: CHARCOAL, textSize: 14, font: MONO, weight: 600, stroke: BORDER_MEDIUM, strokeWidth: 1.5, name: 'Hero CTA Secondary' }),

          // Mini stat badges at bottom left
          r({ x: 125, y: 740, w: 540, h: 100, fill: '#FFFFFF', rx: 20, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Stat Box' }),
          t('48+', { x: 160, y: 755, font: SERIF, size: 36, weight: 700, color: CHARCOAL }),
          t('Handcrafted Pieces', { x: 160, y: 805, font: MONO, size: 12, weight: 500, color: CHARCOAL_SOFT }),
          r({ x: 330, y: 760, w: 1, h: 60, fill: BORDER_LIGHT }),
          t('100%', { x: 365, y: 755, font: SERIF, size: 36, weight: 700, color: TERRACOTTA }),
          t('Ethical Silk & Walnut', { x: 365, y: 805, font: MONO, size: 12, weight: 500, color: CHARCOAL_SOFT }),

          // Hero Right: Asymmetrical Floating Bento Collage
          ...photoPlaceholder({ x: 740, y: 170, w: 420, h: 550, rx: 32, fill: BUTTER_CARD, label: 'MAIN EDITORIAL LOOK', tag: 'Hero Big Photo' }),
          ...pill({ x: 770, y: 200, w: 130, h: 32, fill: '#FFFFFF', text: 'LOOK #01', textColor: CHARCOAL, textSize: 11, font: MONO, weight: 700, name: 'Tag Look 1' }),
          r({ x: 770, y: 640, w: 360, h: 56, fill: 'rgba(255,255,255,0.92)', rx: 16, stroke: BORDER_LIGHT, strokeWidth: 1 }),
          t('The Velvet Silhouette Coat', { x: 790, y: 652, font: SERIF, size: 16, weight: 700, color: CHARCOAL }),
          t('Autumn / Winter 2026', { x: 790, y: 673, font: MONO, size: 11, weight: 500, color: CHARCOAL_SOFT }),

          ...photoPlaceholder({ x: 1190, y: 170, w: 360, h: 260, rx: 28, fill: BLUSH_CARD, label: 'LUMA SCULPTURE CHAIR', tag: 'Hero Obj 1' }),
          ...pill({ x: 1215, y: 195, w: 110, h: 28, fill: TERRACOTTA, text: 'AWARD 2026', textColor: '#FFFFFF', textSize: 11, font: MONO, weight: 700 }),

          ...photoPlaceholder({ x: 1190, y: 460, w: 360, h: 260, rx: 28, fill: SAGE_CARD, label: 'TACTILE CERAMIC DETAIL', tag: 'Hero Obj 2' }),

          c({ x: 1510, y: 390, d: 130, fill: MUSTARD, stroke: '#FFFFFF', strokeWidth: 4, name: 'Floating Badge Circle' }),
          t('EST. 2026\nPARIS / MILAN\n✦ ✦ ✦', {
            x: 1575, y: 440, font: MONO, size: 11, weight: 700, tracking: 120,
            color: CHARCOAL, align: 'center', ls: 1.3, name: 'Badge Text'
          }),

          r({ x: 740, y: 750, w: 810, h: 90, fill: '#FFFFFF', rx: 24, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Bottom Ribbon' }),
          t('✦ NOW SHOWING IN MILAN DESIGN WEEK', { x: 770, y: 785, font: MONO, size: 13, weight: 700, tracking: 120, color: TERRACOTTA }),
          t('Booth C-14 · Via Tortona · Oct 12–18', { x: 1200, y: 785, font: SANS, size: 14, weight: 500, color: CHARCOAL_SOFT })
        ]
      }
    },

    /* 2 · BESTSELLERS & OBJECTS SHOWCASE (Inspired by Reference 3) */
    {
      title: '02 · Bestsellers Showcase',
      canvas_json: {
        backgroundColor: CREAM_BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
          ...pill({ x: 120, y: 70, w: 160, h: 34, fill: BUTTER_CARD, text: '✦ CURATED OBJECTS', textColor: CHARCOAL, textSize: 12, font: MONO, weight: 700 }),
          t('Bestsellers & Iconic Craft', { x: 120, y: 120, font: SERIF, size: 52, weight: 700, color: CHARCOAL }),
          t('Selected limited-run artifacts blending industrial precision with organic forms.', {
            x: 120, y: 185, font: SANS, size: 18, weight: 400, color: CHARCOAL_SOFT, width: 700
          }),
          ...pill({ x: 1620, y: 120, w: 180, h: 50, fill: CHARCOAL, text: 'VIEW FULL SHOP ↗', textColor: '#FFFFFF', textSize: 13, font: MONO, weight: 600 }),

          // 4 Bento Product Cards Grid
          r({ x: 120, y: 250, w: 395, h: 630, fill: BUTTER_BG, rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Product Card 1' }),
          ...photoPlaceholder({ x: 145, y: 275, w: 345, h: 330, rx: 20, fill: '#F5ECCB', label: 'LUMA GLOW LAMP', tag: 'P1 Image' }),
          ...pill({ x: 165, y: 295, w: 90, h: 26, fill: '#FFFFFF', text: 'HOT HIT 🔥', textColor: CHARCOAL, textSize: 11, font: MONO, weight: 700 }),
          t('Luma Glow Table Lamp', { x: 150, y: 630, font: SERIF, size: 24, weight: 700, color: CHARCOAL }),
          t('Hand-spun frosted borosilicate glass with brass dial dimmer.', {
            x: 150, y: 668, font: SANS, size: 14, color: CHARCOAL_SOFT, width: 335, ls: 1.4
          }),
          t('$180.00 USD', { x: 150, y: 745, font: MONO, size: 22, weight: 700, color: CHARCOAL }),
          ...pill({ x: 150, y: 795, w: 335, h: 50, fill: CHARCOAL, text: 'ADD TO BAG +', textColor: '#FFFFFF', textSize: 13, font: MONO, weight: 600, name: 'P1 Button' }),

          r({ x: 545, y: 250, w: 395, h: 630, fill: BLUSH_BG, rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Product Card 2' }),
          ...photoPlaceholder({ x: 570, y: 275, w: 345, h: 330, rx: 20, fill: '#F2D3D8', label: 'TUNE AUDIO POD', tag: 'P2 Image' }),
          ...pill({ x: 590, y: 295, w: 90, h: 26, fill: TERRACOTTA, text: 'LIMITED', textColor: '#FFFFFF', textSize: 11, font: MONO, weight: 700 }),
          t('Tune Wireless Sound Pod', { x: 575, y: 630, font: SERIF, size: 24, weight: 700, color: CHARCOAL }),
          t('High-fidelity acoustic sphere clad in recycled Kvadrat wool.', {
            x: 575, y: 668, font: SANS, size: 14, color: CHARCOAL_SOFT, width: 335, ls: 1.4
          }),
          t('$240.00 USD', { x: 575, y: 745, font: MONO, size: 22, weight: 700, color: CHARCOAL }),
          ...pill({ x: 575, y: 795, w: 335, h: 50, fill: CHARCOAL, text: 'ADD TO BAG +', textColor: '#FFFFFF', textSize: 13, font: MONO, weight: 600, name: 'P2 Button' }),

          r({ x: 970, y: 250, w: 395, h: 630, fill: SAGE_BG, rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Product Card 3' }),
          ...photoPlaceholder({ x: 995, y: 275, w: 345, h: 330, rx: 20, fill: '#D3E2D8', label: 'WAVE VELVET SEAT', tag: 'P3 Image' }),
          ...pill({ x: 1015, y: 295, w: 90, h: 26, fill: '#FFFFFF', text: 'DESIGN AWARD', textColor: CHARCOAL, textSize: 11, font: MONO, weight: 700 }),
          t('Wave Ergonomic Velvet Armchair', { x: 1000, y: 630, font: SERIF, size: 24, weight: 700, color: CHARCOAL }),
          t('Sculptural wave silhouette with featherdown core and steel legs.', {
            x: 1000, y: 668, font: SANS, size: 14, color: CHARCOAL_SOFT, width: 335, ls: 1.4
          }),
          t('$420.00 USD', { x: 1000, y: 745, font: MONO, size: 22, weight: 700, color: CHARCOAL }),
          ...pill({ x: 1000, y: 795, w: 335, h: 50, fill: CHARCOAL, text: 'ADD TO BAG +', textColor: '#FFFFFF', textSize: 13, font: MONO, weight: 600, name: 'P3 Button' }),

          r({ x: 1395, y: 250, w: 395, h: 630, fill: CREAM_CARD, rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Product Card 4' }),
          ...photoPlaceholder({ x: 1420, y: 275, w: 345, h: 330, rx: 20, fill: '#E5DDCF', label: 'SHELL CERAMIC VASE', tag: 'P4 Image' }),
          ...pill({ x: 1440, y: 295, w: 90, h: 26, fill: '#FFFFFF', text: 'ORGANIC', textColor: CHARCOAL, textSize: 11, font: MONO, weight: 700 }),
          t('Shell Matte Ceramic Vase', { x: 1425, y: 630, font: SERIF, size: 24, weight: 700, color: CHARCOAL }),
          t('Double-fired terracotta stoneware with raw grog texture finish.', {
            x: 1425, y: 668, font: SANS, size: 14, color: CHARCOAL_SOFT, width: 335, ls: 1.4
          }),
          t('$95.00 USD', { x: 1425, y: 745, font: MONO, size: 22, weight: 700, color: CHARCOAL }),
          ...pill({ x: 1425, y: 795, w: 335, h: 50, fill: CHARCOAL, text: 'ADD TO BAG +', textColor: '#FFFFFF', textSize: 13, font: MONO, weight: 600, name: 'P4 Button' }),

          t('✓ Worldwide Carbon-Neutral Express Shipping   ✦   30-Day In-Home Guarantee   ✦   Complimentary Swatch Samples', {
            x: 960, y: 920, font: MONO, size: 13, weight: 600, color: CHARCOAL_SOFT, align: 'center'
          })
        ]
      }
    },

    /* 3 · EDITORIAL LOOKBOOK & PHOTOGRID (Inspired by Reference 1: Deep^style) */
    {
      title: '03 · Editorial Lookbook Photogrid',
      canvas_json: {
        backgroundColor: CREAM_BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
          ...pill({ x: 120, y: 60, w: 200, h: 34, fill: '#FFFFFF', text: '✦ LOOKBOOK AUTUMN / 26', textColor: CHARCOAL, textSize: 12, font: MONO, weight: 700, stroke: BORDER_LIGHT, strokeWidth: 1 }),
          t('DEEP · STYLE', { x: 960, y: 60, font: SERIF, size: 28, weight: 700, tracking: 160, color: CHARCOAL, align: 'center' }),
          t('PAGE // 14', { x: 1800, y: 66, font: MONO, size: 13, weight: 600, color: CHARCOAL_SOFT, align: 'right' }),

          t('Make Your Fashion Look More Charming.', {
            x: 960, y: 120, font: SERIF, size: 58, weight: 700, color: CHARCOAL, align: 'center', name: 'Lookbook Main Title'
          }),
          t('Contemporary silhouettes, fluid drapery, and honest tailoring built for effortless character.', {
            x: 960, y: 188, font: SANS, size: 18, color: CHARCOAL_SOFT, align: 'center', width: 750
          }),

          // 5-Photo Staggered Rounded Photogrid Layout
          ...photoPlaceholder({ x: 120, y: 250, w: 300, h: 480, rx: 28, fill: BLUSH_BG, label: 'LOOK 01 · TRENCH', tag: 'Lookbook P1' }),
          t('SILK OVERCOAT / W26', { x: 125, y: 745, font: MONO, size: 12, weight: 700, color: CHARCOAL }),
          t('100% Raw Mulberry Silk', { x: 125, y: 768, font: SANS, size: 13, color: CHARCOAL_SOFT }),

          ...photoPlaceholder({ x: 450, y: 250, w: 310, h: 360, rx: 28, fill: BUTTER_BG, label: 'LOOK 02 · ACCESSORY', tag: 'Lookbook P2' }),
          c({ x: 425, y: 225, d: 50, fill: MUSTARD, stroke: '#FFFFFF', strokeWidth: 3 }),
          t('✳️', { x: 450, y: 250, font: SANS, size: 20, align: 'center' }),
          t('NAPPA MINI TOTE', { x: 455, y: 630, font: MONO, size: 12, weight: 700, color: CHARCOAL }),
          t('Italian vegetable-tanned leather', { x: 455, y: 652, font: SANS, size: 13, color: CHARCOAL_SOFT }),

          ...photoPlaceholder({ x: 790, y: 230, w: 340, h: 540, rx: 32, fill: CREAM_CARD, label: 'HERO LOOK · EVENING', tag: 'Lookbook P3 Hero' }),
          c({ x: 1070, y: 200, d: 90, fill: TERRACOTTA, stroke: '#FFFFFF', strokeWidth: 3 }),
          t('PREMIUM\n2026\nSTYLE', { x: 1115, y: 232, font: MONO, size: 10, weight: 700, color: '#FFFFFF', align: 'center', ls: 1.2 }),

          ...photoPlaceholder({ x: 1160, y: 310, w: 310, h: 360, rx: 28, fill: SAGE_BG, label: 'LOOK 04 · KNITWEAR', tag: 'Lookbook P4' }),
          c({ x: 1430, y: 285, d: 48, fill: BLUSH_CARD, stroke: '#FFFFFF', strokeWidth: 3 }),
          t('🌸', { x: 1454, y: 309, font: SANS, size: 18, align: 'center' }),
          t('CASHMERE RIB KNIT', { x: 1165, y: 690, font: MONO, size: 12, weight: 700, color: CHARCOAL }),
          t('Grade-A Mongolian Cashmere', { x: 1165, y: 712, font: SANS, size: 13, color: CHARCOAL_SOFT }),

          ...photoPlaceholder({ x: 1500, y: 250, w: 300, h: 480, rx: 28, fill: BUTTER_CARD, label: 'LOOK 05 · SUITING', tag: 'Lookbook P5' }),
          t('MODULAR TAILORED SUIT', { x: 1505, y: 745, font: MONO, size: 12, weight: 700, color: CHARCOAL }),
          t('Virgin wool & viscose blend', { x: 1505, y: 768, font: SANS, size: 13, color: CHARCOAL_SOFT }),

          r({ x: 300, y: 820, w: 1320, h: 110, fill: '#FFFFFF', rx: 24, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Bottom Quote Card' }),
          t('“Style is a deeply personal language of proportion, texture, and restraint. When you wear what moves you, confidence becomes effortless.”', {
            x: 960, y: 845, font: SERIF, size: 18, italic: true, color: CHARCOAL, align: 'center', width: 1180
          }),
          t('— ELENA MORGAN · CREATIVE DIRECTOR', {
            x: 960, y: 895, font: MONO, size: 11, weight: 700, tracking: 160, color: TERRACOTTA, align: 'center'
          })
        ]
      }
    },

    /* 4 · WORKPLACE DIVERSITY & PHILOSOPHY */
    {
      title: '04 · Diversity & Philosophy',
      canvas_json: {
        backgroundColor: '#F9F5EE',
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: '#F9F5EE' }),
          ...pill({ x: 120, y: 80, w: 180, h: 34, fill: TERRACOTTA, text: '✦ MANIFESTO & CULTURE', textColor: '#FFFFFF', textSize: 11, font: MONO, weight: 700 }),
          t('Workplace\nDiversity &\nInclusion.', {
            x: 120, y: 140, font: SERIF, size: 68, weight: 700, color: CHARCOAL, ls: 1.05, name: 'Diversity Title'
          }),
          t('We believe exceptional design emerges only when diverse minds, cultural viewpoints, and creative backgrounds intersect freely.', {
            x: 120, y: 390, font: SANS, size: 19, weight: 400, color: CHARCOAL_SOFT, width: 500, ls: 1.5
          }),

          r({ x: 120, y: 500, w: 520, h: 100, fill: '#FFFFFF', rx: 20, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          t('01', { x: 145, y: 520, font: MONO, size: 24, weight: 700, color: TERRACOTTA }),
          t('Inclusive Culture', { x: 200, y: 520, font: SANS, size: 18, weight: 700, color: CHARCOAL }),
          t('Equal voices across every tier from design apprentice to partner.', { x: 200, y: 550, font: SANS, size: 13, color: CHARCOAL_SOFT, width: 400 }),

          r({ x: 120, y: 620, w: 520, h: 100, fill: '#FFFFFF', rx: 20, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          t('02', { x: 145, y: 640, font: MONO, size: 24, weight: 700, color: TERRACOTTA }),
          t('Global Perspectives', { x: 200, y: 640, font: SANS, size: 18, weight: 700, color: CHARCOAL }),
          t('Collaborators spanning 14 countries, bringing rich regional craft.', { x: 200, y: 670, font: SANS, size: 13, color: CHARCOAL_SOFT, width: 400 }),

          r({ x: 120, y: 740, w: 520, h: 100, fill: '#FFFFFF', rx: 20, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          t('03', { x: 145, y: 760, font: MONO, size: 24, weight: 700, color: TERRACOTTA }),
          t('Sustainable Growth', { x: 200, y: 760, font: SANS, size: 18, weight: 700, color: CHARCOAL }),
          t('Living wages, safe studios, and zero tolerance for discrimination.', { x: 200, y: 790, font: SANS, size: 13, color: CHARCOAL_SOFT, width: 400 }),

          ...photoPlaceholder({ x: 700, y: 80, w: 500, h: 360, rx: 32, fill: BLUSH_CARD, label: 'STUDIO CRAFT & WORKSHOP', tag: 'Team Photo 1' }),
          ...photoPlaceholder({ x: 1230, y: 80, w: 470, h: 420, rx: 32, fill: BUTTER_CARD, label: 'CREATIVE TEAM COLLAB', tag: 'Team Photo 2' }),
          ...photoPlaceholder({ x: 700, y: 470, w: 500, h: 420, rx: 32, fill: SAGE_CARD, label: 'ARTISAN FABRIC DYEING', tag: 'Team Photo 3' }),
          ...photoPlaceholder({ x: 1230, y: 530, w: 470, h: 360, rx: 32, fill: CREAM_CARD, label: 'LEADERSHIP FORUM 2026', tag: 'Team Photo 4' }),

          r({ x: 120, y: 870, w: 520, h: 50, fill: MUSTARD, rx: 25 }),
          t('✦ DIVERSITY IS OUR STRONGEST DESIGN TOOL', { x: 380, y: 885, font: MONO, size: 12, weight: 700, color: CHARCOAL, align: 'center', tracking: 100 })
        ]
      }
    },

    /* 5 · CREATING A STYLE: PRODUCT & INTERIOR PAIRING */
    {
      title: '05 · Creating a Style',
      canvas_json: {
        backgroundColor: CREAM_BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
          t('CREATING A STYLE', { x: 120, y: 70, font: MONO, size: 14, weight: 700, tracking: 180, color: TERRACOTTA }),
          t('Harmonizing Fashion & Architecture', { x: 120, y: 110, font: SERIF, size: 54, weight: 700, color: CHARCOAL }),

          ...photoPlaceholder({ x: 120, y: 200, w: 780, h: 700, rx: 32, fill: BLUSH_BG, label: 'FULL EDITORIAL SCENE', tag: 'Split Left Big' }),
          r({ x: 160, y: 800, w: 700, h: 70, fill: 'rgba(255,255,255,0.92)', rx: 20, stroke: BORDER_LIGHT, strokeWidth: 1 }),
          t('LOOK 07 · THE MONOLITH LIVING ROOM', { x: 190, y: 818, font: SERIF, size: 18, weight: 700, color: CHARCOAL }),
          t('Featuring the Sculpted Wool Duster & Travertine Plinth Table', { x: 190, y: 843, font: MONO, size: 12, color: CHARCOAL_SOFT }),

          r({ x: 940, y: 200, w: 760, h: 210, fill: '#FFFFFF', rx: 24, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          ...photoPlaceholder({ x: 970, y: 225, w: 160, h: 160, rx: 16, fill: BUTTER_CARD, label: 'DETAIL 01', tag: 'Right D1' }),
          t('01 / ORGANIC TRAVERTINE PLINTH', { x: 1160, y: 240, font: MONO, size: 13, weight: 700, color: TERRACOTTA }),
          t('Carved from single-block Italian unfilled travertine with brushed matte beeswax sealing.', {
            x: 1160, y: 275, font: SANS, size: 15, color: CHARCOAL_SOFT, width: 500, ls: 1.4
          }),
          t('Dimensions: 120 × 60 × 38 cm · Weight: 74 kg', { x: 1160, y: 350, font: MONO, size: 12, weight: 500, color: CHARCOAL }),

          r({ x: 940, y: 440, w: 760, h: 210, fill: '#FFFFFF', rx: 24, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          ...photoPlaceholder({ x: 970, y: 465, w: 160, h: 160, rx: 16, fill: SAGE_CARD, label: 'DETAIL 02', tag: 'Right D2' }),
          t('02 / HAND-LOOMED CASHMERE DRAPE', { x: 1160, y: 480, font: MONO, size: 13, weight: 700, color: TERRACOTTA }),
          t('Woven by master weavers in Como. Naturally dyed using walnut husk and pomegranate rind.', {
            x: 1160, y: 515, font: SANS, size: 15, color: CHARCOAL_SOFT, width: 500, ls: 1.4
          }),
          t('Composition: 80% Cashmere, 20% Mulberry Silk', { x: 1160, y: 590, font: MONO, size: 12, weight: 500, color: CHARCOAL }),

          r({ x: 940, y: 680, w: 760, h: 220, fill: '#FFFFFF', rx: 24, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          ...photoPlaceholder({ x: 970, y: 705, w: 160, h: 170, rx: 16, fill: BLUSH_CARD, label: 'DETAIL 03', tag: 'Right D3' }),
          t('03 / CAST BRONZE HARDWARE', { x: 1160, y: 720, font: MONO, size: 13, weight: 700, color: TERRACOTTA }),
          t('Lost-wax cast solid bronze fittings developed in partnership with artisan founders in Brescia.', {
            x: 1160, y: 755, font: SANS, size: 15, color: CHARCOAL_SOFT, width: 500, ls: 1.4
          }),
          t('Finish: Living raw bronze with hand-buffed wax', { x: 1160, y: 835, font: MONO, size: 12, weight: 500, color: CHARCOAL })
        ]
      }
    },

    /* 6 · STUDIO CONTACT & CLIENT INQUIRIES */
    {
      title: '06 · Studio & Inquiries',
      canvas_json: {
        backgroundColor: CREAM_BG,
        objects: [
          r({ x: 0, y: 0, w: 1920, h: 1080, fill: CREAM_BG }),
          r({ x: 120, y: 80, w: 1680, h: 840, fill: '#FFFFFF', rx: 36, stroke: BORDER_LIGHT, strokeWidth: 1.5, name: 'Contact Container' }),

          ...pill({ x: 180, y: 140, w: 160, h: 34, fill: BLUSH_BG, text: '✦ GET IN TOUCH', textColor: TERRACOTTA, textSize: 12, font: MONO, weight: 700 }),
          t('Let’s Create\nSomething\nTimeless.', {
            x: 180, y: 200, font: SERIF, size: 68, weight: 700, color: CHARCOAL, ls: 1.05
          }),
          t('Available for bespoke furniture commissions, interior consulting, fashion collaborations, and editorial styling.', {
            x: 180, y: 460, font: SANS, size: 18, color: CHARCOAL_SOFT, width: 620, ls: 1.5
          }),

          t('PARIS STUDIO', { x: 180, y: 570, font: MONO, size: 13, weight: 700, tracking: 140, color: CHARCOAL }),
          t('14 Rue des Blancs-Manteaux\n75004 Paris, France\nhello@rayo-studio.com', {
            x: 180, y: 600, font: SANS, size: 15, color: CHARCOAL_SOFT, ls: 1.4
          }),

          t('MILAN SHOWROOM', { x: 500, y: 570, font: MONO, size: 13, weight: 700, tracking: 140, color: CHARCOAL }),
          t('Via Tortona 28\n20144 Milano, Italy\nmilano@rayo-studio.com', {
            x: 500, y: 600, font: SANS, size: 15, color: CHARCOAL_SOFT, ls: 1.4
          }),

          t('Instagram: @rayo.studio  ·  Pinterest: @rayodesign  ·  Vogue Runway Featured', {
            x: 180, y: 760, font: MONO, size: 13, weight: 600, color: TERRACOTTA
          }),

          r({ x: 920, y: 140, w: 820, h: 720, fill: CREAM_BG, rx: 28, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          t('Commission Inquiry', { x: 970, y: 190, font: SERIF, size: 32, weight: 700, color: CHARCOAL }),
          t('Tell us about your project or private order.', { x: 970, y: 235, font: SANS, size: 15, color: CHARCOAL_SOFT }),

          t('YOUR NAME', { x: 970, y: 290, font: MONO, size: 11, weight: 700, color: CHARCOAL_SOFT }),
          r({ x: 970, y: 315, w: 720, h: 56, fill: '#FFFFFF', rx: 14, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          t('Jane Doe', { x: 995, y: 332, font: SANS, size: 16, color: CHARCOAL }),

          t('EMAIL ADDRESS', { x: 970, y: 400, font: MONO, size: 11, weight: 700, color: CHARCOAL_SOFT }),
          r({ x: 970, y: 425, w: 720, h: 56, fill: '#FFFFFF', rx: 14, stroke: BORDER_LIGHT, strokeWidth: 1.5 }),
          t('jane@example.com', { x: 995, y: 442, font: SANS, size: 16, color: CHARCOAL }),

          t('PROJECT INTEREST', { x: 970, y: 510, font: MONO, size: 11, weight: 700, color: CHARCOAL_SOFT }),
          ...pill({ x: 970, y: 535, w: 180, h: 42, fill: TERRACOTTA, text: '✦ Furniture / Object', textColor: '#FFFFFF', textSize: 12, font: MONO, weight: 600 }),
          ...pill({ x: 1165, y: 535, w: 180, h: 42, fill: '#FFFFFF', text: 'Interior Styling', textColor: CHARCOAL, textSize: 12, font: MONO, weight: 600, stroke: BORDER_MEDIUM, strokeWidth: 1 }),
          ...pill({ x: 1360, y: 535, w: 180, h: 42, fill: '#FFFFFF', text: 'Fashion Lookbook', textColor: CHARCOAL, textSize: 12, font: MONO, weight: 600, stroke: BORDER_MEDIUM, strokeWidth: 1 }),

          ...pill({ x: 970, y: 640, w: 720, h: 64, fill: CHARCOAL, text: 'SUBMIT INQUIRY ↗', textColor: '#FFFFFF', textSize: 15, font: MONO, weight: 700, name: 'Submit Button' }),
          t('✦ Responses typically sent within 24 business hours.', { x: 1330, y: 725, font: MONO, size: 12, color: CHARCOAL_SOFT, align: 'center' })
        ]
      }
    }
  ]
};
