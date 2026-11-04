import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart and go to checkout
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
  });

  test('should display checkout step 1 - contact & delivery', async ({ page }) => {
    await expect(page.locator('[data-testid="checkout-step-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator-1"]')).toHaveClass(/active/);

    // Check form fields
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="first-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="address-line1-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="city-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="state-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="pincode-input"]')).toBeVisible();
  });

  test('should validate required fields in step 1', async ({ page }) => {
    await page.click('[data-testid="continue-to-shipping-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="phone-error"]')).toContainText('Phone is required');
    await expect(page.locator('[data-testid="first-name-error"]')).toContainText('First name is required');
    await expect(page.locator('[data-testid="address-line1-error"]')).toContainText('Address is required');
    await expect(page.locator('[data-testid="city-error"]')).toContainText('City is required');
    await expect(page.locator('[data-testid="pincode-error"]')).toContainText('Pincode is required');
  });

  test('should validate pincode format', async ({ page }) => {
    await page.fill('[data-testid="pincode-input"]', '123');
    await page.click('[data-testid="continue-to-shipping-button"]');

    await expect(page.locator('[data-testid="pincode-error"]')).toContainText('Invalid pincode');
  });

  test('should proceed to step 2 - shipping', async ({ page }) => {
    // Fill step 1
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="address-line1-input"]', '123 Test Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="pincode-input"]', '400001');

    await page.click('[data-testid="continue-to-shipping-button"]');

    // Should be on step 2
    await expect(page.locator('[data-testid="checkout-step-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator-2"]')).toHaveClass(/active/);

    // Check shipping options
    await expect(page.locator('[data-testid="shipping-option"]')).toBeVisible();
  });

  test('should proceed to step 3 - payment', async ({ page }) => {
    // Complete step 1
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="address-line1-input"]', '123 Test Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="pincode-input"]', '400001');
    await page.click('[data-testid="continue-to-shipping-button"]');

    // Select shipping
    await page.click('[data-testid="shipping-option"]:first-child');
    await page.click('[data-testid="continue-to-payment-button"]');

    // Should be on step 3
    await expect(page.locator('[data-testid="checkout-step-3"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator-3"]')).toHaveClass(/active/);

    // Check payment options
    await expect(page.locator('[data-testid="payment-option-upi"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-option-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-option-netbanking"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-option-cod"]')).toBeVisible();
  });

  test('should complete checkout with UPI', async ({ page }) => {
    // Complete all steps
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="address-line1-input"]', '123 Test Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="pincode-input"]', '400001');
    await page.click('[data-testid="continue-to-shipping-button"]');

    await page.click('[data-testid="shipping-option"]:first-child');
    await page.click('[data-testid="continue-to-payment-button"]');

    // Select UPI
    await page.click('[data-testid="payment-option-upi"]');
    await page.fill('[data-testid="upi-id-input"]', 'test@upi');

    // Place order
    await page.click('[data-testid="place-order-button"]');

    // Should redirect to success page
    await expect(page).toHaveURL(/.*order\/success/);
    await expect(page.locator('[data-testid="order-success-title"]')).toContainText('Order Placed Successfully');
    await expect(page.locator('[data-testid="order-id"]')).toBeVisible();
  });

  test('should complete checkout with COD', async ({ page }) => {
    // Complete all steps
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="address-line1-input"]', '123 Test Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="pincode-input"]', '400001');
    await page.click('[data-testid="continue-to-shipping-button"]');

    await page.click('[data-testid="shipping-option"]:first-child');
    await page.click('[data-testid="continue-to-payment-button"]');

    // Select COD
    await page.click('[data-testid="payment-option-cod"]');

    // Place order
    await page.click('[data-testid="place-order-button"]');

    await expect(page).toHaveURL(/.*order\/success/);
    await expect(page.locator('[data-testid="cod-notice"]')).toContainText('Cash on Delivery');
  });

  test('should show order summary on all steps', async ({ page }) => {
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-shipping"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-tax"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-total"]')).toBeVisible();
  });

  test('should allow going back to previous step', async ({ page }) => {
    // Complete step 1
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="address-line1-input"]', '123 Test Street');
    await page.fill('[data-testid="city-input"]', 'Mumbai');
    await page.fill('[data-testid="state-input"]', 'Maharashtra');
    await page.fill('[data-testid="pincode-input"]', '400001');
    await page.click('[data-testid="continue-to-shipping-button"]');

    // Go back
    await page.click('[data-testid="back-to-contact-button"]');

    await expect(page.locator('[data-testid="checkout-step-1"]')).toBeVisible();
    // Form data should be preserved
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('test@example.com');
  });

  test('should handle guest checkout', async ({ page }) => {
    // Don't sign in, just proceed as guest
    await page.fill('[data-testid="email-input"]', 'guest@example.com');
    await page.fill('[data-testid="phone-input"]', '9876543210');
    await page.fill('[data-testid="first-name-input"]', 'Guest');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="address-line1-input"]', '123 Guest Street');
    await page.fill('[data-testid="city-input"]', 'Delhi');
    await page.fill('[data-testid="state-input"]', 'Delhi');
    await page.fill('[data-testid="pincode-input"]', '110001');
    await page.click('[data-testid="continue-to-shipping-button"]');

    await page.click('[data-testid="shipping-option"]:first-child');
    await page.click('[data-testid="continue-to-payment-button"]');

    await page.click('[data-testid="payment-option-cod"]');
    await page.click('[data-testid="place-order-button"]');

    await expect(page).toHaveURL(/.*order\/success/);
    await expect(page.locator('[data-testid="create-account-prompt"]')).toContainText('Create an account');
  });
});