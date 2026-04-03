import { requireAdminAuth } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all banners for admin panel
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new banner
export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { imageUrl, linkUrl, altText, isActive, sortOrder } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });

    const newBanner = await prisma.banner.create({
      data: {
        imageUrl,
        linkUrl,
        altText,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0
      }
    });
    return NextResponse.json({ banner: newBanner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update or Delete a banner
export async function PATCH(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { id, imageUrl, linkUrl, altText, isActive, sortOrder, action } = await request.json();
    if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });

    if (action === 'delete') {
      await prisma.banner.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: { imageUrl, linkUrl, altText, isActive, sortOrder }
    });
    return NextResponse.json({ banner: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
