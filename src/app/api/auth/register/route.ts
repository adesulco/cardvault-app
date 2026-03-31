import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

// TODO: Import PrismaClient once database is set up
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      displayName,
      email,
      password,
      phone,
      socialMedia,
      userRole,
      countryCode,
      preferredCurrency,
    } = body;

    // Validation
    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // TODO: Implement database integration once Prisma is set up
    // For now, just validate and return success response

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: 'user_' + Date.now(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
