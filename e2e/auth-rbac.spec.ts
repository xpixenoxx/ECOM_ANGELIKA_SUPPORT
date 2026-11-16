import { test, expect } from '@playwright/test';

test.describe('Authentication & Fail-Closed RBAC Security', () => {
  test('renders Sign In / Create Account tabs and validates empty login fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome Back')).toBeVisible();

    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Join Angelika Circle')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Priya Sharma')).toBeVisible();

    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();

    const submitButton = page.locator('form button[type="submit"]').first();
    await submitButton.click();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('redirects unauthenticated /admin traffic to /login (fail-closed)', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin/);
  });

  test('redirects unauthenticated /account traffic to /login', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login\?redirect=%2Faccount/);
  });

  test('rejects unauthenticated requests to admin, webhook, and revalidation endpoints', async ({ request }) => {
    const adminContentRes = await request.get('/api/admin/content');
    expect([401, 403]).toContain(adminContentRes.status());

    const adminUploadRes = await request.post('/api/admin/upload');
    expect([401, 403]).toContain(adminUploadRes.status());

    const revalidateRes = await request.post('/api/revalidate', {
      data: { path: '/' },
    });
    expect([401, 503]).toContain(revalidateRes.status());

    const razorpayWebhookRes = await request.post('/api/webhooks/razorpay', {
      data: { event: 'payment.captured' },
    });
    expect([400, 401, 503]).toContain(razorpayWebhookRes.status());

    const stripeWebhookRes = await request.post('/api/webhooks/stripe', {
      data: { id: 'evt_test' },
    });
    expect([400, 401, 503]).toContain(stripeWebhookRes.status());

    const whatsappWebhookRes = await request.post('/api/webhooks/whatsapp', {
      data: { entry: [] },
    });
    expect([401, 503]).toContain(whatsappWebhookRes.status());
  });
});
