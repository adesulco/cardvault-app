import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
   // Fetch everyone with a score over 5 (meaning they are on the old 0-100 system)
   const oldScaleUsers = await prisma.user.findMany({
      where: { trustScore: { gt: 10 } }
   });

   for (const user of oldScaleUsers) {
      // 99 / 100 * 5 = 4.95 -> 5.0
      // 80 / 100 * 5 = 4.0
      const newScore = Number(((user.trustScore / 100) * 5).toFixed(1));
      
      await prisma.user.update({
         where: { id: user.id },
         data: { trustScore: newScore }
      });
      console.log(`Migrated ${user.displayName}: ${user.trustScore} -> ${newScore} ★`);
   }
   console.log('Migration complete!');
}

migrate()
   .catch(console.error)
   .finally(() => prisma.$disconnect());
