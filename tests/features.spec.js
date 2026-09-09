import { test, expect } from '@playwright/test';

/**
 * Feature + regression coverage for the clip-mask overhaul, per-page undo,
 * gradient fill / shadow, rulers, on-canvas corner radius, purple theme
 * and the icon-only toolbar.
 */
async function openBlank(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await welcome.waitFor({ state: 'hidden' });
  await page.waitForTimeout(400);
}

async function addImageAndRect(page) {
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
  await page.waitForTimeout(200);
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

test('clip: release restores the mask shape (image + shape via right-click)', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await addImageAndRect(page);

  await rightClickScene(page, 620, 400);
  await page.locator('.ctx-menu-item', { hasText: 'Create clipping mask' }).click();
  await page.waitForTimeout(350);
  const afterCreate = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().map(o => o.name || o.type));
  expect(afterCreate).toEqual(['Masked content']);

  // re-open the menu on the clipped group and release
  await rightClickScene(page, 620, 400);
  await page.locator('.ctx-menu-item', { hasText: 'Release clipping mask' }).click();
  await page.waitForTimeout(600);
  const afterRelease = await page.evaluate(() => {
    const objs = window.__editorApp.canvasManager.canvas.getObjects();
    return objs.map(o => ({ t: o.type, n: o.name, clip: !!o.clipPath }));
  });
  const img = afterRelease.find(o => o.n === 'img');
  const mask = afterRelease.find(o => o.n === 'maskRect');
  expect(afterRelease).toHaveLength(2);
  expect(img).toBeTruthy();
  expect(img.clip).toBe(false);        // unclipped, not lost
  expect(mask).toBeTruthy();           // the shape came back
  expect(mask.clip).toBe(false);
  expect(errors).toEqual([]);
});

test('clip: shape-on-shape mask also returns the shape on release', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const a = new f.Rect({ left: 500, top: 300, width: 300, height: 220, fill: '#00c2a8', name: 'shapeA' });
    const b = new f.Rect({ left: 550, top: 350, width: 160, height: 120, rx: 0, fill: '#7b46f8', name: 'shapeB' });
    app.canvasManager.canvas.add(a);
    app.canvasManager.canvas.add(b);
    app.canvasManager.canvas.setActiveObject(new f.ActiveSelection([a, b], { canvas: app.canvasManager.canvas }));
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(150);
  await rightClickScene(page, 600, 380);
  await page.locator('.ctx-menu-item', { hasText: 'Create clipping mask' }).click();
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().map(o => o.name || o.type))).toEqual(['shapeA']);

  await rightClickScene(page, 600, 380);
  await page.locator('.ctx-menu-item', { hasText: 'Release clipping mask' }).click();
  await page.waitForTimeout(600);
  const names = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().map(o => (o.name || o.type) + ':' + !!o.clipPath));
  expect(names).toContain('shapeA:false');
  expect(names).toContain('shapeB:false');
  expect(errors).toEqual([]);
});

test('clip: "Edit contents" enters mask-edit mode and re-applies on Done', async ({ page }) => {
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await addImageAndRect(page);
  await rightClickScene(page, 620, 400);
  await page.locator('.ctx-menu-item', { hasText: 'Create clipping mask' }).click();
  await page.waitForTimeout(350);

  // Design tab is active by default; "Edit contents" starts the isolation mode
  const editBtn = page.locator('.dock-body-pane.active .btn', { hasText: 'Edit contents' });
  await expect(editBtn).toBeVisible();
  await editBtn.click();
  await page.waitForTimeout(450);

  const editing = await page.evaluate(() => {
    const app = window.__editorApp;
    const objs = app.canvasManager.canvas.getObjects();
    return {
      editing: app.ops.maskEditing,
      hostClipless: objs.filter(o => o.type === 'group').every(g => !g.clipPath),
      ghost: objs.some(o => o.name === 'Mask outline')
    };
  });
  expect(editing.editing).toBe(true);
  expect(editing.hostClipless).toBe(true); // content is free to move
  expect(editing.ghost).toBe(true);        // dashed mask window stays put
  await expect(page.locator('#mask-edit-bar')).toBeVisible();

  // Done re-applies the clip and removes the ghost
  await page.locator('#btn-mask-done').click();
  await page.waitForTimeout(500);
  const done = await page.evaluate(() => {
    const app = window.__editorApp;
    const g = app.canvasManager.canvas.getObjects().find(o => o.type === 'group');
    return { editing: app.ops.maskEditing, clipped: !!g && !!g.clipPath, ghost: app.canvasManager.canvas.getObjects().some(o => o.name === 'Mask outline') };
  });
  expect(done.editing).toBe(false);
  expect(done.clipped).toBe(true);
  expect(done.ghost).toBe(false);
});

test('undo history stays per page across switching away and back', async ({ page }) => {
  await openBlank(page);
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const r1 = new f.Rect({ left: 200, top: 200, width: 100, height: 80, fill: '#7b46f8', name: 'R1' });
    app.canvasManager.canvas.add(r1);
    const r2 = new f.Rect({ left: 400, top: 200, width: 100, height: 80, fill: '#7b46f8', name: 'R2' });
    app.canvasManager.canvas.add(r2);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(300);
  await page.locator('#btn-add-page').click();      // leave page 1
  await page.waitForTimeout(500);
  await page.locator('.filmstrip-item').first().click(); // return to page 1
  await page.waitForTimeout(500);

  const before = await page.evaluate(() => ({ canUndo: window.__editorApp.historyManager.canUndo(), n: window.__editorApp.canvasManager.canvas.getObjects().length }));
  expect(before.canUndo).toBe(true);
  expect(before.n).toBe(2);

  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ n: window.__editorApp.canvasManager.canvas.getObjects().length }));
  expect(after.n).toBe(1); // granular undo removed just the last rect
});

test('gradient fill: switch shape to gradient, angle + stops apply, undo returns solid', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1500, height: 950 });
  await openBlank(page);
  // add a rect via the UI and select it (Design tab shows Fill)
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const r = new f.Rect({ left: 600, top: 350, width: 260, height: 180, fill: '#7b46f8', name: 'grad' });
    app.canvasManager.canvas.add(r);
    app.canvasManager.canvas.setActiveObject(r);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(350);

  const fillCard = page.locator('.dock-body-pane.active .prop-card', { hasText: 'Fill' }).first();
  await expect(fillCard).toBeVisible();
  await fillCard.locator('.seg-btn', { hasText: 'Gradient' }).click();
  await page.waitForTimeout(200);

  const fillOf = (mode) => page.evaluate((m) => {
    const o = window.__editorApp.canvasManager.canvas.getObjects()[0];
    if (m === 'type') return o && o.fill && o.fill.type;
    if (m === 'first') return String(o.fill.colorStops[0].color).toLowerCase();
    return o && o.fill;
  }, mode);

  expect(await fillOf('type')).toBe('linear');

  // swap the two stops -> first stop becomes pink
  await page.locator('.dock-body-pane.active button[title="Swap colors"]').click();
  await page.waitForTimeout(150);
  expect(await fillOf('first')).toBe('#fa51a2');

  // undo the swap (history reload clears selection, read by name again)
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
  await page.waitForTimeout(400);
  expect(await fillOf('type')).toBe('linear');
  expect(await fillOf('first')).toBe('#7b46f8');

  // undo the mode switch -> back to the solid fill
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
  await page.waitForTimeout(400);
  expect(await fillOf('fill')).toBe('#7b46f8');
  expect(errors).toEqual([]);
});

test('shadow: toggle adds a fabric shadow, preset changes it, serialize keeps it', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1500, height: 950 });
  await openBlank(page);
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const r = new f.Rect({ left: 600, top: 350, width: 260, height: 180, fill: '#7b46f8', name: 'sh' });
    app.canvasManager.canvas.add(r);
    app.canvasManager.canvas.setActiveObject(r);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(350);

  const shadowCard = page.locator('.dock-body-pane.active .prop-card', { hasText: 'Shadow' }).first();
  await expect(shadowCard).toBeVisible();
  await shadowCard.locator('.seg-btn', { hasText: 'Shadow' }).click();
  await page.waitForTimeout(200);

  let sh = await page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getActiveObject();
    return o.shadow ? { blur: o.shadow.blur, has: true } : { has: false };
  });
  expect(sh.has).toBe(true);
  expect(sh.blur).toBeGreaterThan(0);

  // "Violet glow" preset
  await shadowCard.locator('.chip-btn', { hasText: 'Violet glow' }).click();
  await page.waitForTimeout(150);
  const afterPreset = await page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getActiveObject();
    return { color: String(o.shadow.color), blur: o.shadow.blur };
  });
  expect(afterPreset.color.toLowerCase()).toBe('#7b46f8');

  // serializes into the page JSON (survives save/switch)
  const hasShadowInJson = await page.evaluate(() => {
    const json = window.__editorApp.canvasManager.canvas.toJSON();
    return json.objects.some(o => o.shadow && String(o.shadow.color).toLowerCase() === '#7b46f8');
  });
  expect(hasShadowInJson).toBe(true);
  expect(errors).toEqual([]);
});

test('rulers: toggle button shows/hides the ruler chrome', async ({ page }) => {
  await openBlank(page);
  const hRuler = page.locator('.prosy-ruler-h');
  await expect(hRuler).toBeVisible();
  const btn = page.locator('#btn-rulers');
  await btn.click();
  await page.waitForTimeout(150);
  await expect(hRuler).toBeHidden();
  await btn.click();
  await page.waitForTimeout(150);
  await expect(hRuler).toBeVisible();
  const pref = await page.evaluate(() => localStorage.getItem('prosy.rulers'));
  expect(pref).toBe('1');
});

test('corner radius: drag the on-canvas handle to pill and back to sharp', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.setViewportSize({ width: 1600, height: 1000 });
  await openBlank(page);
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const r = new f.Rect({ left: 500, top: 300, width: 260, height: 120, rx: 20, ry: 20, fill: '#7b46f8', name: 'round' });
    app.canvasManager.canvas.add(r);
    app.canvasManager.canvas.setActiveObject(r);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(350);

  const handleInfo = await page.evaluate(() => {
    const o = window.__editorApp.canvasManager.canvas.getActiveObject();
    const vis = o._controlsVisibility && o._controlsVisibility.cornerRadius;
    return { hasControl: !!o.controls.cornerRadius, visible: vis === true, rx: o.rx };
  });
  expect(handleInfo.hasControl).toBe(true);
  expect(handleInfo.visible).toBe(true); // rx 20 ≥ visible threshold

  // handle sits at the arc centre of the top-right corner: scene (740, 320)
  const drag = async (from, to) => {
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
  };

  // drag inward along the top edge → full pill (cap = height/2 = 60)
  await drag([740, 320], [520, 320]);
  let rx = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getActiveObject().rx);
  expect(rx).toBeGreaterThanOrEqual(55);
  expect(rx).toBeLessThanOrEqual(60);

  // drag back out past the corner → radius 0
  await drag([500 + (260 - rx), 300 + rx], [900, 300]);
  rx = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getActiveObject().rx);
  expect(rx).toBe(0);
  expect(errors).toEqual([]);
});

test('purple accent: primary buttons + favicon use the purple brand', async ({ page }) => {
  await openBlank(page);
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.btn-primary')).backgroundColor);
  expect(bg).toBe('rgb(123, 70, 248)');
  const favicon = await page.evaluate(async () => {
    const res = await fetch('/favicon.svg');
    return res.text();
  });
  expect(favicon).toContain('#7b46f8');
  expect(favicon).not.toContain('#fe8616');
});

test('icon-only toolbar: shape button shows an icon, name lives in the tooltip', async ({ page }) => {
  await openBlank(page);
  // no visible text label on the shapes button — just the icon + chevron
  const label = page.locator('#shape-tool-label');
  await expect(label).toBeVisible();
  expect((await label.textContent()).trim()).toBe('');
  expect(await label.locator('svg').count()).toBe(1);
  // other tool labels are hidden (icon-only)
  const hidden = await page.evaluate(() => {
    const sp = document.querySelector('.tool-btn[data-tool="pan"] span');
    return sp ? getComputedStyle(sp).display : 'none';
  });
  expect(hidden).toBe('none');
  // picking a shape updates the icon + hover tooltip and closes the menu
  await page.locator('#btn-shapes').click();
  await page.locator('.shape-menu-cell[title="Heart"]').click();
  const title = await page.locator('#btn-shapes').getAttribute('title');
  expect(title).toContain('Heart');
  await expect(page.locator('.shape-menu')).toBeHidden(); // gallery closed
});
