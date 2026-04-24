import { test, expect } from '@playwright/test';

test.describe('Booking Form Tests', () => {
  const mockState = {
    serviceTitle: 'Math Tutoring',
    pricePerHour: 500,
    selectedSlot: { time: '9:00 AM' },
    selectedDate: '2026-04-25'
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            authUser: {
              _id: 'test-user-123',
              fullName: 'Test User',
              email: 'test@example.com',
              phone: '0771234567'
            }
          }
        })
      );
    });

    // Mock API calls
    await page.route('**/api/services/calculate-payment', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            serviceFee: 1000,
            platformFee: 100,
            tax: 50,
            totalAmount: 1150
          }
        })
      });
    });

    await page.route('**/api/payments/booked-slots*', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        })
      });
    });

    await page.route('**/api/payments/validate-booking', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ success: true, errors: {} })
      });
    });

    await page.route('**/api/payments/upload', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          files: [{ name: 'file.pdf', url: '/file.pdf' }]
        })
      });
    });

    await page.route('**/api/payments/create-booking', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { _id: 'booking-123' }
        })
      });
    });

    // Go to page with route state
    await page.goto('http://localhost:5173/booking-form', {
      waitUntil: 'networkidle'
    });

    // Inject navigation state (React Router workaround)
    await page.evaluate((state) => {
      window.history.pushState({}, '', '/booking-form');
      window.__TEST_STATE__ = state;
    }, mockState);
  });

  test('should load booking form page', async ({ page }) => {
    await expect(page.getByText('Customer Booking Form')).toBeVisible();
  });

  test('should render form inputs', async ({ page }) => {
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="contact"]')).toBeVisible();
    await expect(page.locator('input[name="nic"]')).toBeVisible();
  });

  test('should allow filling customer details', async ({ page }) => {
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="contact"]', '0712345678');
    await page.fill('input[name="nic"]', '1234567890');

    await expect(page.locator('input[name="fullName"]')).toHaveValue('John Doe');
  });

  test('should add availability slot (file upload section exists)', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('should select time slot', async ({ page }) => {
    const select = page.locator('select[name="timeSlot"]');
    await select.selectOption({ index: 1 });

    await expect(select).not.toHaveValue('');
  });

  test('should submit booking successfully', async ({ page }) => {
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="contact"]', '0712345678');
    await page.fill('input[name="nic"]', '1234567890');
    await page.fill('input[name="address"]', 'Colombo');

    const select = page.locator('select[name="timeSlot"]');
    await select.selectOption({ index: 1 });

    await page.route('**/api/bookings', async route => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true })
        });
      }
    });

    await page.click('button[type="submit"]');

    // success navigation check
    await expect(page).toHaveURL(/booking-success/);
  });
});