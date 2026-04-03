const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.card.findMany();
  for (const c of cards) {
    if (!c.estimatedValueIdr || c.estimatedValueIdr === 0) {
       let value = 15000000;
       if (c.cardName.includes('Charizard')) value = 50000000;
       if (c.cardName.includes('Lotus')) value = 250000000;
       await prisma.card.update({ where: { id: c.id }, data: { estimatedValueIdr: value } });
    }
  }
  console.log('Fixed cards estimated values');
}
main().catch(console.error).finally(() => prisma.$disconnect());
