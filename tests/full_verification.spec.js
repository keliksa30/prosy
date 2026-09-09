import { test, expect } from '@playwright/test';

async function openBlank(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await expect(welcome).toBeVisible({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await expect(welcome).toBeHidden();
}

async function canvasCenter(page) {
  const box = await page.locator('.upper-canvas').boundingBox();
  return { box };
}

test.describe('Prosy Full Verification Suite', () => {
  test('Core workflow: canvas, page bg, text, shapes, icons, home — no errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    // 1. blank project
    await openBlank(page);

    const canvasWrapper = page.locator('.canvas-wrapper');
    await expect(canvasWrapper).toBeVisible();
    const initialBg = await page.evaluate(() => window.__editorApp.canvasManager.getBackgroundColor());
    expect(initialBg).toBe('#ffffff');

    // 2. change page background via the Design tab swatch (Ink)
    const inkSwatch = page.locator('.dock-body-pane.active .swatches .swatch[title="Ink"]');
    await expect(inkSwatch).toBeVisible();
    await inkSwatch.click();
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.__editorApp.canvasManager.getBackgroundColor())).toBe('#0f172a');
    // back to white
    await page.evaluate(() => window.__editorApp.canvasManager.setBackgroundColor('#ffffff'));

    // 3. text tool
    await page.locator('.tool-btn[data-tool="text"]').click();
    const { box } = await canvasCenter(page);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(350);
    let info = await page.evaluate(() => {
      const objs = window.__editorApp.canvasManager.canvas.getObjects();
      const text = objs.find(o => o.type === 'i-text');
      return { hasText: !!text, val: text ? text.text : null };
    });
    expect(info.hasText).toBe(true);
    expect(info.val).toContain('Type something');
    // leave text editing before tool shortcuts
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // 4. rectangle via R shortcut, drag
    await page.keyboard.press('r');
    await page.waitForTimeout(150);
    await page.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 120, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(250);
    info = await page.evaluate(() => {
      const objs = window.__editorApp.canvasManager.canvas.getObjects();
      const rect = objs.find(o => o.type === 'rect');
      return { hasRect: !!rect, w: rect ? rect.width * rect.scaleX : 0, h: rect ? rect.height * rect.scaleY : 0 };
    });
    expect(info.hasRect).toBe(true);
    expect(info.w).toBeGreaterThan(50);
    expect(info.h).toBeGreaterThan(50);

    // 5. ellipse via O shortcut, single click places default
    await page.keyboard.press('o');
    await page.mouse.click(box.x + box.width / 2 + 250, box.y + box.height / 2);
    await page.waitForTimeout(250);
    info = await page.evaluate(() => {
      const objs = window.__editorApp.canvasManager.canvas.getObjects();
      return { hasE: !!objs.find(o => o.type === 'ellipse') };
    });
    expect(info.hasE).toBe(true);

    // 6. icon library (dock tab)
    await page.locator('#btn-tool-icons').click();
    const iconGrid = page.locator('.dock-body-pane.active .icon-grid');
    await expect(iconGrid).toBeVisible();
    const firstIcon = iconGrid.locator('.icon-cell').first();
    await firstIcon.click();
    await page.waitForTimeout(500);
    const hasGroup = await page.evaluate(() => !!window.__editorApp.canvasManager.canvas.getObjects().find(o => o.type === 'group'));
    expect(hasGroup).toBe(true);

    // 7. duplicate via Cmd+D works on the selected icon
    const countBefore = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().length);
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+d' : 'Control+d');
    await page.waitForTimeout(250);
    const countAfter = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().length);
    expect(countAfter).toBe(countBefore + 1);

    // 8. undo restores
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+z' : 'Control+z');
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().length)).toBe(countBefore);

    // 9. back home → resume
    await page.locator('#btn-back-home').click();
    await expect(page.locator('#welcome-screen')).toBeVisible();
    await page.locator('#btn-resume-file').click();
    await expect(page.locator('#welcome-screen')).toBeHidden();
    const preserved = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().length);
    expect(preserved).toBeGreaterThanOrEqual(4);

    // ZERO page errors
    expect(pageErrors).toEqual([]);
  });

  test('page CRUD: duplicate + delete from right-click context menu', async ({ page }) => {
    await openBlank(page);
    // add two more pages
    await page.locator('#btn-filmstrip-addrow').click();
    await page.locator('#btn-filmstrip-addrow').click();
    await expect(page.locator('.filmstrip-item')).toHaveCount(3);
    expect(await page.evaluate(() => window.__editorApp.pageManager.currentIndex)).toBe(2);

    // right-click the second page in the filmstrip → duplicate
    const items = page.locator('.filmstrip-item');
    await items.nth(1).click({ button: 'right' });
    await page.locator('.ctx-menu-item', { hasText: 'Duplicate page' }).click();
    await expect(page.locator('.filmstrip-item')).toHaveCount(4);
    expect(await page.evaluate(() => window.__editorApp.pageManager.currentIndex)).toBe(2);

    // right-click again → delete page
    await items.nth(1).click({ button: 'right' });
    await page.locator('.ctx-menu-item', { hasText: 'Delete page' }).click();
    await expect(page.locator('.filmstrip-item')).toHaveCount(3);
  });

  test('zoom: viewport zoom keeps page fixed (scene coordinates unchanged)', async ({ page }) => {
    await openBlank(page);
    // place a rectangle at a known scene position via evaluate
    await page.evaluate(() => {
      const app = window.__editorApp;
      const rect = new window.fabric.Rect({ left: 400, top: 300, width: 220, height: 120, fill: '#7b46f8' });
      app.canvasManager.canvas.add(rect);
      app.canvasManager.canvas.requestRenderAll();
    });
    // zoom in via keyboard (Cmd+ = 110%)
    const before = await page.evaluate(() => window.__editorApp.canvasManager.getZoom());
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press(process.platform === 'darwin' ? 'Meta+=' : 'Control+=');
    }
    const after = await page.evaluate(() => window.__editorApp.canvasManager.getZoom());
    expect(after).toBeGreaterThan(before);
    // object scene coords are untouched by zooming
    const scene = await page.evaluate(() => {
      const r = window.__editorApp.canvasManager.canvas.getObjects()[0];
      return { left: r.left, top: r.top, width: r.width * r.scaleX, height: r.height * r.scaleY };
    });
    expect(scene.left).toBe(400);
    expect(scene.top).toBe(300);
    expect(scene.width).toBe(220);
    expect(scene.height).toBe(120);
    // clicking the object center still selects it (pointer math at zoom)
    const center = await page.evaluate(() => {
      const cm = window.__editorApp.canvasManager;
      const s = cm.sceneToScreen(400 + 110, 300 + 60);
      const vp = cm.getViewport().getBoundingClientRect();
      return { x: vp.left + s.x, y: vp.top + s.y };
    });
    await page.mouse.click(center.x, center.y);
    await page.waitForTimeout(200);
    const selCount = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getActiveObjects().length);
    expect(selCount).toBe(1);
  });
});
