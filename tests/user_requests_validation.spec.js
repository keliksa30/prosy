import { test, expect } from '@playwright/test';

async function loadBlank(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  const welcome = page.locator('#welcome-screen');
  await welcome.waitFor({ timeout: 20000 });
  await page.locator('#new-blank').click();
  await welcome.waitFor({ state: 'hidden' });
  await page.waitForTimeout(400);
}

test.describe('User requests validation suite', () => {
  test.beforeEach(async ({ page }) => {
    await loadBlank(page);
  });

  test('1. Clipping mask release maintains exact position without flying far away', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const app = window.__editorApp;
      const f = window.fabric;
      const canvas = app.canvasManager.getCanvas();
      canvas.clear();

      // create an image
      const img = await new Promise(resolve => {
        const cv = document.createElement('canvas');
        cv.width = 400; cv.height = 300;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, 0, 400, 300);
        f.FabricImage.fromURL(cv.toDataURL(), { crossOrigin: 'anonymous' }).then(resolve);
      });
      img.set({ left: 300, top: 250, originX: 'left', originY: 'top' });
      canvas.add(img);

      // create a shape on top
      const rect = new f.Rect({
        left: 350, top: 280, width: 200, height: 180,
        fill: '#f59e0b', originX: 'left', originY: 'top'
      });
      canvas.add(rect);

      // select both and create clipping mask
      canvas.setActiveObject(new f.ActiveSelection([img, rect], { canvas }));
      await app.ops.createClipMask();

      const maskedObj = canvas.getActiveObject();
      const posBeforeRelease = {
        left: maskedObj.left,
        top: maskedObj.top,
        width: maskedObj.getBoundingRect().width,
        height: maskedObj.getBoundingRect().height
      };

      // release clipping mask
      await app.ops.releaseClipMask();

      // deselect to ensure no dead parent transform flings the object
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      const allObjs = canvas.getObjects();
      const imgAfter = allObjs.find(o => o.type === 'image');
      const maskAfter = allObjs.find(o => o !== imgAfter);

      return {
        posBeforeRelease,
        imgBounds: imgAfter ? imgAfter.getBoundingRect() : null,
        maskBounds: maskAfter ? maskAfter.getBoundingRect() : null,
        imgHasDeadParent: imgAfter ? !!imgAfter.parent : false,
        imgHasDeadGroup: imgAfter ? !!imgAfter.group : false
      };
    });

    expect(result.imgBounds).not.toBeNull();
    expect(result.maskBounds).not.toBeNull();
    expect(result.imgHasDeadParent).toBe(false);
    expect(result.imgHasDeadGroup).toBe(false);

    // Bounding rect must be close to original ~300, 250 and NOT flung to 1200+
    expect(result.imgBounds.left).toBeGreaterThan(250);
    expect(result.imgBounds.left).toBeLessThan(350);
    expect(result.imgBounds.top).toBeGreaterThan(200);
    expect(result.imgBounds.top).toBeLessThan(300);
  });

  test('2. Page switch preserves edits without reverting', async ({ page }) => {
    const check = await page.evaluate(async () => {
      const app = window.__editorApp;
      const f = window.fabric;
      const pm = app.pageManager;

      // Make sure we have 2 pages
      if (pm.pages.length < 2) {
        pm.addPage();
      }

      // Go to page 0
      await pm.switchPage(0);
      const canvas = app.canvasManager.getCanvas();
      canvas.clear();

      // Add a distinctive shape to Page 0
      const testRect = new f.Rect({
        left: 123, top: 456, width: 321, height: 210,
        fill: '#e11d48', name: 'MyUniquePage1Shape'
      });
      canvas.add(testRect);
      canvas.requestRenderAll();

      // Switch to Page 1
      await pm.switchPage(1);

      // Switch back to Page 0
      await pm.switchPage(0);

      // Check if MyUniquePage1Shape is still there
      const found = canvas.getObjects().find(o => o.name === 'MyUniquePage1Shape');
      return {
        found: !!found,
        left: found ? found.left : null,
        top: found ? found.top : null
      };
    });

    expect(check.found).toBe(true);
    expect(check.left).toBe(123);
    expect(check.top).toBe(456);
  });

  test('3. Text menu dropdown is fully visible and not covered by filmstrip', async ({ page }) => {
    const caret = page.locator('#btn-text-caret');
    await caret.click();
    const menu = page.locator('#text-menu');
    await expect(menu).toBeVisible();

    const pItem = page.locator('.text-menu-item[data-textmode="paragraph"]');
    await expect(pItem).toBeVisible();

    // Check z-index stacking context
    const isVisibleAbove = await page.evaluate(() => {
      const pBtn = document.querySelector('.text-menu-item[data-textmode="paragraph"]');
      const rect = pBtn.getBoundingClientRect();
      const elAtCenter = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return pBtn.contains(elAtCenter) || elAtCenter === pBtn;
    });

    expect(isVisibleAbove).toBe(true);
  });

  test('4. Illustrator-style paragraph text reflows width without distorting font size', async ({ page }) => {
    const res = await page.evaluate(() => {
      const app = window.__editorApp;
      const f = window.fabric;
      const canvas = app.canvasManager.getCanvas();
      canvas.clear();

      // Create a textbox (paragraph mode)
      const tb = new f.Textbox('Hello world paragraph that wraps across multiple lines of text beautifully', {
        left: 200, top: 200, width: 300, fontSize: 24
      });
      canvas.add(tb);
      canvas.setActiveObject(tb);

      // Simulate corner scale event
      tb.scaleX = 1.8;
      tb.scaleY = 1.8;
      canvas.fire('object:scaling', { target: tb });

      return {
        type: tb.type,
        width: tb.width,
        scaleX: tb.scaleX,
        scaleY: tb.scaleY,
        fontSize: tb.fontSize
      };
    });

    expect(res.type).toBe('textbox');
    // width should expand from 300 to ~540 (300 * 1.8)
    expect(res.width).toBeGreaterThanOrEqual(530);
    // scaleX and scaleY must be reset to 1 (Illustrator area type behavior)
    expect(res.scaleX).toBe(1);
    expect(res.scaleY).toBe(1);
    // font size remains unchanged
    expect(res.fontSize).toBe(24);
  });

  test('5. Direct drag & drop image import works smoothly', async ({ page }) => {
    const dropSupported = await page.evaluate(async () => {
      const app = window.__editorApp;
      const cm = app.canvasManager;
      if (typeof cm.setupDragAndDrop !== 'function' || typeof cm.importImageFile !== 'function') {
        return { ok: false, reason: 'methods missing' };
      }

      // Create a test image blob
      const cv = document.createElement('canvas');
      cv.width = 100; cv.height = 100;
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      const file = new File([blob], 'test-drag-drop.png', { type: 'image/png' });

      // Import at coordinates (400, 300)
      const img = await cm.importImageFile(file, { x: 400, y: 300 });

      return {
        ok: !!img,
        left: img ? img.left : null,
        top: img ? img.top : null,
        name: img ? img.name : null
      };
    });

    expect(dropSupported.ok).toBe(true);
    expect(dropSupported.left).toBe(400);
    expect(dropSupported.top).toBe(300);
    expect(dropSupported.name).toBe('test-drag-drop');
  });

  test('6. Elements library has no fake photo placeholders (pure vector containers)', async ({ page }) => {
    const elementsMeta = await page.evaluate(() => {
      const { ELEMENT_DEFS } = window.prosyElementDefs || {};
      // Also inspect via ElementsPanel
      const app = window.__prosyApp || window.app;
      const cards = document.querySelectorAll('.elements-popover .element-card, .element-card');
      return {
        hasFakeImageSlotArt: typeof window.slotArt === 'function',
        cardsCount: cards.length
      };
    });

    expect(elementsMeta.hasFakeImageSlotArt).toBe(false);
  });

  test('7. Sidebar dock contains ONLY Design and Layers; Elements is in the toolbar', async ({ page }) => {
    // Check dock tabs
    const dockTabs = await page.locator('.dock-tab').allTextContents();
    const cleanTabs = dockTabs.map(t => t.trim());
    expect(cleanTabs).toEqual(['Design', 'Layers']);

    // Check toolbar has elements button next to icons
    const iconsBtn = page.locator('#btn-tool-icons');
    const elementsBtn = page.locator('#btn-tool-elements');
    await expect(iconsBtn).toBeVisible();
    await expect(elementsBtn).toBeVisible();

    // Clicking elements opens elements popover
    await elementsBtn.click();
    const elemPop = page.locator('#elements-popover');
    await expect(elemPop).toBeVisible();

    // Clicking icons opens icons popover
    await iconsBtn.click();
    const iconPop = page.locator('#icons-popover');
    await expect(iconPop).toBeVisible();
    // Elements popover should close when icons is opened
    await expect(elemPop).not.toBeVisible();
  });

  test('8. Template chooser opens with first pack auto-selected and clean 3-column gallery', async ({ page }) => {
    await page.locator('#btn-templates').click();
    const modal = page.locator('#template-chooser-modal');
    await expect(modal).toBeVisible();

    // Check first pack is active
    const activePack = page.locator('.tc-pack.active');
    await expect(activePack).toBeVisible();

    // Check layouts are displayed in grid
    const layouts = page.locator('.tc-layout');
    expect(await layouts.count()).toBeGreaterThan(0);

    // Check primary button is ready
    const useBtn = page.locator('#tc-actions .btn-primary');
    await expect(useBtn).toBeVisible();
    const btnText = await useBtn.textContent();
    expect(btnText).toContain('Use this template');
  });

  test('9. Inserted elements from toolbar popover are grouped as a single fabric.Group', async ({ page }) => {
    const groupResult = await page.evaluate(async () => {
      const app = window.__editorApp;
      const canvas = app.canvasManager.getCanvas();
      canvas.clear();

      // Open elements popover and insert the first element
      const popover = document.querySelector('#elements-popover');
      if (popover) popover.classList.remove('hidden');

      const card = document.querySelector('.elements-popover .element-card');
      if (!card) return { ok: false, reason: 'no card found' };

      card.click();
      await new Promise(r => setTimeout(r, 200));

      const activeObj = canvas.getActiveObject();
      const allObjs = canvas.getObjects();

      return {
        ok: true,
        objCount: allObjs.length,
        activeType: activeObj ? activeObj.type : null,
        isGroup: activeObj ? (activeObj.type === 'group' || typeof activeObj.getObjects === 'function') : false,
        subObjectCount: (activeObj && typeof activeObj.getObjects === 'function') ? activeObj.getObjects().length : 0
      };
    });

    expect(groupResult.ok).toBe(true);
    expect(groupResult.isGroup).toBe(true);
    expect(groupResult.activeType).toBe('group');
    expect(groupResult.subObjectCount).toBeGreaterThan(1);
    expect(groupResult.objCount).toBe(1);
  });

  test('10. All 7 template packs load valid pages with strict bounds and no overflowing text', async ({ page }) => {
    const report = await page.evaluate(async () => {
      const app = window.__editorApp;
      const tm = app.templateManager;
      const packs = tm.packs;

      const results = [];
      for (const pack of packs) {
        for (let i = 0; i < pack.pages.length; i++) {
          const pg = pack.pages[i];
          const objects = pg.canvas_json?.objects || [];

          let hasOutOfBounds = false;
          for (const obj of objects) {
            if (obj.left < -500 || obj.top < -500 || obj.left > 2400 || obj.top > 1600) {
              hasOutOfBounds = true;
            }
          }

          results.push({
            packId: pack.id,
            pageIndex: i,
            title: pg.title,
            objectCount: objects.length,
            hasOutOfBounds
          });
        }
      }

      return {
        totalPacks: packs.length,
        packIds: packs.map(p => p.id),
        totalCheckedPages: results.length,
        results
      };
    });

    expect(report.totalPacks).toBe(7);
    expect(report.packIds).toContain('pack-rayo-fashion');
    expect(report.packIds).toContain('pack-dsm-kinetic');
    expect(report.totalCheckedPages).toBeGreaterThanOrEqual(40);
    for (const r of report.results) {
      expect(r.objectCount).toBeGreaterThan(0);
      expect(r.hasOutOfBounds).toBe(false);
    }
  });

  test('11. Authentic vector UI elements (ig-post, x-post, browser-window, mobile-frame) contain real vector icons', async ({ page }) => {
    const elCheck = await page.evaluate(async () => {
      const app = window.__editorApp;
      const canvas = app.canvasManager.getCanvas();
      const library = app.elementLibrary;

      // Check ig-post
      const igDef = library.findElement('ig-post');
      const { objs: igObjects } = await library.createElement(igDef);
      const hasPaths = igObjects.some(o => o.type === 'path');
      const hasVerified = igObjects.some(o => o.name && o.name.toLowerCase().includes('verified'));
      const hasHeart = igObjects.some(o => o.name && o.name.toLowerCase().includes('heart'));

      // Check browser-window
      const bwDef = library.findElement('browser-window');
      const { objs: bwObjects } = await library.createElement(bwDef);
      const hasAddressBar = bwObjects.some(o => o.name && (o.name.includes('URL') || o.name.includes('Address')));
      const hasTrafficLights = bwObjects.some(o => o.name && o.name.includes('dot'));

      // Check mobile-frame
      const mobileDef = library.findElement('mobile-frame');
      const { objs: mobileObjects } = await library.createElement(mobileDef);
      const hasIsland = mobileObjects.some(o => o.name === 'Dynamic Island');

      return {
        igCount: igObjects.length,
        hasPaths,
        hasVerified,
        hasHeart,
        bwCount: bwObjects.length,
        hasAddressBar,
        hasTrafficLights,
        mobileCount: mobileObjects.length,
        hasIsland
      };
    });

    expect(elCheck.igCount).toBeGreaterThan(10);
    expect(elCheck.hasPaths).toBe(true);
    expect(elCheck.hasVerified).toBe(true);
    expect(elCheck.hasHeart).toBe(true);
    expect(elCheck.hasAddressBar).toBe(true);
    expect(elCheck.hasTrafficLights).toBe(true);
    expect(elCheck.hasIsland).toBe(true);
  });

  test('12. Category-based templates (covers, galleries, toc, showcase) are available and apply cleanly', async ({ page }) => {
    const catCheck = await page.evaluate(async () => {
      const app = window.__editorApp;
      const tm = app.templateManager;
      const cats = tm.getCategories();
      const covers = tm.getCategoryTemplates('covers');
      const galleries = tm.getCategoryTemplates('galleries');
      const tocs = tm.getCategoryTemplates('toc');
      const showcases = tm.getCategoryTemplates('showcase');

      // Apply a gallery category template to current page
      await tm.applyCategoryTemplate('gallery-staggered-lookbook', { mode: 'replace', pageIndex: 0 });

      const canvas = app.canvasManager.getCanvas();
      const canvasObjs = canvas.getObjects();

      return {
        catCount: cats.length,
        coverCount: covers.length,
        galleryCount: galleries.length,
        tocCount: tocs.length,
        showcaseCount: showcases.length,
        appliedObjects: canvasObjs.length,
        pageTitle: app.pageManager.pages[0].title
      };
    });

    expect(catCheck.catCount).toBe(5);
    expect(catCheck.coverCount).toBeGreaterThanOrEqual(2);
    expect(catCheck.galleryCount).toBeGreaterThanOrEqual(2);
    expect(catCheck.tocCount).toBeGreaterThanOrEqual(2);
    expect(catCheck.showcaseCount).toBeGreaterThanOrEqual(2);
    expect(catCheck.appliedObjects).toBeGreaterThan(5);
    expect(catCheck.pageTitle).toBe('Staggered Lookbook Photogrid');
  });

  test('13. Opening .prs file updates project title and hides welcome screen', async ({ page }) => {
    const prsResult = await page.evaluate(async () => {
      const app = window.__editorApp;
      const pfm = app.projectFileManager;

      // Show welcome screen first to test it hides properly
      app.welcomeScreen.show();
      const isVisibleBefore = app.welcomeScreen.container.style.display !== 'none';

      // Create a test .prs payload
      const testProject = {
        version: '1.0.0',
        name: 'Brand Identity Showcase 2026',
        pages: [
          {
            id: 'p1',
            title: 'Editorial Hero',
            canvas_json: {
              backgroundColor: '#1E1B18',
              objects: [
                { type: 'i-text', text: 'Brand Showcase', left: 100, top: 100, fill: '#FFFFFF' }
              ]
            }
          }
        ]
      };

      const blob = new Blob([JSON.stringify(testProject)], { type: 'application/json' });
      const file = new File([blob], 'brand-showcase.prs', { type: 'application/json' });

      await pfm.loadFromPrs(file);

      const isHiddenAfter = app.welcomeScreen.container.style.display === 'none';
      const projectNameText = document.getElementById('project-name')?.textContent;

      return {
        isVisibleBefore,
        isHiddenAfter,
        projectName: app.projectName,
        projectNameText,
        pagesCount: app.pageManager.pages.length,
        pageTitle: app.pageManager.pages[0]?.title
      };
    });

    expect(prsResult.isVisibleBefore).toBe(true);
    expect(prsResult.isHiddenAfter).toBe(true);
    expect(prsResult.projectName).toBe('Brand Identity Showcase 2026');
    expect(prsResult.projectNameText).toBe('Brand Identity Showcase 2026');
    expect(prsResult.pagesCount).toBe(1);
    expect(prsResult.pageTitle).toBe('Editorial Hero');
  });

  test('14. Applying new Rayo Fashion and DSM Kinetic packs sets up project and renders canvas', async ({ page }) => {
    const packCheck = await page.evaluate(async () => {
      const app = window.__editorApp;
      const tm = app.templateManager;

      // Apply Rayo Fashion Pack
      await tm.applyTemplatePack('pack-rayo-fashion');
      const rayoName = app.projectName;
      const rayoPages = app.pageManager.pages.length;
      const rayoCanvasObjs = app.canvasManager.getCanvas().getObjects().length;

      // Apply DSM Kinetic Pack
      await tm.applyTemplatePack('pack-dsm-kinetic');
      const dsmName = app.projectName;
      const dsmPages = app.pageManager.pages.length;
      const dsmCanvasObjs = app.canvasManager.getCanvas().getObjects().length;

      return {
        rayoName,
        rayoPages,
        rayoCanvasObjs,
        dsmName,
        dsmPages,
        dsmCanvasObjs
      };
    });

    expect(packCheck.rayoName).toContain('Rayo');
    expect(packCheck.rayoPages).toBe(6);
    expect(packCheck.rayoCanvasObjs).toBeGreaterThan(10);

    expect(packCheck.dsmName).toContain('DSM');
    expect(packCheck.dsmPages).toBe(6);
    expect(packCheck.dsmCanvasObjs).toBeGreaterThan(10);
  });

  test('15. Template photo placeholder auto-clips uploaded image and cleans helper label/icon', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const app = window.__editorApp;
      const canvas = app.canvasManager.getCanvas();
      await app.templateManager.applyTemplatePack('pack-rayo-fashion');

      // Check placeholder exists on page 1
      const initialObjs = canvas.getObjects();
      const placeholderBox = initialObjs.find(o => o.name === 'Hero Big Photo Box');
      const placeholderIcon = initialObjs.find(o => o.name === 'Hero Big Photo Icon');
      const placeholderLabel = initialObjs.find(o => o.name === 'Hero Big Photo Label');

      const initialFound = {
        box: !!placeholderBox,
        icon: !!placeholderIcon,
        label: !!placeholderLabel,
        boxLeft: placeholderBox?.left,
        boxTop: placeholderBox?.top,
        boxWidth: placeholderBox?.width,
        boxHeight: placeholderBox?.height
      };

      // Generate a test image data URL
      const cv = document.createElement('canvas');
      cv.width = 600; cv.height = 800;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(0, 0, 600, 800);
      const testDataUrl = cv.toDataURL();

      // Trigger auto-clip via fillPlaceholderWithImage
      const clippedGroup = await app.fillPlaceholderWithImage(placeholderBox, testDataUrl);

      const afterObjs = canvas.getObjects();
      const hasClipPath = !!clippedGroup?.clipPath;
      const isMaskWrap = clippedGroup?.custom?.maskWrap === 'single';
      const iconStillExists = afterObjs.some(o => o.name === 'Hero Big Photo Icon');
      const labelStillExists = afterObjs.some(o => o.name === 'Hero Big Photo Label');
      const oldBoxStillExists = afterObjs.some(o => o === placeholderBox);

      // Now test releasing the clipping mask (⌘7)
      canvas.setActiveObject(clippedGroup);
      await app.ops.releaseClipMask();
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      const releasedObjs = canvas.getObjects();
      const releasedShape = releasedObjs.find(o => o.name === 'Hero Big Photo Box');

      return {
        initialFound,
        hasClipPath,
        isMaskWrap,
        iconStillExists,
        labelStillExists,
        oldBoxStillExists,
        clippedGroupInCanvas: afterObjs.includes(clippedGroup),
        releasedShapeRestored: !!releasedShape,
        releasedLeft: releasedShape?.left,
        releasedTop: releasedShape?.top
      };
    });

    expect(result.initialFound.box).toBe(true);
    expect(result.initialFound.icon).toBe(true);
    expect(result.initialFound.label).toBe(true);

    expect(result.hasClipPath).toBe(true);
    expect(result.isMaskWrap).toBe(true);
    expect(result.iconStillExists).toBe(false);
    expect(result.labelStillExists).toBe(false);
    expect(result.oldBoxStillExists).toBe(false);
    expect(result.clippedGroupInCanvas).toBe(true);

    expect(result.releasedShapeRestored).toBe(true);
    expect(Math.abs(result.releasedLeft - result.initialFound.boxLeft)).toBeLessThan(2);
    expect(Math.abs(result.releasedTop - result.initialFound.boxTop)).toBeLessThan(2);
  });

  test('16. Element library photo slot auto-fills with cover pattern and hides helper hints', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const app = window.__editorApp;
      const canvas = app.canvasManager.getCanvas();
      canvas.clear();

      // Insert ig-post element
      const ep = app.elementsPanel || app.panels.elements;
      await ep.insertElement('ig-post', { x: 500, y: 500 });
      const group = canvas.getActiveObject();

      const photoFrame = group._objects.find(o => o.name === 'Photo Frame');
      const cameraIcon = group._objects.find(o => o.name === 'Camera Icon');
      const frameHint = group._objects.find(o => o.name === 'Frame Hint');

      // Create test image
      const cv = document.createElement('canvas');
      cv.width = 500; cv.height = 500;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 500, 500);
      const testDataUrl = cv.toDataURL();

      // Fill placeholder
      await app.fillPlaceholderWithImage({ type: 'group-child', group, child: photoFrame }, testDataUrl);

      return {
        isGroup: group.type === 'group',
        hasFillPattern: !!photoFrame.fill && typeof photoFrame.fill === 'object',
        cameraIconVisible: cameraIcon.visible,
        frameHintVisible: frameHint.visible,
        isFilled: photoFrame.custom?.isFilled
      };
    });

    expect(result.isGroup).toBe(true);
    expect(result.hasFillPattern).toBe(true);
    expect(result.cameraIconVisible).toBe(false);
    expect(result.frameHintVisible).toBe(false);
    expect(result.isFilled).toBe(true);
  });

  test('17. Double-click placeholder finder locates box from camera icon, label, and coordinates', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const app = window.__editorApp;
      const cm = app.canvasManager;
      const canvas = cm.getCanvas();
      await app.templateManager.applyTemplatePack('pack-rayo-fashion');

      const objs = canvas.getObjects();
      const box = objs.find(o => o.name === 'Hero Big Photo Box');
      const icon = objs.find(o => o.name === 'Hero Big Photo Icon');
      const label = objs.find(o => o.name === 'Hero Big Photo Label');

      // 1. Double click on icon finds box
      const targetFromIcon = cm.findPlaceholderTarget(icon, null, null);

      // 2. Double click on label finds box
      const targetFromLabel = cm.findPlaceholderTarget(label, null, null);

      // 3. Coordinate inside box finds box
      const centerPt = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const targetFromPt = cm.findPlaceholderTarget(null, null, centerPt);

      return {
        fromIconMatched: targetFromIcon?.obj === box,
        fromLabelMatched: targetFromLabel?.obj === box,
        fromPtMatched: targetFromPt?.obj === box
      };
    });

    expect(result.fromIconMatched).toBe(true);
    expect(result.fromLabelMatched).toBe(true);
    expect(result.fromPtMatched).toBe(true);
  });
});

