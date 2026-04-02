import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const now = new Date();
    const whereClause: any = { 
       status: 'active',
       OR: [
          { expiresAt: { gte: now } },
          { expiresAt: null }
       ]
    };

    if (q) {
      whereClause.card = {
        OR: [
          { cardName: { contains: q, mode: 'insensitive' } },
          { playerOrCharacter: { contains: q, mode: 'insensitive' } },
          { setName: { contains: q, mode: 'insensitive' } },
          { certNumber: { equals: q } }
        ]
      };
    }

    if (minPrice || maxPrice) {
      whereClause.priceIdr = {};
      if (minPrice) whereClause.priceIdr.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.priceIdr.lte = parseFloat(maxPrice);
    }

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderByClause = { priceIdr: 'asc' };
    if (sort === 'price_desc') orderByClause = { priceIdr: 'desc' };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        card: true,
        seller: {
          select: { displayName: true, trustScore: true, kycStatus: true }
        }
      }
    });

    const totalCount = await prisma.listing.count({ where: whereClause });

    const formattedListings = listings.map((l: any) => ({
      id: l.card.id,
      listingId: l.id,
      cardName: l.card.cardName,
      playerOrCharacter: l.card.playerOrCharacter,
      sportOrCategory: l.card.sportOrCategory,
      frontImageUrl: l.card.frontImageUrl,
      condition: l.card.condition,
      grade: l.card.grade,
      gradingCompany: l.card.gradingCompany,
      priceIdr: l.priceIdr,
      priceUsd: l.priceUsd,
      status: l.status,
      listingMode: l.listingMode,
      expiresAt: l.expiresAt,
      currentBidIdr: l.currentBidIdr,
      seller: l.seller,
      viewsCount: l.viewsCount,
      favoritesCount: l.favoritesCount,
      createdAt: l.createdAt
    }));

    return NextResponse.json({ listings: formattedListings, total: totalCount, hasMore: (page * limit) < totalCount });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.sellerId || !body.cardId) {
      return NextResponse.json({ error: 'sellerId and cardId are required' }, { status: 400 });
    }

    const durationMs = (body.durationDays || 7) * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    const newListing = await prisma.listing.create({
      data: {
        sellerId: body.sellerId,
        cardId: body.cardId,
        listingType: body.listingType || 'sale',
        listingMode: body.listingMode || 'fixed',
        expiresAt: expiresAt,
        priceIdr: body.priceIdr,
        priceUsd: body.priceUsd,
        startingBidIdr: body.startingBidIdr,
        currentBidIdr: body.startingBidIdr, // Matches init bid
        tradeDescription: body.tradeDescription,
        status: 'active',
      }
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
