import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        socialMedia: true,
        countryCode: true,
        kycStatus: true,
        userRole: true,
        idDocumentUrl: true,
        selfieUrl: true,
        kycSubmittedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching KYC applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, status, note } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'userId and status are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: status,
        kycReviewedAt: new Date(),
        kycReviewNote: note || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        kycStatus: updated.kycStatus,
      },
    });
  } catch (error: any) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
}
