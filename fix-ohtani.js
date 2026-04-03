const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ohtani = await prisma.card.findFirst({ where: { cardName: { contains: "Shohei Ohtani" } } });
  const judge = await prisma.card.findFirst({ where: { cardName: { contains: "Aaron Judge" } } });
  
  if (ohtani && judge) {
    if (ohtani.frontImageUrl.includes("judge") && judge.frontImageUrl.includes("ohtani")) {
        console.log("Found swapped images, swapping back...");
        const ohUrl = ohtani.frontImageUrl;
        const ohtaniScore = ohtani.grade;
        
        await prisma.card.update({ where: { id: ohtani.id }, data: { frontImageUrl: judge.frontImageUrl, grade: "10" } });
        await prisma.card.update({ where: { id: judge.id }, data: { frontImageUrl: ohUrl, grade: "9" } });
    } else if (ohtani.frontImageUrl.includes("judge")) {
        console.log("Ohtani has judge image but judge doesnt have ohtani. Using ohtani slab");
        await prisma.card.update({ where: { id: ohtani.id }, data: { frontImageUrl: "/media/ohtani_slab.png", grade: "10" } });
    }
  }
  console.log("Done checking ohtani mismatch");
}

run().then(() => prisma.$disconnect()).catch(console.error);
