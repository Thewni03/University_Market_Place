import { test, expect } from "@playwright/test";

const URL = "http://localhost:5173/chat"; // adjust if route differs

test.describe("Chat Page Tests", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("should not show error or blank page", async ({ page }) => {
    const errorText = page.locator("text=Error");
    const blank = page.locator("text=Cannot");

    await expect(errorText.or(blank)).toHaveCount(0);
  });

});