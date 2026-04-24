import { test, expect } from '@playwright/test';

const mockService = {
  _id: "service123",
  title: "Math Tutoring",
  category: "Education",
  description: "Professional math tutoring service",
  pricePerHour: 1500,
  locationMode: "Online",
  viewCount: 120,
  reviews: [{ rating: 5 }, { rating: 4 }],
  availabilitySlots: [
    { day: "Monday", time: "10:00 AM" },
    { day: "Monday", time: "2:00 PM" }
  ],
  ownerId: {
    _id: "owner1",
    fullname: "John Doe"
  },
  workSamples: [
    { url: "/uploads/sample1.jpg" }
  ]
};

test.describe('Service Detail Page Tests', () => {

  test.beforeEach(async ({ page }) => {

    await page.route('**/api/services/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockService })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem("userId", "user123");
    });

    await page.goto('http://localhost:5173/service/service123');
  });

  test('should load service detail page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText("Math Tutoring");
  });

  test('should display service stats correctly', async ({ page }) => {
    await expect(page.locator('text=120 views')).toBeVisible();
    await expect(page.locator('text=2 reviews')).toBeVisible();
    await expect(page.locator('text=Rs 1500')).toBeVisible();
  });

  test('should render work samples if available', async ({ page }) => {
    const images = page.locator('img');
    await expect(images.first()).toBeVisible();
  });

  test('should show available slots', async ({ page }) => {
    await expect(page.locator('text=Monday')).toBeVisible();
    await expect(page.locator('text=10:00 AM')).toBeVisible();
    await expect(page.locator('text=2:00 PM')).toBeVisible();
  });

  test('should allow selecting a slot', async ({ page }) => {
    await page.click('text=10:00 AM');
    await expect(page.locator('button:has-text("Book for Monday at 10:00 AM")')).toBeVisible();
  });

});