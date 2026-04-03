import { requireAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authError = await requireAdminAuth(req);
  if (authError) return authError;

  try {
    // In production, verify the user is an admin here before querying
    const pendingKycUsers = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      select: {
        id: true,
        email: true,
        displayName: true,
        idDocumentUrl: true,
        selfieUrl: true,
        kycSubmittedAt: true
      },
      orderBy: { kycSubmittedAt: 'asc' }
    });
    
    return NextResponse.json({ queue: pendingKycUsers });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdminAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { userId, action, note } = body;
    
    if (action !== 'APPROVED' && action !== 'REJECTED') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: action,
        kycReviewedAt: new Date(),
        kycReviewNote: note || null,
        trustScore: action === 'APPROVED' ? { increment: 10 } : undefined
      }
    });

    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'kyc_status',
        title: action === 'APPROVED' ? 'You are Verified! 🛡️' : 'KYC Document Rejected',
        body: action === 'APPROVED' ? 'Your government ID has been approved. You now have the Trusted Seller Gamification Badge on your items!' : `Your verification was rejected: ${note}`
      }
    });

    return NextResponse.json({ success: true, kycStatus: updated.kycStatus });
  } catch (err: any) {
    return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
  }
}
