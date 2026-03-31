import { NextRequest, NextResponse } from 'next/server';

// Valid state transitions for escrow
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['payment_held'],
  payment_held: ['awaiting_shipment', 'refunded'],
  awaiting_shipment: ['shipped', 'refunded'],
  shipped: ['delivered'],
  delivered: ['under_inspection'],
  under_inspection: ['completed', 'disputed'],
  disputed: ['refunded', 'completed'],
  completed: [],
  refunded: [],
  auto_completed: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { escrowStatus, trackingNumber, shippingCarrier } = body;

  // In production: fetch from database
  // Validate state transition
  // For now, return mock response

  const updated = {
    id,
    escrowStatus: escrowStatus || 'payment_held',
    trackingNumberSeller: trackingNumber,
    shippingCarrier,
    updatedAt: new Date().toISOString(),
  };

  // If escrow is being released, trigger payout
  if (escrowStatus === 'completed') {
    // In production: call PGAL to release funds
    // const provider = getProvider(transaction.payoutGateway);
    // await provider.createPayout({ ... });
  }

  return NextResponse.json(updated);
}
