/**
 * Emoji-free icon rendering for the whole UI.
 * Lucide ships its icon artwork as node-array data — we render those to
 * inline <svg> strings so the UI uses the exact same iconography as the
 * canvas icon library (consistent, crisp, recolorable via currentColor).
 */
import { icons as lucideIcons } from 'lucide';
import { BRAND_ICONS } from './brandIcons.js';

// Convert BRAND_ICONS to standard icon definition map
const brandIconDefs = {};
for (const [name, meta] of Object.entries(BRAND_ICONS)) {
  brandIconDefs[name] = meta.elements;
}

const icons = {
  ...brandIconDefs,
  ...lucideIcons
};

const CACHE = new Map();
const findKey = (() => {
  const lower = new Map();
  let built = false;
  return (name) => {
    if (!built) {
      for (const k of Object.keys(icons)) lower.set(k.toLowerCase(), k);
      built = true;
    }
    return lower.get(name.toLowerCase()) || null;
  };
})();

/** data → <svg> string. color falls back to currentColor (CSS) */
export function iconSvgData(iconDef, { color = 'currentColor', size = 20, strokeWidth = 2 } = {}) {
  if (!Array.isArray(iconDef)) return '';
  const inner = iconDef.map(([tag, attrs]) => {
    const attrStr = Object.entries(attrs).map(([k, v]) => {
      const val = v === 'currentColor' ? color : v;
      return `${k}="${val}"`;
    }).join(' ');
    return `<${tag} ${attrStr}></${tag}>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

/** convenience: named lucide icon → svg string (e.g. icon('MousePointer2')) */
export function svg(name, size = 18, strokeWidth = 2) {
  const cacheKey = `${name}|${size}|${strokeWidth}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);
  const key = findKey(name);
  if (!key) return `<svg width="${size}" height="${size}"></svg>`;
  const out = iconSvgData(icons[key], { size, strokeWidth });
  CACHE.set(cacheKey, out);
  return out;
}

/** svg with a chosen stroke color baked in (for canvas insertion) */
export function svgColored(name, color, size = 24, strokeWidth = 2) {
  const key = findKey(name);
  if (!key) return '';
  return iconSvgData(icons[key], { color, size, strokeWidth });
}

/** Does the icon library have this name? */
export function hasIcon(name) {
  return findKey(name) != null;
}

export { icons };
