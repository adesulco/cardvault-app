import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // In production, validate Bearer Token against partner database.
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer CV_LIVE_')) {
    return NextResponse.json({ error: 'Unauthorized. Invalid B2B API Key.' }, { status: 401 });
  }

  try {
     const body = await request.json();
     const { partnerId, itemName, priceIdr, callbackUrl } = body;

     if (!partnerId || !itemName || !priceIdr) {
        return NextResponse.json({ error: 'Missing strict payload parameters (partnerId, itemName, priceIdr)' }, { status: 400 });
     }

     // Simulate generating a physical transaction hold record in the Database securely mapped to the B2B Partner.
     const secureEscrowId = 'ex_cv_' + Math.random().toString(36).substr(2, 9);
     
     // The response provides the physical URL the partner must redirect their buyer to in order to fund the escrow natively on our infrastructure.
     return NextResponse.json({
        success: true,
        data: {
           escrowId: secureEscrowId,
           paymentUrl: `https://beta.cardvault.id/gate/checkout/${secureEscrowId}`,
           status: 'pending_funding',
           expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 Hour Link Expiry
        }
     });

  } catch (error) {
     return NextResponse.json({ error: 'EaaS Network Fault' }, { status: 500 });
  }
}
