import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    
    // Validate minimal requirements for the routing algorithm to function
    if (!data.cardName || !data.setName || !data.year) {
       return NextResponse.json({ error: 'Card Name, Set, and Year are critically required for accurate API pricing.' }, { status: 400 });
    }

    const card = await prisma.card.create({
      data: {
        ownerId: (session.user as any).id,
        cardName: data.cardName,
        year: data.year,
        setName: data.setName,
        brand: data.brand || 'Unknown',
        sportOrCategory: data.sportOrCategory || 'TCG',
        language: data.language || 'EN',
        condition: data.condition || 'raw',
        grade: data.grade || null,
        gradingCompany: data.gradingCompany || null,
        status: 'in_collection', // Natively locks to the Deck, not the Public Marketplace
      }
    });

    return NextResponse.json({ success: true, card });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to inject card matrix' }, { status: 500 });
  }
}
