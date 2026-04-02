import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { transactionId, reviewerId, rating, comment } = await request.json();

    if (!transactionId || !reviewerId || !rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    // Validate the transaction is completed and the user was the buyer
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (transaction.escrowStatus !== 'completed') {
      return NextResponse.json({ error: 'Cannot review an active or disputed escrow' }, { status: 400 });
    }
    
    // In CardVault, both Buyers and Sellers can leave a single 1-to-5 star rating
    if (transaction.buyerId !== reviewerId && transaction.sellerId !== reviewerId) {
      return NextResponse.json({ error: 'Only counterparties can leave a verified review' }, { status: 403 });
    }

    // Ensure they haven't reviewed yet
    const existing = await prisma.review.findFirst({
      where: { transactionId, reviewerId }
    });
    if (existing) return NextResponse.json({ error: 'You have already reviewed this transaction.' }, { status: 400 });

    const revieweeId = reviewerId === transaction.buyerId ? transaction.sellerId : transaction.buyerId;

    // Perform the review insertion and Trust Score calculation in a secure transaction
    const [newReview] = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          transactionId,
          reviewerId,
          revieweeId,
          rating: Number(rating),
          comment,
        }
      });

      // Recalculate average rating dynamically mapped to a true 5.0 Star scale
      const allReviews = await tx.review.findMany({
        where: { revieweeId, isVisible: true }
      });
      
      const totalRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalRating / allReviews.length; // e.g., 4.75
      const trustScore = Number(avgRating.toFixed(1)); // strict 4.8 

      // Persist unified trust score standard
      await tx.user.update({
        where: { id: revieweeId },
        data: { trustScore }
      });

      // Notify the Counterparty!
      await tx.notification.create({
         data: {
            userId: revieweeId,
            type: 'review_received',
            title: 'New Rating Received!',
            body: `You received ${rating} Stars for a completed negotiation. Your Community Trust Score is now ${trustScore} ★.`
         }
      });

      // Gamification Reward: +10 Coins for submitting a Review!
      await tx.coinTransaction.create({
         data: {
            userId: reviewerId,
            amount: 10,
            source: 'review_submitted',
            description: 'Earned for trusting engaging with our Trust Engine.'
         }
      });

      return [review];
    });

    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('Review submit fault:', error);
    return NextResponse.json({ error: 'System fault processing rating.' }, { status: 500 });
  }
}
