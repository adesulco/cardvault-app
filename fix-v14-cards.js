const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.card.findMany();
  for (const c of cards) {
    if (c.cardName.includes('Charizard')) {
      await prisma.card.update({ where: { id: c.id }, data: { year: '1999', certNumber: '28671609' } });
    }
    if (c.cardName.includes('Blue-Eyes')) {
      await prisma.card.update({ where: { id: c.id }, data: { year: '2002', certNumber: '28937105' } });
    }
    if (c.cardName.includes('Black Lotus')) {
      await prisma.card.update({ where: { id: c.id }, data: { year: '1993', certNumber: '1099308' } });
    }
    if (c.cardName.includes('Shohei Ohtani')) {
      await prisma.card.update({ where: { id: c.id }, data: { year: '2018', certNumber: '89102844' } });
    }
    if (c.cardName.includes('Aaron Judge')) {
      await prisma.card.update({ where: { id: c.id }, data: { year: '2017', certNumber: '55612300' } });
    }
  }
  console.log('Fixed cards year and certNumber');
}
main().catch(console.error).finally(() => prisma.$disconnect());
