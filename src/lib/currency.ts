// Currency formatting and conversion utilities for CardVault
// IDR-first with live USD conversion

const IDR_USD_RATE_CACHE: { rate: number; fetchedAt: number } = {
  rate: 15850, // Default fallback rate
  fetchedAt: 0,
};

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function getExchangeRate(): Promise<number> {
  const now = Date.now();
  if (now - IDR_USD_RATE_CACHE.fetchedAt < CACHE_TTL) {
    return IDR_USD_RATE_CACHE.rate;
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (apiKey && apiKey !== 'xxx') {
      const res = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&symbols=IDR`
      );
      const data = await res.json();
      if (data.rates?.IDR) {
        IDR_USD_RATE_CACHE.rate = data.rates.IDR;
        IDR_USD_RATE_CACHE.fetchedAt = now;
        return data.rates.IDR;
      }
    }
  } catch {
    // Fall through to cached/default rate
  }

  return IDR_USD_RATE_CACHE.rate;
}

export function idrToUsd(idrAmount: number, rate: number): number {
  return Math.floor((idrAmount / rate) * 100) / 100;
}

export function usdToIdr(usdAmount: number, rate: number): number {
  return Math.floor((usdAmount * rate) / 100) * 100; // Hard round down to nearest Rp 100 for escrow safety
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDualCurrency(
  idrAmount: number,
  rate: number,
  preferredCurrency: 'IDR' | 'USD' = 'IDR'
): { primary: string; secondary: string } {
  const usdAmount = idrToUsd(idrAmount, rate);
  if (preferredCurrency === 'IDR') {
    return {
      primary: formatIDR(idrAmount),
      secondary: `~${formatUSD(usdAmount)}`,
    };
  }
  return {
    primary: formatUSD(usdAmount),
    secondary: `~${formatIDR(idrAmount)}`,
  };
}

// Calculate platform fees
export function calculateFees(
  priceIdr: number,
  transactionType: 'sale' | 'trade' | 'trade_with_cash',
  isInternational: boolean
): { buyerFeeIdr: number; sellerFeeIdr: number; totalIdr: number } {
  let feeRate: number;
  switch (transactionType) {
    case 'sale':
      feeRate = 0.03;
      break;
    case 'trade':
      feeRate = 0.02;
      break;
    case 'trade_with_cash':
      feeRate = 0.025;
      break;
    default:
      feeRate = 0.03;
  }

  const internationalSurcharge = isInternational ? 0.01 : 0;
  const totalRate = feeRate + internationalSurcharge;

  const buyerFeeIdr = Math.floor((priceIdr * totalRate) / 100) * 100;
  const sellerFeeIdr = Math.floor((priceIdr * totalRate) / 100) * 100;

  return {
    buyerFeeIdr,
    sellerFeeIdr,
    totalIdr: priceIdr + buyerFeeIdr,
  };
}
