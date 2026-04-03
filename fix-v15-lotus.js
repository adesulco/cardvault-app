const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.card.findMany({ where: { cardName: { contains: 'Black Lotus' } } });
  for (const c of cards) {
    await prisma.card.update({ where: { id: c.id }, data: { certNumber: '84720931' } });
  }
  console.log('Fixed Black Lotus cert number');
}
main().catch(console.error).finally(() => prisma.$disconnect());
