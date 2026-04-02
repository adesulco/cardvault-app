import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Public endpoint for marketplace banners
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    
    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
