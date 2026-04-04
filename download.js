const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OHTANI_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shohei_Ohtani_%2842426309854%29.jpg/800px-Shohei_Ohtani_%2842426309854%29.jpg'
];

const LOTUS_URLS = [
  'https://media.psacard.com/cardfacts/1993-magic-the-gathering-232-black-lotus-alpha-70366.jpg',
  'https://cardsblog.psacard.com/wp-content/uploads/2021/01/Alpha-Black-Lotus-PSA-10.jpg',
  'https://upload.wikimedia.org/wikipedia/en/a/aa/Magic_the_gathering-card_back.jpg' // reliable fallback
];

async function tryDownload(urls, dest) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buffer));
        console.log(`Success! Downloaded ${url}`);
        return true;
      }
    } catch(e) {
      // ignore
    }
  }
  return false;
}

async function main() {
  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }

  const ohtaniSuccess = await tryDownload(OHTANI_URLS, 'public/images/ohtani.jpg');
  if (ohtaniSuccess) {
    const ohtaniCard = await prisma.card.findFirst({ where: { cardName: { contains: 'Ohtani' } } });
    if (ohtaniCard) {
      await prisma.card.update({ where: { id: ohtaniCard.id }, data: { frontImageUrl: '/images/ohtani.jpg' } });
    }
  }

  const lotusSuccess = await tryDownload(LOTUS_URLS, 'public/images/lotus.jpg');
  if (lotusSuccess) {
    const lotusCard = await prisma.card.findFirst({ where: { cardName: { contains: 'Lotus' } } });
    if (lotusCard) {
      await prisma.card.update({ where: { id: lotusCard.id }, data: { frontImageUrl: '/images/lotus.jpg', gradingCompany: 'PSA', grade: '10' } });
    }
  }
  console.log('Update Complete!');
}

main().finally(() => prisma.$disconnect());
