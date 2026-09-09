import * as fabric from 'fabric';
import { icons, iconSvgData, svg } from '../ui/icons.js';

import { BRAND_ICONS } from '../ui/brandIcons.js';

const ICON_PRESETS = ['#0f172a', '#ffffff', '#7b46f8', '#00c2a8', '#ff5d3d', '#ffc53d', '#38bdf8', '#f43f5e', '#10b981', '#94a3b8'];

const CATEGORIES = [
  { id: 'popular', name: 'Popular & Social', icon: 'Star' },
  { id: 'contact', name: 'Contact & Web', icon: 'Mail' },
  { id: 'all', name: 'All Icons', icon: 'Sparkles' },
  { id: 'media', name: 'Media & UI', icon: 'Play' },
  { id: 'arrows', name: 'Arrows', icon: 'ArrowRight' }
];

const POPULAR_ICONS = [
  'Instagram', 'WhatsApp', 'LinkedIn', 'Website', 'Browser',
  'X', 'GitHub', 'Dribbble', 'Behance', 'YouTube', 'TikTok',
  'Figma', 'Facebook', 'Telegram', 'Discord', 'Spotify',
  'Medium', 'Threads', 'Substack', 'Pinterest', 'Slack',
  'Notion', 'Codepen', 'GitLab', 'Mail', 'Phone',
  'MapPin', 'Calendar', 'Link', 'ExternalLink'
];

/**
 * IconsPanel — the "Icons" sidebar tab.
 * Search Lucide & Brand libraries (Instagram, WhatsApp, LinkedIn, Web, etc.),
 * pick a color, and click to drop the vector icon at the center of the canvas.
 */
export class IconsPanel {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvasManager.getCanvas();
    this.cm = app.canvasManager;
    this.host = null;
    this.color = '#0f172a';
    this.query = '';
    this.category = 'popular';
  }

  mount(host) {
    this.host = host;
    this.render();
  }

  render() {
    if (!this.host) return;
    const host = this.host;
    host.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = `<div class="panel-head-title">Icon library</div>
      <div class="panel-head-sub">2,100+ icons · Brands & Lucide</div>`;
    host.appendChild(head);

    const searchWrap = document.createElement('div');
    searchWrap.className = 'icon-search-wrap';
    const ic = document.createElement('span');
    ic.innerHTML = this._iconSvg('Search', 13);
    const search = document.createElement('input');
    search.className = 'icon-search';
    search.placeholder = 'Search icons, IG, WA, LinkedIn, web…';
    search.value = this.query;
    search.addEventListener('input', () => { this.query = search.value; this.renderGrid(); });
    searchWrap.appendChild(ic);
    searchWrap.appendChild(search);
    host.appendChild(searchWrap);

    // category pills row
    const filterBar = document.createElement('div');
    filterBar.className = 'icon-filter-bar';
    CATEGORIES.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'icon-filter-chip' + (this.category === cat.id ? ' active' : '');
      chip.innerHTML = `${svg(cat.icon, 13)}<span>${cat.name}</span>`;
      chip.addEventListener('click', () => {
        this.category = cat.id;
        filterBar.querySelectorAll('.icon-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.renderGrid();
      });
      filterBar.appendChild(chip);
    });
    host.appendChild(filterBar);

    // color row
    const colorRow = document.createElement('div');
    colorRow.className = 'icon-color-row';
    const colorLabel = document.createElement('span');
    colorLabel.className = 'valuerow-label';
    colorLabel.textContent = 'Color';
    colorRow.appendChild(colorLabel);

    const swatches = document.createElement('div');
    swatches.className = 'swatches sm';
    ICON_PRESETS.forEach(c => {
      const chip = document.createElement('button');
      chip.className = 'swatch sm' + (this.color === c ? ' active' : '');
      chip.style.background = c;
      chip.title = c;
      chip.addEventListener('click', () => {
        this.color = c;
        swatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        chip.classList.add('active');
        native.value = c;
      });
      swatches.appendChild(chip);
    });

    const native = document.createElement('input');
    native.type = 'color';
    native.className = 'icon-color-native';
    native.value = this.color;
    native.title = 'Custom color';
    native.addEventListener('input', () => {
      this.color = native.value;
      swatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    });
    swatches.appendChild(native);
    colorRow.appendChild(swatches);
    host.appendChild(colorRow);

    this.grid = document.createElement('div');
    this.grid.className = 'icon-grid';
    host.appendChild(this.grid);
    this.renderGrid();
  }

  _iconSvg(name, size) {
    const key = Object.keys(icons).find(k => k.toLowerCase() === name.toLowerCase());
    if (!key) return '';
    return iconSvgData(icons[key], { size });
  }

  renderGrid() {
    if (!this.grid) return;
    const q = this.query.trim().toLowerCase();
    const cat = this.category;

    let pool = [];
    if (q) {
      // When searching, search the entire icon universe
      pool = Object.keys(icons);
    } else if (cat === 'popular') {
      pool = POPULAR_ICONS;
    } else if (cat === 'contact') {
      pool = [
        'WhatsApp', 'Instagram', 'Mail', 'Phone', 'LinkedIn', 'Website', 'Browser',
        'Telegram', 'Discord', 'MapPin', 'Calendar', 'Link', 'ExternalLink',
        ...Object.keys(icons).filter(n => /mail|phone|call|message|chat|send|inbox|contact|calendar|pin|map|globe|web|link/i.test(n.toLowerCase()))
      ];
      pool = [...new Set(pool)];
    } else if (cat === 'media') {
      pool = Object.keys(icons).filter(n => /image|photo|camera|video|film|music|audio|play|pause|disc|speaker|volume|heart|star/i.test(n.toLowerCase()));
    } else if (cat === 'arrows') {
      pool = Object.keys(icons).filter(n => /arrow|chevron|corner|move|navigation|external/i.test(n.toLowerCase()));
    } else {
      // 'all'
      pool = [
        ...Object.keys(BRAND_ICONS),
        ...Object.keys(icons).filter(n => !BRAND_ICONS[n])
      ];
    }

    // Smart search with tag / alias matching
    let scored = [];
    pool.forEach(name => {
      const lower = name.toLowerCase();
      const meta = BRAND_ICONS[name];
      let score = 999;

      if (!q) {
        score = 1;
      } else {
        // Exact name match
        if (lower === q) {
          score = 1;
        }
        // Exact alias / tag match (e.g. user typed 'ig' or 'wa')
        else if (meta && meta.tags && meta.tags.some(t => t === q)) {
          score = 2;
        }
        // Prefix tag match (e.g. user typed 'what' or 'insta' or 'linke')
        else if (meta && meta.tags && meta.tags.some(t => t.startsWith(q) || q.startsWith(t))) {
          score = 3;
        }
        // Name starts with query
        else if (lower.startsWith(q)) {
          score = 4;
        }
        // Name includes query
        else if (lower.includes(q)) {
          score = 5;
        }
        else {
          return; // Not matched
        }
      }

      scored.push({ name, score });
    });

    if (q) {
      scored.sort((a, b) => a.score - b.score);
    }
    let names = scored.map(s => s.name);
    if (names.length > 120) names = names.slice(0, 120);

    this.grid.innerHTML = '';

    if (!names.length) {
      this.grid.innerHTML = '<div class="icons-empty">No icons match your search.</div>';
      return;
    }

    names.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'icon-cell';
      const meta = BRAND_ICONS[name];
      btn.title = meta ? `${meta.title} (${meta.tags.slice(0, 3).join(', ')})` : name;
      btn.innerHTML = iconSvgData(icons[name], { color: 'currentColor', size: 20 });
      btn.addEventListener('click', () => this.insertIcon(name));
      this.grid.appendChild(btn);
    });
  }

  async insertIcon(name) {
    const def = icons[name];
    if (!def) return;
    try {
      const svgStr = iconSvgData(def, { color: this.color, size: 96, strokeWidth: 1.6 });
      const { objects, options } = await fabric.loadSVGFromString(svgStr);
      if (!objects || !objects.length) return;
      const obj = fabric.util.groupSVGElements(objects, options);
      // normalize visual size to ~96px so icons look consistent
      const b = obj.getBoundingRect();
      const want = 96;
      const s = Math.min(want / b.width, want / b.height);
      obj.scale(s);
      obj.set({
        left: this.cm.PAGE_W / 2 - (want / 2),
        top: this.cm.PAGE_H / 2 - (want / 2),
        originX: 'left',
        originY: 'top',
        scaleX: s,
        scaleY: s,
        selectable: true,
        evented: true,
        name: 'Icon',
        _isIcon: true
      });
      this.canvas.add(obj);
      this.canvas.setActiveObject(obj);
      this.canvas.requestRenderAll();
      if (this.app._closeIconsMenu) this.app._closeIconsMenu();
      // jump to the Design tab so styling is one click away
      if (this.app.dock) this.app.dock.show('design');
    } catch (e) {
      console.error('Failed to add icon', e);
    }
  }
}
