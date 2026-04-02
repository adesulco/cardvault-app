import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getIncrement(val: number) {
  if (val < 500000) return 10000;
  if (val < 2000000) return 25000;
  if (val < 10000000) return 100000;
  return 250000;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id: listingId } = await params;
    const incomingMaxBid = parseInt(body.amountIdr);
    
    if (!body.bidderId || !incomingMaxBid || isNaN(incomingMaxBid)) {
      return NextResponse.json({ error: 'Bid parameters incomplete or invalid' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { card: true } });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.listingMode !== 'auction') return NextResponse.json({ error: 'Item is not configured as an auction.' }, { status: 400 });
    if (listing.sellerId === body.bidderId) return NextResponse.json({ error: 'You cannot bid on your own listing.' }, { status: 400 });
    
    // DB Layer Anti-Spam: 3-Second Cycle Lock
    const latestBid = await prisma.bid.findFirst({
       where: { bidderId: body.bidderId },
       orderBy: { createdAt: 'desc' }
    });
    if (latestBid && (Date.now() - new Date(latestBid.createdAt).getTime()) < 3000) {
       return NextResponse.json({ error: 'System limit: You must wait 3 seconds between authorizations. Please slow down.' }, { status: 429 });
    }
    
    // Anti-Sniping & Expiry Block
    if (listing.expiresAt) {
       const diffMs = new Date(listing.expiresAt).getTime() - Date.now();
       if (diffMs <= 0) {
          return NextResponse.json({ error: 'Auction has forcefully closed.' }, { status: 400 });
       }
       if (diffMs <= 10 * 60 * 1000) { // 10 minutes
          const priorHistory = await prisma.bid.findFirst({ where: { listingId, bidderId: body.bidderId } });
          if (!priorHistory) {
             return NextResponse.json({ error: 'Anti-Sniping Rule: You must have participated in this auction prior to the final 10 minutes to place a bid now.' }, { status: 403 });
          }
       }
    }

    const currentPublicPrice = listing.currentBidIdr || listing.startingBidIdr || 0;

    // Process proxy mathematics recursively via PG Transaction Wrapper
    const result = await prisma.$transaction(async (tx) => {
       const currentLeader = await tx.bid.findFirst({ where: { listingId, isWinning: true } });
       
       const hardFloor = currentLeader ? (currentPublicPrice + getIncrement(currentPublicPrice)) : (listing.startingBidIdr || 0);

       if (incomingMaxBid < hardFloor) {
          throw new Error(`Minimum legally acceptable bid is Rp ${hardFloor.toLocaleString()}`);
       }

       // Scenario A: No previous bids exist. You become active leader immediately.
       if (!currentLeader) {
          const newBid = await tx.bid.create({ data: { listingId, bidderId: body.bidderId, amountIdr: incomingMaxBid, isWinning: true } });
          await tx.listing.update({ where: { id: listingId }, data: { currentBidIdr: listing.startingBidIdr || 0 }});
          return { success: true, bid: newBid, currentLeaderRef: null };
       }

       // Scenario B: Bidder just tries to top themselves (e.g., extend their own max bid buffer)
       if (currentLeader.bidderId === body.bidderId) {
          if (incomingMaxBid <= currentLeader.amountIdr) {
             throw new Error(`You are already leading this auction with a max proxy buffer of Rp ${currentLeader.amountIdr.toLocaleString()}`);
          }
          // Simply update their ceiling quietly without changing currentPublicPrice
          await tx.bid.update({ where: { id: currentLeader.id }, data: { amountIdr: incomingMaxBid }});
          return { success: true, bid: currentLeader, currentLeaderRef: currentLeader };
       }

       // Scenario C: Incoming bidder is blocked by the existing Proxy's hidden ceiling.
       if (incomingMaxBid <= currentLeader.amountIdr) {
          const newPublicPrice = Math.min(incomingMaxBid + getIncrement(incomingMaxBid), currentLeader.amountIdr);
          // Log losing attempt
          await tx.bid.create({ data: { listingId, bidderId: body.bidderId, amountIdr: incomingMaxBid, isWinning: false } });
          // Increment Active Price to prove they tried
          await tx.listing.update({ where: { id: listingId }, data: { currentBidIdr: newPublicPrice } });
          throw new Error(`Outbid immediately by a proxy bidder's hidden maximum buffer. Active price is now Rp ${newPublicPrice.toLocaleString()}`);
       }

       // Scenario D: Incoming bidder shatters the Proxy ceiling! New Leader.
       const newPublicPrice = Math.min(currentLeader.amountIdr + getIncrement(currentLeader.amountIdr), incomingMaxBid);
       
       await tx.bid.updateMany({ where: { listingId, isWinning: true }, data: { isWinning: false } });
       const victoriousBid = await tx.bid.create({ data: { listingId, bidderId: body.bidderId, amountIdr: incomingMaxBid, isWinning: true } });
       await tx.listing.update({ where: { id: listingId }, data: { currentBidIdr: newPublicPrice } });

       // Resolve the previous leader entity for the outbid payload
       const previousLeaderUser = await tx.user.findUnique({ where: { id: currentLeader.bidderId }, select: { id: true, email: true } });

       return { success: true, bid: victoriousBid, previousLeader: previousLeaderUser, newPublicPrice };
    });

    // --- Phase 11: Omni-Channel Active Outbid Engine ---
    if (result.previousLeader) {
       const { sendOutbidAlert } = require('@/lib/email');
       Promise.all([
          sendOutbidAlert(result.previousLeader.email, listing.card.cardName, result.newPublicPrice),
          prisma.notification.create({
             data: {
                userId: result.previousLeader.id,
                type: 'outbid',
                title: 'You have been Outbid! 🚨',
                body: `Your proxy ceiling on ${listing.card.cardName} was shattered. The new floor is Rp ${result.newPublicPrice.toLocaleString()}.`
             }
          })
       ]).catch(err => console.error('Silent Notification Bound failed:', err));
    }

    return NextResponse.json({ success: true, bid: result.bid });
  } catch (err: any) {
    if (err.message?.includes('Minimum') || err.message?.includes('Outbid') || err.message?.includes('leading')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Database conflict occurred during bid execution.' }, { status: 500 });
  }
}
