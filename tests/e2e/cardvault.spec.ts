import { test, expect } from '@playwright/test';

test.describe('V20 Live Deployment Security Audit', () => {
    test('Anonymous Landing Page enforces rigid marketing template', async ({ page }) => {
        await page.goto('https://beta.cardvault.id/');
        // Verify absence of products
        await expect(page.locator('text=Most Popular')).toHaveCount(0);
        await expect(page.locator('text=Load More Grails')).toHaveCount(0);
        // Verify absence of Header navigation and Currency toggle
        await expect(page.locator('text=IDR').first()).not.toBeVisible();
        // Ensure only marketing structure exists
        await expect(page.locator('text=Apply to Join Beta')).toBeVisible();
    });

    test('Unauthenticated Marketplace attempts redirect to Authentication', async ({ page }) => {
        await page.goto('https://beta.cardvault.id/explore');
        // Validate redirection lock
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });

    test('Admin dashboard explicitly forces authenticated login barrier', async ({ page }) => {
        await page.goto('https://admin.cardvault.id/transactions');
        await expect(page).toHaveURL(/.*\/admin\/login/);
    });

    test('Strict-Transport-Security (HSTS) is globally active', async ({ request }) => {
        const response = await request.get('https://beta.cardvault.id/');
        expect(response.headers()['strict-transport-security']).toContain('max-age=31536000; includeSubDomains; preload');
    });

    test('Content Security Policy (CSP) enforces nonces natively', async ({ request }) => {
        const response = await request.get('https://beta.cardvault.id/');
        expect(response.headers()['content-security-policy']).toContain('nonce-');
    });
});
