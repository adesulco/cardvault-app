const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
   const users = await prisma.user.findMany({ select: { email: true, isAdmin: true } });
   console.log("Users:", users);
}
main();
