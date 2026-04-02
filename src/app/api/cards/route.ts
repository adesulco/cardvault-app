import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId'); 
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const whereClause: any = {};
    if (ownerId) whereClause.ownerId = ownerId;
    if (status && status !== 'all') whereClause.status = status;
    if (category) whereClause.sportOrCategory = category;

    const cards = await prisma.card.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { displayName: true, trustScore: true } },
        listings: { 
          where: { status: 'active' },
          select: { id: true } 
        }
      }
    });

    const formattedCards = cards.map((c: any) => ({
      ...c,
      seller: c.owner,
      listingId: c.listings?.[0]?.id 
    }));

    return NextResponse.json({ cards: formattedCards, total: formattedCards.length });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ownerId || !body.cardName) {
      return NextResponse.json({ error: 'ownerId and cardName required' }, { status: 400 });
    }

    const newCard = await prisma.card.create({
      data: {
        ownerId: body.ownerId,
        cardName: body.cardName,
        playerOrCharacter: body.playerOrCharacter,
        year: body.year,
        setName: body.setName,
        brand: body.brand,
        sportOrCategory: body.sportOrCategory,
        condition: body.condition || 'raw',
        grade: body.grade,
        gradingCompany: body.gradingCompany,
        certNumber: body.certNumber,
        frontImageUrl: body.frontImageUrl,
        backImageUrl: body.backImageUrl,
        estimatedValueIdr: body.estimatedValueIdr,
        estimatedValueUsd: body.estimatedValueUsd,
        status: body.status || 'in_collection',
        notes: body.notes
      }
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}
