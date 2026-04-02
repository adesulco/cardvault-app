import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using a public open exchange rate API
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    const rate = data.rates.IDR;
    
    if (rate) {
      return NextResponse.json({ rate });
    }
    throw new Error('Invalid rate format');
  } catch (error) {
    console.warn('Failed to fetch live exchange rate, using fallback.', error);
    return NextResponse.json({ rate: 15850 });
  }
}
