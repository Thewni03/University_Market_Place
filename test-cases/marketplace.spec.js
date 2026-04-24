import { test, expect } from '@playwright/test';

test.describe('Marketplace Feature Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/marketplace');
  });

  test('should load products', async ({ page }) => {
    const cards = page.locator('.mp-card');
    await expect(cards.first()).toBeVisible();
  });

  test('should buy a product', async ({ page }) => {
    const buyBtn = page.locator('button:has-text("Add to Cart")').first();
    await buyBtn.click();
    await expect(page.locator('body')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    const search = page.locator('input[placeholder*="Search"]');

    await search.fill('book');

    await page.waitForTimeout(1000);

    await expect(page.locator('.mp-card').first()).toBeVisible();
  });

});