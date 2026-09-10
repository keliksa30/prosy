/**
 * STARTUP INVESTOR PITCH DECK
 * High-impact investor presentation: Problem, Solution, Market, Traction, Team, Ask.
 */
const BG = '#0b0f19';
const SURFACE = '#131b2e';
const INK = '#ffffff';
const MUTED = '#94a3b8';
const CORAL = '#ff5757';
const CYAN = '#00f0ff';
const BORDER = '#1e293b';

const SANS = 'Inter';
const HEAD = 'Space Grotesk';

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
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#1e293b',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-startup-pitch',
  name: 'Startup Investor Pitch',
  theme: [BG, CORAL, CYAN, SURFACE],
  description: 'High-impact investor pitch deck: Problem, Solution, Market, Traction, Team, and Financial Ask.',
  projectName: 'Nexus AI — Series A Pitch Deck',
  pages: [
    // Slide 1: Cover / Hook
    {
      title: 'Cover',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          r({ x: 100, y: 70, w: 120, h: 32, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('SERIES A DECK', { x: 160, y: 78, font: SANS, size: 11, weight: 700, color: CYAN, align: 'center', originX: 'center', tracking: 100 }),
          t('NEXUS AI', { x: 100, y: 280, font: HEAD, size: 92, weight: 700, color: INK, ls: 1.05 }),
          t('Autonomous Cloud Infrastructure\nfor the Enterprise AI Era.', { x: 100, y: 400, font: SANS, size: 38, weight: 400, color: MUTED, ls: 1.3 }),
          r({ x: 100, y: 560, w: 220, h: 56, rx: 28, fill: CORAL }),
          t('Confidential Memo', { x: 210, y: 578, font: SANS, size: 15, weight: 600, color: INK, align: 'center', originX: 'center' }),
          r({ x: 1200, y: 180, w: 620, h: 720, rx: 24, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 1230, y: 210, w: 560, h: 660, rx: 16 }),
          t('Confidential Investor Presentation · 2026', { x: 100, y: 980, font: SANS, size: 13, color: '#475569' })
        ]
      }
    },
    // Slide 2: Problem
    {
      title: 'The Problem',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('01 / PROBLEM STATEMENT', { x: 100, y: 80, font: SANS, size: 13, weight: 700, color: CORAL, tracking: 150 }),
          t('Cloud Complexity is Bleeding Enterprise Margins', { x: 100, y: 130, font: HEAD, size: 54, weight: 700, color: INK }),
          
          r({ x: 100, y: 280, w: 540, h: 520, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('$140B', { x: 140, y: 340, font: HEAD, size: 76, weight: 700, color: CORAL }),
          t('Wasted Cloud Spend Annually', { x: 140, y: 440, font: SANS, size: 22, weight: 600, color: INK }),
          t('Overprovisioned compute instances and unmonitored container clusters drain Fortune 500 engineering budgets without accountability.', { x: 140, y: 490, font: SANS, size: 16, color: MUTED, ls: 1.5, width: 460 }),

          r({ x: 680, y: 280, w: 540, h: 520, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('72%', { x: 720, y: 340, font: HEAD, size: 76, weight: 700, color: CYAN }),
          t('DevOps Fatigue & Churn', { x: 720, y: 440, font: SANS, size: 22, weight: 600, color: INK }),
          t('Site reliability engineers spend 65% of their working hours manually debugging distributed microservice outages and Kubernetes manifests.', { x: 720, y: 490, font: SANS, size: 16, color: MUTED, ls: 1.5, width: 460 }),

          r({ x: 1260, y: 280, w: 560, h: 520, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('4.2h', { x: 1300, y: 340, font: HEAD, size: 76, weight: 700, color: '#f59e0b' }),
          t('Average Outage Resolution Time', { x: 1300, y: 440, font: SANS, size: 22, weight: 600, color: INK }),
          t('Current monitoring tools alert teams AFTER incidents happen, leading to costly downtime and breached SLAs for mission-critical apps.', { x: 1300, y: 490, font: SANS, size: 16, color: MUTED, ls: 1.5, width: 480 }),

          t('Source: Gartner Cloud Spending & SRE Benchmark Report', { x: 100, y: 880, font: SANS, size: 12, color: '#475569' })
        ]
      }
    },
    // Slide 3: Solution
    {
      title: 'The Solution',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('02 / OUR SOLUTION', { x: 100, y: 80, font: SANS, size: 13, weight: 700, color: CYAN, tracking: 150 }),
          t('Nexus AI: The Self-Healing Cloud Fabric', { x: 100, y: 130, font: HEAD, size: 54, weight: 700, color: INK }),
          t('An intelligent kernel that auto-tunes cluster capacity and resolves infrastructure bottlenecks before downtime strikes.', { x: 100, y: 210, font: SANS, size: 20, color: MUTED, width: 900 }),

          r({ x: 100, y: 300, w: 820, h: 560, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 130, y: 330, w: 760, h: 500, rx: 12 }),

          r({ x: 960, y: 300, w: 860, h: 160, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Predictive Capacity Autoscale', { x: 1000, y: 335, font: HEAD, size: 22, weight: 600, color: INK }),
          t('ML-driven traffic forecasting scales nodes down during lulls and pre-warms capacity prior to peak rushes, cutting waste by 52%.', { x: 1000, y: 380, font: SANS, size: 15, color: MUTED, width: 780 }),

          r({ x: 960, y: 490, w: 860, h: 160, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Autonomous Incident Triage', { x: 1000, y: 525, font: HEAD, size: 22, weight: 600, color: INK }),
          t('Identifies deadlocked database locks and memory leaks in real time, automatically routing traffic to healthy pods in under 80ms.', { x: 1000, y: 570, font: SANS, size: 15, color: MUTED, width: 780 }),

          r({ x: 960, y: 680, w: 860, h: 180, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Universal Multi-Cloud Mesh', { x: 1000, y: 715, font: HEAD, size: 22, weight: 600, color: INK }),
          t('Seamless single-pane control plane spanning AWS, Azure, Google Cloud, and private bare-metal Kubernetes clusters with zero lock-in.', { x: 1000, y: 760, font: SANS, size: 15, color: MUTED, width: 780 })
        ]
      }
    },
    // Slide 4: Market Size
    {
      title: 'Market Size',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('03 / MARKET OPPORTUNITY', { x: 100, y: 80, font: SANS, size: 13, weight: 700, color: CORAL, tracking: 150 }),
          t('A $180B Greenfield in Enterprise Modernization', { x: 100, y: 130, font: HEAD, size: 54, weight: 700, color: INK }),

          // TAM Circle
          r({ x: 100, y: 260, w: 520, h: 540, rx: 24, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('TAM', { x: 150, y: 310, font: SANS, size: 14, weight: 700, color: MUTED }),
          t('$180B', { x: 150, y: 350, font: HEAD, size: 68, weight: 700, color: INK }),
          t('Global Cloud Infrastructure & DevOps Observability', { x: 150, y: 440, font: SANS, size: 18, weight: 600, color: INK }),
          t('Total worldwide expenditure across enterprise public cloud optimization and automation software.', { x: 150, y: 490, font: SANS, size: 15, color: MUTED, ls: 1.4, width: 420 }),

          // SAM
          r({ x: 660, y: 260, w: 520, h: 540, rx: 24, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('SAM', { x: 710, y: 310, font: SANS, size: 14, weight: 700, color: CYAN }),
          t('$45B', { x: 710, y: 350, font: HEAD, size: 68, weight: 700, color: CYAN }),
          t('AI-Native Workload Management', { x: 710, y: 440, font: SANS, size: 18, weight: 600, color: INK }),
          t('Enterprises deploying LLM inference pipelines, GPU clusters, and high-density microservices.', { x: 710, y: 490, font: SANS, size: 15, color: MUTED, ls: 1.4, width: 420 }),

          // SOM
          r({ x: 1220, y: 260, w: 600, h: 540, rx: 24, fill: SURFACE, stroke: CORAL, strokeWidth: 1.5 }),
          t('SOM (YEAR 1-3)', { x: 1270, y: 310, font: SANS, size: 14, weight: 700, color: CORAL }),
          t('$6.2B', { x: 1270, y: 350, font: HEAD, size: 68, weight: 700, color: CORAL }),
          t('Mid-to-Large Tier Tech & Fintech', { x: 1270, y: 440, font: SANS, size: 18, weight: 600, color: INK }),
          t('Over 12,000 venture-backed and public tech companies actively migrating from legacy Datadog/NewRelic suites.', { x: 1270, y: 490, font: SANS, size: 15, color: MUTED, ls: 1.4, width: 480 }),

          t('Compound Annual Growth Rate (CAGR): 28.4% through 2030', { x: 100, y: 880, font: SANS, size: 14, weight: 600, color: CYAN })
        ]
      }
    },
    // Slide 5: Traction
    {
      title: 'Traction',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('04 / TRACTION & METRICS', { x: 100, y: 80, font: SANS, size: 13, weight: 700, color: CYAN, tracking: 150 }),
          t('Explosive 280% Year-over-Year Revenue Growth', { x: 100, y: 130, font: HEAD, size: 54, weight: 700, color: INK }),

          r({ x: 100, y: 260, w: 380, h: 220, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('$3.2M', { x: 140, y: 300, font: HEAD, size: 62, weight: 700, color: INK }),
          t('Current ARR', { x: 140, y: 390, font: SANS, size: 18, weight: 600, color: MUTED }),
          t('Up from $840k in Q1 2025', { x: 140, y: 425, font: SANS, size: 13, color: CYAN }),

          r({ x: 520, y: 260, w: 380, h: 220, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('142%', { x: 560, y: 300, font: HEAD, size: 62, weight: 700, color: CORAL }),
          t('Net Dollar Retention', { x: 560, y: 390, font: SANS, size: 18, weight: 600, color: MUTED }),
          t('Top decile enterprise SaaS retention', { x: 560, y: 425, font: SANS, size: 13, color: INK }),

          r({ x: 940, y: 260, w: 380, h: 220, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('48', { x: 980, y: 300, font: HEAD, size: 62, weight: 700, color: INK }),
          t('Enterprise Customers', { x: 980, y: 390, font: SANS, size: 18, weight: 600, color: MUTED }),
          t('Avg contract value $65,000/yr', { x: 980, y: 425, font: SANS, size: 13, color: CYAN }),

          r({ x: 1360, y: 260, w: 460, h: 220, rx: 16, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Zero', { x: 1400, y: 300, font: HEAD, size: 62, weight: 700, color: '#10b981' }),
          t('Annual Customer Churn', { x: 1400, y: 390, font: SANS, size: 18, weight: 600, color: MUTED }),
          t('100% renewal rate over past 18 months', { x: 1400, y: 425, font: SANS, size: 13, color: INK }),

          r({ x: 100, y: 530, w: 1720, h: 360, rx: 20, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Trusted by Engineering Leaders Worldwide', { x: 150, y: 570, font: HEAD, size: 24, weight: 600, color: INK }),
          t('"Nexus saved our team 20 hours per week and halved our AWS bills in the first month." — VP Engineering, ScaleCorp', { x: 150, y: 630, font: SANS, size: 20, color: MUTED, ls: 1.5, width: 1500 }),
          img({ x: 150, y: 720, w: 1620, h: 120, rx: 10 })
        ]
      }
    },
    // Slide 6: Team & Ask
    {
      title: 'Team & The Ask',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('05 / THE TEAM & CAPITAL ASK', { x: 100, y: 80, font: SANS, size: 13, weight: 700, color: CORAL, tracking: 150 }),
          t('Accelerating the $12M Series A Round', { x: 100, y: 130, font: HEAD, size: 54, weight: 700, color: INK }),

          // Team cards
          r({ x: 100, y: 260, w: 380, h: 360, rx: 18, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 130, y: 290, w: 120, h: 120, rx: 60 }),
          t('Alex Mercer', { x: 130, y: 440, font: HEAD, size: 24, weight: 700, color: INK }),
          t('CEO & Co-Founder', { x: 130, y: 475, font: SANS, size: 15, color: CYAN, weight: 600 }),
          t('Ex-VP Engineering at Stripe. 12 years building distributed cloud backbones.', { x: 130, y: 510, font: SANS, size: 14, color: MUTED, width: 320 }),

          r({ x: 520, y: 260, w: 380, h: 360, rx: 18, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 550, y: 290, w: 120, h: 120, rx: 60 }),
          t('Elena Rostova', { x: 550, y: 440, font: HEAD, size: 24, weight: 700, color: INK }),
          t('CTO & Co-Founder', { x: 550, y: 475, font: SANS, size: 15, color: CYAN, weight: 600 }),
          t('PhD in AI from Stanford. Former Principal Scientist at Google DeepMind.', { x: 550, y: 510, font: SANS, size: 14, color: MUTED, width: 320 }),

          // Capital allocation card
          r({ x: 940, y: 260, w: 880, h: 580, rx: 20, fill: SURFACE, stroke: CORAL, strokeWidth: 1.5 }),
          t('Use of $12M Growth Capital', { x: 990, y: 310, font: HEAD, size: 30, weight: 700, color: INK }),

          t('• 50% R&D & Core Engine Expansion', { x: 990, y: 380, font: SANS, size: 19, weight: 600, color: INK }),
          t('Hiring senior distributed systems engineers to ship multi-region GPU scheduler.', { x: 1020, y: 415, font: SANS, size: 15, color: MUTED, width: 760 }),

          t('• 35% Enterprise Go-To-Market', { x: 990, y: 480, font: SANS, size: 19, weight: 600, color: INK }),
          t('Scaling enterprise account executive force across North America & EMEA.', { x: 1020, y: 515, font: SANS, size: 15, color: MUTED, width: 760 }),

          t('• 15% Strategic Partnerships & Ecosystem', { x: 990, y: 580, font: SANS, size: 19, weight: 600, color: INK }),
          t('Co-sell motions with AWS Marketplace and Azure Solutions Center.', { x: 1020, y: 615, font: SANS, size: 15, color: MUTED, width: 760 }),

          r({ x: 990, y: 700, w: 260, h: 60, rx: 30, fill: CORAL }),
          t('investors@nexus.ai', { x: 1120, y: 720, font: SANS, size: 16, weight: 700, color: INK, align: 'center', originX: 'center' }),
          t('San Francisco · New York · London', { x: 1300, y: 722, font: SANS, size: 15, color: MUTED })
        ]
      }
    }
  ]
};
