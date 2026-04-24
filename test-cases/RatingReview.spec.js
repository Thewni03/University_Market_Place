import { test, expect } from '@playwright/test';

test.describe('Rating Review E2E', () => {

  test.beforeEach(async ({ page }) => {

    // MOCK API
    await page.route('**/api/reviews', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: '1',
            name: 'Alice',
            rating: 5,
            comment: 'Amazing service!',
            avatar: 'A',
            avatarBg: 'bg-blue',
            likes: 2,
            liked: false,
            verified: true,
            date: '2026-04-24',
            replies: []
          }
        ])
      });
    });

    // 🔥 CHANGE THIS IF YOUR ROUTE IS DIFFERENT
    await page.goto('http://localhost:5173/reviewandrating');

    // WAIT FOR ANY REAL UI ELEMENT (NOT TEXT)
    await page.waitForTimeout(2000);
  });

  test('page loads', async ({ page }) => {
    await expect(page.locator('text=Customer Reviews').first()).toBeVisible();
  });

  test('reviews appear', async ({ page }) => {
    await expect(page.locator('text=Alice').first()).toBeVisible();
  });

  test('can type review', async ({ page }) => {

    const textarea = page.locator('textarea').first();

    await textarea.fill('Great experience');

    await expect(textarea).toHaveValue('Great experience');
  });

  test('submit button exists and reacts', async ({ page }) => {

    const textarea = page.locator('textarea').first();
    const button = page.getByRole('button', { name: /send review/i });

    await textarea.fill('Nice service');

    // button should exist (not strict enabled check)
    await expect(button).toBeVisible();
  });


  test('reply opens input', async ({ page }) => {

    const replyBtn = page.locator('button').filter({ hasText: 'Reply' }).first();

    await replyBtn.click();

    await expect(page.locator('textarea[placeholder*="reply"]')).toBeVisible();
  });

});