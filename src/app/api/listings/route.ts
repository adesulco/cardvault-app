import { NextRequest, NextResponse } from 'next/server';

const listings: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let filtered = listings.filter(l => l.status === 'active');

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      l.cardName?.toLowerCase().includes(q) ||
      l.playerOrCharacter?.toLowerCase().includes(q)
    );
  }
  if (category) filtered = filtered.filter(l => l.sportOrCategory === category);
  if (minPrice) filtered = filtered.filter(l => l.priceIdr >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(l => l.priceIdr <= Number(maxPrice));

  // Sort
  switch (sortBy) {
    case 'price_asc':
      filtered.sort((a, b) => (a.priceIdr || 0) - (b.priceIdr || 0));
      break;
    case 'price_desc':
      filtered.sort((a, b) => (b.priceIdr || 0) - (a.priceIdr || 0));
      break;
    case 'popular':
      filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      break;
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json({ listings: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newListing = {
    id: crypto.randomUUID(),
    ...body,
    status: 'active',
    viewsCount: 0,
    favoritesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  listings.push(newListing);
  return NextResponse.json(newListing, { status: 201 });
}
