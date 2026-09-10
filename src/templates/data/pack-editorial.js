/**
 * EDITORIAL — Freelance Writer / Journalist
 * Classic, elegant, and readable.
 */
const BG = '#fdfbf7'; // Warm beige
const INK = '#292524'; // Warm dark grey
const MUTED = '#78716c';
const ACCENT = '#9a3412'; // Rust red

const SERIF = 'Playfair Display';
const SANS = 'Inter';

function t(s, { x, y, font = SERIF, size = 20, weight = 400, color = INK, ls = 1.2, tracking = 0, align = 'left', italic = false, width = null } = {}) {
  const base = {
    type: width ? 'textbox' : 'i-text',
    text: s, left: x, top: y, fontFamily: font, fontSize: size, fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal',
    fill: color, lineHeight: ls, charSpacing: tracking, textAlign: align,
    originX: 'left', originY: 'top', selectable: true
  };
  if (width) { base.width = width; base.splitByGrapheme = false; }
  return base;
}

function img({ x, y, w, h, rx = 0 }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#e7e5e4',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

function line(x, y, w) {
  return { type: 'rect', left: x, top: y, width: w, height: 1, fill: INK, originX: 'left', originY: 'top', selectable: true };
}

function r({ x, y, w, h, fill = INK, rx = 0 }) {
  return { type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill, originX: 'left', originY: 'top', selectable: true };
}

export default {
  id: 'pack-editorial',
  name: 'Editorial Writer',
  theme: ['#fdfbf7', '#292524', '#9a3412'],
  description: 'Classic, elegant editorial layout for writers and journalists.',
  projectName: 'Editorial Portfolio',
  pages: [
    {
      title: 'Cover page',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('THE WRITER\'S JOURNAL', { x: 150, y: 80, font: SANS, size: 12, weight: 600, color: MUTED, tracking: 300 }),
          line(150, 110, 1620),
          
          t('Words that shape\nthe narrative.', { x: 150, y: 150, font: SERIF, size: 110, weight: 600, ls: 1, color: INK }),
          t('Journalist & Editor', { x: 150, y: 430, font: SERIF, size: 28, italic: true, color: ACCENT }),
          
          t('Hello, I am Eleanor. A freelance writer and journalist focusing on culture, technology, and the intersection of human experiences. My work has been featured in top publications worldwide.', { x: 150, y: 550, font: SANS, size: 20, color: INK, ls: 1.6, width: 600 }),
          
          img({ x: 900, y: 150, w: 870, h: 750 }),
          t('FIG. 1 — PORTRAIT IN STUDIO, 2026', { x: 900, y: 920, font: SANS, size: 10, color: MUTED, tracking: 200 }),
        ]
      }
    },
    {
      title: 'Articles',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('SELECTED PUBLICATIONS', { x: 150, y: 100, font: SANS, size: 12, weight: 600, color: MUTED, tracking: 300 }),
          line(150, 130, 1620),
          
          // Column 1
          img({ x: 150, y: 200, w: 500, h: 350 }),
          t('CULTURE', { x: 150, y: 580, font: SANS, size: 12, weight: 600, color: ACCENT, tracking: 200 }),
          t('The Future of Urban Living in a Post-Digital Era', { x: 150, y: 610, font: SERIF, size: 36, weight: 600, width: 500, ls: 1.1 }),
          t('Read Article →', { x: 150, y: 740, font: SANS, size: 14, weight: 600 }),
          
          // Column 2
          img({ x: 710, y: 200, w: 500, h: 350 }),
          t('TECHNOLOGY', { x: 710, y: 580, font: SANS, size: 12, weight: 600, color: ACCENT, tracking: 200 }),
          t('Why Artificial Intelligence Needs Human Empathy', { x: 710, y: 610, font: SERIF, size: 36, weight: 600, width: 500, ls: 1.1 }),
          t('Read Article →', { x: 710, y: 740, font: SANS, size: 14, weight: 600 }),
          
          // Column 3
          img({ x: 1270, y: 200, w: 500, h: 350 }),
          t('ESSAY', { x: 1270, y: 580, font: SANS, size: 12, weight: 600, color: ACCENT, tracking: 200 }),
          t('Finding Silence in the Age of Constant Noise', { x: 1270, y: 610, font: SERIF, size: 36, weight: 600, width: 500, ls: 1.1 }),
          t('Read Article →', { x: 1270, y: 740, font: SANS, size: 14, weight: 600 }),
        ]
      }
    },
    {
      title: 'Reading Page',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('ESSAY', { x: 450, y: 100, font: SANS, size: 12, weight: 600, color: ACCENT, tracking: 200 }),
          t('Finding Silence in the Age of Constant Noise', { x: 450, y: 130, font: SERIF, size: 64, weight: 600, width: 1000, ls: 1.1 }),
          t('By Eleanor Vance • Published Oct 14, 2026', { x: 450, y: 300, font: SANS, size: 14, color: MUTED }),
          
          img({ x: 450, y: 350, w: 1000, h: 500 }),
          
          t('The modern world is designed for distraction. Notifications, infinite scrolls, and the pervasive hum of a hyper-connected society have made true silence a luxury. But what happens when we finally turn it all off?', { x: 450, y: 900, font: SERIF, size: 28, color: INK, ls: 1.6, width: 1000 }),
        ]
      }
    },
    {
      title: 'Biography',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('ABOUT THE AUTHOR', { x: 150, y: 100, font: SANS, size: 12, weight: 600, color: MUTED, tracking: 300 }),
          line(150, 130, 1620),
          
          img({ x: 150, y: 200, w: 600, h: 800 }),
          
          t('Eleanor Vance', { x: 850, y: 200, font: SERIF, size: 84, weight: 600, color: INK }),
          t('Author, Essayist, Observer.', { x: 850, y: 320, font: SERIF, size: 28, italic: true, color: ACCENT }),
          
          t('Eleanor Vance is an award-winning freelance writer whose work explores the nuances of modern society, technology, and culture. She holds an MFA in Creative Nonfiction from Columbia University and has spent the last decade contributing to publications such as The New Yorker, The Atlantic, and Wired.\n\nHer debut essay collection, "The Quiet Rooms," was published in 2024 to critical acclaim, winning the National Critics Circle Award for Criticism.', { x: 850, y: 450, font: SANS, size: 20, color: INK, ls: 1.6, width: 800 }),
        ]
      }
    },
    {
      title: 'Subscribe',
      canvas_json: {
        backgroundColor: '#f5f5f4', // Slightly darker beige for contrast
        objects: [
          t('THE NEWSLETTER', { x: 700, y: 300, font: SANS, size: 12, weight: 600, color: ACCENT, tracking: 300, align: 'center', width: 500 }),
          t('Letters from the Quiet Room', { x: 560, y: 340, font: SERIF, size: 64, weight: 600, color: INK, align: 'center', width: 800 }),
          
          t('Join 15,000+ readers who receive my weekly dispatch on culture, technology, and the art of slowing down.', { x: 660, y: 440, font: SANS, size: 20, color: INK, ls: 1.6, width: 600, align: 'center' }),
          
          r({ x: 710, y: 550, w: 500, h: 60, rx: 0, fill: BG }), // Input field
          t('Email Address', { x: 730, y: 570, font: SANS, size: 16, color: MUTED }),
          
          r({ x: 710, y: 630, w: 500, h: 60, rx: 0, fill: INK }), // Subscribe button
          t('Subscribe', { x: 960, y: 648, font: SANS, size: 18, weight: 600, color: BG, align: 'center', originX: 'center' }),
        ]
      }
    }
  ]
};
