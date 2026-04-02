import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET detailed user profile data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        location: true,
        phone: true,
        countryCode: true,
        preferredCurrency: true,
        kycStatus: true,
        payoutMethod: true,
        payoutAccountId: true,
        isEmailVerified: true,
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH generic user object details (KYC, Settings, Payouts)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) return NextResponse.json({ error: 'User ID required for patching' }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates
    });

    // Strip sensitive fields before returning
    const { passwordHash, ...safeUser } = updatedUser;
    
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
