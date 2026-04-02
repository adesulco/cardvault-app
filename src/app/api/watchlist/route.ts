import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            card: true,
            seller: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                trustScore: true,
                kycStatus: true,
              }
            }
          }
        }
      }
    });

    // Map the favorites cleanly into an array of listings just like the main marketplace
    const listings = favorites.map(fav => fav.listing);

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}
