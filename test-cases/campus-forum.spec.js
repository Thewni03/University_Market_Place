import { test, expect } from "@playwright/test";

const URL = "http://localhost:5173/forum"; 

test.describe("Campus Forum Tests", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("should load forum page", async ({ page }) => {
    await expect(page.getByText("Campus Q&A")).toBeVisible();
    await expect(page.getByText("Ask Questions, share knowledge")).toBeTruthy();
  });

  test("should show sorting options", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Latest Activity" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Top Questions" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Unanswered" })).toBeVisible();
  });
  test("should show Ask Question or Login button", async ({ page }) => {
    const askBtn = page.getByRole("button", { name: /ask a question/i });
    const loginBtn = page.getByRole("link", { name: /log in to ask/i });

    await expect(askBtn.or(loginBtn)).toBeVisible();
  });

  test("should open ask question modal", async ({ page }) => {
    const askBtn = page.getByRole("button", { name: /ask a question/i });

    if (await askBtn.isVisible()) {
      await askBtn.click();
      await expect(page.getByText("Ask the Community")).toBeVisible();
      await expect(page.getByPlaceholder(/title/i)).toBeVisible();
      await expect(page.getByPlaceholder(/describe your question/i)).toBeVisible();
    }
  });

  test("should show validation error for empty form", async ({ page }) => {
    const askBtn = page.getByRole("button", { name: /ask a question/i });

    if (await askBtn.isVisible()) {
      await askBtn.click();

      await page.getByRole("button", { name: /post question/i }).click();

      await expect(page.locator("text=Title and description are required")).toBeVisible();
    }
  });

  test("should validate title minimum length", async ({ page }) => {
    const askBtn = page.getByRole("button", { name: /ask a question/i });

    if (await askBtn.isVisible()) {
      await askBtn.click();

      await page.getByPlaceholder(/title/i).fill("short");
      await page.getByPlaceholder(/describe your question/i).fill("This is a valid long description for testing.");

      await page.getByRole("button", { name: /post question/i }).click();

      await expect(page.locator("text=Title must be at least 10 characters long")).toBeVisible();
    }
  });

  test("should validate description minimum length", async ({ page }) => {
    const askBtn = page.getByRole("button", { name: /ask a question/i });

    if (await askBtn.isVisible()) {
      await askBtn.click();

      await page.getByPlaceholder(/title/i).fill("Valid Question Title");
      await page.getByPlaceholder(/describe your question/i).fill("short");

      await page.getByRole("button", { name: /post question/i }).click();

      await expect(page.locator("text=Description must be at least 20 characters long")).toBeVisible();
    }
  });

  test("should show questions or empty state", async ({ page }) => {
    const emptyState = page.getByText("No questions found");
    const questionCard = page.locator(".bg-white.border");

    await expect(emptyState.or(questionCard.first())).toBeVisible();
  });

});