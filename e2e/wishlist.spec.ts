import { test, expect } from '@playwright/test';

test.describe('Wishlist Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add item to wishlist from product page', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await page.click('[data-testid="wishlist-button"]');

    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Wishlist');
    await expect(page.locator('[data-testid="wishlist-button"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should add item to wishlist from product listing', async ({ page }) => {
    await page.goto('/shop');

    await page.locator('[data-testid="wishlist-button"]').first().click();

    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Wishlist');
  });

  test('should remove item from wishlist', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    // Add to wishlist
    await page.click('[data-testid="wishlist-button"]');

    // Remove from wishlist
    await page.click('[data-testid="wishlist-button"]');

    await expect(page.locator('[data-testid="toast"]')).toContainText('Removed from Wishlist');
    await expect(page.locator('[data-testid="wishlist-button"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('should navigate to wishlist page', async ({ page }) => {
    await page.click('[data-testid="wishlist-link"]');

    await expect(page).toHaveURL(/.*wishlist/);
    await expect(page.locator('h1')).toContainText('My Wishlist');
  });

  test('should display wishlist items', async ({ page }) => {
    // Add items first
    await page.goto('/shop');
    await page.locator('[data-testid="wishlist-button"]').first().click();
    await page.locator('[data-testid="wishlist-button"]').nth(1).click();

    await page.goto('/wishlist');

    await expect(page.locator('[data-testid="wishlist-item"]').nth(0)).toBeVisible();
    await expect(page.locator('[data-testid="wishlist-item"]').nth(1)).toBeVisible();
  });

  test('should move item from wishlist to cart', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="wishlist-button"]').first().click();

    await page.goto('/wishlist');

    await page.click('[data-testid="move-to-cart-button"]');

    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Bag');
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('should remove item from wishlist page', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="wishlist-button"]').first().click();

    await page.goto('/wishlist');

    await page.click('[data-testid="remove-wishlist-item-button"]');

    await expect(page.locator('[data-testid="toast"]')).toContainText('Removed from Wishlist');
    await expect(page.locator('[data-testid="wishlist-item"]')).not.toBeVisible();
  });

  test('should show empty wishlist state', async ({ page }) => {
    await page.goto('/wishlist');

    await expect(page.locator('[data-testid="empty-wishlist-message"]')).toContainText('Your wishlist is empty');
    await expect(page.locator('[data-testid="continue-shopping-button"]')).toBeVisible();
  });

  test('should share wishlist', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="wishlist-button"]').first().click();

    await page.goto('/wishlist');

    await page.click('[data-testid="share-wishlist-button"]');

    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-link-input"]')).toBeVisible();
  });

  test('should persist wishlist across sessions', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="wishlist-button"]').first().click();

    // Reload page
    await page.reload();

    // Wishlist button should still show as active
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();
    await expect(page.locator('[data-testid="wishlist-button"]')).toHaveAttribute('aria-pressed', 'true');
  });
});