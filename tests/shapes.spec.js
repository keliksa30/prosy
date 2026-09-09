import { test, expect } from '@playwright/test';

test('path-based shapes (star/arrow) draw + mask with star clip', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await page.waitForTimeout(500);

  // choose star from the shapes dropdown
  await page.locator('#btn-shapes').click();
  await page.locator('.shape-menu-cell[title="Star"]').click();
  const box = await page.locator('.upper-canvas').boundingBox();
  await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 140, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  const starInfo = await page.evaluate(() => {
    const app = window.__editorApp;
    const o = app.canvasManager.canvas.getActiveObject();
    return { type: o ? o.type : null, isFabric: o ? typeof o.set === 'function' : false, w: o ? Math.round(o.width * o.scaleX) : 0 };
  });
  expect(starInfo.type).toBe('path');
  expect(starInfo.isFabric).toBe(true);
  expect(starInfo.w).toBeGreaterThan(80);

  // mask the star with a diamond clip (exercises the tpl path)
  await page.waitForTimeout(200);
  const diamond = page.locator('.mask-chip[title="Diamond"]');
  await expect(diamond).toBeVisible();
  await diamond.click();
  await page.waitForTimeout(300);
  const clipOk = await page.evaluate(() => {
    const a = window.__editorApp.canvasManager.canvas.getActiveObject();
    return !!(a && a.clipPath && typeof a.clipPath.set === 'function');
  });
  expect(clipOk).toBe(true);
  expect(errors).toEqual([]);
});
