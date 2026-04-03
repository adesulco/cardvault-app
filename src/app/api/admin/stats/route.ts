import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const [
      totalUsers,
      pendingKyc,
      activeTransactions,
      openDisputes,
      activeListings,
      totalTransactions,
      pendingWithdrawals,
      recentTransactions,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.transaction.count({ where: { escrowStatus: { notIn: ['completed', 'refunded'] } } }),
      prisma.dispute.count({ where: { resolution: 'pending' } }),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.transaction.count(),
      prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          transactionType: true,
          agreedPriceIdr: true,
          agreedPriceUsd: true,
          escrowStatus: true,
          platformFeeBuyerIdr: true,
          platformFeeSellerIdr: true,
          createdAt: true,
          buyer: { select: { id: true, email: true, displayName: true } },
          seller: { select: { id: true, email: true, displayName: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          displayName: true,
          kycStatus: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate total revenue
    const transactionsForRevenue = await prisma.transaction.findMany({
      select: {
        platformFeeBuyerIdr: true,
        platformFeeSellerIdr: true,
      },
    });

    const totalRevenue = transactionsForRevenue.reduce((sum: number, tx: any) => {
      return sum + (tx.platformFeeBuyerIdr || 0) + (tx.platformFeeSellerIdr || 0);
    }, 0);

    return NextResponse.json({
      totalUsers,
      pendingKyc,
      activeTransactions,
      openDisputes,
      activeListings,
      totalTransactions,
      totalRevenue,
      pendingWithdrawals,
      escrowBalance: 0,
      totalVolume30d: 0,
      feesCollected30d: 0,
      recentTransactions,
      recentUsers,
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
