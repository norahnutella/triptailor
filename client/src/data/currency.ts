export const CURRENCY_OPTIONS = [
  {
    code: 'USD',
    label: 'USD ($)',
    symbol: '$',
    name: 'US Dollar',
  },
  {
    code: 'EUR',
    label: 'EUR (€)',
    symbol: '€',
    name: 'Euro',
  },
  {
    code: 'GBP',
    label: 'GBP (£)',
    symbol: '£',
    name: 'British Pound',
  },
  {
    code: 'INR',
    label: 'INR (₹)',
    symbol: '₹',
    name: 'Indian Rupee',
  },
  {
    code: 'JPY',
    label: 'JPY (¥)',
    symbol: '¥',
    name: 'Japanese Yen',
  },
  {
    code: 'AUD',
    label: 'AUD ($)',
    symbol: 'A$',
    name: 'Australian Dollar',
  },
  {
    code: 'CAD',
    label: 'CAD ($)',
    symbol: 'C$',
    name: 'Canadian Dollar',
  },
  {
    code: 'SGD',
    label: 'SGD ($)',
    symbol: 'S$',
    name: 'Singapore Dollar',
  },
  {
    code: 'AED',
    label: 'AED (د.إ)',
    symbol: 'د.إ',
    name: 'UAE Dirham',
  },
];

const CURRENCY_MAP: Record<string, string> = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  INR: 'INR',
  JPY: 'JPY',
  AUD: 'AUD',
  CAD: 'CAD',
  SGD: 'SGD',
  AED: 'AED',

  'USD ($)': 'USD',
  'EUR (€)': 'EUR',
  'GBP (£)': 'GBP',
  'INR (₹)': 'INR',
  'JPY (¥)': 'JPY',
  'AUD ($)': 'AUD',
  'CAD ($)': 'CAD',
  'SGD ($)': 'SGD',
  'AED (د.إ)': 'AED',

  '$ USD': 'USD',
  '€ EUR': 'EUR',
  '£ GBP': 'GBP',
  '₹ INR': 'INR',
  '¥ JPY': 'JPY',

  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '₹': 'INR',
  '¥': 'JPY',

  'EU currency': 'EUR',
};

const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'JPY',
  'AUD',
  'CAD',
  'SGD',
  'AED',
];

export function getCurrencyCode(
  currency: string | undefined | null
): string {
  if (!currency) {
    return 'INR';
  }

  const value = String(currency).trim();

  if (CURRENCY_MAP[value]) {
    return CURRENCY_MAP[value];
  }

  const upperValue = value.toUpperCase();

  for (const code of SUPPORTED_CURRENCIES) {
    if (upperValue.includes(code)) {
      return code;
    }
  }

  return 'INR';
};

/*
 * Base currency = INR.
 *
 * These are fallback rates:
 * 1 INR = rate of target currency.
 */
export const RATES_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.75,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
  AED: 0.044,
};

/*
 * Returns the complete conversion-rate map.
 *
 * ItineraryView uses:
 * getRatesFromINR().then((rates) => ...)
 */
export function getRatesFromINR(): Promise<Record<string, number>> {
  return Promise.resolve({ ...RATES_FROM_INR });
}

/*
 * Convert an INR amount into the selected currency.
 */
export function convertFromINR(
  amount: number,
  currency: string | undefined | null = 'INR',
  rates: Record<string, number> = RATES_FROM_INR
): number {
  const currencyCode = getCurrencyCode(currency);
  const rate = rates[currencyCode] ?? RATES_FROM_INR[currencyCode] ?? 1;

  return amount * rate;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string | undefined | null = 'INR',
  rates: Record<string, number> = RATES_FROM_INR
): string {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return '₹0.00';
  }

  const currencyCode = getCurrencyCode(currency);

  const convertedAmount = convertFromINR(
    numericAmount,
    currencyCode,
    rates
  );

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}

export function convertCostText(
  text: string | null | undefined,
  currency: string | undefined | null = 'INR',
  rates: Record<string, number> = RATES_FROM_INR
): string {
  if (!text) {
    return '';
  }

  /*
   * Matches values such as:
   * ₹500
   * $500
   * €500
   * £500
   * ¥500
   * 500
   * 1,500
   * 1500.50
   */
  return text.replace(
    /(?:₹|\$|€|£|¥|A\$|C\$|S\$|د\.إ)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/g,
    (match, value: string) => {
      const numericValue = Number(String(value).replace(/,/g, ''));

      if (Number.isNaN(numericValue)) {
        return match;
      }

      return formatCurrency(numericValue, currency, rates);
    }
  );
}

export function getCurrencySymbol(
  currency: string | undefined | null = 'INR'
): string {
  const code = getCurrencyCode(currency);

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'د.إ',
  };

  return symbols[code] || '₹';
}