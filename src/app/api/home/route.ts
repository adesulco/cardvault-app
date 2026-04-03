import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    // 1 & 2. Fetch Banners and Configs using concurrency
    const [banners, sellerConfig, listingConfig] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.platformConfig.findUnique({ where: { configKey: 'featured_sellers' } }),
      prisma.platformConfig.findUnique({ where: { configKey: 'featured_listings' } })
    ]);

    let featuredSellers: any[] = [];
    if (sellerConfig?.configValue) {
      try {
        const userIds = JSON.parse(sellerConfig.configValue);
        if (Array.isArray(userIds) && userIds.length > 0) {
          const fetchedSellers = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, displayName: true, username: true, avatarUrl: true, trustScore: true,
              _count: {
                 select: { sellerTransactions: { where: { escrowStatus: 'completed' } } }
              }
            }
          });
          featuredSellers = userIds.map(id => {
             const s = fetchedSellers.find((u: any) => u.id === id);
             if (s) return { ...s, totalTransactions: s._count?.sellerTransactions || 0, _count: undefined };
             return null;
          }).filter(Boolean);
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
