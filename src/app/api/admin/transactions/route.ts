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
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
