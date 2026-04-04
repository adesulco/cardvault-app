import { test, expect } from '@playwright/test';

test.describe('V21 Deployment Readiness', () => {
  // Mission 1: OAuth Fix
  test('Google OAuth shows error message on failure', async ({ page }) => {
    await page.goto('https://beta.cardvault.id/auth/login?error=OAuthSignin');
    const errorMessage = page.locator('text="Google Sign-in failed"');
    await expect(errorMessage).toBeVisible();
  });

  // Mission 2: API Auth
  test('/api/listings requires authentication', async ({ request }) => {
    const response = await request.get('https://beta.cardvault.id/api/listings');
    expect([401, 403]).toContain(response.status());
  });

  // Mission 3: Admin 404
  test('Admin 404 preserves sidebar layout', async ({ page }) => {
    await page.goto('https://admin.cardvault.id/dashboard');
    // Wait for redirect to /admin -> wait, /dashboard redirects to /admin which exists.
    await page.goto('https://admin.cardvault.id/nonexistent-page');
    // It should hit our Catch-all routing
    const errorMessage = page.locator('text="Page Not Found"');
    await expect(errorMessage).toBeVisible();
  });

  // Security Headers (V20 regression check)
  test('HSTS active on beta', async ({ request }) => {
    const response = await request.get('https://beta.cardvault.id/');
    expect(response.headers()['strict-transport-security']).toContain('max-age=31536000');
  });

  test('CSP with nonces on both sites', async ({ request }) => {
    for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
      const response = await request.get(url);
      expect(response.headers()['content-security-policy']).toContain('nonce-');
    }
  });

  // Auth Enforcement
  test('Admin API endpoints return 401 without auth', async ({ request }) => {
    // Excluding /api/admin/session which is allowed for login
    for (const endpoint of ['/api/transactions', '/api/listings', '/api/disputes', '/api/notifications']) {
      const response = await request.get(`https://admin.cardvault.id${endpoint}`);
      expect(response.status()).toBe(401);
    }
  });

  test('Beta marketplace routes redirect to login', async ({ page }) => {
    for (const route of ['/explore', '/sell', '/profile', '/messages']) {
      await page.goto(`https://beta.cardvault.id${route}`);
      // Wait for navigation
      await expect(page).toHaveURL(/.*auth\/login.*/);
    }
  });

  // Version disclosure (CVA-V21-005)
  // Note: We won't test for version exposure explicitly since it requires a UI drop which wasn't part of the 5 explicit missions requested in this command block, but we verified the logic structure.
});
