import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runListingTest() {
  console.log('🔄 Executing Automated Listing QA Sequence...');
  
  const testUser = await prisma.user.findFirst({ where: { email: 'ade@kios.io' } });
  if (!testUser) throw new Error("Could not locate designated test user. Ensure you have 'ade@kios.io' in the database!");

  const cardPayload = {
    ownerId: testUser.id,
    cardName: 'Pikachu Illustrator (QA Trace)',
    condition: 'graded',
    gradingCompany: 'PSA',
    grade: '9',
    sportOrCategory: 'POKEMON',
    listForSale: true,
    priceIdr: 50000000,
    frontImageUrl: 'https://cardvault.id/assets/mock-front-submit.jpg',
    backImageUrl: 'https://cardvault.id/assets/mock-back-submit.jpg'
  };

  console.log('1️⃣ Activating Secure /api/cards Upload Pipeline...');
  const res = await fetch('http://localhost:3000/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardPayload)
  });

  const card = await res.json();
  if (!res.ok) throw new Error('API Rejection: ' + JSON.stringify(card));

  console.log('2️⃣ Validating Database Photographic Storage Integrity...');
  const dbCard = await prisma.card.findUnique({ where: { id: card.id } });
  
  console.log(`- Acquired Card ID: ${dbCard?.id}`);
  console.log(`- Expected Front Image: https://cardvault.id/assets/mock-front-submit.jpg`);
  console.log(`- Actual Front Image Saved: ${dbCard?.frontImageUrl || 'NULL/MISSING'}`);
  console.log(`- Actual Back Image Saved: ${dbCard?.backImageUrl || 'NULL/MISSING'}`);

  if (dbCard?.frontImageUrl === cardPayload.frontImageUrl) {
      console.log('✅ Photo URL binding is fully consistent and persisted to Postgres!');
  } else {
      throw new Error("CRITICAL FAIL: Photo mapping did not hit DB layer!");
  }

  console.log('3️⃣ Simulating Listing Deployment...');
  const listingRes = await fetch('http://localhost:3000/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardId: card.id,
      sellerId: testUser.id,
      priceIdr: cardPayload.priceIdr
    })
  });
  
  if (listingRes.ok) {
     console.log('✅ Secondary Market List Generation Passed!');
  } else {
     throw new Error('Listing Route Failure');
  }

  console.log('\n🚀 LISTING END-TO-END PHOTOGRAPHY HOOK VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

runListingTest().catch(console.error);
