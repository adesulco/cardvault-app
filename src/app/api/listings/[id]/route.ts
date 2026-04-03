import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const revalidate = 60;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const listingId = awaitedParams.id;

    if (!listingId) return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });

    const getListing = unstable_cache(async (id: string) => {
      return prisma.listing.findUnique({
        where: { id },
        include: {
          card: true,
          seller: {
            select: { id: true, displayName: true, trustScore: true, kycStatus: true, location: true, totalTransactions: true, avatarUrl: true, idDocumentUrl: true }
          }
        }
      });
    }, ['listing-fetch'], { revalidate: 3600 });
    
    const listing = await getListing(listingId);

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    // Format output seamlessly for the marketplace UI
    const formattedListing = {
      ...listing,
      cardName: listing.card.cardName,
      playerOrCharacter: listing.card.playerOrCharacter,
      year: listing.card.year,
      setName: listing.card.setName,
      brand: listing.card.brand,
      sportOrCategory: listing.card.sportOrCategory,
      condition: listing.card.condition,
      grade: listing.card.grade,
      gradingCompany: listing.card.gradingCompany,
      certNumber: listing.card.certNumber,
      notes: listing.card.notes,
      frontImageUrl: listing.card.frontImageUrl,
      backImageUrl: listing.card.backImageUrl,
    };

    const isVerifiedSeller = listing.seller.kycStatus === 'APPROVED' && !!listing.seller.idDocumentUrl;
    // Strip strictly private identity URLs from the payload to prevent frontend PII leaks!
    const safeSeller = { ...listing.seller };
    delete (safeSeller as any).idDocumentUrl;

    return NextResponse.json({ listing: { ...formattedListing, seller: { ...safeSeller, isVerifiedSeller } } });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}
