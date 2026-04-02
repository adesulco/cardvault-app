import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generates a deterministic ID connecting any two users securely
const generateConversationId = (userA: string, userB: string) => {
  return [userA, userB].sort().join('-chat-');
};

// GET all conversations for the Inbox view
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const counterpartId = searchParams.get('counterpartId');
  const conversationId = searchParams.get('conversationId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    if (counterpartId || conversationId) {
       const finalTarget = counterpartId || 'fallback';
       const thread = await prisma.message.findMany({
          where: { 
             OR: [
               { senderId: userId, recipientId: finalTarget },
               { senderId: finalTarget, recipientId: userId },
               { conversationId: conversationId || undefined }
             ]
          },
          orderBy: { createdAt: 'asc' },
          include: {
             sender: { select: { id: true, displayName: true, avatarUrl: true } }
          }
       });

       // Mark as read natively for the querying user
       if (userId && thread.length > 0) {
          await prisma.message.updateMany({
             where: { 
                 recipientId: userId, 
                 senderId: finalTarget,
                 isRead: false 
             },
             data: { isRead: true, readAt: new Date() }
          });
       }

       return NextResponse.json({ messages: thread });
    }

    // Extract unique conversation groups involving this user ...
    if (!userId) return NextResponse.json({ error: 'User ID required for inbox' }, { status: 400 });
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }]
      },
      orderBy: { createdAt: 'desc' },
      take: 200, // Implemented ceiling constraint to stop memory blowout
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true } },
        recipient: { select: { id: true, displayName: true, avatarUrl: true } }
      }
    });

    // Reduce into an inbox array showing only the latest message per thread
    const inboxMap = new Map();
    
    for (const msg of messages) {
      if (!inboxMap.has(msg.conversationId)) {
        // Identify the counterpart (opponent) in the conversation
        const counterpart = msg.senderId === userId ? msg.recipient : msg.sender;
        const unreadCount = (msg.recipientId === userId && !msg.isRead) ? 1 : 0; // naive unread counter
        
        inboxMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          counterpartUser: counterpart,
          latestMessage: msg.content,
          timestamp: msg.createdAt,
          unread: unreadCount,
          isSystem: msg.content.includes('[SYS]') // we will use [SYS] prefix for transactional messages
        });
      } else {
        // Accumulate unread
        const existing = inboxMap.get(msg.conversationId);
        if (msg.recipientId === userId && !msg.isRead) {
          existing.unread += 1;
        }
      }
    }

    const conversations = Array.from(inboxMap.values());

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Fetch Inbox error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST: Standard chat interface endpoint
export async function POST(request: NextRequest) {
  try {
    const { senderId, recipientId, content } = await request.json();

    if (!senderId || !recipientId || !content) {
      return NextResponse.json({ error: 'Missing chat payload' }, { status: 400 });
    }

    const conversationId = generateConversationId(senderId, recipientId);

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        recipientId,
        content
      }
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Send Message error:', error);
    return NextResponse.json({ error: 'Failed to dispatch message' }, { status: 500 });
  }
}
