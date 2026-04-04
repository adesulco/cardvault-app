const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = '/Users/user/.gemini/antigravity/artifacts';
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Validating task 1.1 LocalStorage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const localStorageDump = await page.evaluate(() => {
    return JSON.stringify(Object.keys(localStorage).map(k => ({
      key: k,
      value: localStorage.getItem(k).substring(0, 500)
    })), null, 2);
  });
  console.log('LocalStorage:', localStorageDump);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v18_localstorage.png') });

  console.log('Validating task 1.2 Black Lotus...');
  await page.goto('http://localhost:3000/explore/21dcebf2-9157-4e26-8bfd-76ea9f3ef868', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v18_lotus_badge.png') });

  console.log('Validating Ohtani Image...');
  await page.goto('http://localhost:3000/explore/9b6de645', { waitUntil: 'networkidle0' }); // Assuming it starts with 9b
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v18_ohtani.png') });

  console.log('Validating Admin Listings...');
  await page.goto('http://localhost:3000/admin/listings', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v18_admin_listings.png') });

  console.log('Validating Admin Dashboard...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'v18_admin_dashboard.png') });

  await browser.close();
  console.log('Extraction complete!');
})();
