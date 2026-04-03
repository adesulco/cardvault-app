import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('cv_session_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized: Missing session' }, { status: 401 });

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'cardvault_secret_key_placeholder'));
    
    // PERF-003: Instantly return JWT state skipping 3s DB latency block
    const user = {
        id: payload.userId as string,
        email: payload.email as string || '',
        displayName: payload.displayName as string || '',
    };

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
