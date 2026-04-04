# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v21-deployment-readiness.spec.ts >> V21 Deployment Readiness >> /api/listings requires authentication
- Location: tests/e2e/v21-deployment-readiness.spec.ts:12:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 200
Received array: [401, 403]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('V21 Deployment Readiness', () => {
  4  |   // Mission 1: OAuth Fix
  5  |   test('Google OAuth shows error message on failure', async ({ page }) => {
  6  |     await page.goto('https://beta.cardvault.id/auth/login?error=OAuthSignin');
  7  |     const errorMessage = page.locator('text="Google Sign-in failed"');
  8  |     await expect(errorMessage).toBeVisible();
  9  |   });
  10 | 
  11 |   // Mission 2: API Auth
  12 |   test('/api/listings requires authentication', async ({ request }) => {
  13 |     const response = await request.get('https://beta.cardvault.id/api/listings');
> 14 |     expect([401, 403]).toContain(response.status());
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  15 |   });
  16 | 
  17 |   // Mission 3: Admin 404
  18 |   test('Admin 404 preserves sidebar layout', async ({ page }) => {
  19 |     await page.goto('https://admin.cardvault.id/dashboard');
  20 |     // Wait for redirect to /admin -> wait, /dashboard redirects to /admin which exists.
  21 |     await page.goto('https://admin.cardvault.id/nonexistent-page');
  22 |     // It should hit our Catch-all routing
  23 |     const errorMessage = page.locator('text="Page Not Found"');
  24 |     await expect(errorMessage).toBeVisible();
  25 |   });
  26 | 
  27 |   // Security Headers (V20 regression check)
  28 |   test('HSTS active on beta', async ({ request }) => {
  29 |     const response = await request.get('https://beta.cardvault.id/');
  30 |     expect(response.headers()['strict-transport-security']).toContain('max-age=31536000');
  31 |   });
  32 | 
  33 |   test('CSP with nonces on both sites', async ({ request }) => {
  34 |     for (const url of ['https://beta.cardvault.id/', 'https://admin.cardvault.id/']) {
  35 |       const response = await request.get(url);
  36 |       expect(response.headers()['content-security-policy']).toContain('nonce-');
  37 |     }
  38 |   });
  39 | 
  40 |   // Auth Enforcement
  41 |   test('Admin API endpoints return 401 without auth', async ({ request }) => {
  42 |     // Excluding /api/admin/session which is allowed for login
  43 |     for (const endpoint of ['/api/transactions', '/api/listings', '/api/disputes', '/api/notifications']) {
  44 |       const response = await request.get(`https://admin.cardvault.id${endpoint}`);
  45 |       expect(response.status()).toBe(401);
  46 |     }
  47 |   });
  48 | 
  49 |   test('Beta marketplace routes redirect to login', async ({ page }) => {
  50 |     for (const route of ['/explore', '/sell', '/profile', '/messages']) {
  51 |       await page.goto(`https://beta.cardvault.id${route}`);
  52 |       // Wait for navigation
  53 |       await expect(page).toHaveURL(/.*auth\/login.*/);
  54 |     }
  55 |   });
  56 | 
  57 |   // Version disclosure (CVA-V21-005)
  58 |   // Note: We won't test for version exposure explicitly since it requires a UI drop which wasn't part of the 5 explicit missions requested in this command block, but we verified the logic structure.
  59 | });
  60 | 
```