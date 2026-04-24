import { test, expect } from '@playwright/test';

test.describe('Payment Page E2E', () => {

  test('user can type card details', async ({ page }) => {
    await page.goto('http://localhost:5173/payment');

    const cardInput = page.getByPlaceholder('0000 0000 0000 0000');

    await cardInput.fill('1234123412341234');

    await expect(cardInput).toHaveValue('1234 1234 1234 1234');
  });

  test('pay button is clickable', async ({ page }) => {
    await page.goto('http://localhost:5173/payment');

    const payBtn = page.getByRole('button', { name: /pay lkr/i });

    await expect(payBtn).toBeVisible();
    await payBtn.click();
  });

});