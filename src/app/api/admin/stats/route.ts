import { NextResponse } from 'next/server';

// TODO: Import PrismaClient once database is set up
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export async function GET() {
  try {
    // TODO: Implement database queries once Prisma is set up
    // For now, return empty stats
    return NextResponse.json({
      totalUsers: 0,
      pendingKyc: 0,
      activeTransactions: 0,
      openDisputes: 0,
      escrowBalance: 0,
      totalVolume30d: 0,
      feesCollected30d: 0,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
