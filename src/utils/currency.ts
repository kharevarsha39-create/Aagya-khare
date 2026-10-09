/**
 * CampusPulse Currency & Indian Rupees (INR) Utility Module
 * 
 * Provides consistent formatting using Intl.NumberFormat with locale "en-IN" and currency "INR",
 * official exchange rates, and safe data migration helpers.
 */

export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_LOCALE = 'en-IN';

// Reference exchange rates to INR (1 Unit Foreign Currency = X INR)
export const USD_TO_INR_RATE = 83.5;
export const EUR_TO_INR_RATE = 90.2;
export const GBP_TO_INR_RATE = 106.0;

export const KNOWN_RATES_TO_INR: Record<string, number> = {
  USD: USD_TO_INR_RATE,
  EUR: EUR_TO_INR_RATE,
  GBP: GBP_TO_INR_RATE,
  AED: 22.7,
  CAD: 61.2,
  SGD: 62.4,
  INR: 1.0,
};

/**
 * Format any numerical amount in Indian Rupees (₹ INR) using the Indian numbering system.
 * Examples:
 *   ₹500
 *   ₹1,500
 *   ₹25,000
 *   ₹1,00,000
 *   ₹10,00,000
 */
export function formatINR(
  amount: number,
  options?: {
    showFree?: boolean;
    maximumFractionDigits?: number;
  }
): string {
  if (options?.showFree && (!amount || amount === 0)) {
    return 'Free Entry';
  }

  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const fractionDigits = options?.maximumFractionDigits !== undefined
    ? options.maximumFractionDigits
    : (num % 1 === 0 ? 0 : 2);

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(num);
}

/**
 * Formats event registration fee according to CampusPulse guidelines:
 * - If 0 or free: "Free Entry"
 * - If > 0: "Registration Fee: ₹499"
 */
export function formatEventFee(fee: number): string {
  if (!fee || fee === 0) {
    return 'Free Entry';
  }
  return `Registration Fee: ${formatINR(fee)}`;
}

/**
 * Formats a short badge label for event cards and headers:
 * - 0 => "Free Entry"
 * - >0 => "₹499"
 */
export function formatFeeBadge(fee: number): string {
  if (!fee || fee === 0) {
    return 'Free Entry';
  }
  return formatINR(fee);
}

/**
 * Formats an amount using Indian numbering system without currency symbol:
 * Example: 100000 => "1,00,000"
 */
export function formatIndianNumber(num: number): string {
  const val = typeof num === 'number' && !isNaN(num) ? num : 0;
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(val);
}

/**
 * Replaces hardcoded foreign currency references in prize descriptions and event texts
 * ($10,000 -> ₹8,35,000) using appropriate exchange rates and Indian numbering.
 */
export function convertTextCurrenciesToINR(text: string): string {
  if (!text) return text;
  
  let result = text;

  // Match $ amounts like $10,000 or $3,500 or $1,200
  result = result.replace(/\$([0-9,]+(?:\.[0-9]+)?)/g, (match, numStr) => {
    const rawVal = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(rawVal)) return match;
    const inrValue = Math.round(rawVal * USD_TO_INR_RATE);
    return formatINR(inrValue);
  });

  // Match € amounts like €500
  result = result.replace(/€([0-9,]+(?:\.[0-9]+)?)/g, (match, numStr) => {
    const rawVal = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(rawVal)) return match;
    const inrValue = Math.round(rawVal * EUR_TO_INR_RATE);
    return formatINR(inrValue);
  });

  return result;
}

/**
 * Migrates existing event records into canonical INR format.
 * - Converts USD/EUR amounts to INR using official conversion rates
 * - Preserves originalCurrency, originalFee, and currencyConversionRate
 * - Flags unverified/unknown currencies for review
 */
export function migrateEventToINR(event: any): any {
  if (!event) return event;
  const migrated = { ...event };

  const currentCurrency = migrated.currency ? String(migrated.currency).toUpperCase() : undefined;

  // 1. Check if event is in USD or legacy sample event with USD fee
  if (currentCurrency === 'USD') {
    const originalFee = Number(migrated.fee) || 0;
    migrated.originalCurrency = 'USD';
    migrated.originalFee = originalFee;
    migrated.currencyConversionRate = USD_TO_INR_RATE;
    migrated.fee = Math.round(originalFee * USD_TO_INR_RATE);
    migrated.currency = DEFAULT_CURRENCY;
  } else if (!currentCurrency) {
    // Legacy event without explicit currency field
    // If it's one of the legacy sample events with small numeric USD fees (e.g. 5, 10, 15)
    if (migrated.fee > 0 && migrated.fee <= 50 && !migrated.originalFee) {
      const originalFee = Number(migrated.fee);
      migrated.originalCurrency = 'USD';
      migrated.originalFee = originalFee;
      migrated.currencyConversionRate = USD_TO_INR_RATE;
      migrated.fee = Math.round(originalFee * USD_TO_INR_RATE);
      migrated.currency = DEFAULT_CURRENCY;
    } else {
      migrated.currency = DEFAULT_CURRENCY;
    }
  } else if (currentCurrency !== 'INR') {
    // Non-INR and non-USD currency
    const rate = KNOWN_RATES_TO_INR[currentCurrency];
    if (rate) {
      const originalFee = Number(migrated.fee) || 0;
      migrated.originalCurrency = currentCurrency;
      migrated.originalFee = originalFee;
      migrated.currencyConversionRate = rate;
      migrated.fee = Math.round(originalFee * rate);
      migrated.currency = DEFAULT_CURRENCY;
    } else {
      // Unknown currency and unknown exchange rate - flag for review as per requirement 4
      migrated.currency = currentCurrency;
      migrated.flaggedForCurrencyReview = true;
      migrated.currencyReviewReason = `Original currency "${migrated.currency}" has no known exchange rate. Please review and confirm the registration fee in ₹ INR.`;
    }
  } else {
    // Already INR
    migrated.currency = DEFAULT_CURRENCY;
  }

  // Convert text prizes and description mentions if they contain $ or €
  if (migrated.prizes && typeof migrated.prizes === 'string' && (migrated.prizes.includes('$') || migrated.prizes.includes('€'))) {
    migrated.prizes = convertTextCurrenciesToINR(migrated.prizes);
  }

  if (migrated.description && typeof migrated.description === 'string' && (migrated.description.includes('$') || migrated.description.includes('€'))) {
    migrated.description = convertTextCurrenciesToINR(migrated.description);
  }

  return migrated;
}
