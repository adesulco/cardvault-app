import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, amountIdr, paymentMethod } = await request.json();

    if (!userId || !amountIdr || amountIdr < 10000) {
      return NextResponse.json({ error: 'Minimum Top-Up amount is Rp 10,000' }, { status: 400 });
    }

    // ── Phase 13: Dynamic Admin Gateway Fees ──
    const gatewayConfig = await prisma.gatewayConfiguration.findUnique({
      where: { gatewayName: 'midtrans' }
    });

    let extraFee = 0;
    if (gatewayConfig?.feeStructure) {
       try {
          const fees = JSON.parse(gatewayConfig.feeStructure);
          // Simple flat + percentage logic handler
          if (fees[paymentMethod]) {
             if (typeof fees[paymentMethod] === 'number' && fees[paymentMethod] < 100) {
                // Percentage (e.g., 2.9%)
                extraFee = Math.ceil(amountIdr * (fees[paymentMethod] / 100));
             } else {
                // Flat integer fee (e.g. 4000 IDR for VA)
                extraFee = fees[paymentMethod] || 0;
             }
          }
       } catch (e) { console.error('Fee calculation fault', e); }
    }

    const totalCharge = amountIdr + extraFee;

    // First generate the Vault Ledger in memory
    const pendingLeger = await prisma.walletTransaction.create({
      data: {
        userId,
        amountIdr, // Note: We solely credit the User the pure amount, we do not credit them the payment constraint fee!
        type: 'top_up',
        status: 'pending',
        description: `Vault Deposit via ${paymentMethod}`
      }
    });

    // Generate active Midtrans Snap URL linking `order_id` to our standard `pendingLeger.id`
    // Since Midtrans requires a Server Key, we authenticate using our Next.js backend variables.
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const MIDTRANS_API_URL = process.env.NODE_ENV === 'production' 
      ? 'https://app.midtrans.com/snap/v1/transactions' 
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    // Build the user profile mapping to guarantee midtrans can render receipt UI
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const payload = {
      transaction_details: {
        order_id: pendingLeger.id,
        gross_amount: totalCharge
      },
      item_details: [
        { id: 'VAULT_CASH', price: amountIdr, quantity: 1, name: 'CardVault Balance Reload' },
        ...(extraFee > 0 ? [{ id: 'GATEWAY_FEE', price: extraFee, quantity: 1, name: 'Gateway Processing Surcharge' }] : [])
      ],
      customer_details: {
        first_name: user?.displayName || 'Collector',
        email: user?.email || 'guest@cardvault.id'
      }
    };

    const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
    
    // For local dev where you might not have real midtrans keys
    let tokenUrl = 'https://simulated-midtrans.test?token=vault_mock_' + pendingLeger.id;
    let snapToken = 'mock-snap-' + pendingLeger.id;

    if (MIDTRANS_SERVER_KEY) {
       const midtransRes = await fetch(MIDTRANS_API_URL, {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
           'Authorization': `Basic ${authString}`
         },
         body: JSON.stringify(payload)
       });
       
       if (midtransRes.ok) {
         const midtransData = await midtransRes.json();
         tokenUrl = midtransData.redirect_url;
         snapToken = midtransData.token;
       } else {
         console.error('Midtrans Snap Reject:', await midtransRes.text());
         throw new Error('Midtrans gateway refused connection.');
       }
    }

    return NextResponse.json({ 
       success: true, 
       snapToken, 
       redirectUrl: tokenUrl,
       ledgerId: pendingLeger.id,
       appliedFee: extraFee,
       totalCharge
    });

  } catch (error: any) {
    console.error('Vault TopUp Fault:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize Vault loader' }, { status: 500 });
  }
}
