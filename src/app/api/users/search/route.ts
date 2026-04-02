import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const authorizerId = searchParams.get('userId'); // Pulls searcher's ID to augment "isFollowing" mapping conditionally

    if (!query) {
       return NextResponse.json({ users: [] });
    }

    // Fuzzy text search on displayName and username
    const rawUsers = await prisma.user.findMany({
       where: {
          OR: [
             { displayName: { contains: query, mode: 'insensitive' } },
             { username: { contains: query, mode: 'insensitive' } }
          ],
          NOT: {
             id: authorizerId || "block-self-search"
          }
       },
       take: 10,
       select: { id: true, displayName: true, username: true, avatarUrl: true, trustScore: true, followers: true }
    });

    // Map the results and intelligently figure out if the searching user is mutually subscribed
    const mappedUsers = rawUsers.map(u => ({
       id: u.id,
       displayName: u.displayName,
       username: u.username,
       avatarUrl: u.avatarUrl,
       trustScore: u.trustScore,
       isFollowed: authorizerId ? u.followers.some(f => f.followerId === authorizerId) : false
    }));

    // Prioritize followed users heavily
    mappedUsers.sort((a, b) => Number(b.isFollowed) - Number(a.isFollowed));

    return NextResponse.json({ users: mappedUsers });
  } catch (error: any) {
    console.error('User Search API fault:', error);
    return NextResponse.json({ error: 'Failed to parse user directory' }, { status: 500 });
  }
}
