import { test, expect } from '@playwright/test';

async function loadBlank(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await welcome.waitFor({ state: 'hidden' });
  await page.waitForTimeout(400);
}

async function addNamedRects(page, names) {
  await page.evaluate((ns) => {
    const app = window.__editorApp;
    const f = window.fabric;
    ns.forEach((n, i) => {
      const r = new f.Rect({ left: 100 + i * 60, top: 100 + i * 40, width: 50, height: 40, fill: '#7b46f8', name: n });
      app.canvasManager.canvas.add(r);
    });
    app.canvasManager.canvas.requestRenderAll();
  }, names);
}

function sceneOrder(page) {
  return page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().map(o => o.name || o.type));
}

async function dragRow(page, fromRow, overRow, below = false) {
  // HTML5 drag simulation with a real DataTransfer
  const dt = await page.evaluateHandle(() => new DataTransfer());
  await fromRow.dispatchEvent('dragstart', { dataTransfer: dt });
  await overRow.dispatchEvent('dragover', {
    dataTransfer: dt,
    clientY: below ? 10000 : 0,
    bubbles: true
  });
  await overRow.dispatchEvent('drop', { dataTransfer: dt, bubbles: true });
  await page.waitForTimeout(300);
}

test.describe('Regression fixes', () => {
  test('layer drag-up no longer sends the layer to the bottom', async ({ page }) => {
    await loadBlank(page);
    await addNamedRects(page, ['A', 'B', 'C', 'D']); // A bottom … D top
    await page.locator('.dock-tab[data-tab="layers"]').click();
    await page.waitForTimeout(250);

    // display rows (top→bottom): D C B A
    let rows = page.locator('.layer-row');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0).locator('.layer-name')).toHaveText('D');

    // 1) drag TOP row (D) below BOTTOM row (A) → D must become the bottom layer
    await dragRow(page, rows.nth(0), rows.nth(3), true);
    expect(await sceneOrder(page)).toEqual(['D', 'A', 'B', 'C']);
    rows = page.locator('.layer-row');
    // display now: C B A D (C top)
    await expect(rows.nth(0).locator('.layer-name')).toHaveText('C');

    // 2) drag BOTTOM row (D) up ABOVE the top row (C) → D must land on top
    //    (regression: it used to land at the very bottom)
    await dragRow(page, rows.nth(3), rows.nth(0), false);
    expect(await sceneOrder(page)).toEqual(['A', 'B', 'C', 'D']);
    rows = page.locator('.layer-row');
    await expect(rows.nth(0).locator('.layer-name')).toHaveText('D');

    // 3) drag a middle row (B) above the top row (D) → B sits directly
    //    above D, between D and C (not sent to an extreme)
    await dragRow(page, rows.nth(2), rows.nth(0), false);
    expect(await sceneOrder(page)).toEqual(['A', 'C', 'D', 'B']);
  });

  test('shape dropdown shows the full gallery and picks a shape', async ({ page }) => {
    await loadBlank(page);
    await page.locator('#btn-shapes').click();
    const menu = page.locator('.shape-menu');
    await expect(menu).toBeVisible();
    // 16 shapes listed
    const count = await menu.locator('.shape-menu-cell').count();
    expect(count).toBeGreaterThanOrEqual(16);
    await expect(menu.locator('.shape-menu-cell[title="Star"]')).toBeVisible();
    await expect(menu.locator('.shape-menu-cell[title="Heart"]')).toBeVisible();
    await expect(menu.locator('.shape-menu-cell[title="Pentagon"]')).toBeVisible();
    // pick Heart → tool becomes shape + type heart
    await menu.locator('.shape-menu-cell[title="Heart"]').click();
    expect(await page.evaluate(() => window.__editorApp.toolManager.currentTool)).toBe('shape');
    expect(await page.evaluate(() => window.__editorApp.toolManager.tools['shape'].shapeType)).toBe('heart');
  });

  test('Illustrator-style clipping mask via right-click (image + shape on top)', async ({ page }) => {
    page.setViewportSize({ width: 1600, height: 1000 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await loadBlank(page);

    // image (solid red 300×300 at 600,300, LEFT origin) then a rect mask
    // on top (200×120 at 650,390) — masks overlap with margins on all sides
    await page.evaluate(async () => {
      const app = window.__editorApp;
      const f = window.fabric;
      const cv = document.createElement('canvas');
      cv.width = cv.height = 300;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#ff2d20';
      ctx.fillRect(0, 0, 300, 300);
      const img = await f.FabricImage.fromURL(cv.toDataURL());
      img.set({ left: 600, top: 300, originX: 'left', originY: 'top', name: 'img' });
      app.canvasManager.canvas.add(img);
      const rect = new f.Rect({ left: 650, top: 390, width: 200, height: 120, rx: 0, fill: '#000', name: 'mask' });
      app.canvasManager.canvas.add(rect);
      app.canvasManager.canvas.setActiveObject(new f.ActiveSelection([img, rect], { canvas: app.canvasManager.canvas }));
      app.canvasManager.canvas.requestRenderAll();
    });
    await page.waitForTimeout(300);

    // open the object context menu over the canvas (over the shape+image)
    const clickPt = await page.evaluate(() => {
      const cm = window.__editorApp.canvasManager;
      const vp = cm.getViewport().getBoundingClientRect();
      const s = cm.sceneToScreen(700, 450); // inside both objects
      return { x: vp.left + s.x, y: vp.top + s.y };
    });
    await page.mouse.click(clickPt.x, clickPt.y, { button: 'right' });
    const item = page.locator('.ctx-menu-item', { hasText: 'Create clipping mask' });
    await expect(item).toBeVisible();
    await item.click();
    await page.waitForTimeout(400);

    // single masked GROUP remains (shape removed); group carries the clip
    const state = await page.evaluate(() => {
      const app = window.__editorApp;
      const objs = app.canvasManager.canvas.getObjects();
      const g = objs.find(o => o.type === 'group');
      const clip = g && g.clipPath;
      return {
        count: objs.length,
        hasClip: !!clip,
        clipType: clip ? clip.type : null,
        clip: clip ? { l: Math.round(clip.left), t: Math.round(clip.top), w: Math.round(clip.width * clip.scaleX), h: Math.round(clip.height * clip.scaleY) } : null,
        name: g ? g.name : null
      };
    });
    expect(state.count).toBe(1);
    expect(state.hasClip).toBe(true);
    expect(state.clipType).toBe('rect');
    expect(state.name).toBe('Masked content');
    // group origin is its center (750,450) → mask offset -100,-60, size 200×120
    expect(state.clip.l).toBe(-100);
    expect(state.clip.t).toBe(-60);
    expect(state.clip.w).toBe(200);
    expect(state.clip.h).toBe(120);

    // pixel proof at 100% zoom: red inside the mask, white just outside it
    await page.evaluate(() => {
      const cm = window.__editorApp.canvasManager;
      cm.setZoom(100, null);
      cm.setPan(0, 0);
    });
    await page.waitForTimeout(300);
    const sample = (x, y) => page.evaluate(([px, py]) => {
      const c = window.__editorApp.canvasManager.getCanvas();
      const ctx = c.lowerCanvasEl.getContext('2d');
      const d = ctx.getImageData(px, py, 1, 1).data;
      return [d[0], d[1], d[2]];
    }, [x, y]);

    const inside = await sample(750, 450); // center of mask region
    expect(inside[1]).toBeLessThan(120);   // red (green channel low)
    const outside = await sample(880, 450); // inside image, right of mask
    expect(outside[1]).toBeGreaterThan(200); // page white (green high)
    const above = await sample(750, 320);   // inside image, above mask
    expect(above[1]).toBeGreaterThan(200);

    // release the mask again via right-click (single clipped group active)
    await page.evaluate(() => {
      const app = window.__editorApp;
      const g = app.canvasManager.canvas.getObjects().find(o => o.type === 'group');
      app.canvasManager.canvas.setActiveObject(g);
      app.canvasManager.canvas.requestRenderAll();
    });
    const clickPt2 = await page.evaluate(() => {
      const cm = window.__editorApp.canvasManager;
      const vp = cm.getViewport().getBoundingClientRect();
      const s = cm.sceneToScreen(700, 450);
      return { x: vp.left + s.x, y: vp.top + s.y };
    });
    await page.mouse.click(clickPt2.x, clickPt2.y, { button: 'right' });
    const release = page.locator('.ctx-menu-item', { hasText: 'Release clipping mask' });
    await expect(release).toBeVisible();
    await release.click();
    await page.waitForTimeout(250);
    const afterRelease = await page.evaluate(() => {
      const app = window.__editorApp;
      const objs = app.canvasManager.canvas.getObjects();
      const img = objs.find(o => o.name === 'img');
      const b = img ? img.getBoundingRect() : null;
      return {
        clip: !!(img && img.clipPath),
        imgBack: !!img,
        groupCount: objs.filter(o => o.type === 'group').length,
        types: objs.map(o => (o.type === 'group' ? 'group<' + (o._objects || []).map(c => c.type).join(',') + '>' : o.type + ':' + (o.name || ''))),
        // the raw image must land back EXACTLY where it was pre-mask:
        // 300x300 image with LEFT origin at (600,300) → scene bbox
        l: b ? b.left : null,
        t: b ? b.top : null,
        w: b ? b.width : null,
        h: b ? b.height : null
      };
    });
    expect(afterRelease.clip).toBe(false); // unwrapped back to the raw image
    expect(afterRelease.imgBack).toBe(true);
    expect(afterRelease.groupCount).toBe(0);
    expect(afterRelease.l).toBeCloseTo(600, 0); // no drift from the unwrap
    expect(afterRelease.t).toBeCloseTo(300, 0);
    expect(afterRelease.w).toBeCloseTo(300, 0);
    expect(afterRelease.h).toBeCloseTo(300, 0);
    expect(errors).toEqual([]);
  });
});
