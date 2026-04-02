import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'configs';
  const q = url.searchParams.get('q') || '';

  if (type === 'configs') {
    const sConfig = await prisma.platformConfig.findUnique({ where: { configKey: 'featured_sellers' } });
    const lConfig = await prisma.platformConfig.findUnique({ where: { configKey: 'featured_listings' } });
    
    let sellerIds: string[] = [], listingIds: string[] = [];
    try { if (sConfig?.configValue) sellerIds = JSON.parse(sConfig.configValue); } catch(e){}
    try { if (lConfig?.configValue) listingIds = JSON.parse(lConfig.configValue); } catch(e){}

    const fetchedSellers = await prisma.user.findMany({ where: { id: { in: sellerIds } }, select: { id: true, displayName: true, email: true, username: true }});
    const fetchedListings = await prisma.listing.findMany({ where: { id: { in: listingIds } }, include: { card: { select: { cardName: true } }, seller: { select: { displayName: true } } }});

    const sellers = sellerIds.map(id => fetchedSellers.find(s => s.id === id)).filter(Boolean);
    const listings = listingIds.map(id => fetchedListings.find(l => l.id === id)).filter(Boolean);

    return NextResponse.json({ sellers, listings });
  }

  if (type === 'search_users') {
    if (q.length < 2) return NextResponse.json([]);
    const users = await prisma.user.findMany({
      where: { OR: [ { displayName: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } } ] },
      take: 10,
      select: { id: true, displayName: true, email: true, username: true }
    });
    return NextResponse.json(users);
  }

  if (type === 'search_listings') {
    if (q.length < 2) return NextResponse.json([]);
    const listings = await prisma.listing.findMany({
      where: { card: { cardName: { contains: q, mode: 'insensitive' } } },
      take: 10,
      include: { card: { select: { cardName: true } }, seller: { select: { displayName: true } } }
    });
    return NextResponse.json(listings);
  }

  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  const { sellers, listings } = await request.json();

  if (sellers) {
     await prisma.platformConfig.upsert({
        where: { configKey: 'featured_sellers' },
        update: { configValue: JSON.stringify(sellers) },
        create: { configKey: 'featured_sellers', configValue: JSON.stringify(sellers), description: 'Featured Profiles on Home Page' }
     });
  }

  if (listings) {
     await prisma.platformConfig.upsert({
        where: { configKey: 'featured_listings' },
        update: { configValue: JSON.stringify(listings) },
        create: { configKey: 'featured_listings', configValue: JSON.stringify(listings), description: 'High-Value Featured Listings on Home Page' }
     });
  }

  return NextResponse.json({ success: true });
}
