/**
 * ElementLibrary — pre-built, authentic UI & portfolio blocks.
 * Designed to look 100% true-to-life: real vector SVG icons (hearts, comments,
 * shares, bookmarks, verified badges, traffic lights), authentic typography,
 * and clean photo frames ready for user drag & drop.
 */
import * as fabric from 'fabric';

const INK = '#111827';
const INK_MUTED = '#6B7280';
const INK_LIGHT = '#9CA3AF';
const CARD_BG = '#FFFFFF';
const BORDER = '#E5E7EB';
const ACCENT_BLUE = '#0095F6';
const ACCENT_VIOLET = '#7C3AED';
const ACCENT_GREEN = '#10B981';

function rect({ x, y, w, h, fill = CARD_BG, rx = 0, stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
  const opts = {
    left: x, top: y, width: w, height: h, rx, ry: rx,
    fill, stroke, strokeWidth, strokeUniform: true,
    originX: 'left', originY: 'top', selectable: true, name
  };
  if (custom) opts.custom = custom;
  return new fabric.Rect(opts);
}

function circle({ x, y, d, fill = 'transparent', stroke = null, strokeWidth = 0, name = 'Shape', custom = null }) {
  const opts = {
    left: x, top: y, rx: d / 2, ry: d / 2, fill, stroke, strokeWidth,
    strokeUniform: true, originX: 'left', originY: 'top', selectable: true, name
  };
  if (custom) opts.custom = custom;
  return new fabric.Ellipse(opts);
}

function txt(s, { x, y, size = 16, weight = 400, color = INK, font = 'Inter', ls = 1.3, name = 'Text', align = 'left', width = null, italic = false }) {
  const common = {
    left: x, top: y, fontFamily: font, fontSize: size, fontWeight: weight,
    fontStyle: italic ? 'italic' : 'normal', fill: color, lineHeight: ls,
    textAlign: align, originX: 'left', originY: 'top', selectable: true, name
  };
  if (width) return new fabric.Textbox(s, { ...common, width, splitByGrapheme: false });
  return new fabric.IText(s, common);
}

function path(d, { x, y, scale = 1, fill = '', stroke = null, strokeWidth = 0, name = 'Icon' } = {}) {
  return new fabric.Path(d, {
    left: x, top: y,
    scaleX: scale, scaleY: scale,
    fill: fill || '',
    stroke: stroke || null,
    strokeWidth: strokeWidth || 0,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    originX: 'left', originY: 'top',
    selectable: true, name
  });
}

// Reusable SVG Path icons
const SVG_HEART = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
const SVG_COMMENT = 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z';
const SVG_SEND = 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z';
const SVG_BOOKMARK = 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z';
const SVG_CHECK = 'M20 6L9 17l-5-5';
const SVG_X_LOGO = 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';
const SVG_REPEAT = 'M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3';
const SVG_LOCK = 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4';
const SVG_CAMERA = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';

function verifiedBadge(x, y) {
  return [
    circle({ x, y, d: 18, fill: ACCENT_BLUE, name: 'Verified badge' }),
    path(SVG_CHECK, { x: x + 4, y: y + 5, scale: 0.5, stroke: '#FFFFFF', strokeWidth: 3, name: 'Checkmark' })
  ];
}

export const ELEMENT_DEFS = [
  /* 1. INSTAGRAM POST */
  {
    id: 'ig-post', name: 'Instagram post', icon: 'Camera', sub: 'Authentic IG feed post',
    create() {
      const W = 480;
      return [
        rect({ x: 0, y: 0, w: W, h: 690, fill: CARD_BG, rx: 18, stroke: BORDER, strokeWidth: 1.5, name: 'IG Card' }),

        // Story gradient ring & Avatar
        circle({ x: 20, y: 18, d: 46, stroke: '#F43F5E', strokeWidth: 2.5, name: 'Story Ring' }),
        circle({ x: 24, y: 22, d: 38, fill: '#FFFFFF', stroke: '#FFFFFF', strokeWidth: 2, name: 'Avatar Spacer' }),
        circle({ x: 26, y: 24, d: 34, fill: '#E5E7EB', name: 'Avatar Photo Slot', custom: { isPhotoPlaceholder: true } }),

        // Username & Location
        txt('studio.today', { x: 78, y: 22, size: 15, weight: 700, color: INK, name: 'Username' }),
        ...verifiedBadge(170, 23),
        txt('Jakarta, Indonesia', { x: 78, y: 44, size: 12, color: INK_MUTED, name: 'Location' }),

        // Header options 3-dots
        txt('•••', { x: W - 48, y: 22, size: 18, weight: 700, color: INK_MUTED, name: 'Options' }),

        // Photo / Media Viewport
        rect({ x: 0, y: 76, w: W, h: 400, fill: '#F3F4F6', stroke: BORDER, strokeWidth: 1, name: 'Photo Frame', custom: { isPhotoPlaceholder: true } }),

        // Action Bar with authentic SVG icons
        path(SVG_HEART, { x: 20, y: 490, scale: 1.0, stroke: INK, strokeWidth: 2, fill: '#EF4444', name: 'Heart Icon' }),
        path(SVG_COMMENT, { x: 62, y: 490, scale: 1.0, stroke: INK, strokeWidth: 2, name: 'Comment Icon' }),
        path(SVG_SEND, { x: 104, y: 490, scale: 1.0, stroke: INK, strokeWidth: 2, name: 'Share Icon' }),
        path(SVG_BOOKMARK, { x: W - 42, y: 490, scale: 1.0, stroke: INK, strokeWidth: 2, name: 'Bookmark Icon' }),

        // Likes & Caption
        txt('Liked by alex_design and 2,842 others', { x: 20, y: 532, size: 14, weight: 600, color: INK, name: 'Likes Count' }),
        txt('studio.today  Tactile packaging prototype & custom botanical bottle architecture for our upcoming release. 🌿✨', { x: 20, y: 558, size: 14, color: INK, width: W - 40, ls: 1.35, name: 'Caption' }),
        txt('View all 54 comments', { x: 20, y: 625, size: 13, color: INK_MUTED, name: 'Comments Link' }),
        txt('2 HOURS AGO', { x: 20, y: 648, size: 10.5, color: INK_LIGHT, name: 'Timestamp' })
      ];
    }
  },

  /* 2. X / TWITTER POST */
  {
    id: 'x-post', name: 'X / Tweet post', icon: 'Twitter', sub: 'Social statement card',
    create() {
      const W = 520;
      return [
        rect({ x: 0, y: 0, w: W, h: 290, fill: CARD_BG, rx: 18, stroke: BORDER, strokeWidth: 1.5, name: 'Tweet Card' }),

        // Avatar
        circle({ x: 24, y: 22, d: 44, fill: '#E5E7EB', name: 'User Avatar' }),

        // Name, Badge & Handle
        txt('Aurelia Larson', { x: 80, y: 22, size: 16, weight: 700, color: INK, name: 'Display Name' }),
        ...verifiedBadge(196, 23),
        txt('@aurelia · 2h', { x: 224, y: 23, size: 14, color: INK_MUTED, name: 'Handle' }),

        // X logo on right
        path(SVG_X_LOGO, { x: W - 44, y: 22, scale: 0.85, fill: INK, name: 'X Logo' }),

        // Tweet Body
        txt('Design systems are not static component warehouses. They are living communication contracts between designers and engineers.', {
          x: 80, y: 58, size: 17, weight: 400, color: INK, width: W - 105, ls: 1.45, name: 'Tweet Body'
        }),

        // Action metrics bar
        path(SVG_COMMENT, { x: 80, y: 232, scale: 0.8, stroke: INK_MUTED, strokeWidth: 2, name: 'Reply' }),
        txt('28', { x: 104, y: 232, size: 13, color: INK_MUTED, name: 'Reply count' }),

        path(SVG_REPEAT, { x: 180, y: 232, scale: 0.8, stroke: INK_MUTED, strokeWidth: 2, name: 'Repost' }),
        txt('142', { x: 206, y: 232, size: 13, color: INK_MUTED, name: 'Repost count' }),

        path(SVG_HEART, { x: 280, y: 232, scale: 0.8, stroke: INK_MUTED, strokeWidth: 2, name: 'Like' }),
        txt('1.4K', { x: 304, y: 232, size: 13, color: INK_MUTED, name: 'Like count' }),

        path(SVG_BOOKMARK, { x: 380, y: 232, scale: 0.8, stroke: INK_MUTED, strokeWidth: 2, name: 'Bookmark' }),
        path(SVG_SEND, { x: 440, y: 232, scale: 0.8, stroke: INK_MUTED, strokeWidth: 2, name: 'Share' })
      ];
    }
  },

  /* 3. SAFARI / MACOS BROWSER FRAME */
  {
    id: 'browser-window', name: 'Browser window', icon: 'Globe', sub: 'Desktop Safari mockup',
    create() {
      const W = 620, H = 400;
      return [
        rect({ x: 0, y: 0, w: W, h: H, fill: CARD_BG, rx: 14, stroke: '#D1D5DB', strokeWidth: 1.5, name: 'Browser Window' }),

        // Window Titlebar
        rect({ x: 0, y: 0, w: W, h: 46, fill: '#F3F4F6', rx: 14, name: 'Titlebar' }),
        rect({ x: 0, y: 32, w: W, h: 14, fill: '#F3F4F6', name: 'Titlebar square bottom' }),

        // Traffic lights
        circle({ x: 18, y: 17, d: 12, fill: '#FF5F57', name: 'Close dot' }),
        circle({ x: 38, y: 17, d: 12, fill: '#FEBC2E', name: 'Minimize dot' }),
        circle({ x: 58, y: 17, d: 12, fill: '#28C840', name: 'Expand dot' }),

        // Address bar
        rect({ x: 140, y: 10, w: 340, h: 26, fill: '#FFFFFF', rx: 6, stroke: BORDER, strokeWidth: 1, name: 'URL bar' }),
        path(SVG_LOCK, { x: 152, y: 15, scale: 0.65, stroke: INK_MUTED, strokeWidth: 2, name: 'Lock' }),
        txt('https://studio.design', { x: 174, y: 14, size: 12, color: INK, font: 'Space Grotesk', name: 'URL Text' }),

        // Viewport content placeholder
        rect({ x: 1, y: 46, w: W - 2, h: H - 47, fill: '#FAFAFA', name: 'Browser Viewport', custom: { isPhotoPlaceholder: true } })
      ];
    }
  },

  /* 4. MOBILE PHONE FRAME (IPHONE 16 PRO) */
  {
    id: 'mockup-iphone-16', name: 'iPhone 16 Pro', icon: 'Smartphone', sub: 'Titanium device mockup',
    create() {
      const W = 320, H = 650;
      return [
        rect({ x: 0, y: 0, w: W, h: H, fill: '#18181B', rx: 46, stroke: '#3F3F46', strokeWidth: 3.5, name: 'iPhone Chassis' }),
        rect({ x: 6, y: 6, w: W - 12, h: H - 12, fill: '#09090B', rx: 41, name: 'Bezel Ring' }),
        rect({ x: 11, y: 11, w: W - 22, h: H - 22, fill: CARD_BG, rx: 36, name: 'Phone Screen', custom: { isPhotoPlaceholder: true } }),

        // Dynamic Island
        rect({ x: W / 2 - 47, y: 22, w: 94, h: 26, fill: '#09090B', rx: 13, name: 'Dynamic Island' }),
        circle({ x: W / 2 + 18, y: 28, d: 13, fill: '#18181B', name: 'Front Camera Lens' }),

        // Status bar time & indicators
        txt('9:41', { x: 30, y: 26, size: 12, weight: 600, color: INK, name: 'Clock' }),
        txt('100%', { x: W - 62, y: 26, size: 11, weight: 600, color: INK_MUTED, name: 'Battery' }),

        // Home Indicator
        rect({ x: W / 2 - 60, y: H - 24, w: 120, h: 4.5, fill: '#A1A1AA', rx: 2.25, name: 'Home Bar' })
      ];
    }
  },

  /* 4b. MACBOOK PRO 16" */
  {
    id: 'mockup-macbook-pro', name: 'MacBook Pro 16″', icon: 'Laptop', sub: 'Retina laptop mockup',
    create() {
      const W = 620, H = 390;
      const lidW = 540, lidH = 345;
      const lidX = (W - lidW) / 2;
      return [
        // Display Lid
        rect({ x: lidX, y: 0, w: lidW, h: lidH, fill: '#0F172A', rx: 14, stroke: '#334155', strokeWidth: 2.5, name: 'Display Lid' }),
        // Screen Viewport (Placeholder)
        rect({ x: lidX + 10, y: 10, w: lidW - 20, h: lidH - 20, fill: '#F8FAFC', rx: 6, name: 'MacBook Screen', custom: { isPhotoPlaceholder: true } }),
        // Camera Notch
        rect({ x: W / 2 - 28, y: 10, w: 56, h: 14, fill: '#0F172A', rx: 4, name: 'Camera Notch' }),
        circle({ x: W / 2 - 3, y: 13, d: 6, fill: '#1E293B', name: 'Webcam Lens' }),

        // Keyboard Base / Deck
        rect({ x: 0, y: lidH, w: W, h: 22, fill: '#E2E8F0', rx: 8, stroke: '#CBD5E1', strokeWidth: 1.5, name: 'Keyboard Base' }),
        // Trackpad Notch / Thumb indent
        rect({ x: W / 2 - 45, y: lidH, w: 90, h: 6, fill: '#94A3B8', rx: 3, name: 'Thumb Indent' }),
        // Bottom Rubber Feet
        rect({ x: 20, y: lidH + 20, w: 40, h: 3, fill: '#64748B', rx: 1.5, name: 'Foot Left' }),
        rect({ x: W - 60, y: lidH + 20, w: 40, h: 3, fill: '#64748B', rx: 1.5, name: 'Foot Right' })
      ];
    }
  },

  /* 4c. IPAD PRO 13" */
  {
    id: 'mockup-ipad-pro', name: 'iPad Pro 13″', icon: 'Tablet', sub: 'Edge-to-edge tablet frame',
    create() {
      const W = 540, H = 390;
      return [
        // Tablet Chassis
        rect({ x: 0, y: 0, w: W, h: H, fill: '#18181B', rx: 26, stroke: '#3F3F46', strokeWidth: 3, name: 'iPad Chassis' }),
        // Screen Viewport (Placeholder)
        rect({ x: 14, y: 14, w: W - 28, h: H - 28, fill: '#F8FAFC', rx: 16, name: 'iPad Screen', custom: { isPhotoPlaceholder: true } }),
        // Center Camera Sensor
        circle({ x: W / 2 - 3, y: 5, d: 6, fill: '#334155', name: 'Front Camera' })
      ];
    }
  },

  /* 5. EDITORIAL PHOTO GRID */
  {
    id: 'photogrid-editorial', name: 'Editorial photogrid', icon: 'Grid2X2', sub: '3-frame collage layout',
    create() {
      return [
        rect({ x: 0, y: 0, w: 320, h: 360, rx: 16, fill: '#F3F4F6', stroke: BORDER, strokeWidth: 1.5, name: 'Hero Photo Slot', custom: { isPhotoPlaceholder: true } }),
        rect({ x: 340, y: 0, w: 220, h: 170, rx: 14, fill: '#F3F4F6', stroke: BORDER, strokeWidth: 1.5, name: 'Detail Slot A', custom: { isPhotoPlaceholder: true } }),
        rect({ x: 340, y: 190, w: 220, h: 170, rx: 14, fill: '#F3F4F6', stroke: BORDER, strokeWidth: 1.5, name: 'Detail Slot B', custom: { isPhotoPlaceholder: true } })
      ];
    }
  },

  /* 6. BENTO METRIC STATS CARD */
  {
    id: 'bento-stats-card', name: 'Bento metric card', icon: 'TrendingUp', sub: 'Performance KPI highlight',
    create() {
      const W = 360, H = 210;
      return [
        rect({ x: 0, y: 0, w: W, h: H, fill: CARD_BG, rx: 20, stroke: BORDER, strokeWidth: 1.5, name: 'Metric Card' }),
        txt('PERFORMANCE TELEMETRY', { x: 26, y: 26, size: 12, weight: 700, color: ACCENT_VIOLET, font: 'Space Grotesk', name: 'Card Label' }),
        txt('2.4M+', { x: 26, y: 55, size: 54, weight: 700, color: INK, font: 'Space Grotesk', name: 'Primary Number' }),

        // Growth pill
        rect({ x: 26, y: 132, w: 140, h: 28, rx: 14, fill: '#ECFDF5', name: 'Pill bg' }),
        txt('▲ +38.2% lift', { x: 38, y: 137, size: 13, weight: 700, color: ACCENT_GREEN, font: 'Space Grotesk', name: 'Growth Rate' }),

        txt('Monthly active users verified in production', { x: 26, y: 172, size: 13, color: INK_MUTED, name: 'Subtext' })
      ];
    }
  },

  /* 7. PRICING & SERVICE CARD */
  {
    id: 'pricing-card', name: 'Pricing card', icon: 'CreditCard', sub: 'Service tier card',
    create() {
      const W = 360, H = 450;
      return [
        rect({ x: 0, y: 0, w: W, h: H, fill: CARD_BG, rx: 22, stroke: BORDER, strokeWidth: 1.5, name: 'Pricing Card' }),
        txt('FLAGSHIP SPRINT', { x: 28, y: 28, size: 13, weight: 700, color: ACCENT_VIOLET, font: 'Space Grotesk' }),
        txt('$3,800', { x: 28, y: 60, size: 44, weight: 700, color: INK, font: 'Space Grotesk' }),
        txt('/ full project cycle', { x: 190, y: 78, size: 14, color: INK_MUTED }),

        // 4 Checkmark items
        path(SVG_CHECK, { x: 28, y: 135, scale: 0.8, stroke: ACCENT_GREEN, strokeWidth: 2.5 }),
        txt('Full Brand & Design System', { x: 56, y: 134, size: 15, weight: 500, color: INK }),

        path(SVG_CHECK, { x: 28, y: 175, scale: 0.8, stroke: ACCENT_GREEN, strokeWidth: 2.5 }),
        txt('Desktop & Mobile High-Fi Views', { x: 56, y: 174, size: 15, weight: 500, color: INK }),

        path(SVG_CHECK, { x: 28, y: 215, scale: 0.8, stroke: ACCENT_GREEN, strokeWidth: 2.5 }),
        txt('Interactive Production Prototypes', { x: 56, y: 214, size: 15, weight: 500, color: INK }),

        path(SVG_CHECK, { x: 28, y: 255, scale: 0.8, stroke: ACCENT_GREEN, strokeWidth: 2.5 }),
        txt('4 Weeks Developer QA Support', { x: 56, y: 254, size: 15, weight: 500, color: INK }),

        // Button
        rect({ x: 28, y: 350, w: W - 56, h: 54, rx: 14, fill: ACCENT_VIOLET, name: 'Button' }),
        txt('Book This Project →', { x: 0, y: 366, size: 16, weight: 600, color: '#FFFFFF', align: 'center', width: W, name: 'Button Label' })
      ];
    }
  },

  /* 8. QUOTE TESTIMONIAL */
  {
    id: 'quote-card', name: 'Quote testimonial', icon: 'Quote', sub: 'Client review card',
    create() {
      const W = 480, H = 240;
      return [
        rect({ x: 0, y: 0, w: W, h: H, fill: '#F9FAFB', rx: 20, stroke: BORDER, strokeWidth: 1.5, name: 'Quote Card' }),
        txt('★★★★★', { x: 28, y: 24, size: 18, color: '#F59E0B', name: 'Stars' }),
        txt('“Aurelia completely transformed our user onboarding flow. Drop-off was cut by 42% within 3 weeks of release.”', {
          x: 28, y: 60, size: 18, color: INK, font: 'Playfair Display', italic: true, width: W - 56, ls: 1.4, name: 'Quote Text'
        }),
        circle({ x: 28, y: 160, d: 42, fill: '#E5E7EB', name: 'Author Avatar' }),
        txt('Sarah Jenkins', { x: 80, y: 162, size: 16, weight: 700, color: INK, name: 'Author Name' }),
        txt('VP Product · FinFlow Singapore', { x: 80, y: 184, size: 13, color: INK_MUTED, name: 'Author Role' })
      ];
    }
  },

  /* 9. PRIMARY CTA BUTTON */
  {
    id: 'btn-primary', name: 'Button primary', icon: 'MousePointerClick', sub: 'High-contrast CTA',
    create() {
      const W = 280, H = 56;
      return [
        rect({ x: 0, y: 0, w: W, h: H, fill: ACCENT_VIOLET, rx: 28, name: 'Button Background' }),
        txt('Let’s Work Together →', { x: 0, y: 18, size: 16, weight: 600, color: '#FFFFFF', align: 'center', width: W, name: 'Button Label' })
      ];
    }
  }
];

export function findElement(id) {
  return ELEMENT_DEFS.find(d => d.id === id) || null;
}

/**
 * Instantiate an element and shift the whole block so its top-left corner is at (0,0).
 * → { objs, w, h }
 */
export async function createElement(def) {
  const items = await Promise.all(def.create());
  const objs = items.filter(Boolean);
  let minL = Infinity, minT = Infinity;
  const rights = [], bottoms = [];
  for (const o of objs) {
    o.set({ left: o.left || 0, top: o.top || 0, originX: 'left', originY: 'top' });
    const w = Math.abs(o.width || 0) * Math.abs(o.scaleX || 1);
    const h = Math.abs(o.height || 0) * Math.abs(o.scaleY || 1);
    minL = Math.min(minL, o.left);
    minT = Math.min(minT, o.top);
    rights.push(o.left + w);
    bottoms.push(o.top + h);
  }
  for (const o of objs) {
    o.set({ left: o.left - minL, top: o.top - minT });
    o.setCoords();
  }
  return { objs, w: Math.max(...rights) - minL, h: Math.max(...bottoms) - minT };
}

