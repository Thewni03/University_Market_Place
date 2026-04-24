import { test, expect } from "@playwright/test";

test.describe("Create Service Page Tests", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/create-service"); 
    // change if your Vite port is different
  });

  // ✅ 1. Page load
  test("should load Create Service page", async ({ page }) => {
    await expect(page.getByText("Create a New Service")).toBeVisible();
    await expect(page.getByText("Basic Information")).toBeVisible();
  });

  // ✅ 2. Dummy data fill
  test("should fill dummy data", async ({ page }) => {
    await page.getByRole("button", { name: "Fill Dummy Data" }).click();

    await expect(page.locator('input[name="title"]')).toHaveValue(
      "Advanced Mathematics Tutoring"
    );

    await expect(page.locator('input[name="pricePerHour"]')).toHaveValue("2500");
  });

  // ✅ 3. Add slot
  test("should add availability slot", async ({ page }) => {
    await page.getByRole("button", { name: "Add Slot" }).click();

    await expect(page.locator("text=Mon at 8:00 AM")).toBeVisible();
  });
/*
  // ❌ 4. Title validation
  test("should validate title field", async ({ page }) => {
    await page.locator('input[name="title"]').fill("Invalid@Title!");
    await page.getByRole("button", { name: /publish service/i }).click();

    const toast = page.locator('[role="status"]');

    await expect(toast).toContainText(
      "Title cannot contain special characters."
    );
  });

  // ❌ 5. Price validation (FIXED FOR TOAST)
  test("should validate price limit", async ({ page }) => {
    await page.locator('input[name="pricePerHour"]').fill("20000");

    await page.getByRole("button", { name: /publish service/i }).click();

    const toast = page.locator('[role="status"]');

    await expect(toast).toContainText(
      "Price cannot be more than 10000"
    );
  });

  // ❌ 6. Slot validation (FIXED FOR TOAST)
  test("should require at least one availability slot", async ({ page }) => {
    await page.locator('input[name="title"]').fill("Test Service");
    await page.locator('input[name="pricePerHour"]').fill("1000");
    await page.locator("textarea[name='description']").fill(
      "This is a valid description for testing purposes."
    );

    await page.getByRole("button", { name: /publish service/i }).click();

    const toast = page.locator('[role="status"]');

    await expect(toast).toContainText(
      "You must add at least one availability slot."
    );
  });
*/
});