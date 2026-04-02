import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, amountIdr, bankCode, accountNumber, accountName } = await request.json();

    if (!userId || !amountIdr || amountIdr < 50000 || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Minimum physical bank withdrawal is Rp 50,000 and requires complete wire documentation.' }, { status: 400 });
    }

    // Wrap the absolute deduction securely using a PG Transaction wrapper
    const resolution = await prisma.$transaction(async (tx) => {
       const user = await tx.user.findUnique({ where: { id: userId } });
       
       if (!user || user.walletBalanceIdr < amountIdr) {
          throw new Error('Insufficient Vault verification limits to execute withdrawal.');
       }

       // Generate the immutable Bank processing hook
       const withdrawReq = await tx.withdrawalRequest.create({
         data: {
           userId,
           amountIdr,
           status: 'pending',
           bankCode: bankCode.toLowerCase(),
           accountNumber,
           accountName
         }
       });

       // Instantly deduct the balance locking Double-Spend exploits
       await tx.user.update({
         where: { id: userId },
         data: { walletBalanceIdr: { decrement: amountIdr } }
       });

       // Generate Ledger Proof
       await tx.walletTransaction.create({
         data: {
           userId,
           amountIdr: -amountIdr, // Negative denotes absolute physical egress
           type: 'withdrawal',
           status: 'pending',
           referenceId: withdrawReq.id,
           description: `Admin Wire: ${bankCode.toUpperCase()} *******${accountNumber.slice(-4)}`
         }
       });

       // Map push notification explicitly
       await tx.notification.create({
         data: {
           userId,
           type: 'payout',
           title: 'Withdrawal Processing',
           body: `Your localized wire for Rp ${amountIdr.toLocaleString()} has been handed off to an authorized agent for settlement.`
         }
       });

       return withdrawReq;
    });

    return NextResponse.json({ success: true, request: resolution });
  } catch (error: any) {
    console.error('Vault Egress Error:', error);
    return NextResponse.json({ error: error.message || 'Fatal verification rejection.' }, { status: 500 });
  }
}
