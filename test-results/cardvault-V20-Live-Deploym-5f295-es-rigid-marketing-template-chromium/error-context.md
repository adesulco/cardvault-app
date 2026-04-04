# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cardvault.spec.ts >> V20 Live Deployment Security Audit >> Anonymous Landing Page enforces rigid marketing template
- Location: tests/e2e/cardvault.spec.ts:4:9

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('text=IDR').first()
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for locator('text=IDR').first()
    9 × locator resolved to <span class="text-[12px] text-slate-700 font-medium">Multi-currency support (IDR & USD)</span>
      - unexpected value "visible"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: BETA
        - generic [ref=e7]: Limited Access
      - heading "CardVault Beta" [level=1] [ref=e8]
      - paragraph [ref=e9]: Trade with confidence. Your cards, your money — protected. Buy, sell, and trade collectible cards with vault protection.
      - generic [ref=e10]:
        - link "Apply to Join Beta" [ref=e11] [cursor=pointer]:
          - /url: /auth/register
        - link "Already a Member? Login" [ref=e12] [cursor=pointer]:
          - /url: /auth/login
    - generic [ref=e13]:
      - generic [ref=e14]:
        - img [ref=e15]
        - generic [ref=e18]: Vault Protected
      - generic [ref=e19]:
        - img [ref=e20]
        - generic [ref=e23]: Verified Sellers
      - generic [ref=e24]:
        - img [ref=e25]
        - generic [ref=e28]: Indonesia-first
    - generic [ref=e29]:
      - heading "How It Works" [level=2] [ref=e30]
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]: "1"
          - generic [ref=e34]:
            - heading "Place Order" [level=3] [ref=e35]
            - paragraph [ref=e36]: Browse verified listings and make an offer
        - generic [ref=e37]:
          - generic [ref=e38]: "2"
          - generic [ref=e39]:
            - heading "Secure Protection" [level=3] [ref=e40]
            - paragraph [ref=e41]: Payment held safely during shipping
        - generic [ref=e42]:
          - generic [ref=e43]: "3"
          - generic [ref=e44]:
            - heading "Receive & Confirm" [level=3] [ref=e45]
            - paragraph [ref=e46]: Verify card, confirm receipt, funds released
    - generic [ref=e47]:
      - heading "Beta Features" [level=2] [ref=e48]
      - generic [ref=e49]:
        - generic [ref=e50]:
          - img [ref=e51]
          - generic [ref=e54]: Secure vault-protected transactions
        - generic [ref=e55]:
          - img [ref=e56]
          - generic [ref=e59]: Multi-currency support (IDR & USD)
        - generic [ref=e60]:
          - img [ref=e61]
          - generic [ref=e64]: Seller KYC verification
        - generic [ref=e65]:
          - img [ref=e66]
          - generic [ref=e69]: Real-time payment gateways
        - generic [ref=e70]:
          - img [ref=e71]
          - generic [ref=e74]: Dispute resolution system
        - generic [ref=e75]:
          - img [ref=e76]
          - generic [ref=e79]: Seller ratings & reviews
    - generic [ref=e80]:
      - heading "FAQ" [level=2] [ref=e81]
      - generic [ref=e82]:
        - generic [ref=e83]:
          - paragraph [ref=e84]: Is CardVault free to use?
          - paragraph [ref=e85]: Yes, registration is free. We charge a small platform fee on sales (3%).
        - generic [ref=e86]:
          - paragraph [ref=e87]: Who can I trade with?
          - paragraph [ref=e88]: You can trade with verified sellers who have passed our KYC process.
        - generic [ref=e89]:
          - paragraph [ref=e90]: How long does shipping take?
          - paragraph [ref=e91]: Typically 3-7 days within Indonesia. International varies by carrier.
  - alert [ref=e92]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('V20 Live Deployment Security Audit', () => {
  4  |     test('Anonymous Landing Page enforces rigid marketing template', async ({ page }) => {
  5  |         await page.goto('https://beta.cardvault.id/');
  6  |         // Verify absence of products
  7  |         await expect(page.locator('text=Most Popular')).toHaveCount(0);
  8  |         await expect(page.locator('text=Load More Grails')).toHaveCount(0);
  9  |         // Verify absence of Header navigation and Currency toggle
> 10 |         await expect(page.locator('text=IDR').first()).not.toBeVisible();
     |                                                            ^ Error: expect(locator).not.toBeVisible() failed
  11 |         // Ensure only marketing structure exists
  12 |         await expect(page.locator('text=Apply to Join Beta')).toBeVisible();
  13 |     });
  14 | 
  15 |     test('Unauthenticated Marketplace attempts redirect to Authentication', async ({ page }) => {
  16 |         await page.goto('https://beta.cardvault.id/explore');
  17 |         // Validate redirection lock
  18 |         await expect(page).toHaveURL(/.*\/auth\/login/);
  19 |     });
  20 | 
  21 |     test('Admin dashboard explicitly forces authenticated login barrier', async ({ page }) => {
  22 |         await page.goto('https://admin.cardvault.id/transactions');
  23 |         await expect(page).toHaveURL(/.*\/admin\/login/);
  24 |     });
  25 | 
  26 |     test('Strict-Transport-Security (HSTS) is globally active', async ({ request }) => {
  27 |         const response = await request.get('https://beta.cardvault.id/');
  28 |         expect(response.headers()['strict-transport-security']).toContain('max-age=31536000; includeSubDomains; preload');
  29 |     });
  30 | 
  31 |     test('Content Security Policy (CSP) enforces nonces natively', async ({ request }) => {
  32 |         const response = await request.get('https://beta.cardvault.id/');
  33 |         expect(response.headers()['content-security-policy']).toContain('nonce-');
  34 |     });
  35 | });
  36 | 
```