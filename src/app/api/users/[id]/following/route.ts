import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const followingRelations = await prisma.follows.findMany({
      where: { followerId: id },
      include: {
        following: {
          select: { id: true, displayName: true, username: true, avatarUrl: true, trustScore: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const following = followingRelations.map(rel => rel.following);

    return NextResponse.json({ following });
  } catch (error: any) {
    console.error('API following extraction error:', error);
    return NextResponse.json({ error: 'Failed to access subscription network' }, { status: 500 });
  }
}
