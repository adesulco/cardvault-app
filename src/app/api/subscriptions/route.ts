import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch Active Seller Subscription Tier
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Identity Missing' }, { status: 400 });

  try {
     const sub = await prisma.subscriptionTier.findUnique({
        where: { userId }
     });

     return NextResponse.json({
        tier: sub ? sub.tierName : 'BRONZE'
     });
  } catch (error) {
     return NextResponse.json({ error: 'Failed retrieving sub tier.' }, { status: 500 });
  }
}

// POST: Execute Subscription Upgrade Hook
export async function POST(request: NextRequest) {
  try {
     const { userId, tierName, billingCycle } = await request.json(); // tierName = 'SILVER' | 'GOLD'
     if (!userId || !tierName) return NextResponse.json({ error: 'Missing upgrade parameters.' }, { status: 400 });

     // In production, this would trigger a Midtrans/PayPal recurring charge.
     // For this environment, we execute the internal license swap dynamically.
     const targetTime = new Date();
     if (billingCycle === 'YEARLY') targetTime.setFullYear(targetTime.getFullYear() + 1);
     else targetTime.setMonth(targetTime.getMonth() + 1);

     const sub = await prisma.subscriptionTier.upsert({
        where: { userId },
        update: {
           tierName,
           billingCycle: billingCycle || 'MONTHLY',
           expiresAt: targetTime,
           status: 'active'
        },
        create: {
           userId,
           tierName,
           billingCycle: billingCycle || 'MONTHLY',
           expiresAt: targetTime,
           status: 'active'
        }
     });

     // Apply premium gamification sign-on bonus for higher tiers
     if (tierName === 'GOLD' || tierName === 'PLATINUM') {
         await prisma.coinTransaction.create({
            data: {
               userId,
               amount: 500,
               source: 'subscription_bonus',
               description: `Bonus for upgrading to ${tierName} Pro Status!`
            }
         });
     }

     await prisma.notification.create({
        data: {
           userId,
           type: 'subscription',
           title: `Welcome to ${tierName} Pro! 👑`,
           body: `You are successfully verified for lower marketplace commission rates.`
        }
     });

     return NextResponse.json({ success: true, sub });
  } catch (error) {
     console.error('Sub migration fault:', error);
     return NextResponse.json({ error: 'Subscription Database Mutator Failed.' }, { status: 500 });
  }
}
