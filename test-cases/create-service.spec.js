import { test, expect } from "@playwright/test";

test.describe("Create Service Page Tests", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/create-service"); 

  });


  test("should load Create Service page", async ({ page }) => {
    await expect(page.getByText("Create a New Service")).toBeVisible();
    await expect(page.getByText("Basic Information")).toBeVisible();
  });


  test("should fill dummy data", async ({ page }) => {
    await page.getByRole("button", { name: "Fill Dummy Data" }).click();

    await expect(page.locator('input[name="title"]')).toHaveValue(
      "Advanced Mathematics Tutoring"
    );

    await expect(page.locator('input[name="pricePerHour"]')).toHaveValue("2500");
  });


  test("should add availability slot", async ({ page }) => {
    await page.getByRole("button", { name: "Add Slot" }).click();

    await expect(page.locator("text=Mon at 8:00 AM")).toBeVisible();
  });
});