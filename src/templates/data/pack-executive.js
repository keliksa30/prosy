/**
 * EXECUTIVE — Consultant / Professional
 * Trustworthy, structured, and corporate.
 */
const BG = '#ffffff';
const INK = '#1e293b'; // Slate 800
const MUTED = '#64748b'; // Slate 500
const ACCENT = '#0f172a'; // Slate 900
const BRAND = '#0284c7'; // Light Blue

const SANS = 'Roboto';

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

function r({ x, y, w, h, fill = BRAND, rx = 0 }) {
  return { type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill, originX: 'left', originY: 'top', selectable: true };
}

function img({ x, y, w, h, rx = 0 }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#f1f5f9',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-executive',
  name: 'Executive Portfolio',
  theme: ['#ffffff', '#1e293b', '#0284c7'],
  description: 'Trustworthy, structured, corporate portfolio for consultants.',
  projectName: 'Executive Presentation',
  pages: [
    {
      title: 'Intro',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 0, y: 0, w: 600, h: 1080, fill: ACCENT }),
          img({ x: 80, y: 150, w: 440, h: 500, rx: 8 }),
          
          t('CONTACT', { x: 80, y: 720, font: SANS, size: 14, weight: 700, color: BRAND, tracking: 100 }),
          t('david.r@example.com\n+1 (555) 123-4567\nNew York, NY', { x: 80, y: 750, font: SANS, size: 18, color: '#f8fafc', ls: 1.6 }),
          
          t('DAVID REYNOLDS', { x: 700, y: 150, font: SANS, size: 64, weight: 900, color: INK, tracking: -50 }),
          t('Strategic Management Consultant', { x: 700, y: 230, font: SANS, size: 28, color: BRAND, weight: 500 }),
          
          t('Driving growth and operational excellence for Fortune 500 companies through data-driven strategy and transformative leadership.', { x: 700, y: 320, font: SANS, size: 24, color: MUTED, ls: 1.5, width: 900 }),
          
          r({ x: 700, y: 450, w: 220, h: 50, rx: 4, fill: BRAND }),
          t('Download Resume', { x: 725, y: 464, font: SANS, size: 16, weight: 700, color: '#ffffff' }),
          
          t('KEY EXPERTISE', { x: 700, y: 600, font: SANS, size: 14, weight: 700, color: INK, tracking: 100 }),
          r({ x: 700, y: 640, w: 900, h: 1, fill: '#e2e8f0' }),
          
          t('• Corporate Restructuring\n• Market Entry Strategy\n• M&A Advisory', { x: 700, y: 680, font: SANS, size: 20, color: INK, ls: 1.8 }),
          t('• Supply Chain Optimization\n• Financial Modeling\n• Change Management', { x: 1050, y: 680, font: SANS, size: 20, color: INK, ls: 1.8 }),
        ]
      }
    },
    {
      title: 'Core Competencies',
      canvas_json: {
        backgroundColor: '#f8fafc',
        objects: [
          t('CORE COMPETENCIES', { x: 100, y: 100, font: SANS, size: 14, weight: 700, color: BRAND, tracking: 100 }),
          t('Value Proposition', { x: 100, y: 140, font: SANS, size: 48, weight: 800, color: INK }),
          
          r({ x: 100, y: 300, w: 500, h: 300, fill: BG, rx: 8 }),
          t('Strategic Planning', { x: 140, y: 350, font: SANS, size: 28, weight: 700, color: INK }),
          t('Aligning organizational goals with market opportunities. Developing 3-5 year roadmaps for sustainable growth and competitive advantage.', { x: 140, y: 420, font: SANS, size: 18, color: MUTED, ls: 1.5, width: 420 }),
          
          r({ x: 710, y: 300, w: 500, h: 300, fill: BG, rx: 8 }),
          t('Operational Efficiency', { x: 750, y: 350, font: SANS, size: 28, weight: 700, color: INK }),
          t('Streamlining complex processes using lean methodologies. Reducing overhead costs while improving overall output quality and employee satisfaction.', { x: 750, y: 420, font: SANS, size: 18, color: MUTED, ls: 1.5, width: 420 }),
          
          r({ x: 1320, y: 300, w: 500, h: 300, fill: BG, rx: 8 }),
          t('Change Management', { x: 1360, y: 350, font: SANS, size: 28, weight: 700, color: INK }),
          t('Guiding leadership and staff through major transitions. Ensuring high adoption rates for new technologies and cultural shifts within the firm.', { x: 1360, y: 420, font: SANS, size: 18, color: MUTED, ls: 1.5, width: 420 }),
        ]
      }
    },
    {
      title: 'Case Study',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('CASE STUDY', { x: 100, y: 100, font: SANS, size: 14, weight: 700, color: BRAND, tracking: 100 }),
          t('Global Supply Chain Optimization', { x: 100, y: 140, font: SANS, size: 48, weight: 800, color: INK }),
          t('Client: Fortune 500 Retailer | Duration: 18 Months', { x: 100, y: 220, font: SANS, size: 18, color: MUTED }),
          
          img({ x: 100, y: 300, w: 800, h: 600, rx: 8 }),
          
          t('THE CHALLENGE', { x: 1000, y: 300, font: SANS, size: 16, weight: 700, color: INK }),
          t('The client faced a 15% increase in logistics costs due to fragmented supplier networks and inefficient warehouse management systems.', { x: 1000, y: 340, font: SANS, size: 20, color: MUTED, ls: 1.5, width: 800 }),
          
          t('THE SOLUTION', { x: 1000, y: 480, font: SANS, size: 16, weight: 700, color: INK }),
          t('Implemented a centralized inventory forecasting model and renegotiated contracts with key tier-1 suppliers to consolidate freight routes.', { x: 1000, y: 520, font: SANS, size: 20, color: MUTED, ls: 1.5, width: 800 }),
          
          r({ x: 1000, y: 680, w: 250, h: 150, fill: '#f0f9ff', rx: 8 }),
          t('Cost Reduction', { x: 1030, y: 720, font: SANS, size: 16, color: MUTED }),
          t('18.5%', { x: 1030, y: 750, font: SANS, size: 48, weight: 800, color: BRAND }),
          
          r({ x: 1300, y: 680, w: 250, h: 150, fill: '#f0f9ff', rx: 8 }),
          t('Fulfillment Speed', { x: 1330, y: 720, font: SANS, size: 16, color: MUTED }),
          t('+ 32%', { x: 1330, y: 750, font: SANS, size: 48, weight: 800, color: BRAND }),
        ]
      }
    },
    {
      title: 'Testimonials',
      canvas_json: {
        backgroundColor: ACCENT,
        objects: [
          t('CLIENT TESTIMONIALS', { x: 100, y: 100, font: SANS, size: 14, weight: 700, color: BRAND, tracking: 100 }),
          t('What They Say', { x: 100, y: 140, font: SANS, size: 48, weight: 800, color: '#ffffff' }),
          
          t('“', { x: 100, y: 350, font: SANS, size: 120, weight: 900, color: BRAND }),
          t('David\'s ability to diagnose systemic operational issues and implement pragmatic solutions is unmatched. He didn\'t just give us a report; he stayed to ensure the changes were fully integrated into our company culture.', { x: 200, y: 380, font: SANS, size: 36, color: '#f8fafc', ls: 1.5, width: 1400 }),
          
          t('Sarah Jenkins', { x: 200, y: 650, font: SANS, size: 24, weight: 700, color: '#ffffff' }),
          t('CEO, Apex Logistics International', { x: 200, y: 690, font: SANS, size: 18, color: MUTED }),
        ]
      }
    },
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 100, y: 100, w: 1720, h: 880, fill: '#f8fafc', rx: 16 }),
          
          t('READY TO DISCUSS YOUR NEXT STRATEGIC MOVE?', { x: 960, y: 250, font: SANS, size: 14, weight: 700, color: BRAND, tracking: 100, align: 'center', originX: 'center' }),
          t('Schedule a Consultation', { x: 960, y: 290, font: SANS, size: 64, weight: 800, color: INK, align: 'center', originX: 'center' }),
          t('Whether you\'re looking to scale operations, restructure for profitability, or navigate complex market entries, let\'s explore how we can achieve your goals together.', { x: 960, y: 400, font: SANS, size: 24, color: MUTED, ls: 1.5, width: 800, align: 'center', originX: 'center' }),
          
          r({ x: 810, y: 550, w: 300, h: 60, rx: 8, fill: BRAND }),
          t('Book an Appointment', { x: 960, y: 568, font: SANS, size: 18, weight: 700, color: '#ffffff', align: 'center', originX: 'center' }),
          
          t('david.reynolds@consulting.com', { x: 960, y: 700, font: SANS, size: 18, weight: 600, color: INK, align: 'center', originX: 'center' }),
          t('+1 (555) 123-4567', { x: 960, y: 740, font: SANS, size: 18, weight: 600, color: INK, align: 'center', originX: 'center' }),
        ]
      }
    }
  ]
};
