import { svg } from '../ui/icons.js';
import { colorControl } from '../ui/controls.js';

/**
 * ThemePanel — Premium Global Design System & Palette Manager.
 */
export class ThemePanel {
  constructor(app) {
    this.app = app;
    this.host = null;
    if (this.app.themeManager) {
      this.app.themeManager.subscribe(() => this.render());
    }
  }

  mount(host) {
    this.host = host;
    this.render();
  }

  render() {
    if (!this.host || !this.app.themeManager) return;
    const host = this.host;
    host.innerHTML = '';

    const tm = this.app.themeManager;
    const tokens = tm.getTokens();
    const presets = tm.getPresets();

    // 1. Header
    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = `
      <div>
        <div class="panel-head-title">Theme & Styles</div>
        <div class="panel-head-sub">Global design system palette</div>
      </div>
    `;
    host.appendChild(head);

    const scroll = document.createElement('div');
    scroll.className = 'panel-scroll';
    scroll.style.padding = '12px 14px';
    scroll.style.display = 'flex';
    scroll.style.flexDirection = 'column';
    scroll.style.gap = '16px';
    host.appendChild(scroll);

    // 2. Action Buttons
    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.gap = '8px';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'panel-action-btn';
    applyBtn.style.flex = '2';
    applyBtn.style.justifyContent = 'center';
    applyBtn.style.fontWeight = '600';
    applyBtn.style.background = 'var(--accent)';
    applyBtn.style.color = '#fff';
    applyBtn.innerHTML = `${svg('Sparkles', 14)} <span>Apply to Page</span>`;
    applyBtn.title = 'Intelligently restyle all elements on this page with the active palette';
    applyBtn.addEventListener('click', () => {
      tm.applyThemeToCurrentCanvas({ smartRecolor: true });
    });

    const shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'panel-action-btn';
    shuffleBtn.style.flex = '1';
    shuffleBtn.style.justifyContent = 'center';
    shuffleBtn.innerHTML = `${svg('RefreshCw', 13)} <span>Shuffle</span>`;
    shuffleBtn.title = 'Shuffle color assignments across page elements';
    shuffleBtn.addEventListener('click', () => {
      tm.shufflePageTheme();
    });

    actionRow.appendChild(applyBtn);
    actionRow.appendChild(shuffleBtn);
    scroll.appendChild(actionRow);

    // 3. Preset Palettes Section
    const presetSection = document.createElement('div');
    presetSection.style.display = 'flex';
    presetSection.style.flexDirection = 'column';
    presetSection.style.gap = '8px';

    const presetTitle = document.createElement('div');
    presetTitle.style.fontSize = '11px';
    presetTitle.style.fontWeight = '700';
    presetTitle.style.textTransform = 'uppercase';
    presetTitle.style.letterSpacing = '0.5px';
    presetTitle.style.color = 'var(--text-muted)';
    presetTitle.textContent = 'Curated Palettes';
    presetSection.appendChild(presetTitle);

    const presetGrid = document.createElement('div');
    presetGrid.style.display = 'grid';
    presetGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    presetGrid.style.gap = '8px';

    presets.forEach(p => {
      const card = document.createElement('button');
      card.type = 'button';
      const isActive = tm.activePresetId === p.id;
      card.style.background = isActive ? 'var(--bg-active)' : 'var(--bg-raised)';
      card.style.border = isActive ? '1.5px solid var(--accent)' : '1px solid var(--border-color)';
      card.style.borderRadius = '8px';
      card.style.padding = '8px';
      card.style.cursor = 'pointer';
      card.style.textAlign = 'left';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '6px';
      card.style.transition = 'all 0.15s ease';

      // Swatches preview bar
      const bar = document.createElement('div');
      bar.style.display = 'flex';
      bar.style.height = '14px';
      bar.style.borderRadius = '4px';
      bar.style.overflow = 'hidden';
      bar.style.border = '1px solid rgba(0,0,0,0.1)';

      ['primary', 'secondary', 'accent', 'background', 'text'].forEach(tk => {
        const seg = document.createElement('div');
        seg.style.flex = '1';
        seg.style.background = p.tokens[tk];
        bar.appendChild(seg);
      });

      const label = document.createElement('div');
      label.style.fontSize = '11px';
      label.style.fontWeight = isActive ? '600' : '500';
      label.style.color = isActive ? 'var(--text-accent)' : 'var(--text-primary)';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.style.whiteSpace = 'nowrap';
      label.textContent = p.name;

      card.appendChild(bar);
      card.appendChild(label);

      card.addEventListener('click', () => {
        tm.setPreset(p.id, true);
      });

      presetGrid.appendChild(card);
    });

    presetSection.appendChild(presetGrid);
    scroll.appendChild(presetSection);

    // 4. Color Tokens Section
    const tokensSection = document.createElement('div');
    tokensSection.style.display = 'flex';
    tokensSection.style.flexDirection = 'column';
    tokensSection.style.gap = '8px';

    const tokenHeader = document.createElement('div');
    tokenHeader.style.display = 'flex';
    tokenHeader.style.justifyContent = 'space-between';
    tokenHeader.style.alignItems = 'center';

    const tokensTitle = document.createElement('div');
    tokensTitle.style.fontSize = '11px';
    tokensTitle.style.fontWeight = '700';
    tokensTitle.style.textTransform = 'uppercase';
    tokensTitle.style.letterSpacing = '0.5px';
    tokensTitle.style.color = 'var(--text-muted)';
    tokensTitle.textContent = 'Design Tokens';
    tokenHeader.appendChild(tokensTitle);

    const applyAllLink = document.createElement('button');
    applyAllLink.type = 'button';
    applyAllLink.style.background = 'none';
    applyAllLink.style.border = 'none';
    applyAllLink.style.fontSize = '11px';
    applyAllLink.style.color = 'var(--text-accent)';
    applyAllLink.style.cursor = 'pointer';
    applyAllLink.style.padding = '0';
    applyAllLink.textContent = 'Apply to all pages';
    applyAllLink.addEventListener('click', () => {
      tm.applyThemeToAllPages();
    });
    tokenHeader.appendChild(applyAllLink);
    tokensSection.appendChild(tokenHeader);

    const tokenRoles = {
      primary: 'Main brand, CTAs & key shapes',
      secondary: 'Supporting shapes & icons',
      accent: 'Badges, highlights & details',
      background: 'Canvas page background',
      text: 'Titles & body typography'
    };

    const tokenList = document.createElement('div');
    tokenList.style.display = 'flex';
    tokenList.style.flexDirection = 'column';
    tokenList.style.gap = '6px';

    Object.keys(tokens).forEach(key => {
      const val = tokens[key];
      const row = document.createElement('div');
      row.className = 'prop-card';
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.justifyContent = 'space-between';
      row.style.padding = '8px 10px';
      row.style.gap = '10px';

      const info = document.createElement('div');
      info.style.flex = '1';
      info.style.minWidth = '0';

      const label = document.createElement('div');
      label.style.fontSize = '12px';
      label.style.fontWeight = '600';
      label.style.color = 'var(--text-primary)';
      label.textContent = key.charAt(0).toUpperCase() + key.slice(1);

      const desc = document.createElement('div');
      desc.style.fontSize = '10px';
      desc.style.color = 'var(--text-muted)';
      desc.style.overflow = 'hidden';
      desc.style.textOverflow = 'ellipsis';
      desc.style.whiteSpace = 'nowrap';
      desc.textContent = tokenRoles[key] || '';

      info.appendChild(label);
      info.appendChild(desc);

      const cc = colorControl({
        value: val,
        onInput: (c) => tm.setToken(key, c),
        onChange: (c) => tm.setToken(key, c)
      });
      cc.style.flexShrink = '0';

      row.appendChild(info);
      row.appendChild(cc);
      tokenList.appendChild(row);
    });

    tokensSection.appendChild(tokenList);
    scroll.appendChild(tokensSection);

    // 5. Help / Explanatory Note
    const tip = document.createElement('div');
    tip.className = 'panel-tip';
    tip.style.margin = '0';
    tip.innerHTML = `<strong>Theme Binding</strong>
      <div>Editing a token color updates all linked shapes, texts, and background instantly across the project. Click <strong>Apply to Page</strong> to restyle the current layout.</div>`;
    scroll.appendChild(tip);
  }
}
