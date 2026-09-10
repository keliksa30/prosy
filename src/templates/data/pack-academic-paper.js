/**
 * ACADEMIC & RESEARCH PAPER PRESENTATION
 * Clean two-column typography, abstracts, formulas, data figures, and bibliography.
 */
const BG = '#ffffff';
const SURFACE = '#f8fafc';
const INK = '#0f172a';
const MUTED = '#475569';
const OXFORD = '#1e3a8a';
const BORDER = '#e2e8f0';

const SANS = 'Inter';
const SERIF = 'Playfair Display';

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
    type: 'rect', left: x, top: y, width: w, height: h, rx, ry: rx, fill: '#f1f5f9',
    originX: 'left', originY: 'top', selectable: true,
    custom: { isPhotoPlaceholder: true, maskWrap: true }
  };
}

export default {
  id: 'pack-academic-paper',
  name: 'Academic & Research Paper',
  theme: [BG, OXFORD, INK, SURFACE],
  description: 'Formal research presentation: clean two-column text, empirical tables, figure cards, and bibliography.',
  projectName: 'Latent Geometries — Academic Paper',
  pages: [
    // Slide 1: Title & Abstract
    {
      title: 'Title & Abstract',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('IEEE TRANSACTIONS ON COMPUTATIONAL INTELLIGENCE · VOL. 42, NO. 3, 2026', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: OXFORD, tracking: 100 }),
          t('Neural Representation of Multi-Agent\nSpatial Consensus in Latent Geometries', { x: 100, y: 130, font: SERIF, size: 52, weight: 700, color: INK, ls: 1.15 }),

          t('Dr. Marcus Vance¹, Prof. Sarah Lin², Dr. Kenji Takahashi¹', { x: 100, y: 280, font: SANS, size: 18, weight: 600, color: INK }),
          t('¹Center for Autonomous Systems, MIT   ²Department of Computer Science, ETH Zürich', { x: 100, y: 315, font: SANS, size: 14, color: MUTED }),

          r({ x: 100, y: 380, w: 1720, h: 2, fill: INK }),

          // Abstract Callout
          r({ x: 100, y: 430, w: 1720, h: 260, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('ABSTRACT', { x: 140, y: 460, font: SANS, size: 14, weight: 700, color: OXFORD, tracking: 120 }),
          t('We investigate the emergence of geometric spatial consensus in decentralized multi-agent reinforcement learning environments. By projecting high-dimensional sensor manifolds into Riemannian latent manifolds, we demonstrate that decentralized agents reach topological coordination in O(log N) iterations without explicit global state synchronization. Experimental benchmarks demonstrate a 3.4× reduction in communication bandwidth across swarm robotics tests.', {
            x: 140, y: 500, font: SANS, size: 18, color: INK, ls: 1.6, width: 1640
          }),

          t('Index Terms — Distributed Consensus, Riemannian Geometry, Multi-Agent RL, Swarm Robotics, Manifold Learning.', { x: 140, y: 640, font: SANS, size: 13, weight: 600, color: MUTED }),

          // Keywords Pill badges
          t('DOI: 10.1109/TCSI.2026.892014', { x: 100, y: 920, font: SANS, size: 13, color: MUTED }),
          t('arXiv:2604.11928 [cs.RO]', { x: 1640, y: 920, font: SANS, size: 13, color: OXFORD, weight: 600 })
        ]
      }
    },
    // Slide 2: Two-column Methodology & Equations
    {
      title: 'Methodology',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('02 / MATHEMATICAL FORMULATION', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: OXFORD, tracking: 120 }),
          t('Decentralized Manifold Projection', { x: 100, y: 110, font: SERIF, size: 44, color: INK }),

          // Column 1 (Text & Equations)
          t('A. Local Policy Embeddings', { x: 100, y: 200, font: SANS, size: 20, weight: 700, color: INK }),
          t('Consider a swarm of N independent agents where each agent i observes an ego-centric state vector s_i ∈ ℝ^d. Rather than broadcasting full observations across lossy radio channels, each node maps s_i into an intrinsic Riemannian metric space M governed by the Laplace-Beltrami operator:', {
            x: 100, y: 240, font: SANS, size: 15, color: MUTED, ls: 1.5, width: 800
          }),

          // Formula box
          r({ x: 100, y: 370, w: 800, h: 100, rx: 8, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('L(s_i) = argmin_θ ‖ ∇_M Ψ_θ(s_i) - ∑_{j ∈ N(i)} w_ij (Ψ_θ(s_j) - Ψ_θ(s_i)) ‖_g^2', {
            x: 140, y: 405, font: SANS, size: 17, weight: 600, color: OXFORD
          }),

          t('B. Convergence Guarantee', { x: 100, y: 510, font: SANS, size: 20, weight: 700, color: INK }),
          t('Theorem 1 (Asymptotic Consensus): Under any weakly-connected dynamic graph topology G(t), the gradient flow induced by L(s) converges asymptotically to a unique geodesically convex equilibrium with probability 1 - ε.', {
            x: 100, y: 550, font: SANS, size: 15, color: MUTED, ls: 1.5, width: 800
          }),

          // Column 2 (Figure diagram placeholder)
          r({ x: 960, y: 200, w: 860, h: 680, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 990, y: 230, w: 800, h: 560, rx: 8 }),
          t('Fig. 1. Architectural schematic of the Riemannian latent manifold mapping and decentralized consensus gradient flow across 64 autonomous robotic nodes.', {
            x: 990, y: 810, font: SANS, size: 13, color: MUTED, width: 800, ls: 1.4
          })
        ]
      }
    },
    // Slide 3: Results & Benchmark Table
    {
      title: 'Empirical Results',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('03 / EXPERIMENTAL BENCHMARKS', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: OXFORD, tracking: 120 }),
          t('Performance Comparison on SwarmRobo-100', { x: 100, y: 110, font: SERIF, size: 44, color: INK }),

          // Benchmark Table Card
          r({ x: 100, y: 200, w: 1720, h: 420, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('TABLE I: Quantitative Comparison Across 100 Autonomous UAV Field Trials', { x: 140, y: 230, font: SANS, size: 14, weight: 700, color: INK }),

          // Table Header
          r({ x: 140, y: 270, w: 1640, h: 48, fill: '#e2e8f0' }),
          t('Architecture / Baseline', { x: 160, y: 285, font: SANS, size: 14, weight: 700, color: INK }),
          t('Convergence (s)', { x: 620, y: 285, font: SANS, size: 14, weight: 700, color: INK }),
          t('Bandwidth (kB/s)', { x: 960, y: 285, font: SANS, size: 14, weight: 700, color: INK }),
          t('Packet Loss Resilience', { x: 1320, y: 285, font: SANS, size: 14, weight: 700, color: INK }),

          // Row 1
          t('Centralized MAPPO', { x: 160, y: 335, font: SANS, size: 14, color: MUTED }),
          t('4.82 ± 0.4', { x: 620, y: 335, font: SANS, size: 14, color: MUTED }),
          t('2,410 kB/s', { x: 960, y: 335, font: SANS, size: 14, color: MUTED }),
          t('Fails at 15% loss', { x: 1320, y: 335, font: SANS, size: 14, color: MUTED }),

          // Row 2
          r({ x: 140, y: 370, w: 1640, h: 1, fill: BORDER }),
          t('GNN-Consensus (Li et al.)', { x: 160, y: 395, font: SANS, size: 14, color: MUTED }),
          t('2.15 ± 0.2', { x: 620, y: 395, font: SANS, size: 14, color: MUTED }),
          t('840 kB/s', { x: 960, y: 395, font: SANS, size: 14, color: MUTED }),
          t('Degrades at 30% loss', { x: 1320, y: 395, font: SANS, size: 14, color: MUTED }),

          // Row 3 (Our method - highlighted)
          r({ x: 140, y: 430, w: 1640, h: 56, rx: 6, fill: '#dbeafe' }),
          t('Ours: Latent Geometry (O(log N))', { x: 160, y: 448, font: SANS, size: 15, weight: 700, color: OXFORD }),
          t('0.64 ± 0.05', { x: 620, y: 448, font: SANS, size: 15, weight: 700, color: OXFORD }),
          t('245 kB/s (-71%)', { x: 960, y: 448, font: SANS, size: 15, weight: 700, color: OXFORD }),
          t('Robust up to 65% loss', { x: 1320, y: 448, font: SANS, size: 15, weight: 700, color: OXFORD }),

          // Chart summary cards below
          r({ x: 100, y: 650, w: 840, h: 260, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 130, y: 675, w: 780, h: 210, rx: 6 }),

          r({ x: 980, y: 650, w: 840, h: 260, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          img({ x: 1010, y: 675, w: 780, h: 210, rx: 6 })
        ]
      }
    },
    // Slide 4: Discussion & Bibliography
    {
      title: 'References & Affiliations',
      canvas_json: {
        backgroundColor: BG,
        objects: [
          t('04 / CITATIONS & ACKNOWLEDGMENTS', { x: 100, y: 70, font: SANS, size: 12, weight: 700, color: OXFORD, tracking: 120 }),
          t('References and Institutional Affiliations', { x: 100, y: 110, font: SERIF, size: 44, color: INK }),

          // Citations List
          r({ x: 100, y: 190, w: 1100, h: 720, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('REFERENCES', { x: 140, y: 225, font: SANS, size: 14, weight: 700, color: INK }),

          t('[1] C. Olfati-Saber, J. A. Fax, and R. M. Murray, "Consensus and cooperation in networked multi-agent systems," Proc. IEEE, vol. 95, no. 1, pp. 215–233, Jan. 2007.', {
            x: 140, y: 275, font: SANS, size: 14, color: MUTED, width: 1020, ls: 1.4
          }),
          t('[2] M. Bronstein, J. Bruna, T. Cohen, and P. Veličković, "Geometric deep learning: Grids, groups, graphs, geodesics, and gauges," arXiv preprint arXiv:2104.13478, 2021.', {
            x: 140, y: 355, font: SANS, size: 14, color: MUTED, width: 1020, ls: 1.4
          }),
          t('[3] Y. Li, W. Zhang, and Z. Chen, "Graph neural diffusion for decentralized robotic coordination," IEEE Trans. Robotics, vol. 39, pp. 1102–1118, 2024.', {
            x: 140, y: 435, font: SANS, size: 14, color: MUTED, width: 1020, ls: 1.4
          }),
          t('[4] S. Lin and M. Vance, "Riemannian gradient dynamics on metric graphs," J. Machine Learning Research, vol. 26, no. 88, pp. 1–34, 2025.', {
            x: 140, y: 515, font: SANS, size: 14, color: MUTED, width: 1020, ls: 1.4
          }),
          t('[5] D. Silver et al., "Mastering complex distributed domains with decentralized actor-critic representations," Nature Machine Intelligence, vol. 7, pp. 412–428, 2025.', {
            x: 140, y: 595, font: SANS, size: 14, color: MUTED, width: 1020, ls: 1.4
          }),

          // Author card on right
          r({ x: 1240, y: 190, w: 580, h: 720, rx: 12, fill: SURFACE, stroke: BORDER, strokeWidth: 1 }),
          t('Corresponding Authors', { x: 1280, y: 225, font: SANS, size: 16, weight: 700, color: INK }),

          t('Dr. Marcus Vance', { x: 1280, y: 275, font: SANS, size: 18, weight: 600, color: OXFORD }),
          t('Lead Researcher, MIT CSAIL\nEmail: mvance@csail.mit.edu', { x: 1280, y: 305, font: SANS, size: 14, color: MUTED, ls: 1.4 }),

          t('Prof. Sarah Lin', { x: 1280, y: 395, font: SANS, size: 18, weight: 600, color: OXFORD }),
          t('Chair of Learning Systems, ETH Zürich\nEmail: sarah.lin@inf.ethz.ch', { x: 1280, y: 425, font: SANS, size: 14, color: MUTED, ls: 1.4 }),

          r({ x: 1280, y: 510, w: 500, h: 1, fill: BORDER }),
          t('Funding & Grants', { x: 1280, y: 545, font: SANS, size: 16, weight: 700, color: INK }),
          t('This research was supported in part by the National Science Foundation (NSF) Grant CNS-2401821 and the Swiss National Science Foundation (SNSF) Project 200021_215904.', {
            x: 1280, y: 585, font: SANS, size: 13, color: MUTED, width: 500, ls: 1.5
          })
        ]
      }
    }
  ]
};
