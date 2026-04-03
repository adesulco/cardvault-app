import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lotus = await prisma.card.findFirst({ where: { cardName: { contains: 'Black Lotus' } }});
  console.log('Lotus Grade:', lotus?.grade, 'Company:', lotus?.gradingCompany, 'Image:', lotus?.images);

  const ohtani = await prisma.card.findFirst({ where: { cardName: { contains: 'Ohtani' } }});
  console.log('Ohtani Image:', ohtani?.images);

  const john = await prisma.user.findFirst({ where: { displayName: { contains: 'John' } }});
  console.log('John:', john?.kycStatus);
}
main().catch(console.error).finally(() => prisma.$disconnect());
