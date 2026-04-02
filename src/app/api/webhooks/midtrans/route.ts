import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEscrowReceipt } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Webhook Security Validation Simulation
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'dummy_server_key';
    const computedSignature = crypto
      .createHash('sha512')
      .update(payload.order_id + payload.status_code + payload.gross_amount + serverKey)
      .digest('hex');

    // When money successfully hits our platform vault
    if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') {
      const transaction = await prisma.transaction.findFirst({
        where: { id: payload.order_id },
        include: { buyer: true, seller: true, listing: { include: { card: true } } }
      });

      // ── Phase 13: Intercept Wallet Top-Ups ──
      if (!transaction) {
         const walletTx = await prisma.walletTransaction.findUnique({ where: { id: payload.order_id } });
         if (walletTx && walletTx.status === 'pending' && walletTx.type === 'top_up') {
            await prisma.$transaction([
               prisma.walletTransaction.update({ where: { id: walletTx.id }, data: { status: 'completed' } }),
               prisma.user.update({ where: { id: walletTx.userId }, data: { walletBalanceIdr: { increment: walletTx.amountIdr } } }),
               prisma.notification.create({
                 data: { userId: walletTx.userId, type: 'payment_received', title: 'Vault Reloaded Successfully 💰', body: `Rp ${walletTx.amountIdr.toLocaleString()} has settled. You are now authorized to instantly check out high-stakes assets.` }
               })
            ]);
         }
         return NextResponse.json({ status: 'success' });
      }

      if (transaction) {
         await prisma.transaction.update({
           where: { id: transaction.id },
           data: { escrowStatus: 'payment_held' }
         });

         const cardRef = transaction.listing?.card?.cardName || 'your negotiated marketplace asset';
         
         // ── Phase 11: Escrow Notification Broadcast ──
         const notificationPromises = [];
         
         if (transaction.buyer?.email) {
            notificationPromises.push(sendEscrowReceipt(transaction.buyer.email, cardRef, 'buyer'));
            notificationPromises.push(prisma.notification.create({
               data: { userId: transaction.buyer.id, type: 'payment_received', title: 'Fund Secured in Vault 🔒', body: `Your payment of Rp ${transaction.agreedPriceIdr?.toLocaleString()} was locked in Escrow. the Seller is authorized to ship.`}
            }));
         }
         
         if (transaction.seller?.email) {
            notificationPromises.push(sendEscrowReceipt(transaction.seller.email, cardRef, 'seller'));
            notificationPromises.push(prisma.notification.create({
               data: { userId: transaction.seller.id, type: 'escrow_shipped', title: 'Vault Authorization: Prepare Shipment 📦', body: `The Buyer has locked funds into Escrow. You are legally authorized to ship ${cardRef}.`}
            }));
         }

         await Promise.all(notificationPromises).catch(err => console.error('Silent Notification Engine Fault:', err));
      }
    } else if (payload.transaction_status === 'cancel' || payload.transaction_status === 'expire') {
        const transaction = await prisma.transaction.findFirst({
          where: { id: payload.order_id }
        });
        
        if (transaction && transaction.listingId) {
          // Release the hold on the listing back to the marketplace
          await prisma.listing.update({
            where: { id: transaction.listingId },
            data: { status: 'active' }
          });
        }
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    console.error('Midtrans Escrow Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
