import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all messages in a specific chronological thread
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversationId = id;
  
  if (!conversationId) return NextResponse.json({ error: 'Conversation route param required' }, { status: 400 });

  try {
    // We intentionally sort chronologically old -> new for the chat UI to render standard bubble lists
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true } }
      }
    });

    // Automatically mark all unread messages in this thread generically as 'read'
    // since the user has just polled the active thread. (Optimistic UI fallback)
    setTimeout(async () => {
      await prisma.message.updateMany({
        where: { conversationId, isRead: false },
        data: { isRead: true }
      });
    }, 500);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Fetch Thread error:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}
