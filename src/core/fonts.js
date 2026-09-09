/**
 * Google Fonts integration.
 *
 * - A curated catalog of ~46 fonts (categories: Sans / Serif / Display /
 *   Mono / Handwritten) used by the font picker in the properties panel.
 * - `loadFont(family)` lazily injects the css2 stylesheet for that family
 *   and resolves once the faces are actually available, so canvas text
 *   re-renders in the correct typeface.
 *
 * The catalog is deliberately smaller than the full Google Fonts API to
 * keep the picker fast; every family renders a live preview in its own
 * typeface once loaded.
 */

export const FONT_CATEGORIES = ['Sans Serif', 'Serif', 'Display', 'Mono', 'Handwritten'];

const FAMILIES = {
  'Sans Serif': [
    'Inter', 'Outfit', 'Space Grotesk', 'Plus Jakarta Sans', 'Manrope', 'Sora',
    'Poppins', 'Montserrat', 'DM Sans', 'Figtree', 'Work Sans', 'Archivo',
    'Lexend', 'Barlow', 'Karla', 'Rubik', 'Nunito', 'Mulish', 'Public Sans',
    'Hanken Grotesk'
  ],
  Serif: [
    'Playfair Display', 'Lora', 'Merriweather', 'Source Serif 4', 'PT Serif',
    'DM Serif Display', 'Fraunces', 'Libre Baskerville', 'Crimson Pro',
    'Spectral', 'EB Garamond', 'Zilla Slab'
  ],
  Display: [
    'Syne', 'Unbounded', 'Anton', 'Bebas Neue', 'Archivo Black', 'Alfa Slab One'
  ],
  Mono: [
    'JetBrains Mono', 'IBM Plex Mono', 'Space Mono', 'Fira Code', 'Roboto Mono', 'DM Mono'
  ],
  Handwritten: [
    'Caveat', 'Dancing Script', 'Pacifico', 'Shadows Into Light', 'Homemade Apple'
  ]
};

export const GOOGLE_FONTS = (() => {
  const all = [];
  for (const cat of FONT_CATEGORIES) {
    for (const family of FAMILIES[cat]) {
      all.push({ family, category: cat, loaded: false });
    }
  }
  return all;
})();

export function fontCategory(family) {
  const f = GOOGLE_FONTS.find(x => x.family === family);
  return f ? f.category : 'Sans Serif';
}

const AXIS_TUPLES = '0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700';
const loading = new Map();   // family -> Promise
const loadedFamilies = new Set();

function urlFor(family) {
  const q = family.replace(/ /g, '+');
  // Full weights + italics using standard Google Fonts CSS2 tuple format
  return `https://fonts.googleapis.com/css2?family=${q}:ital,wght@${AXIS_TUPLES}&display=swap`;
}

/** Preload catalog font definitions so font picker previews render immediately */
export function preloadFontCatalog() {
  if (typeof document === 'undefined') return;
  const b1 = GOOGLE_FONTS.slice(0, 25).map(f => 'family=' + f.family.replace(/ /g, '+') + ':wght@400;600;700').join('&');
  const b2 = GOOGLE_FONTS.slice(25).map(f => 'family=' + f.family.replace(/ /g, '+') + ':wght@400;600;700').join('&');

  [b1, b2].forEach((batch, idx) => {
    const id = `google-fonts-catalog-${idx}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${batch}&display=swap`;
    document.head.appendChild(link);
  });
}

// Kick off catalog font definition preloading in browser environment
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => preloadFontCatalog(), { timeout: 1200 });
  } else {
    setTimeout(preloadFontCatalog, 300);
  }
}

/** Ensure a font family is loaded; resolves immediately if already loaded. */
export function loadFont(family) {
  if (!family) return Promise.resolve(false);
  if (loadedFamilies.has(family)) return Promise.resolve(true);
  if (loading.has(family)) return loading.get(family);

  const p = new Promise((resolve) => {
    try {
      const q = family.replace(/ /g, '+');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = urlFor(family);

      const onDone = async () => {
        try {
          if (document.fonts && document.fonts.load) {
            await document.fonts.load(`16px "${family}"`).catch(() => []);
            if (document.fonts.ready) await document.fonts.ready.catch(() => {});
          }
        } catch (_) {}
        loadedFamilies.add(family);
        resolve(true);
      };

      link.onload = onDone;
      link.onerror = () => {
        // Fallback to simple Google Fonts query if multi-axis fails
        const fallback = document.createElement('link');
        fallback.rel = 'stylesheet';
        fallback.href = `https://fonts.googleapis.com/css2?family=${q}&display=swap`;
        fallback.onload = onDone;
        fallback.onerror = () => {
          loading.delete(family);
          resolve(false);
        };
        document.head.appendChild(fallback);
      };

      document.head.appendChild(link);
    } catch (e) {
      loading.delete(family);
      resolve(false);
    }
  });
  loading.set(family, p);
  return p;
}

/** load several families at once (used when opening template packs) */
export async function loadFonts(families) {
  const uniq = [...new Set((families || []).filter(Boolean))];
  await Promise.allSettled(uniq.map(f => loadFont(f)));
}

/** pull font families referenced inside a fabric page JSON */
export function fontFamiliesInJson(json) {
  const out = new Set();
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (typeof obj.fontFamily === 'string') out.add(obj.fontFamily);
    if (Array.isArray(obj.objects)) obj.objects.forEach(walk);
    if (Array.isArray(obj)) obj.forEach(walk);
    if (obj._objects && Array.isArray(obj._objects)) obj._objects.forEach(walk);
  };
  walk(json);
  return [...out];
}

// The default families used by the app chrome (already in index.html).
export const APP_FONTS = ['Inter', 'Space Grotesk', 'Outfit', 'Playfair Display'];
