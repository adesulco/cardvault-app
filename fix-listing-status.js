const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const transactions = await prisma.transaction.findMany({ where: { escrowStatus: { in: ['completed', 'delivered' ] } }});
  let updated = 0;
  for (const t of transactions) {
     if (t.listingId) {
        await prisma.listing.update({ where: { id: t.listingId }, data: { status: 'sold' }});
        updated++;
     }
  }
  console.log('Fixed ' + updated + ' stale active listings');
}
main().catch(console.error).finally(() => prisma.$disconnect());
