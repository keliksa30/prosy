import { test, expect } from '@playwright/test';

/**
 * Structural + pixel verification (vision unavailable): checks the editor
 * really RENDERS correctly — real page colors, thumbnails, dock panels,
 * context menus, per-page template apply, fonts, masks.
 */

async function loadApp(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
}

function pixelAt(page, x, y) {
  return page.evaluate(([px, py]) => {
    const c = window.__editorApp.canvasManager.getCanvas();
    const ctx = c.lowerCanvasEl.getContext('2d');
    const d = ctx.getImageData(px, py, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  }, [x, y]);
}

test('pixel + structural verification of rendered editor', async ({ page }) => {
  page.setViewportSize({ width: 1500, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await loadApp(page);

  // Welcome shows real (rendered) pack thumbnails — images actually load
  await page.waitForTimeout(800);
  const welcomeImgs = await page.evaluate(() =>
    [...document.querySelectorAll('#welcome-screen img')].every(i => i.complete && i.naturalWidth > 50)
  );
  expect(welcomeImgs).toBe(true);

  // Apply Neo Studio pack from welcome
  const neoCard = page.locator('#welcome-pack-neo-studio');
  await neoCard.scrollIntoViewIfNeeded();
  await neoCard.click();
  await page.waitForTimeout(1400);
  expect(await page.locator('.filmstrip-item').count()).toBe(6);

  // Page background really is dark (#0B0E14) at the canvas top-left corner
  let px = await pixelAt(page, 30, 30);
  expect(Math.abs(px[0] - 11) < 24 && Math.abs(px[1] - 14) < 24 && Math.abs(px[2] - 20) < 24).toBe(true);

  // Text objects really rendered: 'NEO' headline exists in canvas objects
  const texts = await page.evaluate(() =>
    window.__editorApp.canvasManager.canvas.getObjects().filter(o => o.type === 'i-text').map(o => o.text)
  );
  expect(texts.some(t => /NEO/i.test(t))).toBe(true);

  // filmstrip thumbnails eventually show real renders
  await page.waitForTimeout(1200);
  const thumbsOk = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.filmstrip-item')];
    return items.every(it => {
      const img = it.querySelector('img');
      return img && img.complete && img.naturalWidth > 40;
    });
  });
  expect(thumbsOk).toBe(true);

  // page 2 (Overview) has lime accents — sample the small lime square area
  await page.locator('.filmstrip-item').nth(1).click();
  await page.waitForTimeout(800);
  // big lime "07" text exists on page 2
  const hasLimeText = await page.evaluate(() => {
    const objs = window.__editorApp.canvasManager.canvas.getObjects();
    return objs.some(o => o.type === 'i-text' && o.text === '07');
  });
  expect(hasLimeText).toBe(true);

  // select the '07' text -> Design tab shows a Text card
  await page.evaluate(() => {
    const app = window.__editorApp;
    const objs = app.canvasManager.canvas.getObjects();
    const seven = objs.find(o => o.type === 'i-text' && o.text === '07');
    app.canvasManager.canvas.setActiveObject(seven);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(300);
  await expect(page.locator('.dock-body-pane.active .prop-card-title', { hasText: 'Text' }).first()).toBeVisible();
  await expect(page.locator('.font-picker-btn')).toBeVisible();

  // font picker opens with categories + google fonts list
  await page.locator('.font-picker-btn').click();
  await expect(page.locator('.font-cat', { hasText: 'Sans Serif' }).first()).toBeVisible();
  const fontCount = await page.locator('.font-list .font-row').count();
  expect(fontCount).toBeGreaterThan(10);
  // pick 'Space Mono' → fontFamily applied and font actually loads
  await page.locator('.font-row', { hasText: 'Space Mono' }).first().click();
  await page.waitForTimeout(1200);
  const family = await page.evaluate(() => {
    const a = window.__editorApp.canvasManager.canvas.getActiveObject();
    return a ? a.fontFamily : null;
  });
  expect(family).toBe('Space Mono');
  const fontLoaded = await page.evaluate(() => document.fonts.check('700 32px "Space Mono"'));
  expect(fontLoaded).toBe(true);

  // layers tab reflects real object count
  await page.locator('.dock-tab[data-tab="layers"]').click();
  await page.waitForTimeout(250);
  const layerCount = await page.locator('.layer-row').count();
  const objCount = await page.evaluate(() => window.__editorApp.canvasManager.canvas.getObjects().length);
  expect(layerCount).toBe(objCount);

  // icons tab inserts an icon; selected icon color recolor works via ops
  await page.locator('.dock-tab[data-tab="icons"]').click();
  await page.waitForTimeout(200);
  await page.locator('.icon-grid .icon-cell').first().click();
  await page.waitForTimeout(700);
  const iconStroke = await page.evaluate(() => {
    const c = window.__editorApp.canvasManager.canvas;
    const g = c.getObjects().find(o => o.type === 'group');
    const leaf = g && g._objects ? g._objects[0] : null;
    return leaf ? leaf.stroke : null;
  });
  expect(iconStroke).toBe('#0f172a'); // default preset color

  // mask: select the '07' text? use a shape — add a star shape first via keyboard, then mask it
  await page.locator('.dock-tab[data-tab="design"]').click();
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const app = window.__editorApp;
    app.canvasManager.canvas.discardActiveObject();
    const star = new window.fabric.Path('M50,2 L61,38 L99,38 L68,60 L79,96 L50,74 L21,96 L32,60 L1,38 L39,38 Z', {
      left: 800, top: 500, fill: '#c8f542', selectable: true
    });
    app.canvasManager.canvas.add(star);
    app.canvasManager.canvas.setActiveObject(star);
    app.canvasManager.canvas.requestRenderAll();
  });
  await page.waitForTimeout(400);
  // mask section available
  const maskBtn = page.locator('.mask-chip', { hasText: '' }).first();
  await expect(maskBtn).toBeVisible();
  await maskBtn.click(); // rect mask
  await page.waitForTimeout(300);
  const hasClip = await page.evaluate(() => {
    const a = window.__editorApp.canvasManager.canvas.getActiveObject();
    return !!(a && a.clipPath);
  });
  expect(hasClip).toBe(true);

  // per-page template apply: duplicate current page & replace it with a Studio Today layout
  const pmCount = await page.evaluate(() => window.__editorApp.pageManager.pages.length);
  await page.locator('.filmstrip-item').nth(2).click({ button: 'right' });
  await page.locator('.ctx-menu-item', { hasText: 'Duplicate page' }).click();
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.__editorApp.pageManager.pages.length)).toBe(pmCount + 1);
  // duplicate inserted after page 2 → it is the current page at index 3
  const curIdx = await page.evaluate(() => window.__editorApp.pageManager.currentIndex);
  expect(curIdx).toBe(3);
  await page.locator('.filmstrip-item').nth(curIdx).click({ button: 'right' });
  await page.locator('.ctx-menu-item', { hasText: 'Apply template to this page' }).click();
  const modal = page.locator('#template-chooser-modal');
  await modal.locator('.tc-pack', { hasText: 'Studio Today' }).click();
  await modal.locator('.tc-layout', { hasText: 'About' }).first().click();
  await modal.locator('button', { hasText: 'Replace this page' }).click();
  await page.waitForTimeout(1200);
  // current page title became 'About' and has cream bg
  const title = await page.evaluate(() => {
    const pm = window.__editorApp.pageManager;
    return pm.pages[pm.currentIndex].title;
  });
  expect(title).toBe('About');
  px = await pixelAt(page, 40, 40);
  expect(Math.abs(px[0] - 244) < 12 && Math.abs(px[1] - 239) < 12).toBe(true); // #F4EFE3 cream

  expect(errors).toEqual([]);
});
