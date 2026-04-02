import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch the top 10 most reputable sellers natively
    const rawUsers = await prisma.user.findMany({
       where: {
          trustScore: { gte: 4.0 },
          kycStatus: "APPROVED",
          avatarUrl: { not: null }
       },
       orderBy: {
          trustScore: 'desc'
       },
       take: 10,
       select: { id: true, displayName: true, username: true, avatarUrl: true, trustScore: true }
    });

    return NextResponse.json({ featured: rawUsers });
  } catch (error: any) {
    console.error('Featured Users API fault:', error);
    return NextResponse.json({ error: 'Failed to extract featured user block' }, { status: 500 });
  }
}
