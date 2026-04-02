import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch Banners
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // 2. Fetch Configs
    const sellerConfig = await prisma.platformConfig.findUnique({ where: { configKey: 'featured_sellers' } });
    const listingConfig = await prisma.platformConfig.findUnique({ where: { configKey: 'featured_listings' } });

    let featuredSellers: any[] = [];
    if (sellerConfig?.configValue) {
      try {
        const userIds = JSON.parse(sellerConfig.configValue);
        if (Array.isArray(userIds) && userIds.length > 0) {
          const fetchedSellers = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, displayName: true, username: true, avatarUrl: true, trustScore: true, totalTransactions: true }
          });
          // Restore visual sorting order that an admin might have configured via JSON array index
          featuredSellers = userIds.map(id => fetchedSellers.find(s => s.id === id)).filter(Boolean);
        }
      } catch (e) {}
    }

    let featuredListings: any[] = [];
    if (listingConfig?.configValue) {
      try {
        const listingIds = JSON.parse(listingConfig.configValue);
        if (Array.isArray(listingIds) && listingIds.length > 0) {
          const fetchedListings = await prisma.listing.findMany({
             where: { id: { in: listingIds }, status: 'active' },
             include: {
                card: true,
                seller: { select: { id: true, displayName: true, avatarUrl: true } }
             }
          });
          // Preserve custom sorting order explicitly defined by Admin
          featuredListings = listingIds.map(id => fetchedListings.find(l => l.id === id)).filter(Boolean);
        }
      } catch (e) {}
    }

    return NextResponse.json({
      banners,
      featuredSellers,
      featuredListings
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
    });
  } catch (error) {
    console.error('Home Feed Error:', error);
    return NextResponse.json({ error: 'Failed to construct home feed module' }, { status: 500 });
  }
}
