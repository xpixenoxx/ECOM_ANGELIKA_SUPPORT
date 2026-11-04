import { test, expect } from '@playwright/test';

test.describe('Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add item to cart from product page', async ({ page }) => {
    // Navigate to a product
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    // Select size and color if available
    const sizeButton = page.locator('[data-testid="size-option"]').first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click();
    }

    const colorButton = page.locator('[data-testid="color-option"]').first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    }

    // Add to cart
    await page.click('[data-testid="add-to-cart-button"]');

    // Check for success toast
    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Bag');

    // Check cart badge updated
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('should add item to cart from product listing', async ({ page }) => {
    await page.goto('/shop');

    // Quick add from product card
    await page.locator('[data-testid="quick-add-button"]').first().click();

    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Bag');
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('should open cart drawer', async ({ page }) => {
    // Add item first
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    // Open cart drawer
    await page.click('[data-testid="cart-button"]');

    // Check drawer is open
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-drawer-title"]')).toContainText('Shopping Bag');
  });

  test('should display cart items correctly', async ({ page }) => {
    // Add multiple items
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();
    await page.locator('[data-testid="quick-add-button"]').nth(1).click();

    await page.click('[data-testid="cart-button"]');

    // Check items displayed
    await expect(page.locator('[data-testid="cart-item"]').nth(0)).toBeVisible();
    await expect(page.locator('[data-testid="cart-item"]').nth(1)).toBeVisible();
  });

  test('should update item quantity in cart', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    await page.click('[data-testid="cart-button"]');

    // Increase quantity
    await page.click('[data-testid="quantity-increase"]');
    await expect(page.locator('[data-testid="quantity-value"]')).toContainText('2');

    // Decrease quantity
    await page.click('[data-testid="quantity-decrease"]');
    await expect(page.locator('[data-testid="quantity-value"]')).toContainText('1');
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    await page.click('[data-testid="cart-button"]');

    // Remove item
    await page.click('[data-testid="remove-item-button"]');

    // Check item removed
    await expect(page.locator('[data-testid="cart-item"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="empty-cart-message"]')).toContainText('Your bag is empty');
  });

  test('should apply coupon code', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    await page.click('[data-testid="cart-button"]');

    // Apply coupon
    await page.fill('[data-testid="coupon-input"]', 'WELCOME20');
    await page.click('[data-testid="apply-coupon-button"]');

    await expect(page.locator('[data-testid="coupon-applied"]')).toContainText('WELCOME20');
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
  });

  test('should calculate totals correctly', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    await page.click('[data-testid="cart-button"]');

    // Check subtotal, tax, shipping, total displayed
    await expect(page.locator('[data-testid="subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping"]')).toBeVisible();
    await expect(page.locator('[data-testid="tax"]')).toBeVisible();
    await expect(page.locator('[data-testid="total"]')).toBeVisible();
  });

  test('should proceed to checkout from cart', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');

    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should persist cart across page navigation', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="quick-add-button"]').first().click();

    // Navigate away
    await page.goto('/about');
    await page.goto('/shop');

    // Cart badge should still show count
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('should handle empty cart state', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');

    await expect(page.locator('[data-testid="empty-cart-message"]')).toContainText('Your bag is empty');
    await expect(page.locator('[data-testid="continue-shopping-button"]')).toBeVisible();
  });
});