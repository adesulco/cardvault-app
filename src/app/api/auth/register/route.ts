import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateReferralCode() {
  return 'VAULT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

function extractUsername(email: string, displayName: string | null) {
  const base = displayName 
     ? displayName.replace(/\s+/g, '').toLowerCase().slice(0, 12) 
     : email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  return base + '_' + crypto.randomBytes(2).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, userRole, preferredCurrency, countryCode, idDocumentUrl, selfieUrl, referredBy, phone, socialMedia } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique referral codes proactively
    let newSafeReferralCode = generateReferralCode();
    while (await prisma.user.findFirst({ where: { referralCode: newSafeReferralCode } })) {
       newSafeReferralCode = generateReferralCode();
    }
    
    const newUsername = extractUsername(email, displayName);
    
    // Auto-calculate structural verification state
    let autoStatus: 'UNVERIFIED' | 'PENDING' = 'UNVERIFIED';
    if (userRole === 'SELLER' || userRole === 'BOTH') {
      autoStatus = 'PENDING';
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const resolvedRole = (userRole === 'SELLER' || userRole === 'BOTH') ? 'SELLER' : 'BUYER';

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        displayName: displayName || email.split('@')[0],
        userRole: resolvedRole,
        preferredCurrency: preferredCurrency || 'IDR',
        countryCode: countryCode || 'ID',
        idDocumentUrl: idDocumentUrl || null,
        selfieUrl: selfieUrl || null,
        phone: phone || null,
        socialMedia: socialMedia || null,
        kycStatus: autoStatus,
        kycSubmittedAt: autoStatus === 'PENDING' ? new Date() : null,
        
        // Custom Future-Proof References
        username: newUsername,
        referralCode: newSafeReferralCode,
        referredBy: referredBy || null
      }
    });

    // --- Phase 11: Omni-Channel Onboarding Trigger ---
    const { sendWelcomeEmail } = require('@/lib/email');
    await Promise.all([
       sendWelcomeEmail(newUser.email, newUser.displayName || 'Vault Collector'),
       prisma.notification.create({
          data: {
             userId: newUser.id,
             type: 'kyc_system',
             title: 'Welcome to the Vault 🃏',
             body: 'Your account is secured. Complete KYC verification tightly inside your profile settings to unlock Escrow Instant-Buy capabilities.'
          }
       })
    ]).catch(err => console.error('Silent Notification Engine Fault:', err));
    // ---------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          kycStatus: newUser.kycStatus,
          userRole: newUser.userRole,
          referralCode: newUser.referralCode
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API fault:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to organically map registration state' },
      { status: 500 }
    );
  }
}
