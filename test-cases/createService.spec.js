import { test, expect } from '@playwright/test';

test.describe('Create Service Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    const fakeUserId = '64f1c2a8f1a2b3c4d5e6f789';

    await page.addInitScript((id) => {
      localStorage.setItem('userId', id);
      localStorage.setItem('ownerId', id);
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: id,
          fullname: 'Test User'
        })
      );
    }, fakeUserId);

    await page.route('**/api/services/meta', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            days: ['Mon', 'Tue', 'Wed'],
            times: ['9:00 AM', '10:00 AM', '2:00 PM'],
          },
        }),
      });
    });

    await page.route('**/api/services', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
        }),
      });
    });

    await page.goto('http://localhost:5173/create-service');
  });
  test('should allow filling service title and description', async ({ page }) => {
    await page.fill('input[placeholder="e.g. Advanced Calculus Tutoring"]', 'Math Tutoring');
    await page.fill('textarea', 'I provide advanced math tutoring for university students');

    await expect(page.locator('input[placeholder="e.g. Advanced Calculus Tutoring"]'))
      .toHaveValue('Math Tutoring');
  });
  test('should change location mode', async ({ page }) => {
    await page.click('text=On-Campus');
    await expect(page.getByText('On-Campus')).toBeVisible();
  });
});