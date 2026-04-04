# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v22-deployment-readiness.spec.ts >> V22 Deployment Readiness >> Zero console errors on beta
- Location: tests/e2e/v22-deployment-readiness.spec.ts:91:7

# Error details

```
Error: page.waitForLoadState: Test ended.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('V22 Deployment Readiness', () => {
  4   |   // V21 Fix Verification (regression check)
  5   |   test('Google OAuth shows error message on failure', async ({ page }) => {
  6   |     await page.goto('https://beta.cardvault.id/auth/login?error=OAuthSignin');
  7   |     const errorMessage = page.locator('[data-testid="auth-error"], .error-message, [role="alert"], text="Google Sign-in failed"');
  8   |     await expect(errorMessage.first()).toBeVisible();
  9   |     await expect(errorMessage.first()).toContainText(/sign-in failed|try again/i);
  10  |   });
  11  | 
  12  |   test('/api/listings requires authentication', async ({ request }) => {
  13  |     const response = await request.get('https://beta.cardvault.id/api/listings');
  14  |     expect([401, 403]).toContain(response.status());
  15  |   });
  16  | 
  17  |   test('Admin 404 preserves sidebar layout', async ({ page }) => {
  18  |     await page.goto('https://admin.cardvault.id/admin/nonexistent-page');
  19  |     // Using a broader locator for the sidebar nav
  20  |     const sidebar = page.locator('nav, [role="navigation"], aside').first();
  21  |     await expect(sidebar).toBeVisible();
  22  |   });
  23  | 
  24  |   test('/dashboard redirects to /admin', async ({ page }) => {
  25  |     await page.goto('https://admin.cardvault.id/dashboard');
  26  |     await expect(page).toHaveURL(/\/admin/);
  27  |   });
  28  | 
  29  |   // V22 New Fix Verification
  30  |   test('Version number not exposed in production UI', async ({ page }) => {
  31  |     await page.goto('https://beta.cardvault.id/');
  32  |     const content = await page.textContent('body');
  33  |     // We expect the version string structure NOT to be present on beta public roots
  34  |     expect(content).not.toMatch(/v\d+\.\d+\.\d+/);
  35  |   });
  36  | 
  37  |   test('Admin email masked in sidebar', async ({ page }) => {
  38  |     await page.goto('https://admin.cardvault.id/admin');
  39  |     const sidebar = page.locator('nav, aside, [role="navigation"]').first();
  40  |     const sidebarText = (await sidebar.textContent()) || '';
  41  |     // Should not contain full email pattern
  42  |     expect(sidebarText).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  43  |   });
  44  | 
  45  |   // Security Headers
  46  |   test('HSTS active on both sites', async ({ request }) => {
  47  |     for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
  48  |       const response = await request.get(url);
  49  |       expect(response.headers()['strict-transport-security']).toContain('max-age=31536000');
  50  |     }
  51  |   });
  52  | 
  53  |   test('CSP with nonces on both sites', async ({ request }) => {
  54  |     for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
  55  |       const response = await request.get(url);
  56  |       expect(response.headers()['content-security-policy']).toContain('nonce-');
  57  |     }
  58  |   });
  59  | 
  60  |   test('X-Frame-Options DENY on both sites', async ({ request }) => {
  61  |     for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
  62  |       const response = await request.get(url);
  63  |       expect(response.headers()['x-frame-options']).toBe('DENY');
  64  |     }
  65  |   });
  66  | 
  67  |   // Auth Enforcement
  68  |   test('All admin API endpoints return 401 without auth', async ({ request }) => {
  69  |     for (const endpoint of ['/api/transactions', '/api/listings', '/api/disputes', '/api/notifications']) {
  70  |       const response = await request.get(`https://admin.cardvault.id${endpoint}`);
  71  |       expect(response.status()).toBe(401);
  72  |     }
  73  |   });
  74  | 
  75  |   test('Beta marketplace routes redirect to login', async ({ page }) => {
  76  |     for (const route of ['/explore', '/sell', '/profile', '/messages']) {
  77  |       await page.goto(`https://beta.cardvault.id${route}`);
  78  |       await expect(page).toHaveURL(/auth\/login/);
  79  |     }
  80  |   });
  81  | 
  82  |   // Performance
  83  |   test('Beta landing TTFB under 800ms', async ({ request }) => {
  84  |     const start = Date.now();
  85  |     await request.get('https://beta.cardvault.id/');
  86  |     const ttfb = Date.now() - start;
  87  |     expect(ttfb).toBeLessThan(800);
  88  |   });
  89  | 
  90  |   // Console Errors
  91  |   test('Zero console errors on beta', async ({ page }) => {
  92  |     const errors: string[] = [];
  93  |     page.on('pageerror', (error) => errors.push(error.message));
  94  |     page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) });
  95  |     await page.goto('https://beta.cardvault.id/');
> 96  |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test ended.
  97  |     expect(errors).toHaveLength(0);
  98  |   });
  99  | 
  100 |   test('Zero console errors on admin', async ({ page }) => {
  101 |     const errors: string[] = [];
  102 |     page.on('pageerror', (error) => errors.push(error.message));
  103 |     page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) });
  104 |     // This will redirect to login because we aren't seeding auth headers natively
  105 |     await page.goto('https://admin.cardvault.id/admin/login');
  106 |     await page.waitForLoadState('networkidle');
  107 |     expect(errors).toHaveLength(0);
  108 |   });
  109 | });
  110 | 
```