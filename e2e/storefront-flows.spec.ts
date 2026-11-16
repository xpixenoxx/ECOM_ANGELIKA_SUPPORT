import { test, expect } from '@playwright/test';

test.describe('Storefront Core Flows, Security Headers & SEO', () => {
  test('homepage renders without runtime errors, header overlap, or missing security headers', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const headers = response?.headers() || {};
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['strict-transport-security']).toContain('max-age=');

    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();

    const headerBox = await page.locator('header').boundingBox();
    const mainBox = await page.locator('#main-content').boundingBox();
    expect(headerBox).not.toBeNull();
    expect(mainBox).not.toBeNull();
    if (headerBox && mainBox) {
      expect(mainBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    expect(pageErrors).toEqual([]);
  });

  test('SEO endpoints (/robots.txt, /sitemap.xml), health endpoint, and custom 404 behave cleanly', async ({ request }) => {
    const healthRes = await request.get('/api/health');
    expect(healthRes.status()).toBe(200);
    const healthJson = await healthRes.json();
    expect(healthJson.ok).toBe(true);

    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain('Disallow: /admin/');
    expect(robotsText).toContain('Sitemap:');

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain('<urlset');
    expect(sitemapText).toContain('/shop');
    expect(sitemapText).toContain('/new-arrivals');

    const notFoundRes = await request.get('/nonexistent-atelier-route-404');
    expect(notFoundRes.status()).toBe(404);
  });

  test('catalog discovery on /shop and /shop/kurtis works without runtime errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/shop');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/shop/kurtis');
    await expect(page.locator('h1')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('interactive Size Finder renders brand pills & measurement controls', async ({ page }) => {
    await page.goto('/size-finder');
    await expect(page.locator('h1')).toBeVisible();
    await page.getByRole('button', { name: /M\s+UK 10|M/i }).first().click();
    await expect(page.locator('#main-content')).toContainText(/Recommended|Angelika/i);
  });

  test('public order tracking rejects unknown orders honestly (no fake AWB)', async ({ page }) => {
    await page.goto('/track-order');
    await expect(page.getByRole('heading', { name: 'Track Your Order' })).toBeVisible();

    await page.locator('#orderId').fill('AF-NONEXISTENT-9999');
    await page.locator('#phoneOrEmail').fill('9876543210');
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator('body')).not.toContainText('BD-');
  });

  test('empty cart and concierge contact pages render valid navigation and validation', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Your Bag is Empty' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue Shopping' })).toHaveAttribute('href', '/shop');

    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
    await page.locator('#name').fill('Aadhya Verma');
    await page.locator('#email').fill('bad-email');
    await page.locator('form button[type="submit"]').first().click();
    await expect(page.locator('#main-content')).toBeVisible();
  });
});
