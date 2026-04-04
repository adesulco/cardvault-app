# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: v21-deployment-readiness.spec.ts >> V21 Deployment Readiness >> Google OAuth shows error message on failure
- Location: tests/e2e/v21-deployment-readiness.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="Google Sign-in failed"')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text="Google Sign-in failed"')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]: v0.9.0
    - generic [ref=e6]:
      - img [ref=e7]
      - heading "Welcome Back" [level=1] [ref=e11]
      - paragraph [ref=e12]: Sign in to your CardVault account
      - button "Continue with Google" [ref=e13]:
        - img [ref=e14]
        - text: Continue with Google
      - generic [ref=e21]: or email
      - generic [ref=e23]:
        - generic [ref=e24]:
          - img [ref=e25]
          - textbox "Email address" [ref=e28]
        - generic [ref=e29]:
          - img [ref=e30]
          - textbox "Password" [ref=e33]
          - button [ref=e34]:
            - img [ref=e35]
        - link "Forgot password?" [ref=e39] [cursor=pointer]:
          - /url: /auth/forgot-password
        - button "Sign In" [ref=e40]
      - paragraph [ref=e41]:
        - text: Don't have an account?
        - link "Sign Up" [ref=e42] [cursor=pointer]:
          - /url: /auth/register
    - paragraph [ref=e44]: CardVault Build v0.9.0
  - alert [ref=e45]
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
> 8  |     await expect(errorMessage).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  9  |   });
  10 | 
  11 |   // Mission 2: API Auth
  12 |   test('/api/listings requires authentication', async ({ request }) => {
  13 |     const response = await request.get('https://beta.cardvault.id/api/listings');
  14 |     expect([401, 403]).toContain(response.status());
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