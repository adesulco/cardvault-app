// Payment Gateway Abstraction Layer (PGAL)
// Unified interface for Midtrans, Xendit, Stripe, PayPal

export interface ChargeRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  paymentMethod?: string;
  metadata?: Record<string, string>;
}

export interface ChargeResponse {
  success: boolean;
  gatewayTransactionId: string;
  status: 'pending' | 'captured' | 'failed';
  redirectUrl?: string;
  token?: string;
  error?: string;
}

export interface PayoutRequest {
  amount: number;
  currency: string;
  recipientId: string;
  recipientEmail?: string;
  bankCode?: string;
  accountNumber?: string;
  description: string;
}

export interface PayoutResponse {
  success: boolean;
  payoutId: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

// Gateway provider interface
export interface PaymentGatewayProvider {
  name: string;
  createCharge(req: ChargeRequest): Promise<ChargeResponse>;
  captureCharge(transactionId: string): Promise<ChargeResponse>;
  refundCharge(transactionId: string, amount?: number): Promise<ChargeResponse>;
  createPayout(req: PayoutRequest): Promise<PayoutResponse>;
  verifyWebhook(payload: string, signature: string): boolean;
}

// Midtrans Provider (sandbox)
class MidtransProvider implements PaymentGatewayProvider {
  name = 'midtrans';

  async createCharge(req: ChargeRequest): Promise<ChargeResponse> {
    // In production, this calls Midtrans Core API v2
    // For now, return sandbox simulation
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey || serverKey === 'SB-Mid-server-xxx') {
      return {
        success: true,
        gatewayTransactionId: `mt-sandbox-${Date.now()}`,
        status: 'pending',
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${Date.now()}`,
      };
    }

    // Real Midtrans API call would go here
    const auth = Buffer.from(`${serverKey}:`).toString('base64');
    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        payment_type: req.paymentMethod || 'qris',
        transaction_details: {
          order_id: req.orderId,
          gross_amount: req.amount,
        },
        customer_details: {
          email: req.customerEmail,
          first_name: req.customerName,
        },
      }),
    });

    const data = await response.json();
    return {
      success: data.status_code === '201',
      gatewayTransactionId: data.transaction_id || '',
      status: 'pending',
      redirectUrl: data.redirect_url,
    };
  }

  async captureCharge(transactionId: string): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: transactionId, status: 'captured' };
  }

  async refundCharge(transactionId: string): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: transactionId, status: 'pending' };
  }

  async createPayout(req: PayoutRequest): Promise<PayoutResponse> {
    return { success: true, payoutId: `mt-payout-${Date.now()}`, status: 'pending' };
  }

  verifyWebhook(_payload: string, _signature: string): boolean {
    return true; // Implement with Midtrans server key verification
  }
}

// Stripe Provider (sandbox)
class StripeProvider implements PaymentGatewayProvider {
  name = 'stripe';

  async createCharge(req: ChargeRequest): Promise<ChargeResponse> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey === 'sk_test_xxx') {
      return {
        success: true,
        gatewayTransactionId: `pi_sandbox_${Date.now()}`,
        status: 'pending',
        token: `cs_sandbox_${Date.now()}`,
      };
    }

    // Real Stripe Payment Intent with manual capture (escrow)
    const stripe = require('stripe')(secretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(req.amount * 100), // Stripe uses cents
      currency: req.currency.toLowerCase(),
      capture_method: 'manual', // Escrow: hold funds
      metadata: { orderId: req.orderId, ...req.metadata },
      description: req.description,
    });

    return {
      success: true,
      gatewayTransactionId: paymentIntent.id,
      status: 'pending',
      token: paymentIntent.client_secret,
    };
  }

  async captureCharge(transactionId: string): Promise<ChargeResponse> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey === 'sk_test_xxx') {
      return { success: true, gatewayTransactionId: transactionId, status: 'captured' };
    }
    const stripe = require('stripe')(secretKey);
    await stripe.paymentIntents.capture(transactionId);
    return { success: true, gatewayTransactionId: transactionId, status: 'captured' };
  }

  async refundCharge(transactionId: string, amount?: number): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: transactionId, status: 'pending' };
  }

  async createPayout(req: PayoutRequest): Promise<PayoutResponse> {
    return { success: true, payoutId: `po_sandbox_${Date.now()}`, status: 'pending' };
  }

  verifyWebhook(_payload: string, _signature: string): boolean {
    return true;
  }
}

// Xendit Provider (sandbox)
class XenditProvider implements PaymentGatewayProvider {
  name = 'xendit';

  async createCharge(req: ChargeRequest): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: `xnd-${Date.now()}`, status: 'pending' };
  }

  async captureCharge(id: string): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: id, status: 'captured' };
  }

  async refundCharge(id: string): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: id, status: 'pending' };
  }

  async createPayout(req: PayoutRequest): Promise<PayoutResponse> {
    return { success: true, payoutId: `xnd-po-${Date.now()}`, status: 'pending' };
  }

  verifyWebhook(): boolean {
    return true;
  }
}

// PayPal Provider (sandbox)
class PayPalProvider implements PaymentGatewayProvider {
  name = 'paypal';

  async createCharge(req: ChargeRequest): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: `pp-${Date.now()}`, status: 'pending' };
  }

  async captureCharge(id: string): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: id, status: 'captured' };
  }

  async refundCharge(id: string): Promise<ChargeResponse> {
    return { success: true, gatewayTransactionId: id, status: 'pending' };
  }

  async createPayout(req: PayoutRequest): Promise<PayoutResponse> {
    return { success: true, payoutId: `pp-po-${Date.now()}`, status: 'pending' };
  }

  verifyWebhook(): boolean {
    return true;
  }
}

// Gateway instances
const providers: Record<string, PaymentGatewayProvider> = {
  midtrans: new MidtransProvider(),
  xendit: new XenditProvider(),
  stripe: new StripeProvider(),
  paypal: new PayPalProvider(),
};

// Gateway routing logic
export function routePaymentGateway(
  buyerCountry: string,
  paymentMethod: string
): string {
  // PayPal always routes to PayPal
  if (paymentMethod === 'paypal') return 'paypal';

  // Indonesian local payments
  if (buyerCountry === 'ID') {
    const localMethods = ['e_wallet', 'bank_transfer', 'qris', 'convenience_store'];
    if (localMethods.includes(paymentMethod)) return 'midtrans';
    if (paymentMethod === 'card') return 'midtrans'; // local cards
  }

  // International card payments
  if (paymentMethod === 'card' || paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
    return 'stripe';
  }

  return 'midtrans'; // Default fallback
}

export function getProvider(gateway: string): PaymentGatewayProvider {
  return providers[gateway] || providers.midtrans;
}
