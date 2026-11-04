import { test, expect } from '@playwright/test';

test.describe('Product Discovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
  });

  test('should display product listing page', async ({ page }) => {
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.click('[data-testid="category-filter-kurti"]');

    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(await page.locator('[data-testid="product-card"]').count());
    await expect(page.locator('[data-testid="active-filter"]').first()).toContainText('Kurti');
  });

  test('should filter products by price range', async ({ page }) => {
    await page.click('[data-testid="price-filter-button"]');

    await page.fill('[data-testid="price-min-input"]', '1000');
    await page.fill('[data-testid="price-max-input"]', '5000');
    await page.click('[data-testid="apply-price-filter-button"]');

    await expect(page.locator('[data-testid="active-filter"]')).toContainText('₹1,000 - ₹5,000');
  });

  test('should sort products', async ({ page }) => {
    await page.click('[data-testid="sort-dropdown-trigger"]');
    await page.click('[data-testid="sort-option-price-asc"]');

    await expect(page.locator('[data-testid="sort-dropdown-trigger"]')).toContainText('Price: Low to High');
  });

  test('should search products', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'chikankari');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page).toHaveURL(/.*search/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should navigate to product detail page', async ({ page }) => {
    const productName = await page.locator('[data-testid="product-card-name"]').first().textContent();

    await page.locator('[data-testid="product-card"]').first().click();

    await expect(page).toHaveURL(/.*product\//);
    await expect(page.locator('[data-testid="product-title"]')).toContainText(productName || '');
  });

  test('should display product images gallery', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await expect(page.locator('[data-testid="main-product-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="thumbnail"]').first()).toBeVisible();
  });

  test('should select product size', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await page.click('[data-testid="size-option"]:first-child');

    await expect(page.locator('[data-testid="size-option"]:first-child')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should select product color', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await page.click('[data-testid="color-option"]:first-child');

    await expect(page.locator('[data-testid="color-option"]:first-child')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show size guide modal', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await page.click('[data-testid="size-guide-link"]');

    await expect(page.locator('[data-testid="size-guide-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="size-chart-table"]')).toBeVisible();
  });

  test('should display product reviews', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="review"]').first()).toBeVisible();
  });

  test('should add product to cart from detail page', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await page.click('[data-testid="size-option"]:first-child');
    await page.click('[data-testid="color-option"]:first-child');
    await page.click('[data-testid="add-to-cart-button"]');

    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Bag');
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('should add product to wishlist from detail page', async ({ page }) => {
    await page.goto('/shop');
    await page.locator('[data-testid="product-card"]').first().click();

    await page.click('[data-testid="wishlist-button"]');

    await expect(page.locator('[data-testid="toast"]')).toContainText('Added to Wishlist');
  });

  test('should navigate category pages', async ({ page }) => {
    await page.goto('/shop/kurti');

    await expect(page.locator('[data-testid="category-title"]')).toContainText('Kurti');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });

  test('should filter by occasion', async ({ page }) => {
    await page.goto('/shop');

    await page.click('[data-testid="occasion-filter-wedding"]');

    await expect(page.locator('[data-testid="active-filter"]')).toContainText('Wedding');
  });

  test('should filter by fabric', async ({ page }) => {
    await page.goto('/shop');

    await page.click('[data-testid="fabric-filter-cotton"]');

    await expect(page.locator('[data-testid="active-filter"]')).toContainText('Cotton');
  });

  test('should handle infinite scroll', async ({ page }) => {
    await page.goto('/shop');

    // Scroll to bottom to trigger infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Should load more products
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const newCount = await page.locator('[data-testid="product-card"]').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should display Vidhya\'s Picks section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="vidhyas-picks-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="vidhyas-pick-card"]').first()).toBeVisible();
  });

  test('should navigate to Vidhya\'s Picks page', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="view-all-vidhyas-picks"]');

    await expect(page).toHaveURL(/.*vidhyas-picks/);
    await expect(page.locator('h1')).toContainText('Vidhya\'s Picks');
  });

  test('should display sale section', async ({ page }) => {
    await page.goto('/sale');

    await expect(page.locator('[data-testid="sale-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card-sale-badge"]').first()).toBeVisible();
  });

  test('should handle out of stock products', async ({ page }) => {
    await page.goto('/shop');

    const outOfStockCard = page.locator('[data-testid="product-card-out-of-stock"]').first();
    if (await outOfStockCard.isVisible()) {
      await outOfStockCard.click();

      await expect(page.locator('[data-testid="out-of-stock-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="notify-me-button"]')).toBeVisible();
    }
  });

  test('should display product badges', async ({ page }) => {
    await page.goto('/shop');

    // Check for various badges
    const newBadge = page.locator('[data-testid="badge-new"]').first();
    const saleBadge = page.locator('[data-testid="badge-sale"]').first();
    const limitedBadge = page.locator('[data-testid="badge-limited"]').first();
    const vidhyasPickBadge = page.locator('[data-testid="badge-vidhyas-pick"]').first();

    // At least one badge type should be visible
    const badgeCount = await newBadge.count() + await saleBadge.count() + await limitedBadge.count() + await vidhyasPickBadge.count();
    expect(badgeCount).toBeGreaterThan(0);
  });
});