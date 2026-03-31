import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      orderBy: { kycSubmittedAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        kycStatus: true,
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
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status, note } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: status,
        kycReviewedAt: new Date(),
        kycReviewNote: note || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${status === 'APPROVED' ? 'approved' : 'rejected'}`,
    });
  } catch (error: any) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
