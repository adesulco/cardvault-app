import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const QA_EMAIL = 'qa.agent.e2e@cardvault.id';

test.describe('E2E QA Flow - Registration to Post Inventory', () => {

  test.afterAll(async () => {
    // Delete the data after successful test
    await prisma.listing.deleteMany({
      where: { seller: { email: QA_EMAIL } }
    });
    await prisma.card.deleteMany({
      where: { owner: { email: QA_EMAIL } }
    });
    await prisma.user.deleteMany({
      where: { email: QA_EMAIL }
    });
  });

  test('User registers, admin approves, user posts item', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for slow Dev server compiles
    
    // 1. User Registration
    await page.goto('http://localhost:3000/auth/register');
    await page.fill('input[placeholder="Your trading name"]', 'QA Agent');
    await page.fill('input[placeholder="you@example.com"]', QA_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', 'qa-password!1');
    await page.fill('input[placeholder="Re-enter password"]', 'qa-password!1');
    
    // Select Seller Role
    await page.click('text=I want to Sell cards');
    
    // Upload files (using our local dummy files)
    const fileInputs = await page.locator('input[type="file"]').all();
    if (fileInputs.length >= 2) {
       await fileInputs[0].setInputFiles('/tmp/id.pdf');
       await fileInputs[1].setInputFiles('/tmp/selfie.png');
    }

    await page.click('button:has-text("Create Account")');
    await expect(page.locator('text=Application Submitted')).toBeVisible({ timeout: 15000 });

    // 2. Admin KYC Approval (Programmatic via DB)
    await prisma.user.update({
      where: { email: QA_EMAIL },
      data: { kycStatus: 'APPROVED', trustScore: 10 }
    });
    
    // 3. Login User
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', QA_EMAIL);
    await page.fill('input[type="password"]', 'qa-password!1');
    await page.click('button:has-text("Sign In")');
    
    // Expect to be routed to Home
    await expect(page).toHaveURL('http://localhost:3000/');

    // 4. Post New Inventory
    await page.goto('http://localhost:3000/cards/new');
    await page.fill('input[placeholder="e.g., Charizard VMAX"]', 'Shining QA Charizard');
    await page.fill('input[placeholder="2024"]', '1999');
    
    // Enable list for sale switch
    await page.click('button:has(div.translate-x-0)');
    
    // Wait for price input to appear and fill it
    const priceInput = page.locator('input[placeholder="0"]');
    await expect(priceInput).toBeVisible();
    await priceInput.fill('50000');
    
    // Accept success alert
    page.on('dialog', dialog => dialog.accept());

    await page.click('button:has-text("Add Card & Create Listing")');
    
    // Expect to be redirected to cards portfolio
    await expect(page).toHaveURL('http://localhost:3000/cards', { timeout: 15000 });
  });

});
