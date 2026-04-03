import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('cv_session_token')?.value;
  let ownerId = null;

  try {
    if (token) {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'cardvault_secret_key_placeholder'));
        ownerId = payload.userId as string;
    }
  } catch (error) {}

  if (!ownerId) {
     ownerId = new URL(request.url).searchParams.get('userId');
  }

  if (!ownerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const cards = await prisma.card.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, cards });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
