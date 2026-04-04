import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        buyer: { select: { id: true, email: true, displayName: true } },
        seller: { select: { id: true, email: true, displayName: true } },
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { transactionId, escrowStatus, note } = await request.json();

    if (!transactionId || !escrowStatus) {
      return NextResponse.json(
        { error: 'transactionId and escrowStatus required' },
        { status: 400 }
      );
    }

    const data: any = { escrowStatus };
    if (escrowStatus === 'completed') {
      data.completedAt = new Date();
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data,
      include: { listing: true }
    });

    if (escrowStatus === 'completed' && updated.listing) {
      await prisma.listing.update({ where: { id: updated.listing.id }, data: { status: 'sold' } });
      await prisma.card.update({ where: { id: updated.listing.cardId }, data: { status: 'sold' } });
    }

    if (escrowStatus === 'payment_held' && updated.paymentMethodType === 'bank_transfer_manual') {
      const netAmount = updated.agreedPriceIdr || 0;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: updated.sellerId },
          data: { walletBalanceIdr: { increment: netAmount } }
        }),
        prisma.walletTransaction.create({
          data: {
            userId: updated.sellerId,
            amountIdr: netAmount,
            type: 'escrow_sale',
            description: `Escrow transfer verified for Tx #${updated.id.slice(0, 8)}`,
            referenceId: updated.id,
            status: 'completed'
          }
        })
      ]);
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
