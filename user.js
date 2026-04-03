const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
   const admin = await prisma.user.findFirst({where: {isAdmin: true}});
   console.log("Admin Email:", admin.email);
}
main();
