import { NextRequest, NextResponse } from 'next/server';

// In production, this connects to Prisma
const cards: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get('ownerId');
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  let filtered = [...cards];
  if (ownerId) filtered = filtered.filter(c => c.ownerId === ownerId);
  if (status) filtered = filtered.filter(c => c.status === status);
  if (category) filtered = filtered.filter(c => c.sportOrCategory === category);

  return NextResponse.json({ cards: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newCard = {
    id: crypto.randomUUID(),
    ...body,
    status: 'in_collection',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cards.push(newCard);
  return NextResponse.json(newCard, { status: 201 });
}
