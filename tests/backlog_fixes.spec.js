import { test, expect } from '@playwright/test';

test.describe('Task Backlog & Bug Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'load' });
    const welcome = page.locator('#welcome-screen');
    await welcome.waitFor({ timeout: 20000 });
    await page.locator('#new-blank').click();
    await welcome.waitFor({ state: 'hidden' });
    await page.waitForTimeout(400);
  });

  test('1. Ungroup matrix decomposition keeps objects in visual place', async ({ page }) => {
    const result = await page.evaluate(() => {
      const app = window.__editorApp;
      const f = window.fabric;
      const canvas = app.canvasManager.canvas;

      // Create two rects
      const r1 = new f.Rect({ left: 300, top: 200, width: 100, height: 80, fill: 'red' });
      const r2 = new f.Rect({ left: 450, top: 250, width: 80, height: 60, fill: 'blue' });
      canvas.add(r1, r2);

      // Select and group
      canvas.setActiveObject(new f.ActiveSelection([r1, r2], { canvas }));
      app.ops.group();

      const group = canvas.getActiveObject();
      // Move the group to another position
      group.set({ left: 500, top: 350 });
      group.setCoords();
      canvas.requestRenderAll();

      // Record visual positions before ungroup
      const r1Before = r1.calcTransformMatrix();
      const p1Before = f.util.qrDecompose(r1Before);
      const r2Before = r2.calcTransformMatrix();
      const p2Before = f.util.qrDecompose(r2Before);

      // Perform ungroup
      app.ops.ungroup();

      // Check positions after ungroup
      const r1After = r1.getCenterPoint ? r1.getCenterPoint() : { x: r1.left, y: r1.top };
      const r2After = r2.getCenterPoint ? r2.getCenterPoint() : { x: r2.left, y: r2.top };

      return {
        r1DiffX: Math.abs(p1Before.translateX - r1After.x),
        r1DiffY: Math.abs(p1Before.translateY - r1After.y),
        r2DiffX: Math.abs(p2Before.translateX - r2After.x),
        r2DiffY: Math.abs(p2Before.translateY - r2After.y),
        canvasCount: canvas.getObjects().length
      };
    });

    expect(result.canvasCount).toBe(2);
    expect(result.r1DiffX).toBeLessThan(2);
    expect(result.r1DiffY).toBeLessThan(2);
    expect(result.r2DiffX).toBeLessThan(2);
    expect(result.r2DiffY).toBeLessThan(2);
  });

  test('2. Photo placeholder / shape auto-clip mask execution', async ({ page }) => {
    const fillResult = await page.evaluate(async () => {
      const app = window.__editorApp;
      const f = window.fabric;
      const canvas = app.canvasManager.canvas;

      // Add a placeholder rect
      const rect = new f.Rect({ left: 200, top: 150, width: 250, height: 200, fill: '#EBE5DA', name: 'Photo Frame Box' });
      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.requestRenderAll();

      // Create a 1x1 data URL image to test clipping
      const dummyDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

      const host = await app.objectOps.fillStandalonePlaceholder(rect, dummyDataUrl);
      return {
        success: !!host,
        hasClipPath: host ? !!host.clipPath : false,
        name: host ? host.name : null
      };
    });

    expect(fillResult.success).toBe(true);
    expect(fillResult.hasClipPath).toBe(true);
  });

  test('3. Sidebar UI: Radius presets 5-grid and Border segmented styling', async ({ page }) => {
    // Add a rectangle and select it
    await page.evaluate(() => {
      const app = window.__editorApp;
      const f = window.fabric;
      const r = new f.Rect({ left: 100, top: 100, width: 120, height: 100, fill: '#7b46f8' });
      app.canvasManager.canvas.add(r);
      app.canvasManager.canvas.setActiveObject(r);
      app.canvasManager.canvas.requestRenderAll();
    });

    await page.waitForTimeout(300);

    // Verify Corner Radius presets container has .radius-presets
    const presets = page.locator('.radius-presets');
    await expect(presets).toBeVisible();

    // Verify exactly 5 chip buttons
    const chips = presets.locator('.chip-btn');
    await expect(chips).toHaveCount(5);
    await expect(chips.nth(0)).toHaveText('Sharp');
    await expect(chips.nth(1)).toHaveText('Soft');
    await expect(chips.nth(2)).toHaveText('Rounded');
    await expect(chips.nth(3)).toHaveText('Rounder');
    await expect(chips.nth(4)).toHaveText('Full');

    // Verify no button overflows outside container
    const presetBox = await presets.boundingBox();
    for (let i = 0; i < 5; i++) {
      const chipBox = await chips.nth(i).boundingBox();
      expect(chipBox.x + chipBox.width).toBeLessThanOrEqual(presetBox.x + presetBox.width + 1);
    }

    // Verify Border control has Solid and Dashed segmented buttons
    const borderCard = page.locator('.prop-card', { hasText: 'Border' });
    const segButtons = borderCard.locator('.segmented .seg-btn');
    await expect(segButtons.nth(0)).toHaveText('Solid');
    await expect(segButtons.nth(1)).toHaveText('Dashed');

    // Verify Photo Slot card exists in sidebar
    const photoSection = page.locator('.prop-card', { hasText: 'Photo Slot' });
    await expect(photoSection).toBeVisible();

    // Verify Transform Rotate row buttons fit within the card without overflow
    const transformCard = page.locator('.prop-card', { hasText: 'Transform' });
    const cardBox = await transformCard.boundingBox();
    const rotButtons = transformCard.locator('.icobtn[title*="Rotate"]');
    await expect(rotButtons).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const bBox = await rotButtons.nth(i).boundingBox();
      expect(bBox.x + bBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
    }
  });

  test('4. Template Chooser: 3 distinct action buttons & multi-select badge', async ({ page }) => {
    // Open Template Chooser via app
    await page.evaluate(() => {
      window.__editorApp.templateChooser.show({ mode: 'pack' });
    });

    const modal = page.locator('#template-chooser-modal');
    await expect(modal).toBeVisible();

    // Layout tiles should be visible
    const layouts = page.locator('.tc-layout');
    await expect(layouts.first()).toBeVisible();

    // Should have check badges
    const checkBadge = page.locator('.tc-check-badge').first();
    await expect(checkBadge).toBeVisible();

    // Actions bar should have:
    // 1. "Apply to This Page Only"
    // 2. "Insert as New Page"
    // 3. "Apply All Pages"
    const applyThisPage = page.locator('#tc-actions button', { hasText: 'Apply to This Page Only' });
    const insertNewPage = page.locator('#tc-actions button', { hasText: 'Insert as New Page' });
    const applyAllPages = page.locator('#tc-actions button', { hasText: 'Apply All Pages' });

    await expect(applyThisPage).toBeVisible();
    await expect(insertNewPage).toBeVisible();
    await expect(applyAllPages).toBeVisible();
  });
});
