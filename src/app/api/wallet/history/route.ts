import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID is strictly required' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletBalanceIdr: true } });
    const history = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ 
      walletBalanceIdr: user?.walletBalanceIdr || 0,
       history 
    });
  } catch (error) {
    console.error('Fetch Wallet err:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
