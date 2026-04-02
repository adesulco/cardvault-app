import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Buyer securely submits a Fraud/Damage claim
export async function POST(request: NextRequest) {
  try {
    const { transactionId, openedByUserId, reason, description } = await request.json();
    if (!transactionId || !openedByUserId || !reason) {
      return NextResponse.json({ error: 'Missing dispute parameters' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.buyerId !== openedByUserId) {
       return NextResponse.json({ error: 'Unauthorized dispute creation' }, { status: 403 });
    }

    // Wrap dispute logic safely in SQL Transaction
    const newDispute = await prisma.$transaction(async (tx) => {
      // 1. Physically freeze the Escrow Cash
      await tx.transaction.update({
         where: { id: transactionId },
         data: { escrowStatus: 'disputed' } // Halts disbursement permanently
      });

      // 2. Open the claim
      const dispute = await tx.dispute.create({
         data: {
            transactionId,
            openedByUserId,
            reason,
            description,
         }
      });

      // 3. System Notification for Seller
      await tx.notification.create({
         data: { userId: transaction.sellerId, type: 'dispute', title: 'Escrow Frozen (Dispute)', body: `Buyer flagged this delivery as [${reason.toUpperCase()}]. Admin intervention required.`}
      });

      return dispute;
    });

    return NextResponse.json({ dispute: newDispute }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed validating dispute ticket.' }, { status: 500 });
  }
}

// PATCH: Platform Admin securely Resolves the Dispute (Routing the Funds)
export async function PATCH(request: NextRequest) {
  try {
    const { disputeId, resolution } = await request.json(); // resolution = 'refund_buyer' OR 'release_seller'
    if (!disputeId || !resolution) return NextResponse.json({ error: 'Missing Admin resolution target' }, { status: 400 });

    const disputeAction = await prisma.$transaction(async (tx) => {
       const dispute = await tx.dispute.update({
          where: { id: disputeId },
          data: { resolution, resolvedAt: new Date() }
       });

       const finalState = resolution === 'refund_buyer' ? 'refunded' : 'completed';

       // Resume Escrow Finality
       await tx.transaction.update({
          where: { id: dispute.transactionId },
          data: { 
             escrowStatus: finalState,
             completedAt: finalState === 'completed' ? new Date() : null,
          }
       });

       return dispute;
    });

    return NextResponse.json({ dispute: disputeAction }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'System fault on Escrow Admin release.' }, { status: 500 });
  }
}

// GET: Admin Dispute Fetcher
export async function GET(request: NextRequest) {
  try {
     const disputes = await prisma.dispute.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
           transaction: { include: { listing: { include: { card: true } }, seller: true, buyer: true } },
           openedBy: { select: { displayName: true } }
        }
     });
     return NextResponse.json({ disputes });
  } catch {
     return NextResponse.json({ error: 'Fetch failed.' }, { status: 500 });
  }
}
