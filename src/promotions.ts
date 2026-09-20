// Sales running at the vendors, and the price movement each one caused.
//
// Everything here is public. It is what the Sales tab announces and what the
// notice above the comparison tables summarises.
//
// NOTHING IS ANNOUNCED ON FIRST SIGHTING.
//
// A sale is published only once the scheduled scan has seen it on three
// separate runs. The scan runs three times in the last week of each month, so
// a real sale clears the bar in about four days, while a flash promo, a
// regional price variant or a scraping artefact expires or disappears before
// it ever reaches a visitor. An entry below the threshold is tracked but
// invisible.
//
// This site takes no commission. A sale is not a recommendation, and the only
// reason to surface one is timing: an intro price seen during a sale is not
// the price at renewal, and the renewal figure is the one that matters.

export interface Promotion {
  vendor: string;
  /** The product row this applies to, matching the comparison tables. */
  product: string;
  /** Short, factual headline. No urgency language. */
  headline: string;
  /** e.g. "85% off". Omitted when the vendor states no percentage. */
  discount?: string;

  /** What the vendor shows as the undiscounted price, when it shows one. */
  priceWas: number | null;
  /** What the sale actually charges. */
  priceNow: number | null;
  /** What priceNow covers, e.g. "for the first 27 months". */
  priceCovers: string;
  /**
   * What it costs once the intro term ends. This is the number the sale does
   * not change, and the reason the page exists.
   */
  renewsAt: number | null;
  /** The period renewsAt covers, e.g. "/yr". */
  renewsPer: string;

  /** ISO date of the first scan that saw this sale. */
  firstSeen: string;
  /** ISO date of the most recent scan that saw it. */
  lastSeen: string;
  /** How many scheduled scans have seen it. Announced at REQUIRED_SCANS. */
  confirmations: number;

  /**
   * ISO date the sale ends, or null when the vendor publishes none. Most do
   * not. Saying so beats implying a deadline we invented, and a sale with a
   * date drops off the site by itself once it passes.
   */
  endsOn: string | null;
  source: string;
}

/** Scans that must see a sale before it is announced. */
export const REQUIRED_SCANS = 3;

/** Days of the month the scan runs. Kept in step with the workflow cron. */
export const SCAN_DAYS = [24, 26, 28];

/** "24th, 26th and 28th" — for prose, where a joined number list reads badly. */
export function scanDaysLabel(): string {
  const ordinal = (n: number) => {
    const rem100 = n % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
    return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
  };
  const days = SCAN_DAYS.map(ordinal);
  return days.length > 1
    ? `${days.slice(0, -1).join(', ')} and ${days[days.length - 1]}`
    : days[0];
}

export const PROMOTIONS: Promotion[] = [
  {
    vendor: 'Surfshark',
    product: 'Surfshark Starter',
    headline: '2-year plan discounted, with 3 months added to the term',
    discount: '85% off',
    priceWas: 444.15,
    priceNow: 67.23,
    priceCovers: 'for the first 27 months',
    renewsAt: 79.0,
    renewsPer: '/yr',
    firstSeen: '2026-09-20',
    lastSeen: '2026-09-20',
    confirmations: 1,
    endsOn: null,
    source: 'https://surfshark.com/pricing',
  },
  {
    vendor: 'Private Internet Access',
    product: 'Private Internet Access',
    headline: 'Fall sale on the 3-year plan, with 3 months added',
    discount: '85% off',
    priceWas: null,
    priceNow: 69.81,
    priceCovers: 'for the first 39 months',
    renewsAt: 56.16,
    renewsPer: '/yr',
    firstSeen: '2026-09-20',
    lastSeen: '2026-09-20',
    confirmations: 1,
    endsOn: null,
    source: 'https://www.privateinternetaccess.com/buy-vpn-online',
  },
  {
    vendor: 'ExpressVPN',
    product: 'ExpressVPN Basic',
    headline: 'Discount the vendor describes as limited-time',
    discount: '80% off',
    priceWas: null,
    priceNow: 97.72,
    priceCovers: 'for the first 28 months',
    renewsAt: 99.95,
    renewsPer: '/yr',
    firstSeen: '2026-09-20',
    lastSeen: '2026-09-20',
    confirmations: 1,
    endsOn: null,
    source: 'https://www.expressvpn.com/order',
  },
  {
    vendor: 'Bitdefender',
    product: 'Bitdefender Total Security',
    headline: 'First year discounted',
    discount: '50% off',
    priceWas: null,
    priceNow: 49.99,
    priceCovers: 'for the first year',
    renewsAt: 109.99,
    renewsPer: '/yr',
    firstSeen: '2026-09-20',
    lastSeen: '2026-09-20',
    confirmations: 1,
    endsOn: null,
    source: 'https://www.bitdefender.com/en-us/consumer/total-security',
  },
  {
    vendor: 'Norton',
    product: 'Norton 360 Deluxe',
    headline: 'First year discounted',
    discount: '60% off',
    priceWas: null,
    priceNow: 49.99,
    priceCovers: 'for the first year',
    renewsAt: 119.99,
    renewsPer: '/yr',
    firstSeen: '2026-09-20',
    lastSeen: '2026-09-20',
    confirmations: 1,
    endsOn: null,
    source: 'https://us.norton.com/products/norton-360-deluxe',
  },
];

const startOfDay = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Whole days until a sale ends. null when no end date is published. */
export function daysRemaining(promo: Promotion, today = new Date()): number | null {
  if (!promo.endsOn) return null;
  const end = new Date(`${promo.endsOn}T00:00:00Z`).getTime();
  return Math.round((end - startOfDay(today).getTime()) / 86_400_000);
}

/** Has the sale's published end date passed? */
export function hasExpired(promo: Promotion, today = new Date()): boolean {
  const left = daysRemaining(promo, today);
  return left !== null && left < 0;
}

/** Seen by enough scans to be announced. */
export function isConfirmed(promo: Promotion): boolean {
  return promo.confirmations >= REQUIRED_SCANS;
}

/** Sales a visitor should see: confirmed by three scans and not expired. */
export function announcedPromotions(today = new Date()): Promotion[] {
  return PROMOTIONS.filter((p) => isConfirmed(p) && !hasExpired(p, today));
}

/** Seen, but not yet by enough scans to announce. */
export function awaitingConfirmation(today = new Date()): Promotion[] {
  return PROMOTIONS.filter((p) => !isConfirmed(p) && !hasExpired(p, today));
}

/** How long the sale runs, in words. */
export function durationLabel(promo: Promotion, today = new Date()): string {
  const left = daysRemaining(promo, today);
  if (left === null) return 'No end date published by the vendor';
  if (left < 0) return 'Ended';
  if (left === 0) return 'Ends today';
  if (left === 1) return 'Ends tomorrow';
  if (left <= 14) return `Ends in ${left} days`;
  const end = new Date(`${promo.endsOn}T00:00:00Z`);
  return `Runs until ${end.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })}`;
}

/** Close enough to the end to be worth flagging. */
export function endingSoon(promo: Promotion, today = new Date()): boolean {
  const left = daysRemaining(promo, today);
  return left !== null && left >= 0 && left <= 7;
}

/** How long a sale has been observed running, in days. */
export function daysObserved(promo: Promotion, today = new Date()): number {
  const first = new Date(`${promo.firstSeen}T00:00:00Z`).getTime();
  return Math.max(
    0,
    Math.round((startOfDay(today).getTime() - first) / 86_400_000)
  );
}

/** What a sale saves against the vendor's own undiscounted figure. */
export function savingPercent(promo: Promotion): number | null {
  if (promo.priceWas === null || promo.priceNow === null || promo.priceWas <= 0) {
    return null;
  }
  return Math.round(((promo.priceWas - promo.priceNow) / promo.priceWas) * 100);
}

/**
 * The multiple between the sale price and the renewal, normalised to a year.
 * A sale that looks generous can still renew at several times the rate.
 */
export function renewalMultiple(promo: Promotion, months: number | null): number | null {
  if (promo.priceNow === null || promo.renewsAt === null || !months) return null;
  const perYear = (promo.priceNow / months) * 12;
  if (perYear <= 0) return null;
  return promo.renewsAt / perYear;
}
