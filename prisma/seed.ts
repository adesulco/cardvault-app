import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_CARDS = [
  { cardName: 'Charizard Base Set', playerOrCharacter: 'Charizard', set: 'Base Set', brand: 'Pokémon', sport: 'pokemon', condition: 'graded', grade: '10', company: 'PSA', price: 25000000, img: '/seed/charizard.png' },
  { cardName: 'Blue-Eyes White Dragon', playerOrCharacter: 'Blue-Eyes White Dragon', set: 'LOB 1st Edition', brand: 'Konami', sport: 'yugioh', condition: 'graded', grade: '9.5', company: 'BGS', price: 18000000, img: '/seed/blue_eyes.png' },
  { cardName: 'Shohei Ohtani Chrome Auto', playerOrCharacter: 'Shohei Ohtani', set: 'Bowman Refractor', brand: 'Topps', sport: 'baseball', condition: 'graded', grade: '10', company: 'PSA', price: 55000000, img: '/seed/ohtani.png' },
  { cardName: 'Black Lotus Alpha', playerOrCharacter: 'Black Lotus', set: 'Alpha Edition', brand: 'Wizards of the Coast', sport: 'mtg', condition: 'graded', grade: '10', company: 'UGA', price: 125000000, img: '/seed/lotus.png' }
];

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
     console.warn('Production Environment detected. Aborting destructive seed...');
     return;
  }

  try {
    console.log('Purging the Vault of corrupted data...');
    // Delete all corrupted duplicate data recursively
    await prisma.message.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.platformConfig.deleteMany({});

    const passwordHash = await hash('cardvault2024', 10);
    
    // Core Authorized Personal Demo Account
    const admin = await prisma.user.upsert({
      where: { email: 'adesulistioputra@gmail.com' },
      update: { avatarUrl: null },
      create: {
        email: 'adesulistioputra@gmail.com',
        displayName: 'TokyoCards',
        passwordHash,
        isAdmin: true,
        kycStatus: 'APPROVED',
        userRole: 'ADMIN',
        isEmailVerified: true,
        countryCode: 'ID',
        preferredCurrency: 'IDR',
        avatarUrl: null
      },
    });

    const testBuyer = await prisma.user.upsert({
      where: { email: 'buyer@test.com' },
      update: { avatarUrl: null },
      create: {
        email: 'buyer@test.com',
        displayName: 'John Collector',
        passwordHash,
        userRole: 'BUYER',
        countryCode: 'ID',
        preferredCurrency: 'IDR',
        avatarUrl: null
      },
    });

    const testSeller = await prisma.user.upsert({
      where: { email: 'seller2@test.com' },
      update: { avatarUrl: null },
      create: {
        email: 'seller2@test.com',
        displayName: 'CardVault Official',
        passwordHash,
        userRole: 'SELLER',
        kycStatus: 'APPROVED',
        countryCode: 'ID',
        preferredCurrency: 'IDR',
        avatarUrl: null
      },
    });

    console.log('Generating seed cards & listings...');

    const SEED_CARDS = [
      { cardName: 'Charizard Base Set Holo', playerOrCharacter: 'Charizard', set: 'Base Set', brand: 'Pokémon', sport: 'pokemon', condition: 'graded', grade: '9', company: 'PSA', price: 15500000, img: '/mock/charizard_slab_1775067166104.png', ownerId: admin.id },
      { cardName: 'Blue-Eyes White Dragon', playerOrCharacter: 'Blue-Eyes White Dragon', set: 'LOB 1st Edition', brand: 'Konami', sport: 'yugioh', condition: 'graded', grade: '9.5', company: 'BGS', price: 45000000, img: '/mock/blue_eyes_slab_1775067182285.png', ownerId: admin.id },
      { cardName: 'Shohei Ohtani Chrome RC Auto', playerOrCharacter: 'Shohei Ohtani', set: 'Bowman Chrome Refractor', brand: 'Topps', sport: 'baseball', condition: 'graded', grade: '10', company: 'PSA', price: 25000000, img: '/mock/ohtani_slab_1775067262564.png', ownerId: testSeller.id },
      { cardName: 'Black Lotus Alpha Vault', playerOrCharacter: 'Black Lotus', set: 'Alpha Edition', brand: 'Wizards', sport: 'mtg', condition: 'graded', grade: '9', company: 'SCG', price: 125000000, img: '/mock/lotus_slab_1775067278497.png', ownerId: testSeller.id }
    ];

    for (const data of SEED_CARDS) {
      const newCard = await prisma.card.create({
        data: {
          ownerId: data.ownerId,
          cardName: data.cardName,
          playerOrCharacter: data.playerOrCharacter,
          setName: data.set,
          brand: data.brand,
          sportOrCategory: data.sport,
          condition: data.condition,
          grade: data.grade,
          gradingCompany: data.company,
          frontImageUrl: data.img,
          status: 'listed_sale',
        }
      });

      await prisma.listing.create({
        data: {
          sellerId: data.ownerId,
          cardId: newCard.id,
          listingType: 'sale',
          priceIdr: data.price,
          status: 'active',
        }
      });
    }

    // Set Up Realistic Historical Logs
    await prisma.transaction.create({
      data: {
        buyerId: testBuyer.id,
        sellerId: admin.id,
        transactionType: 'sale',
        agreedPriceIdr: 25000000,
        platformFeeBuyerIdr: 750000,
        platformFeeSellerIdr: 750000,
        escrowStatus: 'completed',
        completedAt: new Date(Date.now() - 86400000 * 2),
      }
    });

    console.log('Successfully injected deterministic, safe local Data!');
  } catch (error) {
    console.error('Error in seed script:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
