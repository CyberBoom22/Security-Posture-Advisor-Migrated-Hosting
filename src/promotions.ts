// Sales running at the vendors, for the public side of the site.
//
// This is deliberately separate from changelog.ts. That file is the internal
// audit trail — what moved, what we got wrong, what it means — and it is
// excluded from the production build. This file is the opposite: it ships to
// every visitor, so it carries only what a visitor needs, which is that a sale
// is running and how long it lasts.
//
// Nothing here is promotional. There are no affiliate links on this site and a
// sale is not a recommendation. The point of surfacing one is timing: a price
// seen during a sale is not the price at renewal, and someone comparing tools
// this week should know which numbers are temporary.

export interface Promotion {
  vendor: string;
  /** The product row this applies to, matching the comparison tables. */
  product: string;
  /** Short, factual headline. No exclamation marks, no urgency language. */
  headline: string;
  /** ISO date the sale was last confirmed running. */
  seenOn: string;
  /**
   * ISO date the sale ends, or null when the vendor does not publish one.
   * Most do not. Saying so is more useful than implying a deadline we invented,
   * and an expired sale disappears from the site on its own.
   */
  endsOn: string | null;
  source: string;
}

export const PROMOTIONS: Promotion[] = [
  {
    vendor: 'Surfshark',
    product: 'Surfshark Starter',
    headline: '85% off the 2-year plan, plus 3 months added to the term',
    seenOn: '2026-09-20',
    endsOn: null,
    source: 'https://surfshark.com/pricing',
  },
  {
    vendor: 'Private Internet Access',
    product: 'Private Internet Access',
    headline: 'Fall sale: 85% off the 3-year plan, plus 3 months added',
    seenOn: '2026-09-20',
    endsOn: null,
    source: 'https://www.privateinternetaccess.com/buy-vpn-online',
  },
  {
    vendor: 'ExpressVPN',
    product: 'ExpressVPN Basic',
    headline: '80% off, described by the vendor as limited-time',
    seenOn: '2026-09-20',
    endsOn: null,
    source: 'https://www.expressvpn.com/order',
  },
  {
    vendor: 'Bitdefender',
    product: 'Bitdefender Total Security',
    headline: '50% off the first year',
    seenOn: '2026-09-20',
    endsOn: null,
    source: 'https://www.bitdefender.com/en-us/consumer/total-security',
  },
  {
    vendor: 'Norton',
    product: 'Norton 360 Deluxe',
    headline: '60% off the first year',
    seenOn: '2026-09-20',
    endsOn: null,
    source: 'https://us.norton.com/products/norton-360-deluxe',
  },
];

const startOfDay = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/**
 * Whole days until a sale ends. null when the vendor publishes no end date,
 * negative once it has passed.
 */
export function daysRemaining(promo: Promotion, today = new Date()): number | null {
  if (!promo.endsOn) return null;
  const end = new Date(`${promo.endsOn}T00:00:00Z`).getTime();
  const now = startOfDay(today).getTime();
  return Math.round((end - now) / 86_400_000);
}

/**
 * Sales still running. A sale whose end date has passed drops off the site by
 * itself, so a forgotten entry cannot leave a dead offer on the page.
 */
export function activePromotions(today = new Date()): Promotion[] {
  return PROMOTIONS.filter((p) => {
    const left = daysRemaining(p, today);
    return left === null || left >= 0;
  });
}

/** How the remaining time should read to a visitor. */
export function durationLabel(promo: Promotion, today = new Date()): string {
  const left = daysRemaining(promo, today);
  if (left === null) return 'No end date published by the vendor';
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

/** True when the sale is close enough to its end to be worth flagging. */
export function endingSoon(promo: Promotion, today = new Date()): boolean {
  const left = daysRemaining(promo, today);
  return left !== null && left <= 7;
}
