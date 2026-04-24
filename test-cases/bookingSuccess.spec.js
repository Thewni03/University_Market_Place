import { test, expect } from '@playwright/test';

test.describe('Booking Success Page Tests', () => {

  const mockState = {
    bookingId: 'UNI-999999',
    serviceName: 'Math Tutoring',
    customerName: 'John Doe',
    amount: '1500.00'
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((state) => {
      window.history.pushState(state, '', '/booking-success');
    }, mockState);

    await page.goto('http://localhost:5173/booking-success', {
      waitUntil: 'networkidle'
    });
  });

  test('should load booking success page', async ({ page }) => {
    await expect(page.getByText('Booking Confirmation')).toBeVisible();
    await expect(page.getByText('Your booking has been confirmed successfully!')).toBeVisible();
  });

  test('should show default booking ID if state missing', async ({ page }) => {
    await page.goto('http://localhost:5173/booking-success');

    await expect(page.getByText('UNI-2024-12345')).toBeVisible();
  });

  test('should render proceed to payment button', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Proceed to Payment/i });
    await expect(btn).toBeVisible();
  });

  test('should navigate to payment page on click', async ({ page }) => {
    await page.click('button:has-text("Proceed to Payment")');

    await expect(page).toHaveURL(/\/payment/);
  });

});