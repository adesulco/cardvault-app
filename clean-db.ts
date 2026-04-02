import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning duplicate listings...');
  
  // Find all cards
  const cards = await prisma.card.findMany({
    include: {
      listings: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  let deletedCount = 0;

  for (const card of cards) {
    if (card.listings.length > 1) {
      // Keep the first one, delete the rest
      const [keep, ...duplicates] = card.listings;
      for (const duplicate of duplicates) {
         try {
           await prisma.listing.delete({
             where: { id: duplicate.id }
           });
           console.log(`Deleted duplicate listing ${duplicate.id} for card ${card.cardName}`);
           deletedCount++;
         } catch(e) {
           console.log('Skipped duplicate ' + duplicate.id + ' probably because it has relations.');
         }
      }
    }
  }

  console.log(`Finished. Deleted ${deletedCount} duplicate listings.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
