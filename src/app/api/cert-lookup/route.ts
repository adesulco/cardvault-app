import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const certNumber = searchParams.get('cert');
  
  if (!certNumber) return NextResponse.json({ error: 'Missing cert number' }, { status: 400 });

  try {
    const response = await axios.get(`https://www.psacard.com/cert/${certNumber}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    
    const $ = cheerio.load(response.data);
    
    let year = '', brand = '', cardName = '', subject = '', grade = '';
    
    // PSA Data table structure
    $('table tr').each((i, el) => {
      const header = $(el).find('th').text().trim().toLowerCase();
      const val = $(el).find('td').text().trim();
      
      if (header === 'year') year = val;
      if (header === 'brand') brand = val;
      if (header === 'card number') cardName = val;
      if (header === 'subject') subject = val;
      if (header === 'grade') grade = val.split(' ')[0] || val; // Takes "10" from "10 Gem Mint"
    });

    const finalCardName = `${cardName} ${subject}`.trim();

    // Map sport heuristically if possible, else default to 'pokemon' or something
    let sportCategory = 'pokemon';
    if (brand.toLowerCase().includes('panini') || brand.toLowerCase().includes('topps')) {
       sportCategory = 'basketball';
    }

    return NextResponse.json({
      year,
      brand,
      cardName: finalCardName || 'Unknown Card',
      playerOrCharacter: subject,
      gradingCompany: 'PSA',
      grade: grade.replace(/[^0-9.]/g, '') || '10',
      sportOrCategory: sportCategory,
      condition: 'graded'
    });
  } catch (error: any) {
    console.error('Failed to lookup PSA cert:', error.message);
    return NextResponse.json({ error: 'Failed to lookup cert on PSA' }, { status: 500 });
  }
}
