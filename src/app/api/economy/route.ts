import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET Wallet Overview (Balance + History)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
     return NextResponse.json({ error: 'Missing User Identity' }, { status: 400 });
  }

  try {
     const history = await prisma.coinTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
     });

     const aggregated = await prisma.coinTransaction.aggregate({
        where: { userId },
        _sum: { amount: true }
     });

     return NextResponse.json({
        balance: aggregated._sum.amount || 0,
        history
     });
  } catch (error) {
     return NextResponse.json({ error: 'Wallet payload failed.' }, { status: 500 });
  }
}

// POST: Execute Point Purchases (Promotions, Upgrades)
export async function POST(request: NextRequest) {
  try {
     const { userId, action, spendAmount, targetId } = await request.json();
     if (!userId || !action || !spendAmount) {
         return NextResponse.json({ error: 'Invalid Economy request.' }, { status: 400 });
     }

     const currentAgg = await prisma.coinTransaction.aggregate({
        where: { userId },
        _sum: { amount: true }
     });
     
     const balance = currentAgg._sum.amount || 0;
     if (balance < spendAmount) {
        return NextResponse.json({ error: 'Insufficient CardVault Coins balance.' }, { status: 403 });
     }

     const checkoutAction = await prisma.$transaction(async (tx) => {
        // Core Spending Deduction
        const deduction = await tx.coinTransaction.create({
           data: {
              userId,
              amount: -Math.abs(spendAmount),
              source: action,
              description: `Coin redemption for ${action.replace('_', ' ')}`
           }
        });

        if (action === 'promote_listing') {
           // Establish premium listing logic
           await tx.promotedListing.create({
              data: {
                 userId,
                 listingId: targetId,
                 coinsSpent: spendAmount,
                 activeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // + 7 Days Boost
              }
           });
           
           await tx.notification.create({
              data: { userId, type: 'promotion', title: 'Listing Boosted! 🚀', body: `You successfully applied a 7-Day Network Boost using your Vault Coins.`}
           });
        }
        
        return deduction;
     });

     return NextResponse.json({ success: true, transaction: checkoutAction });
  } catch (error) {
     console.error('Points consumption fault:', error);
     return NextResponse.json({ error: 'Internal Economy Failure.' }, { status: 500 });
  }
}
