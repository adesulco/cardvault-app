import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const [users, kycSubmissions, transactions, disputes] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        where: { kycStatus: { not: 'PENDING' } },
        orderBy: { kycSubmittedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          email: true,
          displayName: true,
          kycStatus: true,
          kycSubmittedAt: true,
        },
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          transactionType: true,
          agreedPriceIdr: true,
          agreedPriceUsd: true,
          escrowStatus: true,
          createdAt: true,
          buyer: { select: { id: true, email: true, displayName: true } },
          seller: { select: { id: true, email: true, displayName: true } },
        },
      }),
      prisma.dispute.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          reason: true,
          resolution: true,
          createdAt: true,
          openedBy: { select: { id: true, email: true, displayName: true } },
          transaction: { select: { id: true } },
        },
      }),
    ]);

    // Combine all activities
    const activities = [
      ...users.map((user: any) => ({
        type: 'user_registration',
        description: `User registered: ${user.displayName || user.email}`,
        timestamp: user.createdAt.toISOString(),
        metadata: { userId: user.id, email: user.email },
      })),
      ...kycSubmissions.map((user: any) => ({
        type: 'kyc_submission',
        description: `KYC ${user.kycStatus === 'APPROVED' ? 'approved' : 'rejected'}: ${user.displayName || user.email}`,
        timestamp: user.kycSubmittedAt?.toISOString() || new Date().toISOString(),
        metadata: { userId: user.id, status: user.kycStatus },
      })),
      ...transactions.map((tx: any) => ({
        type: 'transaction',
        description: `${tx.transactionType} transaction: ${tx.buyer.displayName || tx.buyer.email} -> ${tx.seller.displayName || tx.seller.email}`,
        timestamp: tx.createdAt.toISOString(),
        metadata: {
          transactionId: tx.id,
          amount: tx.agreedPriceIdr || tx.agreedPriceUsd,
          status: tx.escrowStatus,
        },
      })),
      ...disputes.map((dispute: any) => ({
        type: 'dispute',
        description: `Dispute opened: ${dispute.reason} by ${dispute.openedBy.displayName || dispute.openedBy.email}`,
        timestamp: dispute.createdAt.toISOString(),
        metadata: {
          disputeId: dispute.id,
          transactionId: dispute.transaction.id,
          resolution: dispute.resolution,
        },
      })),
    ];

    // Sort by timestamp descending and limit to 50
    const sorted = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    return NextResponse.json(sorted);
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
