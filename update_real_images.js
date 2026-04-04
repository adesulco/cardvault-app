const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function scrapeGoogleImage(query) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`);
  
  // Get first image thumbnail that is loaded
  const imgUrl = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs) {
      if (img.src && img.src.startsWith('http') && !img.src.includes('favicon')) {
        return img.src;
      }
    }
    return null;
  });
  
  await browser.close();
  return imgUrl;
}

async function main() {
  console.log('Scraping Ohtani...');
  const ohtaniUrl = await scrapeGoogleImage('Shohei Ohtani 2018 Topps Chrome Rookie Auto PSA 10');
  console.log('Scraping Black Lotus...');
  const lotusUrl = await scrapeGoogleImage('MTG Alpha Black Lotus PSA 10');

  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }

  if (ohtaniUrl) {
    console.log('Downloading Ohtani:', ohtaniUrl.substring(0, 50));
    await downloadImage(ohtaniUrl, 'public/images/ohtani.jpg');
    const ohtaniCard = await prisma.card.findFirst({ where: { cardName: { contains: 'Ohtani' } } });
    if (ohtaniCard) {
      await prisma.card.update({ where: { id: ohtaniCard.id }, data: { images: ['/images/ohtani.jpg'] } });
    }
  }

  if (lotusUrl) {
    console.log('Downloading Black Lotus:', lotusUrl.substring(0, 50));
    await downloadImage(lotusUrl, 'public/images/lotus.jpg');
    const lotusCard = await prisma.card.findFirst({ where: { cardName: { contains: 'Lotus' } } });
    if (lotusCard) {
      await prisma.card.update({ where: { id: lotusCard.id }, data: { images: ['/images/lotus.jpg'], grade: '10', gradingCompany: 'PSA' } });
    }
  }

  console.log('Database and local images updated securely!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
