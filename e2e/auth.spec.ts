import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('[data-testid="sign-in-link"]');
    await expect(page).toHaveURL(/.*auth\/signin/);
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.click('[data-testid="sign-up-link"]');
    await expect(page).toHaveURL(/.*auth\/signup/);
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should show validation errors for empty sign in form', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email');
  });

  test('should sign in successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to homepage or account page
    await expect(page).toHaveURL(/\/(account|\/)$/);

    // Check for user avatar or name in header
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should sign up successfully', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await expect(page).toHaveURL(/\/(account|\/)$/);
  });

  test('should sign out successfully', async ({ page }) => {
    // First sign in
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(account|\/)$/);

    // Then sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="sign-out-button"]');
    await expect(page).toHaveURL(/\/(auth\/signin|\/)$/);
  });

  test('should redirect to sign in when accessing protected route', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/.*auth\/signin/);
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.click('[data-testid="forgot-password-link"]');
    await expect(page).toHaveURL(/.*auth\/forgot-password/);

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reset link sent');
  });

  test('should handle password reset flow', async ({ page }) => {
    // Navigate to reset password with token
    await page.goto('/auth/reset-password?token=valid-token');
    await expect(page.locator('h1')).toContainText('Reset Password');

    await page.fill('[data-testid="password-input"]', 'newpassword123');
    await page.fill('[data-testid="confirm-password-input"]', 'newpassword123');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password updated');
  });
});