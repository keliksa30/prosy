/**
 * CODEDARK — Software Developer Portfolio
 * Technical, sleek, and high-contrast.
 */
const BG = '#0e0f12';
const INK = '#ffffff';
const MUTED = '#a1a1aa';
const ACCENT = '#10b981'; // Neon Green
const BORDER = '#27272a';
const BLUE = '#3b82f6';

const SANS = 'Inter';
const MONO = 'IBM Plex Mono';

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

function r({ x, y, w, h, fill = '#18181b', rx = 8, stroke = BORDER, strokeWidth = 1 }) {
  return { type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill, stroke, strokeWidth, originX: 'left', originY: 'top', selectable: true };
}

function img({ x, y, w, h, rx = 8 }) {
  return {
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#27272a',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-codedark',
  name: 'CodeDark Portfolio',
  theme: ['#0e0f12', '#ffffff', '#10b981'],
  description: 'Technical, dark-themed portfolio for software developers.',
  projectName: 'Dev Portfolio - Dark',
  pages: [
    {
      title: 'Terminal / Hero',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('<alex.dev />', { x: 120, y: 80, font: MONO, size: 24, weight: 600, color: INK }),
          t('GitHub', { x: 1550, y: 80, font: MONO, size: 16, color: MUTED }),
          t('LinkedIn', { x: 1650, y: 80, font: MONO, size: 16, color: MUTED }),
          t('Resume', { x: 1750, y: 80, font: MONO, size: 16, color: ACCENT }),
          
          t('FULL-STACK ENGINEER', { x: 120, y: 350, font: MONO, size: 16, color: ACCENT, tracking: 200 }),
          t('Building robust\nbackend systems\n& fast frontends.', { x: 120, y: 390, font: SANS, size: 80, weight: 800, ls: 1.1, color: INK }),
          
          t('$ npx alex-portfolio', { x: 120, y: 700, font: MONO, size: 18, color: MUTED }),
          t('> Specializing in TypeScript, Go, and React. AWS Certified.', { x: 120, y: 740, font: MONO, size: 18, color: MUTED }),
          
          r({ x: 1100, y: 250, w: 650, h: 550, rx: 12 }),
          r({ x: 1100, y: 250, w: 650, h: 40, rx: 12, strokeWidth: 0, fill: '#27272a' }), // window bar
          { type: 'ellipse', left: 1120, top: 265, rx: 6, ry: 6, fill: '#ef4444' }, // red dot
          { type: 'ellipse', left: 1140, top: 265, rx: 6, ry: 6, fill: '#f59e0b' }, // yellow dot
          { type: 'ellipse', left: 1160, top: 265, rx: 6, ry: 6, fill: '#10b981' }, // green dot
          
          t('const developer = {', { x: 1140, y: 320, font: MONO, size: 16, color: BLUE }),
          t('  name: "Alex Johnson",', { x: 1140, y: 360, font: MONO, size: 16, color: INK }),
          t('  role: "Software Engineer",', { x: 1140, y: 400, font: MONO, size: 16, color: INK }),
          t('  skills: ["TypeScript", "Go", "React", "Node.js"],', { x: 1140, y: 440, font: MONO, size: 16, color: INK }),
          t('  location: "Remote, US"', { x: 1140, y: 480, font: MONO, size: 16, color: INK }),
          t('};', { x: 1140, y: 520, font: MONO, size: 16, color: BLUE }),
        ]
      }
    },
    {
      title: 'Projects',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('FEATURED PROJECTS', { x: 120, y: 120, font: MONO, size: 16, color: ACCENT, tracking: 200 }),
          t('What I\'ve built', { x: 120, y: 160, font: SANS, size: 48, weight: 700, color: INK }),
          
          // Project 1
          r({ x: 120, y: 300, w: 800, h: 600, rx: 16 }),
          img({ x: 120, y: 300, w: 800, h: 400, rx: 16 }),
          t('OpenSource CLI Tool', { x: 160, y: 740, font: SANS, size: 28, weight: 700, color: INK }),
          t('A blazingly fast CLI tool written in Rust for developers.', { x: 160, y: 790, font: SANS, size: 18, color: MUTED, width: 700 }),
          t('Rust • CLI • Open Source', { x: 160, y: 840, font: MONO, size: 14, color: ACCENT }),
          
          // Project 2
          r({ x: 1000, y: 300, w: 800, h: 600, rx: 16 }),
          img({ x: 1000, y: 300, w: 800, h: 400, rx: 16 }),
          t('SaaS Platform Dashboard', { x: 1040, y: 740, font: SANS, size: 28, weight: 700, color: INK }),
          t('Real-time analytics dashboard with WebSockets and React.', { x: 1040, y: 790, font: SANS, size: 18, color: MUTED, width: 700 }),
          t('React • TypeScript • Node.js', { x: 1040, y: 840, font: MONO, size: 14, color: ACCENT }),
        ]
      }
    },
    {
      title: 'Experience',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('CAREER TIMELINE', { x: 120, y: 120, font: MONO, size: 16, color: ACCENT, tracking: 200 }),
          t('Where I\'ve worked', { x: 120, y: 160, font: SANS, size: 48, weight: 700, color: INK }),
          
          r({ x: 140, y: 300, w: 2, h: 500, fill: BORDER, rx: 0 }),
          
          { type: 'ellipse', left: 135, top: 320, rx: 6, ry: 6, fill: ACCENT },
          t('Senior Backend Engineer', { x: 200, y: 310, font: SANS, size: 28, weight: 700, color: INK }),
          t('TechCorp Inc. // 2023 - Present', { x: 200, y: 350, font: MONO, size: 16, color: MUTED }),
          t('Led the migration of legacy monolith to microservices using Go and gRPC, reducing latency by 40%.', { x: 200, y: 390, font: SANS, size: 18, color: MUTED, width: 800 }),
          
          { type: 'ellipse', left: 135, top: 520, rx: 6, ry: 6, fill: BORDER },
          t('Full-Stack Developer', { x: 200, y: 510, font: SANS, size: 28, weight: 700, color: INK }),
          t('StartupX // 2020 - 2023', { x: 200, y: 550, font: MONO, size: 16, color: MUTED }),
          t('Developed and maintained React frontends and Node.js REST APIs for a SaaS product with 50k+ MAU.', { x: 200, y: 590, font: SANS, size: 18, color: MUTED, width: 800 }),
        ]
      }
    },
    {
      title: 'Tech Stack',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('TOOLBOX', { x: 120, y: 120, font: MONO, size: 16, color: ACCENT, tracking: 200 }),
          t('Tech Stack', { x: 120, y: 160, font: SANS, size: 48, weight: 700, color: INK }),
          
          r({ x: 120, y: 300, w: 500, h: 400, rx: 16 }),
          t('Backend', { x: 160, y: 340, font: SANS, size: 28, weight: 700, color: INK }),
          t('• Golang\n• Node.js / Express\n• Python / Django\n• PostgreSQL\n• Redis\n• gRPC', { x: 160, y: 400, font: MONO, size: 18, color: MUTED, ls: 2 }),
          
          r({ x: 670, y: 300, w: 500, h: 400, rx: 16 }),
          t('Frontend', { x: 710, y: 340, font: SANS, size: 28, weight: 700, color: INK }),
          t('• React / Next.js\n• TypeScript\n• Tailwind CSS\n• Redux\n• Framer Motion\n• Webpack', { x: 710, y: 400, font: MONO, size: 18, color: MUTED, ls: 2 }),
          
          r({ x: 1220, y: 300, w: 500, h: 400, rx: 16 }),
          t('DevOps & Cloud', { x: 1260, y: 340, font: SANS, size: 28, weight: 700, color: INK }),
          t('• AWS / GCP\n• Docker / Kubernetes\n• CI/CD Pipelines\n• Terraform\n• Datadog\n• Linux', { x: 1260, y: 400, font: MONO, size: 18, color: MUTED, ls: 2 }),
        ]
      }
    },
    {
      title: 'Contact',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('// EOF', { x: 120, y: 300, font: MONO, size: 24, color: ACCENT, tracking: 200 }),
          t('Let\'s build\nsomething.', { x: 120, y: 350, font: SANS, size: 96, weight: 800, ls: 1.1, color: INK }),
          
          r({ x: 120, y: 650, w: 250, h: 60, rx: 8, fill: ACCENT, strokeWidth: 0 }),
          t('Send Email', { x: 245, y: 668, size: 18, weight: 700, color: BG, align: 'center', originX: 'center' }),
          
          t('github.com/alexdev', { x: 120, y: 780, font: MONO, size: 18, color: MUTED }),
          t('linkedin.com/in/alexdev', { x: 400, y: 780, font: MONO, size: 18, color: MUTED }),
        ]
      }
    }
  ]
};
