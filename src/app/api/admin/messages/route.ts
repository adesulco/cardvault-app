import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { sender: { displayName: { contains: search, mode: 'insensitive' } } },
        { sender: { email: { contains: search, mode: 'insensitive' } } },
        { recipient: { displayName: { contains: search, mode: 'insensitive' } } },
        { recipient: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
          recipient: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
