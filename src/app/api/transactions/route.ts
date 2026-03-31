import { NextRequest, NextResponse } from 'next/server';

const transactions: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  const status = searchParams.get('status');

  let filtered = [...transactions];
  if (userId) {
    if (role === 'buyer') filtered = filtered.filter(t => t.buyerId === userId);
    else if (role === 'seller') filtered = filtered.filter(t => t.sellerId === userId);
    else filtered = filtered.filter(t => t.buyerId === userId || t.sellerId === userId);
  }
  if (status) filtered = filtered.filter(t => t.escrowStatus === status);

  return NextResponse.json({ transactions: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Create transaction with escrow
  const transaction = {
    id: crypto.randomUUID(),
    ...body,
    escrowStatus: 'pending_payment',
    paymentIdempotencyKey: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  transactions.push(transaction);
  return NextResponse.json(transaction, { status: 201 });
}
