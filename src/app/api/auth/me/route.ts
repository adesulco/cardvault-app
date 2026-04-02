import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        kycStatus: true,
        userRole: true,
        isAdmin: true,
        trustScore: true,
        countryCode: true,
        preferredCurrency: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { user }, 
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
    );

  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Server evaluation failed' }, { status: 500 });
  }
}
