import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    const alerts = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    const unreadCount = alerts.filter(a => !a.isRead).length;

    return NextResponse.json({ notifications: alerts, unreadCount });
  } catch (error) {
    console.error('Fetch Alerts err:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'No user ID' }, { status: 400 });

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 });
  }
}
