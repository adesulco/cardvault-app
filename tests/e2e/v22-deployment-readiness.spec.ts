import { test, expect } from '@playwright/test';

test.describe('V22 Deployment Readiness', () => {
  // V21 Fix Verification (regression check)
  test('Google OAuth shows error message on failure', async ({ page }) => {
    await page.goto('https://beta.cardvault.id/auth/login?error=OAuthSignin');
    const errorMessage = page.locator('[data-testid="auth-error"], .error-message, [role="alert"], text="Google Sign-in failed"');
    await expect(errorMessage.first()).toBeVisible();
    await expect(errorMessage.first()).toContainText(/sign-in failed|try again/i);
  });

  test('/api/listings requires authentication', async ({ request }) => {
    const response = await request.get('https://beta.cardvault.id/api/listings');
    expect([401, 403]).toContain(response.status());
  });

  test('Admin 404 preserves sidebar layout', async ({ page }) => {
    await page.goto('https://admin.cardvault.id/admin/nonexistent-page');
    // Using a broader locator for the sidebar nav
    const sidebar = page.locator('nav, [role="navigation"], aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('/dashboard redirects to /admin', async ({ page }) => {
    await page.goto('https://admin.cardvault.id/dashboard');
    await expect(page).toHaveURL(/\/admin/);
  });

  // V22 New Fix Verification
  test('Version number not exposed in production UI', async ({ page }) => {
    await page.goto('https://beta.cardvault.id/');
    const content = await page.textContent('body');
    // We expect the version string structure NOT to be present on beta public roots
    expect(content).not.toMatch(/v\d+\.\d+\.\d+/);
  });

  test('Admin email masked in sidebar', async ({ page }) => {
    await page.goto('https://admin.cardvault.id/admin');
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    const sidebarText = (await sidebar.textContent()) || '';
    // Should not contain full email pattern
    expect(sidebarText).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  });

  // Security Headers
  test('HSTS active on both sites', async ({ request }) => {
    for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
      const response = await request.get(url);
      expect(response.headers()['strict-transport-security']).toContain('max-age=31536000');
    }
  });

  test('CSP with nonces on both sites', async ({ request }) => {
    for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
      const response = await request.get(url);
      expect(response.headers()['content-security-policy']).toContain('nonce-');
    }
  });

  test('X-Frame-Options DENY on both sites', async ({ request }) => {
    for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
      const response = await request.get(url);
      expect(response.headers()['x-frame-options']).toBe('DENY');
    }
  });

  // Auth Enforcement
  test('All admin API endpoints return 401 without auth', async ({ request }) => {
    for (const endpoint of ['/api/transactions', '/api/listings', '/api/disputes', '/api/notifications']) {
      const response = await request.get(`https://admin.cardvault.id${endpoint}`);
      expect(response.status()).toBe(401);
    }
  });

  test('Beta marketplace routes redirect to login', async ({ page }) => {
    for (const route of ['/explore', '/sell', '/profile', '/messages']) {
      await page.goto(`https://beta.cardvault.id${route}`);
      await expect(page).toHaveURL(/auth\/login/);
    }
  });

  // Performance
  test('Beta landing TTFB under 800ms', async ({ request }) => {
    const start = Date.now();
    await request.get('https://beta.cardvault.id/');
    const ttfb = Date.now() - start;
    expect(ttfb).toBeLessThan(800);
  });

  // Console Errors
  test('Zero console errors on beta', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) });
    await page.goto('https://beta.cardvault.id/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('Zero console errors on admin', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) });
    // This will redirect to login because we aren't seeding auth headers natively
    await page.goto('https://admin.cardvault.id/admin/login');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });
});
