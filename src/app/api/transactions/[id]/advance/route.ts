import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactionId = id;

  try {
    const { action, trackingNumber, userId } = await request.json();
    if (!userId || !action) return NextResponse.json({ error: 'Missing physical fields' }, { status: 400 });

    const transaction = await prisma.transaction.findUnique({
       where: { id: transactionId },
       include: { listing: { include: { card: true } } }
    });
    if (!transaction) return NextResponse.json({ error: '404 Trx' }, { status: 404 });

    // Ensure authorized participant is performing the action
    if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
       return NextResponse.json({ error: 'Unauthorized Escrow Mutation' }, { status: 403 });
    }

    /* 
     * SELLER FLOW: UPLOADING TRACKING
     */
    if (action === 'ship_item' && userId === transaction.sellerId) {
       if (transaction.escrowStatus !== 'payment_held') return NextResponse.json({ error: 'Escrow is not locked.' }, { status: 400 });
       if (!trackingNumber) return NextResponse.json({ error: 'Mandatory Tracking Number missing.' }, { status: 400 });

       const updated = await prisma.transaction.update({
          where: { id: transactionId },
          data: { 
             escrowStatus: 'shipped',
             trackingNumberSeller: trackingNumber,
             updatedAt: new Date()
          }
       });

       // Notify Buyer
       await prisma.notification.create({
          data: { userId: transaction.buyerId, type: 'shipped', title: 'Grail Shipped!', body: `Tracking: ${trackingNumber}. Escrow is active.`}
       });
       return NextResponse.json({ transaction: updated });
    }

    /* 
     * BUYER FLOW: RELEASING FUNDS / CONFIRMING DELIVERY
     */
    if (action === 'release_escrow' && userId === transaction.buyerId) {
       if (transaction.escrowStatus !== 'shipped' && transaction.escrowStatus !== 'delivered') {
          return NextResponse.json({ error: 'Item must be shipped before inspection release.' }, { status: 400 });
       }

       // In production, this trigger mathematically executes Midtrans/Xendit payout APIs.
       // Here we finalize the logical state to 'completed'.
       const updated = await prisma.transaction.update({
          where: { id: transactionId },
          data: { 
             escrowStatus: 'completed',
             completedAt: new Date(),
          }
       });

       // ── Phase 13: Instant Vault Platform Routing ──
       // Dynamically intercept the Admin Configuration mapping to support active 0% Promo periods.
       const feeConfig = await prisma.platformConfig.findUnique({ where: { configKey: 'escrow_fee_percentage' } });
       
       // Calculate mathematically against a baseline 3.0 percentage limit
       let feePercentage = 3.0;
       if (feeConfig && !isNaN(parseFloat(feeConfig.configValue))) {
           feePercentage = parseFloat(feeConfig.configValue);
       }
       
       const multiplier = (100 - feePercentage) / 100;
       const sellerRevenue = transaction.agreedPriceIdr ? Math.floor(transaction.agreedPriceIdr * multiplier) : 0; 
       
       if (sellerRevenue > 0) {
          await prisma.$transaction([
             prisma.user.update({
                where: { id: transaction.sellerId },
                data: { walletBalanceIdr: { increment: sellerRevenue } }
             }),
             prisma.walletTransaction.create({
                data: {
                   userId: transaction.sellerId,
                   amountIdr: sellerRevenue,
                   type: 'escrow_sale',
                   status: 'completed',
                   referenceId: transactionId,
                   description: `Vault Payout: Escrow ${transactionId.slice(-6)}`
                }
             })
          ]);
       }

       // Trigger Loyaty Subsystem: Reward buyer & seller 50 points each
       await prisma.coinTransaction.createMany({
          data: [
             { userId: transaction.buyerId, amount: 50, source: 'escrow_completed', description: 'Transaction Complete' },
             { userId: transaction.sellerId, amount: 50, source: 'escrow_completed', description: 'Sale Fulfilled' }
          ]
       });

       // Notify Seller
       await prisma.notification.create({
          data: { userId: transaction.sellerId, type: 'completed', title: 'Escrow Released! 💰', body: `Buyer accepted condition. Rp ${sellerRevenue.toLocaleString()} has been beamed directly into your localized Vault Wallet!`}
       });
       return NextResponse.json({ transaction: updated });
    }

    return NextResponse.json({ error: 'Invalid operation.' }, { status: 400 });

  } catch (error: any) {
    console.error('Escrow advance failure:', error);
    return NextResponse.json({ error: 'Escrow state immutable failure.' }, { status: 500 });
  }
}
