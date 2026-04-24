import { test, expect } from '@playwright/test';

test.describe('Rating Review E2E', () => {

  test.beforeEach(async ({ page }) => {

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

    await page.goto('http://localhost:5173/reviewandrating');

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

    await expect(button).toBeVisible();
  });


  test('reply opens input', async ({ page }) => {

    const replyBtn = page.locator('button').filter({ hasText: 'Reply' }).first();

    await replyBtn.click();

    await expect(page.locator('textarea[placeholder*="reply"]')).toBeVisible();
  });

});