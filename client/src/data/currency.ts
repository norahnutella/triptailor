export const CURRENCY_OPTIONS = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
];

const FALLBACK_RATES_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  JPY: 1.75,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.015,
};

let cachedRates: Record<string, number> | null = null;

export async function getRatesFromINR(): Promise<Record<string, number>> {
  if (cachedRates) return cachedRates;
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/INR');
    const data = await response.json();
    if (data?.rates) {
      cachedRates = { ...FALLBACK_RATES_FROM_INR, ...data.rates, INR: 1 };
      return cachedRates as Record<string, number>;
    }
  } catch {
    // Keep the local fallback when live rates are unavailable.
  }
  cachedRates = FALLBACK_RATES_FROM_INR;
  return cachedRates;
}

export function currencySymbol(currency: string): string {
  return CURRENCY_OPTIONS.find((item) => item.code === currency)?.symbol || currency;
}

export function currencyLabel(currency: string): string {
  return CURRENCY_OPTIONS.find((item) => item.code === currency)?.label || currency;
}

export function convertInrAmount(amount: number, currency: string, rates: Record<string, number>): number {
  return amount * (rates[currency] || 1);
}

export function formatCurrency(amountInr: number, currency: string, rates: Record<string, number>): string {
  const amount = convertInrAmount(amountInr, currency, rates);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

export function convertCostText(costInfo: string, currency: string, rates: Record<string, number>): string {
  if (!costInfo || costInfo.toLowerCase() === 'free') return costInfo || 'Free';
  const match = costInfo.replace(/,/g, '').match(/(?:₹|INR\s*)?([0-9]+(?:\.[0-9]+)?)/i);
  if (!match) return costInfo;
  return formatCurrency(Number(match[1]), currency, rates);
}
