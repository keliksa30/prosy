/**
 * APEX MINIMAL — UX/UI Designer Portfolio
 * Clean, airy, spacious, and modern.
 */
const BG = '#ffffff';
const INK = '#111111';
const MUTED = '#666666';

const SANS = 'Inter';
const HEAD = 'Inter';

function t(s, { x, y, font = SANS, size = 20, weight = 400, color = INK, ls = 1, tracking = 0, align = 'left', width = null } = {}) {
  const base = {
    type: width ? 'textbox' : 'i-text',
    text: s, left: x, top: y, fontFamily: font, fontSize: size, fontWeight: weight,
    fill: color, lineHeight: ls, charSpacing: tracking, textAlign: align,
    originX: 'left', originY: 'top', selectable: true
  };
  if (width) { base.width = width; base.splitByGrapheme = false; }
  return base;
}

function r({ x, y, w, h, fill = INK, rx = 0, stroke = null, strokeWidth = 0 }) {
  return { type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true };
}

function img({ x, y, w, h, rx = 0 }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#e5e7eb',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-apex-minimal',
  name: 'Apex Minimal',
  theme: ['#ffffff', '#111111', '#e5e7eb'],
  description: 'Clean, airy, and modern UX/UI designer portfolio.',
  projectName: 'Apex Minimal Portfolio',
  pages: [
    {
      title: 'Home',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('JANE DOE', { x: 100, y: 80, font: HEAD, size: 24, weight: 700, tracking: 100 }),
          t('UX/UI DESIGNER', { x: 100, y: 120, font: SANS, size: 14, color: MUTED, tracking: 200 }),
          t('Work', { x: 1600, y: 80, size: 16, weight: 500 }),
          t('About', { x: 1700, y: 80, size: 16, weight: 500 }),
          t('Contact', { x: 1800, y: 80, size: 16, weight: 500 }),
          
          t('Designing digital experiences\nthat are as intuitive as\nthey are beautiful.', { x: 100, y: 350, font: HEAD, size: 84, weight: 700, ls: 1.1 }),
          t('I specialize in crafting user-centric interfaces and scalable design systems for modern web and mobile applications.', { x: 100, y: 680, font: SANS, size: 24, color: MUTED, ls: 1.5, width: 700 }),
          
          r({ x: 100, y: 800, w: 200, h: 60, rx: 30, fill: INK }),
          t('View Projects', { x: 200, y: 818, size: 18, weight: 600, color: BG, align: 'center', originX: 'center' }),
          
          img({ x: 1100, y: 250, w: 700, h: 600, rx: 20 })
        ]
      }
    },
    {
      title: 'Selected Work',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('Selected Work', { x: 100, y: 100, font: HEAD, size: 48, weight: 700 }),
          
          img({ x: 100, y: 250, w: 800, h: 500, rx: 16 }),
          t('Fintech Dashboard', { x: 100, y: 780, size: 24, weight: 600 }),
          t('Product Design • Web App', { x: 100, y: 820, size: 16, color: MUTED }),
          
          img({ x: 1020, y: 250, w: 800, h: 500, rx: 16 }),
          t('E-commerce Mobile App', { x: 1020, y: 780, size: 24, weight: 600 }),
          t('UX/UI Design • iOS', { x: 1020, y: 820, size: 16, color: MUTED }),
        ]
      }
    },
    {
      title: 'About & Skills',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('About Me', { x: 100, y: 100, font: HEAD, size: 48, weight: 700 }),
          img({ x: 100, y: 250, w: 500, h: 650, rx: 20 }),
          
          t('Hi, I am Jane. A passionate designer with over 5 years of experience creating digital products that people love to use. My approach bridges the gap between user needs and business goals.', { x: 700, y: 250, size: 32, ls: 1.4, weight: 400, width: 1000 }),
          
          t('CORE SKILLS', { x: 700, y: 550, size: 14, weight: 600, tracking: 150, color: MUTED }),
          t('User Interface Design\nUser Experience (UX)\nWireframing & Prototyping\nDesign Systems\nInteraction Design\nUsability Testing', { x: 700, y: 600, size: 24, ls: 1.8, weight: 500 }),
          
          t('TOOLS', { x: 1300, y: 550, size: 14, weight: 600, tracking: 150, color: MUTED }),
          t('Figma\nFramer\nWebflow\nAdobe Creative Suite\nHTML/CSS\nReact (Basic)', { x: 1300, y: 600, size: 24, ls: 1.8, weight: 500 }),
        ]
      }
    },
    {
      title: 'Case Study Detail',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('Fintech Dashboard', { x: 100, y: 100, font: HEAD, size: 64, weight: 700 }),
          t('Role: Lead Product Designer', { x: 100, y: 200, size: 16, weight: 600, color: MUTED }),
          t('Timeline: 6 Months', { x: 400, y: 200, size: 16, weight: 600, color: MUTED }),
          
          img({ x: 100, y: 300, w: 1720, h: 600, rx: 20 }),
          
          t('THE CHALLENGE', { x: 100, y: 980, font: HEAD, size: 14, weight: 700, color: MUTED, tracking: 100 }),
          t('Simplifying complex financial data into an intuitive, accessible interface for everyday users without losing pro features.', { x: 100, y: 1020, font: SANS, size: 24, ls: 1.5, width: 800 }),
        ]
      }
    },
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('Let\'s work together.', { x: 100, y: 300, font: HEAD, size: 84, weight: 700, ls: 1.1 }),
          t('I am currently available for freelance projects and full-time opportunities.', { x: 100, y: 450, font: SANS, size: 28, color: MUTED, ls: 1.5, width: 800 }),
          
          r({ x: 100, y: 600, w: 300, h: 60, rx: 30, fill: INK }),
          t('hello@janedoe.com', { x: 250, y: 618, size: 18, weight: 600, color: BG, align: 'center', originX: 'center' }),
          
          t('Twitter / X', { x: 100, y: 750, size: 18, weight: 500, color: MUTED }),
          t('LinkedIn', { x: 300, y: 750, size: 18, weight: 500, color: MUTED }),
          t('Dribbble', { x: 500, y: 750, size: 18, weight: 500, color: MUTED }),
          
          img({ x: 1200, y: 200, w: 600, h: 700, rx: 20 })
        ]
      }
    }
  ]
};
