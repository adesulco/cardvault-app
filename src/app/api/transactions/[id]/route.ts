import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single transaction state for Escrow mapping
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, displayName: true, avatarUrl: true, email: true } },
        seller: { select: { id: true, displayName: true, avatarUrl: true, trustScore: true } },
        listing: { include: { card: true } }
      }
    });

    if (!transaction) return NextResponse.json({ error: 'Transaction undefined' }, { status: 404 });

    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('Fetch Transaction payload failed:', error);
    return NextResponse.json({ error: 'Query execution fault.' }, { status: 500 });
  }
}
