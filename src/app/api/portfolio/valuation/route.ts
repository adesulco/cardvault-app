import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * ARCHITECTURAL STUB: fetchEbayData
 * Uses the eBay Finding API (Completed/Sold Items)
 * Ideal for: Sports Cards (Panini/Topps), extremely rare Grails, Comic Books.
 */
async function fetchEbayData(card: any) {
  console.log(`[Algorithm] Routing to eBay Developer API for ${card.cardName}...`);
  // TODO: Insert eBay OAuth Key and execute 'findCompletedItems' querying `card.year + card.setName + card.cardName + card.grade`
  // Mocking average of last 3 completed sales:
  return { provider: 'eBay (Sold Transactions)', valueIdr: Math.floor(Math.random() * (5000000 - 500000) + 500000) };
}

/**
 * ARCHITECTURAL STUB: fetchYuyuteiData
 * Japan's native TCG standard. Since they restrict APIs, this serves as a 
 * server-side Puppeteer or Cheerio scraper reading from yuyu-tei.jp directly.
 * Ideal for: Japanese Pokemon, One Piece TCG, Weiss Schwarz.
 */
async function fetchYuyuteiData(card: any) {
  console.log(`[Algorithm] Booting Yuyu-tei (遊々亭) Scraper for ${card.cardName}...`);
  // TODO: Insert Proxy URL or Cheerio logic targeting yuyu-tei.jp search tables.
  // Mocking Yen conversion:
  return { provider: 'Yuyu-tei (遊々亭)', valueIdr: Math.floor(Math.random() * (8000000 - 150000) + 150000) };
}

/**
 * ARCHITECTURAL STUB: fetchTCGPlayerData
 * The Platinum global standard for English TCG.
 * Ideal for: English Pokemon, Magic: The Gathering, Disney Lorcana.
 */
async function fetchTCGPlayerData(card: any) {
  console.log(`[Algorithm] Routing to TCGPlayer Enterprise API for ${card.cardName}...`);
  // TODO: Insert TCGPlayer Public/Private Key and ping `/pricing/market` for English TCG.
  // Mocking TCG Market Price:
  return { provider: 'TCGPlayer Market Price', valueIdr: Math.floor(Math.random() * (20000000 - 1000000) + 1000000) };
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized to ping Portfolio Engines' }, { status: 401 });
  }

  try {
    const { cardId } = await request.json();
    if (!cardId) return NextResponse.json({ error: 'System requires an explicit Card ID' }, { status: 400 });

    const card = await prisma.card.findUnique({
      where: { id: cardId }
    });

    if (!card) return NextResponse.json({ error: 'Card physically missing from database' }, { status: 404 });
    if (card.ownerId !== (session.user as any).id) {
       return NextResponse.json({ error: 'You do not hold the Vault rights to this specific card' }, { status: 403 });
    }

    const { sportOrCategory, language } = card;
    const cat = sportOrCategory?.toLowerCase() || '';
    
    let result = { provider: 'Unknown', valueIdr: 0 };

    // ── PRECISION ALGORITHM GATEWAY ──
    const isJapaneseTCG = language === 'JP' && (cat.includes('pokemon') || cat.includes('one piece') || cat.includes('weiss'));
    const isSportsCard = cat.includes('baseball') || cat.includes('basketball') || cat.includes('football') || cat.includes('soccer') || cat.includes('hockey');

    if (isJapaneseTCG) {
      result = await fetchYuyuteiData(card);
    } else if (isSportsCard) {
      result = await fetchEbayData(card);
    } else {
      result = await fetchTCGPlayerData(card);
    }

    // ── DB OVERWRITE ──
    const updatedCard = await prisma.card.update({
      where: { id: card.id },
      data: { estimatedValueIdr: result.valueIdr }
    });

    return NextResponse.json({
      success: true,
      provider: result.provider,
      estimatedValueIdr: result.valueIdr,
      card: updatedCard
    });

  } catch (error) {
    console.error('Portfolio Routing Error:', error);
    return NextResponse.json({ error: 'API Gateway disconnected or timed out' }, { status: 500 });
  }
}
