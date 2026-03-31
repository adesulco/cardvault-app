import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';

// TODO: Import PrismaClient once database is set up
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // TODO: Implement database integration once Prisma is set up
    // For now, just return mock success response

    return NextResponse.json(
      {
        success: true,
        user: {
          id: 'user_' + Date.now(),
          email: email,
          displayName: 'User',
          kycStatus: 'APPROVED',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
