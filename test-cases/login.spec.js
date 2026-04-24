import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {

  test.beforeEach(async ({ page }) => {

    // Mock login API
    await page.route('**/Users/login', async route => {
      const body = route.request().postDataJSON();

      if (body.email === 'test@mail.com' && body.password === '123456') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'fake-token',
            user: { name: 'Test User', _id: '123' }
          })
        });
      }

      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    });

    // Mock forgot password flow
    await page.route('**/forgot-password', route =>
      route.fulfill({ status: 200, body: '{}' })
    );

    await page.route('**/verify-otp', route =>
      route.fulfill({ status: 200, body: '{}' })
    );

    await page.route('**/reset-password', route =>
      route.fulfill({ status: 200, body: '{}' })
    );

    await page.goto('http://localhost:5173/login');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@mail.com');
    await page.fill('input[name="password"]', 'wrong');

    await page.click('button:has-text("Login")');

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  // ---------------- SUCCESS LOGIN ----------------

  test('should login successfully and redirect', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@mail.com');
    await page.fill('input[name="password"]', '123456');

    await page.click('button:has-text("Login")');

    await page.waitForURL('**/home');

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('fake-token');
  });


  test('should navigate to register page', async ({ page }) => {
    await page.getByText('SignUp').click();
    await page.waitForURL('**/register');
  });


  test('should go to OTP screen', async ({ page }) => {
    await page.getByText('Forgot Password?').click();

    await page.fill('input[placeholder="Enter your email"]', 'test@mail.com');
    await page.click('button:has-text("Send Code")');

    await expect(page.getByText('OTP')).toBeVisible();
  });

 
  test('should update password successfully', async ({ page }) => {
    await page.getByText('Forgot Password?').click();

    await page.fill('input[placeholder="Enter your email"]', 'test@mail.com');
    await page.click('button:has-text("Send Code")');

    await page.fill('input[placeholder="Enter OTP"]', '123456');
    await page.click('button:has-text("Verify")');

    await page.fill('input[placeholder="New Password"]', 'newpass123');
    await page.click('button:has-text("Update Password")');

    await expect(page.getByText('Password Updated')).toBeVisible();
  });


});