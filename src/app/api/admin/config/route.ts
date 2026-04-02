import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const configPercentage = await prisma.platformConfig.findUnique({
      where: { configKey: 'escrow_fee_percentage' }
    });
    const configGaId = await prisma.platformConfig.findUnique({
      where: { configKey: 'google_analytics_id' }
    });
    
    return NextResponse.json({ 
       feePercentage: configPercentage ? parseFloat(configPercentage.configValue) : 3.0,
       gaId: configGaId ? configGaId.configValue : ''
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { feePercentage, gaId } = await request.json();
    
    if (feePercentage !== undefined) {
      await prisma.platformConfig.upsert({
        where: { configKey: 'escrow_fee_percentage' },
        update: { configValue: feePercentage.toString() },
        create: { configKey: 'escrow_fee_percentage', configValue: feePercentage.toString(), description: 'Payout Withholding' }
      });
    }

    if (gaId !== undefined) {
      await prisma.platformConfig.upsert({
        where: { configKey: 'google_analytics_id' },
        update: { configValue: gaId },
        create: { configKey: 'google_analytics_id', configValue: gaId, description: 'Google Analytics Tracking ID (G-XXXX)' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Configuration DB block' }, { status: 500 });
  }
}
