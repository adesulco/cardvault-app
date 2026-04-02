import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const config = await prisma.platformConfig.findUnique({
      where: { configKey: 'escrow_fee_percentage' }
    });
    
    return NextResponse.json({ feePercentage: config ? parseFloat(config.configValue) : 3.0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to access active vault constraints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { feePercentage } = await request.json();
    if (feePercentage === undefined || typeof feePercentage !== 'number') {
       return NextResponse.json({ error: 'A strictly mathematical percentage is required (e.g., 3.0 or 0)' }, { status: 400 });
    }

    const updated = await prisma.platformConfig.upsert({
      where: { configKey: 'escrow_fee_percentage' },
      update: { configValue: feePercentage.toString() },
      create: {
        configKey: 'escrow_fee_percentage',
        configValue: feePercentage.toString(),
        description: 'Global Marketplace Payout Withholding (Phase 13 Dynamic Setting)'
      }
    });

    return NextResponse.json({ feePercentage: parseFloat(updated.configValue) });
  } catch (error) {
    console.error('Config Error:', error);
    return NextResponse.json({ error: 'Platform DB execution blocked.' }, { status: 500 });
  }
}
