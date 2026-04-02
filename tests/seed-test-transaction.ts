import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Spawning physical QA transaction for Escrow/Chat flows...');

  const ade = await prisma.user.findUnique({ where: { email: 'adesulistioputra@gmail.com' } });
  if (!ade) {
    console.error('Primary user missing. Please register first.');
    return;
  }

  // Create a synthetic counterpart
  const buyer = await prisma.user.upsert({
    where: { email: 'test_qa_buyer@cardvault.id' },
    update: {},
    create: {
      email: 'test_qa_buyer@cardvault.id',
      displayName: 'CardVault QA Buyer',
      trustScore: 100
    }
  });

  // Create a grail card for Ade
  const card = await prisma.card.create({
    data: {
      ownerId: ade.id,
      cardName: 'LeBron James (QA Verify)',
      brand: 'Panini Prizm',
      year: '2012',
      status: 'listed_sale'
    }
  });

  const listing = await prisma.listing.create({
    data: {
      sellerId: ade.id,
      cardId: card.id,
      priceIdr: 15500000,
      listingType: 'sale'
    }
  });

  // Physically force an escrow directly into "Payment Held" so Ade (Seller) has to hit "Mark Shipped"
  const tx = await prisma.transaction.create({
    data: {
      buyerId: buyer.id,
      sellerId: ade.id,
      listingId: listing.id,
      transactionType: 'sale',
      agreedPriceIdr: 15500000,
      buyerPaidAmount: 15500000,
      escrowStatus: 'payment_held',
      paymentGateway: 'qris_midtrans'
    }
  });

  // Physically generate a chat message history between them
  const convId = [ade.id, buyer.id].sort().join('-chat-');
  await prisma.message.create({
    data: {
      conversationId: convId,
      senderId: buyer.id,
      recipientId: ade.id,
      content: 'Hey Ade, just paid! Excited to receive the LeBron Prizm.'
    }
  });

  console.log('✅ Setup success! Transaction ID:', tx.id);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
