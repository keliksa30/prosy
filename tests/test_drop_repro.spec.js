import { test, expect } from '@playwright/test';

test('drag and drop onto shape creates clipping mask and onto element fills photo slot', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await welcome.waitFor({ state: 'hidden' });
  await page.waitForTimeout(400);

  // 1. Add a standalone Rect onto the canvas
  await page.evaluate(() => {
    const app = window.__editorApp;
    const f = window.fabric;
    const r = new f.Rect({
      left: 500, top: 300, width: 300, height: 200, fill: '#3b82f6', name: 'Blue Rect'
    });
    app.canvasManager.canvas.add(r);
    r.setCoords();
    app.canvasManager.canvas.requestRenderAll();
  });

  // 2. Dispatch a drop event of an image onto the viewport directly over (650, 400)
  const dropSuccess = await page.evaluate(async () => {
    const app = window.__editorApp;
    const cm = app.canvasManager;
    const vp = cm.getViewport();

    const screenPt = cm.sceneToScreen(650, 400);
    const vpRect = vp.getBoundingClientRect();
    const clientX = vpRect.left + screenPt.x;
    const clientY = vpRect.top + screenPt.y;

    const cv = document.createElement('canvas');
    cv.width = 100; cv.height = 100;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const file = new File([blob], 'test_photo.png', { type: 'image/png' });

    const dt = new DataTransfer();
    dt.items.add(file);

    const dropEvt = new DragEvent('drop', {
      clientX,
      clientY,
      dataTransfer: dt,
      bubbles: true,
      cancelable: true
    });

    vp.dispatchEvent(dropEvt);
    await new Promise(r => setTimeout(r, 1200));

    const objs = cm.canvas.getObjects();
    return {
      totalObjs: objs.length,
      types: objs.map(o => o.type),
      names: objs.map(o => o.name),
      clips: objs.map(o => !!o.clipPath)
    };
  });

  expect(dropSuccess.clips[0]).toBe(true);
  expect(dropSuccess.names[0]).toContain('Clipped');

  // 3. Test dropping on an element from ElementLibrary
  const groupDropResult = await page.evaluate(async () => {
    const app = window.__editorApp;
    const cm = app.canvasManager;
    const canvas = cm.canvas;

    // Insert IG post element at (1000, 500)
    await app.elementsPanel.insertElement('ig-post', { x: 1000, y: 500 });

    const group = canvas.getObjects().find(o => o.name === 'Instagram post');

    // In IG post: Photo Frame is around scene x = 1000, scene y = 431
    const screenPt = cm.sceneToScreen(1000, 431);
    const vp = cm.getViewport();
    const vpRect = vp.getBoundingClientRect();
    const clientX = vpRect.left + screenPt.x;
    const clientY = vpRect.top + screenPt.y;

    const cv = document.createElement('canvas');
    cv.width = 100; cv.height = 100;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, 100, 100);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const file = new File([blob], 'photo2.png', { type: 'image/png' });

    const dt = new DataTransfer();
    dt.items.add(file);
    const dropEvt = new DragEvent('drop', {
      clientX, clientY, dataTransfer: dt, bubbles: true, cancelable: true
    });

    vp.dispatchEvent(dropEvt);
    await new Promise(r => setTimeout(r, 1200));

    const photoFrame = group?._objects?.find(o => o.name === 'Photo Frame');
    return {
      groupFound: !!group,
      photoFrameFillType: photoFrame?.fill?.type || typeof photoFrame?.fill,
      photoFrameIsFilled: photoFrame?.custom?.isFilled
    };
  });

  expect(groupDropResult.groupFound).toBe(true);
  expect(groupDropResult.photoFrameIsFilled).toBe(true);
  expect(pageErrors).toEqual([]);
});
