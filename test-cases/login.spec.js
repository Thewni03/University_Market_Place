import { test, expect } from "@playwright/test";

test.describe("Login Page Tests", () => {

  test("should load login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator(".lp-login-title")).toContainText("LOGIN");
  });

  test("should render login form inputs", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("should open forgot password screen", async ({ page }) => {
    await page.goto("/login");

    await page.getByText("Forgot Password?").click();

    await expect(page.locator(".lp-login-title")).toContainText("Reset");
    await expect(page.locator("input[placeholder='Enter your email']")).toBeVisible();
  });

  test("should go to OTP screen (mocked)", async ({ page }) => {

    await page.route("**/forgot-password", async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto("/login");
    await page.getByText("Forgot Password?").click();

    await page.fill("input[placeholder='Enter your email']", "test@example.com");
    await page.getByRole("button", { name: /send code/i }).click();

    // UI state change happens via onOTPSent()
    await expect(page.locator(".lp-login-title")).toContainText("OTP");
  });

  test("should render OTP input", async ({ page }) => {

    await page.route("**/forgot-password", route =>
      route.fulfill({ status: 200, body: JSON.stringify({}) })
    );

    await page.goto("/login");
    await page.getByText("Forgot Password?").click();

    await page.fill("input[placeholder='Enter your email']", "test@example.com");
    await page.getByRole("button", { name: /send code/i }).click();

    await expect(page.locator("input[placeholder='Enter OTP']")).toBeVisible();
  });

  test("should go to new password screen (mocked)", async ({ page }) => {

    await page.route("**/forgot-password", route =>
      route.fulfill({ status: 200 })
    );

    await page.route("**/verify-otp", route =>
      route.fulfill({ status: 200 })
    );

    await page.goto("/login");

    // Forgot password
    await page.getByText("Forgot Password?").click();
    await page.fill("input[placeholder='Enter your email']", "test@example.com");
    await page.getByRole("button", { name: /send code/i }).click();

    // OTP screen
    await page.fill("input[placeholder='Enter OTP']", "123456");
    await page.getByRole("button", { name: /verify/i }).click();

    await expect(page.locator(".lp-login-title")).toContainText("New Password");
  });

  test("should show password input (final step)", async ({ page }) => {

    await page.route("**/forgot-password", route =>
      route.fulfill({ status: 200 })
    );

    await page.route("**/verify-otp", route =>
      route.fulfill({ status: 200 })
    );

    await page.route("**/reset-password", route =>
      route.fulfill({ status: 200 })
    );

    await page.goto("/login");

    await page.getByText("Forgot Password?").click();
    await page.fill("input[placeholder='Enter your email']", "test@example.com");
    await page.getByRole("button", { name: /send code/i }).click();

    await page.fill("input[placeholder='Enter OTP']", "123456");
    await page.getByRole("button", { name: /verify/i }).click();

    await expect(page.locator("input[placeholder='New Password']")).toBeVisible();
  });

});