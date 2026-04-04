const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(c => console.log('Users in DB:', c)).finally(() => prisma.$disconnect());
