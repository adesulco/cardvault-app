import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    
    // Fallback ID if none provided (for beta prototype testing without auth)
    const activeUserId = userId || 'mock-buyer-id-999';

    const whereClause: any = {};
    
    if (role === 'buyer') {
      whereClause.buyerId = activeUserId;
    } else if (role === 'seller') {
      whereClause.sellerId = activeUserId;
    } else {
      whereClause.OR = [
        { buyerId: activeUserId },
        { sellerId: activeUserId }
      ];
    }

    if (status && status !== 'all') {
      whereClause.escrowStatus = status;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        listing: { include: { card: true } },
        buyer: { select: { displayName: true } },
        seller: { select: { displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = transactions.map((t: any) => ({
      id: t.id,
      cardName: t.listing?.card?.cardName || 'Delisted Card',
      date: new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      role: t.buyerId === activeUserId ? 'buyer' : 'seller',
      buyer: t.buyer?.displayName || 'Unknown Buyer',
      seller: t.seller?.displayName || 'Unknown Seller',
      priceIdr: t.agreedPriceIdr || 0,
      escrowStatus: t.escrowStatus
    }));

    return NextResponse.json({ transactions: formatted, total: formatted.length });
  } catch (error: any) {
    console.error('Transactions API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.totalIdr >= 10000000) {
      const buyer = await prisma.user.findUnique({ where: { id: body.buyerId || 'mock-buyer-id-999' } });
      if (buyer?.kycStatus !== 'APPROVED') {
        return NextResponse.json({ error: 'KYC Verification Required: Transactions over Rp 10.000.000 require approved KYC status.' }, { status: 403 });
      }
    }

    // In a prod app, we'd wrap this in a prisma.$transaction to guarantee atomic inserts
    const newTransaction = await prisma.transaction.create({
      data: {
        buyerId: body.buyerId || 'mock-buyer-id-999',
        sellerId: body.sellerId,
        listingId: body.listingId,
        transactionType: 'sale',
        agreedPriceIdr: body.priceIdr,
        platformFeeBuyerIdr: body.buyerFeeIdr,
        buyerPaidAmount: body.totalIdr,
        paymentGateway: body.paymentGateway,
        paymentMethodType: body.paymentMethodType,
        escrowStatus: 'payment_held', // Immediately holding in escrow after mock payment
        paymentIdempotencyKey: crypto.randomUUID()
      }
    });

    if (body.listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
      if (listing) {
        await prisma.$transaction([
          prisma.listing.update({
            where: { id: body.listingId },
            data: { status: 'in_transaction' } // Reserve it so it drops from marketplace
          }),
          prisma.card.update({
            where: { id: listing.cardId },
            data: { status: 'in_transaction' }
          })
        ]);
      }
    }

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error: any) {
    console.error('Tx Create Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
