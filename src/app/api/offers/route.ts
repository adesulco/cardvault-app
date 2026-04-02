import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOfferEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.listingId || !body.offerAmountIdr || !body.fromUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch listing info 
    const listing = await prisma.listing.findUnique({
      where: { id: body.listingId },
      include: { card: true, seller: true }
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    // Validate minimum offer threshold if set by seller
    if (listing.minOfferIdr && body.offerAmountIdr < listing.minOfferIdr) {
      return NextResponse.json({ 
        error: `Offer rejected. The seller has set a minimum offer amount of Rp ${listing.minOfferIdr.toLocaleString('id-ID')}` 
      }, { status: 400 });
    }

    // Calc expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newOffer = await prisma.offer.create({
      data: {
        listingId: listing.id,
        fromUserId: body.fromUserId,
        toUserId: listing.sellerId,
        offerType: 'cash',
        offeredAmountIdr: body.offerAmountIdr,
        offeredAmountUsd: body.offerAmountUsd,
        expiresAt: expiresAt,
        status: 'pending' // pending seller decision
      }
    });

    // Notify the seller immediately
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        type: 'offer_received',
        title: 'New Incoming Offer!',
        body: `You received a binding offer of Rp ${body.offerAmountIdr.toLocaleString('id-ID')} for your ${listing.card?.cardName || 'card'}.`
      }
    });

    // Send transactional email
    await sendOfferEmail(listing.seller.email || 'seller@example.com', body.offerAmountIdr, listing.card?.cardName || 'Card');

    // Sync into Peer-to-Peer Messages securely utilizing our new architecture system flag
    const conversationId = [body.fromUserId, listing.sellerId].sort().join('-chat-');
    await prisma.message.create({
      data: {
        conversationId,
        senderId: body.fromUserId,
        recipientId: listing.sellerId,
        content: `[SYS] Made a binding offer of Rp ${body.offerAmountIdr.toLocaleString('id-ID')}. Please check your Incoming Offers dashboard to Accept or Counter.`
      }
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error: any) {
    console.error('Submit Offer Error:', error);
    return NextResponse.json({ error: 'Failed to submit offer' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const incomingOffers = await prisma.offer.findMany({
      where: { toUserId: userId },
      include: {
        listing: { include: { card: true } },
        fromUser: { select: { displayName: true, trustScore: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ offers: incomingOffers });
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { offerId, action, userId } = await request.json();

    if (!offerId || !action || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify ownership
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    if (offer.toUserId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    if (action === 'accept') {
      await prisma.offer.update({ where: { id: offerId }, data: { status: 'accepted' } });
      
      // Notify buyer it was accepted securely via Chat pipeline
      const conversationId = [offer.fromUserId, offer.toUserId].sort().join('-chat-');
      await prisma.message.create({
        data: {
          conversationId,
          senderId: offer.toUserId,
          recipientId: offer.fromUserId,
          content: `[SYS] Seller accepted your offer of Rp ${offer.offeredAmountIdr?.toLocaleString('id-ID')}. Please proceed to final checkout.`
        }
      });
      // Optionally transition listing status to 'pending_escrow'
    } else if (action === 'decline') {
      await prisma.offer.update({ where: { id: offerId }, data: { status: 'declined' } });
    }

    return NextResponse.json({ success: true, status: action === 'accept' ? 'accepted' : 'declined' });
  } catch (error) {
    console.error('Action Failed:', error);
    return NextResponse.json({ error: 'Mishandled execution' }, { status: 500 });
  }
}
