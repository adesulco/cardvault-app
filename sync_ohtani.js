const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.card.findFirst({ where: { cardName: { contains: 'Ohtani' } } })
  .then(c => prisma.card.update({ where: { id: c.id }, data: { frontImageUrl: '/images/ohtani.jpg' } }))
  .then(() => console.log('Ohtani synced!'))
  .finally(() => prisma.$disconnect());
