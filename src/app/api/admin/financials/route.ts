import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const [allTransactions, pendingPayouts, completedPayouts, recentTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: { escrowStatus: 'completed' },
        select: {
          agreedPriceIdr: true,
          agreedPriceUsd: true,
          platformFeeBuyerIdr: true,
          platformFeeSellerIdr: true,
        },
      }),
      prisma.transaction.count({
        where: {
          escrowStatus: 'completed',
          payoutId: null,
        },
      }),
      prisma.transaction.count({
        where: {
          payoutId: { not: null },
        },
      }),
      prisma.transaction.findMany({
        where: { escrowStatus: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          transactionType: true,
          agreedPriceIdr: true,
          agreedPriceUsd: true,
          platformFeeBuyerIdr: true,
          platformFeeSellerIdr: true,
          payoutAmountLocal: true,
          payoutCurrency: true,
          completedAt: true,
          buyer: { select: { id: true, email: true, displayName: true } },
          seller: { select: { id: true, email: true, displayName: true } },
        },
      }),
    ]);

    const totalVolume = allTransactions.reduce((sum: number, tx: any) => {
      return sum + (tx.agreedPriceIdr || tx.agreedPriceUsd || 0);
    }, 0);

    const totalRevenue = allTransactions.reduce((sum: number, tx: any) => {
      return sum + (tx.platformFeeBuyerIdr || 0) + (tx.platformFeeSellerIdr || 0);
    }, 0);

    return NextResponse.json({
      totalVolume,
      totalRevenue,
      pendingPayouts,
      completedPayouts,
      recentTransactions,
    });
  } catch (error: any) {
    console.error('Error fetching financials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financials' },
      { status: 500 }
    );
  }
}
