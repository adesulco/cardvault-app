import { Resend } from 'resend';

// Initialize the global email hook. Use a mock for local testing if unconfigured.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_test_mock');
const defaultFrom = 'CardVault Escrow <onboarding@resend.dev>'; // Temporarily utilizing Resend test boundaries

export const sendWelcomeEmail = async (userEmail: string, displayName: string) => {
  try {
    await resend.emails.send({
      from: defaultFrom,
      to: userEmail,
      subject: 'Welcome to CardVault 🃏',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color: #2563eb;">Welcome to CardVault, ${displayName}!</h2>
          <p>We are thrilled to formally verify your registration. You now have full access to our global Escrow network and High-End Auction house.</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #3b82f6;">
             <strong>Next Step:</strong> Navigate to your Vault Profile and complete your KYC verification to unlock unlimited Instant Buy capability.
          </div>
          <p>Securely yours,<br/>The CardVault Security Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to dispatch welcome protocol:', error);
  }
};

export const sendOutbidAlert = async (userEmail: string, cardName: string, newBidAmount: number) => {
  try {
    await resend.emails.send({
      from: defaultFrom,
      to: userEmail,
      subject: `🚨 You've been outbid on ${cardName}!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color: #ef4444;">Your Proxy Ceiling was Shattered</h2>
          <p>Another Vault user just surpassed your maximum proxy bid on <strong>${cardName}</strong>.</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #fee2e2; border-left: 4px solid #ef4444;">
             The new active price requirement is <strong>Rp ${newBidAmount.toLocaleString()}</strong>.
          </div>
          <p>Log back into your active marketplace negotiations quickly to re-secure your lead and protect your asset.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to dispatch proxy alert:', error);
  }
};

export const sendEscrowReceipt = async (userEmail: string, cardName: string, expectedAction: string) => {
  try {
    const isBuyer = expectedAction === 'buyer';
    const subject = isBuyer ? 'Payment Secured in Vault 🔒' : 'Vault Authorization: Prepare Shipment 📦';
    
    await resend.emails.send({
      from: defaultFrom,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color: #2563eb;">CardVault Escrow Update</h2>
          <p>Regarding your transaction for: <strong>${cardName}</strong></p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #22c55e;">
             ${isBuyer 
               ? 'Your funds have been successfully locked inside our Escrow Vault. The seller has been notified to legally provision and dispatch the shipment.' 
               : 'The buyer has successfully locked their funds into Escrow. You are now legally authorized to ship the item. <strong>Please upload tracking information within 48 hours to prevent dispute penalizations.</strong>'}
          </div>
          <p>Track live transaction progress inside the vault portal.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to dispatch Escrow manifesto:', error);
  }
};

export const sendOfferEmail = async (userEmail: string, offerAmountIdr: number, cardName: string) => {
  try {
    await resend.emails.send({
      from: defaultFrom,
      to: userEmail,
      subject: `New Offer on ${cardName}! 🤝`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
          <h2 style="color: #2563eb;">You've received an Exclusive Offer</h2>
          <p>A Vault investor has submitted a formal <strong>Rp ${offerAmountIdr.toLocaleString('id-ID')}</strong> cash offer for your <strong>${cardName}</strong>.</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #3b82f6;">
             Log into your seller dashboard to Accept, Decline, or Counter this offer.
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to dispatch offer email:', error);
  }
};
