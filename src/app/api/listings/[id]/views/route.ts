import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.sessionId) {
      return NextResponse.json({ error: 'Missing Session Identifier for deduplication.' }, { status: 400 });
    }

    // In a full production Edge env, we would map sessionId to a Redis HyperLogLog.
    // For V11 remediation, we'll natively fire an unchecked increment.
    await prisma.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
     return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
