import { NextRequest, NextResponse } from 'next/server';

// TODO: Import PrismaClient once database is set up
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement database queries once Prisma is set up
    // For now, return empty array
    return NextResponse.json([]);
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

    // TODO: Implement database updates once Prisma is set up
    // TODO: Send email notification to user

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
