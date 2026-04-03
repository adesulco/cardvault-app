import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const [cardsCount, watchlistCount, buyerTx, sellerTx, cards] = await Promise.all([
      prisma.card.count({ where: { ownerId: userId, status: { notIn: ['sold', 'traded'] } } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.transaction.count({ where: { buyerId: userId, escrowStatus: "completed" } }),
      prisma.transaction.count({ where: { sellerId: userId, escrowStatus: "completed" } }),
      prisma.card.findMany({ where: { ownerId: userId }, select: { estimatedValueIdr: true } })
    ]);

    const collectionValueIdr = cards.reduce((acc, c) => acc + (c.estimatedValueIdr || 0), 0);

    return NextResponse.json({
      cardsOwned: cardsCount,
      watchlistCount: watchlistCount,
      totalTransactions: buyerTx + sellerTx,
      collectionValue: collectionValueIdr
    });
  } catch (error: any) {
    console.error('Failed to fetch profile stats:', error.message);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
