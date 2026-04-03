const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.card.findMany();
  for (const c of cards) {
    if (c.cardName.includes('Charizard')) {
      await prisma.card.update({ where: { id: c.id }, data: { grade: '10' } });
    }
    if (c.cardName.includes('Blue-Eyes')) {
      await prisma.card.update({ where: { id: c.id }, data: { gradingCompany: 'CGC', grade: '9.5' } });
    }
    if (c.cardName.includes('Black Lotus')) {
      await prisma.card.update({ where: { id: c.id }, data: { gradingCompany: 'UGA', grade: '9' } });
    }
  }
  console.log('Fixed badges');
}
main().catch(console.error).finally(() => prisma.$disconnect());
