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
  try {
    const passwordHash = await hash('cardvault2024', 10);
    
    // 1. Ensure seed Admin and Standard Seller exist
    const admin = await prisma.user.upsert({
      where: { email: 'adesulistioputra@gmail.com' },
      update: {},
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
      },
    });

    console.log('Generating seed cards & listings...');

    for (const data of SEED_CARDS) {
      // Create the card
      const newCard = await prisma.card.create({
        data: {
          ownerId: admin.id,
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

      // Create live active listing for it
      await prisma.listing.create({
        data: {
          sellerId: admin.id,
          cardId: newCard.id,
          listingType: 'sale',
          priceIdr: data.price,
          status: 'active',
        }
      });
    }

    console.log('Successfully seeded listings.');

    // Create secondary test user for Transactions
    const testBuyer = await prisma.user.upsert({
      where: { email: 'buyer@test.com' },
      update: {},
      create: {
        email: 'buyer@test.com',
        displayName: 'John Collector',
        passwordHash,
        userRole: 'BUYER',
        countryCode: 'ID',
        preferredCurrency: 'IDR',
      },
    });

    // Generate Mock Messages
    await prisma.message.create({
      data: {
        conversationId: `${admin.id}_${testBuyer.id}`,
        senderId: testBuyer.id,
        recipientId: admin.id,
        content: 'Is this Charizard still available for immediate escrow?',
        isRead: false,
      }
    });

    // Generate Mock Transactions (Escrow testing)
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

    await prisma.transaction.create({
      data: {
        buyerId: testBuyer.id,
        sellerId: admin.id,
        transactionType: 'sale',
        agreedPriceIdr: 125000000,
        platformFeeBuyerIdr: 3750000,
        platformFeeSellerIdr: 3750000,
        escrowStatus: 'shipped',
        trackingNumberSeller: 'RESI-CARD-123',
      }
    });

    console.log('Successfully injected historical Transactions, Messages, and Sales for Admin Panel Validation!');
  } catch (error) {
    console.error('Error in seed script:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
