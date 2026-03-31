import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          select: {
            id: true,
            transactionType: true,
            agreedPriceIdr: true,
            agreedPriceUsd: true,
            escrowStatus: true,
          },
        },
        openedBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        adminAssigned: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(disputes);
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const { id, resolution, resolutionNotes, refundAmountIdr } = await request.json();

    if (!id || !resolution) {
      return NextResponse.json(
        { error: 'id and resolution are required' },
        { status: 400 }
      );
    }

    if (!['refund_buyer', 'release_seller', 'partial_refund', 'cancelled'].includes(resolution)) {
      return NextResponse.json(
        { error: 'Invalid resolution status' },
        { status: 400 }
      );
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        resolution,
        resolutionNotes: resolutionNotes || null,
        refundAmountIdr: refundAmountIdr || null,
        resolvedAt: new Date(),
      },
      include: {
        transaction: {
          select: {
            id: true,
            transactionType: true,
            agreedPriceIdr: true,
          },
        },
        openedBy: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      dispute: updated,
    });
  } catch (error: any) {
    console.error('Error updating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
