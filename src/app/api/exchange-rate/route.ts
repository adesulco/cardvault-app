import { NextResponse } from 'next/server';

let cachedRate = { rate: 15850, fetchedAt: 0 };
const CACHE_TTL = 15 * 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (now - cachedRate.fetchedAt < CACHE_TTL) {
    return NextResponse.json({
      baseCurrency: 'USD',
      targetCurrency: 'IDR',
      rate: cachedRate.rate,
      source: 'cache',
      fetchedAt: new Date(cachedRate.fetchedAt).toISOString(),
    });
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (apiKey && apiKey !== 'xxx') {
      const res = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=IDR`
      );
      const data = await res.json();
      if (data.rates?.IDR) {
        cachedRate = { rate: data.rates.IDR, fetchedAt: now };
      }
    }
  } catch {
    // Use cached/default rate
  }

  return NextResponse.json({
    baseCurrency: 'USD',
    targetCurrency: 'IDR',
    rate: cachedRate.rate,
    source: cachedRate.fetchedAt > 0 ? 'open_exchange_rates' : 'default',
    fetchedAt: new Date(cachedRate.fetchedAt || now).toISOString(),
  });
}
