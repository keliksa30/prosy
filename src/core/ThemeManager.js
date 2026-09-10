export const THEME_PRESETS = [
  {
    id: 'neo-studio',
    name: 'Neo Studio',
    tokens: {
      primary: '#0D9488',
      secondary: '#4F46E5',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#111827'
    }
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Luxury',
    tokens: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#D97706',
      background: '#F0FDF4',
      text: '#064E3B'
    }
  },
  {
    id: 'midnight-indigo',
    name: 'Midnight Indigo',
    tokens: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#EC4899',
      background: '#0F172A',
      text: '#F8FAFC'
    }
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    tokens: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      accent: '#FBBF24',
      background: '#FFF1F2',
      text: '#1C1917'
    }
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    tokens: {
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      accent: '#F43F5E',
      background: '#09090B',
      text: '#FAFAFA'
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    tokens: {
      primary: '#0284C7',
      secondary: '#38BDF8',
      accent: '#F97316',
      background: '#F0F9FF',
      text: '#0C4A6E'
    }
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    tokens: {
      primary: '#18181B',
      secondary: '#52525B',
      accent: '#3B82F6',
      background: '#FFFFFF',
      text: '#09090B'
    }
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    tokens: {
      primary: '#C2410C',
      secondary: '#EA580C',
      accent: '#EAB308',
      background: '#FFFBEB',
      text: '#292524'
    }
  }
];

export class ThemeManager {
  constructor(app) {
    this.app = app;
    
    // Active design system tokens
    this.tokens = { ...THEME_PRESETS[0].tokens };
    this.activePresetId = 'neo-studio';

    // Subscriptions for UI updates (e.g., ThemePanel)
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.tokens));
  }

  getTokens() {
    return this.tokens;
  }

  getPresets() {
    return THEME_PRESETS;
  }

  setPreset(presetId, applyToPage = true) {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    this.activePresetId = presetId;
    this.tokens = { ...preset.tokens };
    this.notify();
    if (applyToPage) {
      this.applyThemeToCurrentCanvas({ smartRecolor: true });
    } else {
      this.applyThemeToProject();
    }
  }

  setToken(key, value) {
    if (this.tokens[key] !== value) {
      this.tokens[key] = value;
      this.activePresetId = null; // Custom theme
      this.notify();
      this.applyThemeToProject();
    }
  }

  // Iterate over all pages and all objects to apply the new theme token
  applyThemeToProject() {
    const cm = this.app.canvasManager;
    const canvas = cm ? cm.getCanvas() : null;
    const pm = this.app.pageManager;
    
    // Update canvas background color if background token is set
    if (cm && this.tokens.background) {
      cm.setBackgroundColor(this.tokens.background);
    }

    if (pm && pm.pages) {
      pm.pages.forEach((page, idx) => {
        if (!page.canvas_json) return;
        const state = typeof page.canvas_json === 'string' ? JSON.parse(page.canvas_json) : page.canvas_json;
        if (!state || !state.objects) return;

        let pageModified = false;
        if (state.backgroundColor && this.tokens.background) {
          state.backgroundColor = this.tokens.background;
          state.background = this.tokens.background;
          pageModified = true;
        }

        state.objects.forEach(obj => {
          if (this._applyThemeToObjectData(obj)) {
            pageModified = true;
          }
        });

        if (pageModified && idx !== pm.currentIndex) {
          page.canvas_json = state;
        }
      });
    }

    if (canvas) {
      let requiresRender = false;
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (this._applyThemeToCanvasObject(obj)) {
          requiresRender = true;
        }
      });

      if (requiresRender) {
        canvas.requestRenderAll();
        this.app.historyManager.saveState();
      }
    }
  }

  _applyThemeToObjectData(objData) {
    let modified = false;
    if (objData.themeColor) {
      if (objData.themeColor.fill && this.tokens[objData.themeColor.fill]) {
        objData.fill = this.tokens[objData.themeColor.fill];
        modified = true;
      }
      if (objData.themeColor.stroke && this.tokens[objData.themeColor.stroke]) {
        objData.stroke = this.tokens[objData.themeColor.stroke];
        modified = true;
      }
    }
    // Check nested objects (groups)
    if (objData.objects && Array.isArray(objData.objects)) {
      objData.objects.forEach(nested => {
        if (this._applyThemeToObjectData(nested)) modified = true;
      });
    }
    return modified;
  }

  _applyThemeToCanvasObject(obj) {
    let modified = false;
    if (obj.themeColor) {
      if (obj.themeColor.fill && this.tokens[obj.themeColor.fill]) {
        const themeFill = this.tokens[obj.themeColor.fill];
        if (obj.fill !== themeFill) {
          obj.set('fill', themeFill);
          modified = true;
        }
      }
      if (obj.themeColor.stroke && this.tokens[obj.themeColor.stroke]) {
        const themeStroke = this.tokens[obj.themeColor.stroke];
        if (obj.stroke !== themeStroke) {
          obj.set('stroke', themeStroke);
          modified = true;
        }
      }
    }
    // Support nested group objects
    if (obj.type === 'group' && obj.getObjects) {
      obj.getObjects().forEach(nested => {
        if (this._applyThemeToCanvasObject(nested)) modified = true;
      });
    }
    return modified;
  }

  // Binds an object's fill or stroke to a theme token
  bindObjectToTheme(obj, property, tokenName) {
    if (!obj.themeColor) obj.themeColor = {};
    obj.themeColor[property] = tokenName;
    const value = this.tokens[tokenName];
    if (value) {
      obj.set(property, value);
      this.app.canvasManager.getCanvas().requestRenderAll();
      this.app.historyManager.saveState();
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }
  
  unbindObjectFromTheme(obj, property) {
    if (obj.themeColor && obj.themeColor[property]) {
      delete obj.themeColor[property];
      if (Object.keys(obj.themeColor).length === 0) {
        delete obj.themeColor;
      }
      document.dispatchEvent(new CustomEvent('prosy:objectEdited'));
    }
  }

  // Smartly applies the current theme tokens to all elements on the active canvas
  applyThemeToCurrentCanvas({ smartRecolor = true } = {}) {
    const cm = this.app.canvasManager;
    if (!cm) return;
    const canvas = cm.getCanvas();
    if (!canvas) return;

    // 1. Update background
    cm.setBackgroundColor(this.tokens.background);

    // 2. Iterate canvas objects
    const objects = canvas.getObjects();
    let count = 0;

    const shapeColors = ['primary', 'secondary', 'accent'];
    let shapeIdx = 0;

    objects.forEach(obj => {
      // If object already has themeColor, apply it
      if (obj.themeColor) {
        this._applyThemeToCanvasObject(obj);
        count++;
        return;
      }

      if (!smartRecolor) return;

      // Smart recoloring for objects without themeColor:
      const t = obj.type;
      if (t === 'i-text' || t === 'text' || t === 'textbox') {
        // Text element
        obj.themeColor = { fill: 'text' };
        obj.set('fill', this.tokens.text);
        count++;
      } else if (['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon'].includes(t)) {
        // Shape element
        const token = shapeColors[shapeIdx % shapeColors.length];
        shapeIdx++;
        obj.themeColor = { fill: token };
        obj.set('fill', this.tokens[token]);
        count++;
      } else if (t === 'group') {
        // Group (e.g. icon or SVG)
        obj.themeColor = { fill: 'primary' };
        if (obj.getObjects) {
          obj.getObjects().forEach(child => {
            if (child.fill && child.fill !== 'none') {
              child.set('fill', this.tokens.primary);
            }
          });
        }
        count++;
      }
    });

    canvas.requestRenderAll();
    this.app.pageManager.saveCurrentPage();
    this.app.historyManager.saveState();
    if (this.app.toast) {
      this.app.toast(`Theme applied to ${count} element${count === 1 ? '' : 's'}`);
    }
  }

  // Applies the theme to all pages in the project
  applyThemeToAllPages() {
    this.applyThemeToCurrentCanvas({ smartRecolor: true });
    
    const pm = this.app.pageManager;
    if (!pm || !pm.pages) return;

    pm.pages.forEach((page, idx) => {
      if (idx === pm.currentIndex) return;
      if (!page.canvas_json) return;
      const state = typeof page.canvas_json === 'string' ? JSON.parse(page.canvas_json) : page.canvas_json;
      if (!state || !state.objects) return;

      state.backgroundColor = this.tokens.background;
      state.background = this.tokens.background;

      const shapeColors = ['primary', 'secondary', 'accent'];
      let shapeIdx = 0;

      state.objects.forEach(obj => {
        const t = obj.type;
        if (t === 'i-text' || t === 'text' || t === 'textbox') {
          obj.themeColor = { fill: 'text' };
          obj.fill = this.tokens.text;
        } else if (['rect', 'circle', 'ellipse', 'triangle', 'path', 'polygon'].includes(t)) {
          const token = shapeColors[shapeIdx % shapeColors.length];
          shapeIdx++;
          obj.themeColor = { fill: token };
          obj.fill = this.tokens[token];
        }
      });

      page.canvas_json = state;
    });

    if (this.app.toast) {
      this.app.toast(`Theme applied to all ${pm.pages.length} pages`);
    }
  }

  // Shuffles theme color roles across elements on current page
  shufflePageTheme() {
    const cm = this.app.canvasManager;
    if (!cm) return;
    const canvas = cm.getCanvas();
    if (!canvas) return;

    const objects = canvas.getObjects().filter(o => o.type !== 'guide-line');
    if (!objects.length) return;

    const roles = ['primary', 'secondary', 'accent', 'text'];
    
    objects.forEach(obj => {
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      if (obj.themeColor) {
        obj.themeColor.fill = randomRole;
      } else {
        obj.themeColor = { fill: randomRole };
      }
      obj.set('fill', this.tokens[randomRole]);
    });

    canvas.requestRenderAll();
    this.app.pageManager.saveCurrentPage();
    this.app.historyManager.saveState();
    if (this.app.toast) {
      this.app.toast('Palette roles shuffled');
    }
  }
}
