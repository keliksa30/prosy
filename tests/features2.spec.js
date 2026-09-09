import { test, expect } from '@playwright/test';

async function openBlank(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await welcome.waitFor({ state: 'hidden' });
  await page.waitForTimeout(400);
}

async function rightClickScene(page, sceneX, sceneY) {
  const pt = await page.evaluate(([x, y]) => {
    const cm = window.__editorApp.canvasManager;
    const vp = cm.getViewport().getBoundingClientRect();
    const s = cm.sceneToScreen(x, y);
    return { x: vp.left + s.x, y: vp.top + s.y };
  }, [sceneX, sceneY]);
  await page.mouse.click(pt.x, pt.y, { button: 'right' });
}

async function sceneDrag(page, from, to) {
  const pts = await page.evaluate(({ from, to }) => {
    const cm = window.__editorApp.canvasManager;
    const vp = cm.getViewport().getBoundingClientRect();
    const s = cm.sceneToScreen(from[0], from[1]);
    const t = cm.sceneToScreen(to[0], to[1]);
    return { fx: vp.left + s.x, fy: vp.top + s.y, tx: vp.left + t.x, ty: vp.top + t.y };
  }, { from, to });
  await page.mouse.move(pts.fx, pts.fy);
  await page.mouse.down();
  await page.mouse.move(pts.tx, pts.ty, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

async function addMaskedImage(page) {
  await page.evaluate(async () => {
    const app = window.__editorApp;
    const f = window.fabric;
    const cv = document.createElement('canvas');
    cv.width = cv.height = 300;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ff2d20';
    ctx.fillRect(0, 0, 300, 300);
    const img = await f.FabricImage.fromURL(cv.toDataURL());
    img.set({ left: 500, top: 300, originX: 'left', originY: 'top', name: 'img' });
    app.canvasManager.canvas.add(img);
    const rect = new f.Rect({ left: 550, top: 350, width: 200, height: 120, rx: 0, fill: '#7b46f8', name: 'maskRect' });
    app.canvasManager.canvas.add(rect);
    app.canvasManager.canvas.setActiveObject(new f.ActiveSelection([img, rect], { canvas: app.canvasManager.canvas }));
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(250);
  await rightClickScene(page, 620, 400);
  await page.locator('.ctx-menu-item', { hasText: 'Create clipping mask' }).click();
  await page.waitForTimeout(350);
}

test('mask edit: moving the content re-frames it inside a fixed window', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await addMaskedImage(page);

  // enter edit, then drag the content 160px to the right
  await page.locator('.dock-body-pane.active .btn', { hasText: 'Edit contents' }).click();
  await page.waitForTimeout(400);
  await sceneDrag(page, [620, 400], [780, 400]);
  await page.locator('#btn-mask-done').click();
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => {
    const app = window.__editorApp;
    const g = app.canvasManager.canvas.getObjects().find(o => o.type === 'group');
    return {
      clipped: !!g && !!g.clipPath,
      editing: app.ops.maskEditing,
      groupLeft: Math.round(g.left),
      clipScene: g && g.clipPath ? Math.round(g.clipPath.left * g.scaleX + g.left) : null
    };
  });
  expect(state.editing).toBe(false);
  expect(state.clipped).toBe(true);
  // group center moved +160 from (620,360+?) → ~780-ish; the mask window is pinned
  expect(state.groupLeft).toBeGreaterThan(700);
  expect(errors).toEqual([]);
});

test('remove mask: content stays in place, shape returns at the mask window', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await addMaskedImage(page);

  // move the whole masked unit +140 x / +60 y like a normal object drag
  await sceneDrag(page, [620, 400], [760, 460]);
  const before = await page.evaluate(() => {
    const app = window.__editorApp;
    const g = app.canvasManager.canvas.getObjects().find(o => o.type === 'group');
    return { gx: g.left, gy: g.top };
  });

  await rightClickScene(page, 760, 460);
  await page.locator('.ctx-menu-item', { hasText: 'Release clipping mask' }).click();
  await page.waitForTimeout(600);

  const after = await page.evaluate(() => {
    const app = window.__editorApp;
    const objs = app.canvasManager.canvas.getObjects();
    const img = objs.find(o => o.name === 'img');
    const mask = objs.find(o => o.name === 'maskRect');
    return img && mask
      ? { imgLeft: Math.round(img.left), imgTop: Math.round(img.top), maskLeft: Math.round(mask.left), maskTop: Math.round(mask.top), gapX: Math.round(mask.left - img.left) }
      : null;
  });
  expect(after).not.toBeNull();
  // image stayed where it was dragged to (it moved WITH the group before release)
  expect(after.imgLeft).toBeGreaterThan(590);
  // the shape comes back exactly aligned over the clip window: same offset as pre-clip (50px)
  expect(Math.abs(after.gapX - 50)).toBeLessThan(2);
  expect(Math.abs((after.maskTop - after.imgTop) - 50)).toBeLessThan(2);
  expect(errors).toEqual([]);
});

test('paragraph text: drag creates a wrapping textbox', async ({ page }) => {
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await page.locator('#btn-text-caret').click();
  await page.locator('.text-menu-item[data-textmode="paragraph"]').click();
  expect(await page.evaluate(() => window.__editorApp.toolManager.currentTool)).toBe('text');
  expect(await page.evaluate(() => window.__editorApp.toolManager.tools['text'].mode)).toBe('paragraph');

  const box = await page.locator('.upper-canvas').boundingBox();
  await page.mouse.move(box.x + box.width / 2 - 300, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 300 + 420, box.y + box.height / 2 + 60, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(400);

  const tb = await page.evaluate(() => {
    const app = window.__editorApp;
    const o = app.canvasManager.canvas.getObjects().find(x => x.type === 'textbox');
    return o ? { type: o.type, width: Math.round(o.width), left: Math.round(o.left) } : null;
  });
  expect(tb).not.toBeNull();
  // drag was 420 CSS px → scene width depends on zoom (~0.5–0.6 here)
  expect(tb.width).toBeGreaterThanOrEqual(600);
  expect(tb.width).toBeLessThanOrEqual(950);
  // type into it (it is in editing mode) then finish
  await page.keyboard.type('Hello paragraph');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const val = await page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getObjects().find(x => x.type === 'textbox');
    return o ? o.text : null;
  });
  expect(val).toContain('Hello paragraph');
});

test('heading text (T) still drops an IText instantly', async ({ page }) => {
  await openBlank(page);
  await page.locator('.tool-btn[data-tool="text"]').click();
  const box = await page.locator('.upper-canvas').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getObjects().find(x => x.type === 'i-text');
    return !!o;
  });
  expect(info).toBe(true);
});

test('text supports gradient fill via the shared Fill section', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await openBlank(page);
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const t = new f.IText('Gradient headline', { left: 500, top: 380, fontSize: 90, fontFamily: 'Inter', name: 'head' });
    app.canvasManager.canvas.add(t);
    app.canvasManager.canvas.setActiveObject(t);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(300);
  const fillCard = page.locator('.dock-body-pane.active .prop-card', { hasText: 'Fill' }).first();
  await fillCard.locator('.seg-btn', { hasText: 'Gradient' }).click();
  await page.waitForTimeout(250);
  const fill = await page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getObjects().find(x => x.name === 'head');
    return o && o.fill && o.fill.type;
  });
  expect(fill).toBe('linear');
  expect(errors).toEqual([]);
});

test('color picker: popover opens, drags and presets commit', async ({ page }) => {
  await openBlank(page);
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const r = new f.Rect({ left: 600, top: 350, width: 260, height: 180, fill: '#7b46f8', name: 'cpt' });
    app.canvasManager.canvas.add(r);
    app.canvasManager.canvas.setActiveObject(r);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(350);

  // fill color control inside the Fill card
  const fillCard = page.locator('.dock-body-pane.active .prop-card', { hasText: 'Fill' }).first();
  await fillCard.locator('.colorrow .color-swatch').first().click();
  const pop = page.locator('.color-pop');
  await expect(pop).toBeVisible();
  // drag in the SV square to pick another colour (live preview)
  const sv = pop.locator('.cp-sv');
  const b = await sv.boundingBox();
  await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.75, b.y + b.height * 0.3, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const fillOf = () => page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getObjects().find(x => x.name === 'cpt');
    return String(o.fill).toLowerCase();
  });
  const afterDrag = await fillOf();
  expect(afterDrag).not.toBe('#7b46f8');
  // preset chip commits & closes
  await pop.locator('.cp-presets .swatch[title="#00c2a8"]').click();
  await page.waitForTimeout(250);
  expect(await fillOf()).toBe('#00c2a8');
  await expect(pop).toBeHidden();
});

test('ruler labels are drawn (major tick numbers visible)', async ({ page }) => {
  page.setViewportSize({ width: 1680, height: 1000 });
  await openBlank(page);
  await page.waitForTimeout(500);
  const res = await page.evaluate(() => {
    const cm = window.__editorApp.canvasManager;
    const countLabelPixels = (cv, x0, y0, x1, y1) => {
      const ctx = cv.getContext('2d');
      const d = ctx.getImageData(Math.max(0, x0), Math.max(0, y0), Math.min(cv.width, x1) - Math.max(0, x0), Math.min(cv.height, y1) - Math.max(0, y0)).data;
      let lit = 0;
      for (let i = 0; i < d.length; i += 4) {
        // bright accent-text pixels (labels are #c4b5fd-ish → blue channel high)
        if (d[i + 3] > 0 && d[i + 2] > 150 && d[i] < 220) lit++;
      }
      return lit;
    };
    const zoom = cm.getZoom(), pan = cm.getPan();
    const toLocal = (scene) => scene * zoom + pan.x - 18;
    // find the first major tick > 0 inside the horizontal ruler
    const step = cm._tickStep(zoom);
    const major = step * 5;
    let s = Math.max(step, Math.floor((-pan.x + 18) / zoom / step) * step);
    while (s % major !== 0) s += step;
    const x = Math.round(toLocal(s));
    return {
      zoom,
      hPixels: countLabelPixels(cm.rulerH, x + 2, 0, x + 2 + 60, 12),
      vPixels: (() => {
        const toLocalY = (sc) => sc * zoom + pan.y - 18;
        const stepY = cm._tickStep(zoom);
        const majorY = stepY * 5;
        let sy = Math.max(stepY, Math.floor((-pan.y + 18) / zoom / stepY) * stepY);
        while (sy % majorY !== 0) sy += stepY;
        const y = Math.round(toLocalY(sy));
        const ctx = cm.rulerV.getContext('2d');
        // exclude the tick column on the right — labels only
        const d = ctx.getImageData(0, Math.max(0, y - 12), Math.max(0, cm.rulerV.width - 10), 24).data;
        let lit = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && d[i + 2] > 150) lit++;
        return lit;
      })()
    };
  });
  expect(res.hPixels).toBeGreaterThan(5);  // horizontal numbers painted
  expect(res.vPixels).toBeGreaterThan(5);  // vertical numbers painted
});

test('elements: IG post block drops onto the page with photo slots', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1680, height: 1000 });
  await openBlank(page);
  await page.locator('.dock-tab[data-tab="elements"]').click();
  await page.waitForTimeout(300);
  const card = page.locator('.element-card[data-element="ig-post"]');
  await expect(card).toBeVisible();
  await card.click(); // click = insert at page centre
  await page.waitForTimeout(1200);

  const state = await page.evaluate(() => {
    const app = window.__editorApp;
    const objs = app.canvasManager.canvas.getObjects();
    return {
      cardRect: objs.some(o => o.type === 'rect' && o.name === 'IG card'),
      slot: objs.find(o => o.type === 'image' && o.name === 'IG photo slot'),
      n: objs.length,
      inPage: objs.every(o => o.left >= 0 && o.top >= 0 && o.left + o.width * o.scaleX <= 1920 + 1)
    };
  });
  expect(state.cardRect).toBe(true);
  expect(state.slot).toBeTruthy();
  expect(state.slot.width).toBeGreaterThan(400); // placeholder art decoded
  expect(state.n).toBeGreaterThan(6);
  expect(state.inPage).toBe(true);
  expect(errors).toEqual([]);
});

test('Aurelia template pack appears and renders showcase structure', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1680, height: 1000 });
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 25000 });
  const packCard = welcome.locator('.welcome-card', { hasText: 'Aurelia' });
  await expect(packCard).toBeVisible();
  await packCard.click();
  await welcome.waitFor({ state: 'hidden' });
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => {
    const app = window.__editorApp;
    return {
      nPages: app.pageManager.pages.length,
      titles: app.pageManager.pages.map(p => p.title),
      coverText: app.canvasManager.canvas.getObjects().filter(o => o.type === 'i-text').slice(0, 6).map(o => (o.text || '').slice(0, 30)).join(' | ')
    };
  });
  expect(state.nPages).toBe(7);
  expect(state.titles).toEqual(['Cover', 'About', 'Selected work', 'Case study', 'Gallery', 'Services & process', 'Contact']);
  expect(state.coverText).toContain('Design that ships');
  expect(errors).toEqual([]);
});
