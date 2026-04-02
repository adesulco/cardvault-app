import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    where: { kycStatus: 'PENDING' }
  });
  console.log("ALL PENDING USERS:", users);
}
run();
