import { test, expect } from "@playwright/test";

test.describe("Register Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API call
    await page.route("**/users", async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            _id: "1234567890abcdef12345678",
            fullname: "Test User",
            email: "test@example.com",
          },
        }),
      });
    });

    await page.goto("http://localhost:5173/register");
  });

  test("should load register page", async ({ page }) => {
    await expect(page.getByText("Sign Up")).toBeVisible();
  });

  test("should render all input fields", async ({ page }) => {
    await expect(page.getByPlaceholder("Samantha Sandaruwan")).toBeVisible();
    await expect(page.getByPlaceholder("WJ38194520")).toBeVisible();
    await expect(page.getByPlaceholder("email@university.edu")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("should show validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
    await expect(page.getByText("Full name is required")).toBeVisible();
  });


  test("should validate password rules", async ({ page }) => {
    await page.fill('input[name="password"]', "abc");

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
  });

  test("should fill and submit form successfully", async ({ page }) => {
    await page.fill('input[name="fullname"]', "Test User");
    await page.fill('input[name="student_id"]', "IT12345678");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Password1A");
    await page.fill('input[name="university_name"]', "SLIIT");
    await page.fill('input[name="phone"]', "0771234567");
    await page.fill('input[name="graduate_year"]', "2025");

    // fake file upload (important for test stability)
    const fileInput = page.locator('input[name="student_id_pic"]');
    await fileInput.setInputFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image content"),
    });

    await page.getByRole("button", { name: /create account/i }).click();

    // should navigate after success
    await expect(page).toHaveURL(/\/$/);
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.getByRole("button", { name: /show/i }).click();
    await expect(page.locator('input[name="password"]')).toHaveAttribute("type", "text");
  });

  test("should show password strength indicator", async ({ page }) => {
    await page.fill('input[name="password"]', "Password1A");
    await expect(page.getByText(/Good|Strong|Fair|Weak/i)).toBeVisible();
  });
});