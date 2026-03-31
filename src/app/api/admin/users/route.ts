import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        socialMedia: true,
        countryCode: true,
        preferredCurrency: true,
        kycStatus: true,
        userRole: true,
        isAdmin: true,
        isSuspended: true,
        kycSubmittedAt: true,
        kycReviewNote: true,
        idDocumentUrl: true,
        selfieUrl: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
