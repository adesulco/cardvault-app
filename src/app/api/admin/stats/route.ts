import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalUsers, pendingKyc, activeTransactions, openDisputes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.transaction.count({ where: { escrowStatus: { notIn: ['completed', 'refunded'] } } }),
      prisma.dispute.count({ where: { resolution: 'pending' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      pendingKyc,
      activeTransactions,
      openDisputes,
      escrowBalance: 0,
      totalVolume30d: 0,
      feesCollected30d: 0,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
