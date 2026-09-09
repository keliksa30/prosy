import { test, expect } from '@playwright/test';

async function openBlank(page) {
  await page.goto('http://localhost:5173/');
  const welcome = page.locator('#welcome-screen');
  await expect(welcome).toBeVisible();
  await page.locator('#new-blank').click();
  await expect(welcome).toBeHidden();
}

test.describe('Prosy Portfolio Builder Tests', () => {
  test('should load the Welcome screen and navigate to Editor', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const welcomeTitle = page.locator('text="Start something good"');
    await expect(welcomeTitle).toBeVisible();

    const blankCard = page.locator('#new-blank');
    await expect(blankCard).toBeVisible();
    await blankCard.click();

    const selectToolBtn = page.locator('.tool-btn').filter({ hasText: 'Select' });
    await expect(selectToolBtn).toBeVisible();

    // Filmstrip says "Pages" and shows one page
    await expect(page.locator('.filmstrip-title')).toHaveText('Pages');

    // Add a page (filmstrip bottom row)
    await page.locator('#btn-filmstrip-addrow').click();
    const pages = page.locator('.filmstrip-item');
    await expect(pages).toHaveCount(2);
  });

  test('should open templates modal with packs', async ({ page }) => {
    await openBlank(page);

    await page.locator('#btn-templates').click();
    const modal = page.locator('#template-chooser-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text="Studio Today"')).toBeVisible();
    await expect(modal.locator('text="Neo Studio"')).toBeVisible();
    await expect(modal.locator('text="Jost Brand"')).toBeVisible();
    await expect(modal.locator('text="Digital Portfolio"')).toBeVisible();
  });

  test('apply a template pack replaces pages', async ({ page }) => {
    await openBlank(page);
    await page.locator('#btn-templates').click();
    const modal = page.locator('#template-chooser-modal');
    await modal.locator('.tc-pack', { hasText: 'Studio Today' }).click();
    await modal.locator('button', { hasText: 'Use this template' }).click();
    // Studio Today has 6 pages
    await expect(page.locator('.filmstrip-item')).toHaveCount(6);
  });
});
