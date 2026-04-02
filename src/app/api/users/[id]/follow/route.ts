import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get('followerId'); // Check if a specific user is following them

    if (!id) return NextResponse.json({ error: 'Target User ID required' }, { status: 400 });

    const [followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.follows.count({ where: { followingId: id } }),
      prisma.follows.count({ where: { followerId: id } }),
      followerId ? prisma.follows.findFirst({ where: { followerId, followingId: id } }) : null
    ]);

    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing: !!isFollowing
    });
  } catch (error: any) {
    console.error('API follow check error:', error);
    return NextResponse.json({ error: 'Failed to verify follow context' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Person being followed
    const { followerId } = await request.json(); // Person doing the following

    if (!followerId || !id) return NextResponse.json({ error: 'IDs required' }, { status: 400 });
    if (followerId === id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

    const existingFollow = await prisma.follows.findFirst({
      where: { followerId, followingId: id }
    });

    if (existingFollow) return NextResponse.json({ success: true, message: 'Already subscribed' });

    await prisma.follows.create({
      data: { followerId, followingId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API follow error:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { followerId } = await request.json();

    if (!followerId || !id) return NextResponse.json({ error: 'IDs required' }, { status: 400 });

    await prisma.follows.deleteMany({
      where: { followerId, followingId: id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API unfollow error:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}
