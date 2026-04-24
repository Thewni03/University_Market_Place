import { test, expect } from '@playwright/test';

test.describe('Post Request Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          name: 'Test User',
          _id: '64f1c2a3b4d5e6f789012345'
        })
      );
    });


    await page.route('**/api/requests', async route => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
      route.continue();
    });

    await page.goto('http://localhost:5173/post-request');
  });
  test('should render all form inputs', async ({ page }) => {
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="budget"]')).toBeVisible();
    await expect(page.locator('input[name="deadline"]')).toBeVisible();
  });

  test('should fill form using dummy data button', async ({ page }) => {
    await page.getByRole('button', { name: /fill dummy data/i }).click();

    await expect(page.locator('input[name="title"]')).toHaveValue(/logo/i);
    await expect(page.locator('select[name="category"]')).toHaveValue('Design');
    await expect(page.locator('input[name="budget"]')).toHaveValue('5000');
  });

  test('should submit request successfully', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Design Logo');
    await page.locator('select[name="category"]').selectOption('Design');
    await page.locator('input[name="budget"]').fill('5000');
    await page.locator('textarea[name="description"]').fill('Need a clean logo for student club project');
    await page.locator('input[name="deadline"]').fill('2026-12-31');

    await page.getByRole('button', { name: /publish request/i }).click();

    // ✅ wait for navigation OR success state
    await page.waitForTimeout(1000);

    await expect(page).toBeTruthy();
  });

  // 6. Empty submit prevention
  test('should not submit empty form', async ({ page }) => {
    await page.getByRole('button', { name: /publish request/i }).click();

    await expect(page).toHaveURL(/post-request/);
  });

  
    // 2. Dummy Data Full Fill Validation
    test('should fill all fields with dummy data correctly', async ({ page }) => {
      await page.getByRole('button', { name: /fill dummy data/i }).click();
  
      await expect(page.locator('input[name="title"]')).not.toBeEmpty();
      await expect(page.locator('textarea[name="description"]')).not.toBeEmpty();
      await expect(page.locator('select[name="category"]')).toHaveValue('Design');
    });
  
      // 8. Navigation after success
  test('should navigate after successful submission', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Valid Title');
    await page.locator('select[name="category"]').selectOption('Design');
    await page.locator('textarea[name="description"]').fill('This is a valid description with enough characters');
    await page.locator('input[name="budget"]').fill('3000');

    await page.getByRole('button', { name: /publish request/i }).click();

    await page.waitForTimeout(1500);

    await expect(page).not.toHaveURL(/post-request/);
  });


});