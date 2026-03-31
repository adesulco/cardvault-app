import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const [pendingKyc, openDisputes, pendingTransactions] = await Promise.all([
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.dispute.count({ where: { resolution: 'pending' } }),
      prisma.transaction.count({
        where: {
          escrowStatus: { in: ['pending_payment', 'payment_held'] },
        },
      }),
    ]);

    return NextResponse.json({
      pendingKyc,
      openDisputes,
      pendingTransactions,
    });
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
