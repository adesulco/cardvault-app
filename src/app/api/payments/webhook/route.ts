import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const gateway = request.headers.get('x-gateway') || 'midtrans';

  // Verify webhook signature based on gateway
  // In production: validate using each gateway's signature verification

  console.log(`[Webhook] ${gateway}:`, body);

  // Process payment notification
  // Update transaction escrow status
  // Send notifications

  return NextResponse.json({ received: true });
}
