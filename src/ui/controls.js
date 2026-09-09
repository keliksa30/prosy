/**
 * Reusable DOM controls for the properties / sidebar UI.
 *
 * The headline control is `scrub()` — a Canva-style drag-to-change
 * number field ("geser, bukan klik panah"):
 *   • drag horizontally → change value live
 *   • Shift = ×10, Cmd/Ctrl or Alt = fine ×0.1
 *   • scroll wheel over the field → ±step
 *   • double-click → type a precise value
 *
 * All controls return plain DOM elements; no template strings needed.
 */
import { svg } from './icons.js';

export function h(tag, cls, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined && html !== null) el.innerHTML = html;
  return el;
}

/* ------------------------------------------------------------------ */
/* Scrub (drag) number field                                           */
/* ------------------------------------------------------------------ */
export function scrub(opts = {}) {
  const {
    value = 0, min = -Infinity, max = Infinity,
    step = 1, precision = 0, suffix = '', ariaLabel = ''
  } = opts;
  const display = (v) => (precision ? v.toFixed(precision) : String(Math.round(v)));

  const root = h('div', 'scrub', '');
  root.setAttribute('tabindex', '0');
  root.setAttribute('role', 'spinbutton');
  if (ariaLabel) root.setAttribute('aria-label', ariaLabel);

  const valEl = h('span', 'scrub-val', display(value));
  if (suffix) root.appendChild(h('span', 'scrub-suffix', suffix));
  root.prepend(valEl);

  let current = value;
  let dragState = null;

  const commit = (final) => {
    const v = Math.min(max, Math.max(min, final));
    if (opts.onChange) opts.onChange(v);
  };
  const live = (v) => {
    const clamped = Math.min(max, Math.max(min, v));
    current = clamped;
    valEl.textContent = display(clamped);
    if (opts.onInput) opts.onInput(clamped);
  };
  const fromDragDelta = (dx) => {
    const mult = (dragState.shift ? 10 : 1) * (dragState.alt ? 0.1 : 1);
    return dragState.start + dx * step * mult;
  };

  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('input')) return;
    e.preventDefault();
    root.setPointerCapture(e.pointerId);
    dragState = { start: current, x: e.clientX, shift: e.shiftKey, alt: e.altKey || e.ctrlKey || e.metaKey, moved: false };
    root.classList.add('dragging');
    const onMove = (ev) => {
      if (!dragState) return;
      const dx = ev.clientX - dragState.x;
      if (Math.abs(dx) > 1) dragState.moved = true;
      live(fromDragDelta(dx));
    };
    const onUp = (ev) => {
      root.releasePointerCapture?.(ev.pointerId);
      root.classList.remove('dragging');
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
      if (dragState) {
        const wasDrag = dragState.moved;
        dragState = null;
        commit(wasDrag ? current : current); // value already live
      }
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
  });

  root.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    root.classList.add('editing');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'scrub-input';
    input.value = display(current);
    root.innerHTML = '';
    root.appendChild(input);
    input.focus();
    input.select();
    let done = false;
    const close = (ok) => {
      if (done) return;
      done = true;
      root.classList.remove('editing');
      if (ok) {
        const v = parseFloat(input.value.replace(',', '.'));
        if (!Number.isNaN(v)) {
          live(v);
          commit(v);
        }
      }
      root.innerHTML = '';
      root.appendChild(valEl);
      if (suffix) root.appendChild(h('span', 'scrub-suffix', suffix));
    };
    input.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') close(true);
      else if (ev.key === 'Escape') close(false);
    });
    input.addEventListener('blur', () => close(true));
  });

  root.addEventListener('wheel', (e) => {
    if (root.classList.contains('editing')) return;
    e.preventDefault();
    e.stopPropagation();
    const mult = (e.shiftKey ? 10 : 1) * (e.ctrlKey || e.metaKey || e.altKey ? 0.1 : 1);
    live(current + (e.deltaY < 0 ? 1 : -1) * step * mult);
    commit(current);
  }, { passive: false });

  root.setValue = (v) => { current = v; valEl.textContent = display(v); };
  root.getValue = () => current;
  return root;
}

/* ------------------------------------------------------------------ */
/* Labeled value row (label left, value right) used with scrub/slider  */
/* ------------------------------------------------------------------ */
export function valueRow(label, control, extra) {
  const row = h('div', 'valuerow');
  const lbl = h('span', 'valuerow-label', label);
  row.appendChild(lbl);
  row.appendChild(control);
  if (extra) row.appendChild(extra);
  return row;
}

/* ------------------------------------------------------------------ */
/* Range slider with live label                                        */
/* ------------------------------------------------------------------ */
export function slider(opts = {}) {
  const { value = 0, min = 0, max = 100, step = 1, onChange, onInput, format } = opts;
  const root = h('div', 'slider-wrap');
  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'range';
  input.min = min; input.max = max; input.step = step; input.value = value;

  const fmt = (v) => (format ? format(v) : v);
  const valEl = h('span', 'slider-val', fmt(value));

  const bar = h('div', 'slider-bar');
  bar.appendChild(valEl);
  bar.appendChild(input);

  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    valEl.textContent = fmt(v);
    if (onInput) onInput(v);
  });
  input.addEventListener('change', () => {
    const v = parseFloat(input.value);
    if (onChange) onChange(v);
  });
  root.appendChild(bar);
  root.setValue = (v) => { input.value = v; valEl.textContent = fmt(v); };
  return root;
}

/* ------------------------------------------------------------------ */
/* Color control: swatch + hex input + draggable popover picker        */
/* (SV square + hue strip are pointer-draggable; works for page bg,    */
/*  fill, gradient stops, shadow, icon & text colors alike)            */
/* ------------------------------------------------------------------ */
const CP_PRESETS = ['#ffffff', '#0f172a', '#18181b', '#7b46f8', '#fa51a2', '#00c2a8', '#38bdf8', '#10b981', '#ffc53d', '#ff5d3d', '#f43f5e', '#94a3b8'];

function hexToRgb(hex) {
  let v = String(hex || '').replace('#', '').trim();
  if (/^[0-9a-fA-F]{3}$/.test(v)) v = v.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  const c = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

let openPopover = null;

function closeColorPopover() {
  if (openPopover) {
    openPopover.remove();
    openPopover = null;
  }
}

export function colorControl(opts = {}) {
  const { value = '#ffffff', onInput, onChange, label = '' } = opts;
  const root = h('div', 'colorrow');
  const swatchWrap = h('div', 'color-swatch-wrap');
  const swatch = h('button', 'color-swatch');
  swatch.type = 'button';
  swatch.title = 'Pick color';
  const hex = document.createElement('input');
  hex.type = 'text';
  hex.className = 'hex-input';
  hex.value = value;
  hex.spellcheck = false;

  const setSwatch = (v) => { swatch.style.background = v; swatch.dataset.color = v; };
  const setHex = (v) => { hex.value = v; };
  const fire = (v, isChange) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) return;
    const color = v.toLowerCase();
    setHex(color);
    setSwatch(color);
    if (isChange) { if (onChange) onChange(color); }
    else { if (onInput) onInput(color); }
  };

  setSwatch(/^#/.test(value) ? value : '#000000');

  const syncFromHex = (v, commit) => {
    const rgb = hexToRgb(v);
    if (rgb) fire(rgbToHex(rgb.r, rgb.g, rgb.b), commit);
  };

  const openPicker = () => {
    closeColorPopover();
    const wrapRect = swatchWrap.getBoundingClientRect();
    const rgb = hexToRgb(hex.value) || { r: 0, g: 0, b: 0 };
    const start = rgbToHsv(rgb.r, rgb.g, rgb.b);

    const pop = h('div', 'color-pop');
    pop.style.left = Math.max(8, Math.min(window.innerWidth - 208, wrapRect.left)) + 'px';
    pop.style.top = (wrapRect.bottom + 6 > window.innerHeight - 240 ? Math.max(8, wrapRect.top - 248) : wrapRect.bottom + 6) + 'px';

    const svSize = 168;
    const sv = h('div', 'cp-sv');
    sv.style.width = svSize + 'px';
    sv.style.height = svSize + 'px';
    const svMark = h('div', 'cp-mark');
    const hue = h('div', 'cp-hue');
    const hueMark = h('div', 'cp-mark cp-hue-mark');
    sv.appendChild(svMark);
    hue.appendChild(hueMark);

    const applyUI = () => {
      const col = hsvToRgb(start.h, 1, 1);
      sv.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${rgbToHex(col.r, col.g, col.b)})`;
      svMark.style.left = (start.s * svSize) + 'px';
      svMark.style.top = ((1 - start.v) * svSize) + 'px';
      svMark.style.background = hex.value;
      hueMark.style.left = ((start.h / 360) * svSize) + 'px';
    };
    const commitColor = (final) => fire(hex.value, final);

    const drag = (el, onMove) => {
      let dragging = false;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        dragging = true;
        el.setPointerCapture(e.pointerId);
        onMove(e);
      });
      el.addEventListener('pointermove', (e) => { if (dragging) onMove(e); });
      const up = () => { if (dragging) { dragging = false; commitColor(true); } };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    };

    drag(sv, (e) => {
      const r = sv.getBoundingClientRect();
      start.s = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      start.v = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
      const col = hsvToRgb(start.h, start.s, start.v);
      const hexV = rgbToHex(col.r, col.g, col.b);
      fire(hexV, false);
      applyUI();
    });

    drag(hue, (e) => {
      const r = hue.getBoundingClientRect();
      start.h = Math.max(0, Math.min(360, ((e.clientX - r.left) / r.width) * 360));
      const col = hsvToRgb(start.h, start.s, start.v);
      fire(rgbToHex(col.r, col.g, col.b), false);
      applyUI();
    });

    // hex row
    const hexRow = h('div', 'cp-hexrow');
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'hex-input';
    hexInput.value = hex.value;
    hexInput.spellcheck = false;
    hexInput.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) { fire(hexInput.value, false); applyUI(); }
    });
    hexInput.addEventListener('change', () => { syncFromHex(hexInput.value, true); applyUI(); closeColorPopover(); });
    hexInput.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') { syncFromHex(hexInput.value, true); applyUI(); closeColorPopover(); } if (ev.key === 'Escape') { closeColorPopover(); } });
    const hint = h('span', 'cp-hexlabel', 'Hex');
    hexRow.appendChild(hint);
    hexRow.appendChild(hexInput);

    // presets
    const presets = h('div', 'swatches sm cp-presets');
    CP_PRESETS.forEach(c => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'swatch sm' + (c === hex.value ? ' active' : '');
      chip.style.background = c;
      chip.title = c;
      chip.addEventListener('click', () => { fire(c, false); applyUI(); setSwatch(c); closeColorPopover(); if (onChange) onChange(c); });
      presets.appendChild(chip);
    });

    pop.appendChild(sv);
    pop.appendChild(hue);
    pop.appendChild(hexRow);
    pop.appendChild(presets);
    document.body.appendChild(pop);
    openPopover = pop;
    applyUI();
    const closer = (e) => {
      if (!root.isConnected) { closeColorPopover(); document.removeEventListener('mousedown', closer, true); return; }
      if (pop.contains(e.target) || root.contains(e.target)) return;
      closeColorPopover();
      document.removeEventListener('mousedown', closer, true);
    };
    document.addEventListener('mousedown', closer, true);
  };

  const togglePicker = (e) => {
    e.preventDefault();
    if (openPopover && openPopover.parentNode) { closeColorPopover(); return; }
    openPicker();
  };
  swatch.addEventListener('click', togglePicker);

  hex.addEventListener('change', () => syncFromHex(hex.value.trim(), true));
  hex.addEventListener('input', () => {
    const v = hex.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) fire(v, false);
  });

  swatchWrap.appendChild(swatch);
  swatchWrap.appendChild(hex);
  if (label) {
    const lbl = h('span', 'color-label', label);
    root.appendChild(lbl);
    root.appendChild(swatchWrap);
  } else {
    root.appendChild(swatchWrap);
  }

  root.setValue = (v) => { setHex(v); setSwatch(/^#/.test(v) ? v : '#000000'); };
  return root;
}

/* ------------------------------------------------------------------ */
/* Small square icon button                                            */
/* ------------------------------------------------------------------ */
export function iconBtn(iconName, { title = '', active = false, onClick, size = 16, className = '' } = {}) {
  const btn = h('button', `icobtn${active ? ' active' : ''}${className ? ' ' + className : ''}`, svg(iconName, size));
  if (title) btn.title = title;
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (onClick) onClick(btn, e); });
  return btn;
}

/* ------------------------------------------------------------------ */
/* Segmented control (icon options in one pill)                        */
/* ------------------------------------------------------------------ */
export function segmented(options, { value = null, onChange, title = false } = {}) {
  const root = h('div', 'segmented');
  options.forEach(opt => {
    const btn = h('button',
      `seg-btn${opt.value === value ? ' active' : ''}`,
      opt.icon ? svg(opt.icon, 15) : (opt.label || '')
    );
    if (title && opt.title) btn.title = opt.title;
    if (opt.label && !opt.icon) btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      root.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(opt.value);
    });
    root.appendChild(btn);
  });
  root.setValue = (v) => {
    root.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.v === String(v)));
  };
  return root;
}

/* ------------------------------------------------------------------ */
/* Labeled select                                                      */
/* ------------------------------------------------------------------ */
export function select(opts = {}) {
  const { value = '', onChange, options = [] } = opts;
  const sel = h('select', 'ctrl-select', '');
  options.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    sel.appendChild(opt);
  });
  sel.value = value;
  sel.addEventListener('change', () => { if (onChange) onChange(sel.value); });
  return sel;
}

/* ------------------------------------------------------------------ */
/* Section container (card) used inside panels                         */
/* ------------------------------------------------------------------ */
export function section(title, bodyEl, { actions = null } = {}) {
  const card = h('div', 'prop-card');
  const head = h('div', 'prop-card-head');
  const t = h('span', 'prop-card-title', title);
  head.appendChild(t);
  if (actions) head.appendChild(actions);
  card.appendChild(head);
  card.appendChild(bodyEl);
  return card;
}
