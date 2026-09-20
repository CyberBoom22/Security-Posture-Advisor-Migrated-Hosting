// The audit trail behind the numbers published elsewhere on this site.
//
// Two kinds of record live here, and the Dispatch tab keeps them on separate
// pages because they are earned differently:
//
//   CHANGES  — what moved in the data, one entry per field. These are meant to
//              be generated from a pricing audit rather than typed: the
//              checker reports what no longer matches the vendor's page, a
//              human confirms it, and the confirmed move is recorded here with
//              the source it was read from. A change with no source is a change
//              nobody can check.
//
//   FINDINGS — what the changes mean, or what went wrong. Editorial, written by
//              hand, and including this site's own corrections. A publication
//              that only records other people's errors is not being audited.
//
// A quiet audit writes nothing. If no price moved, there is no entry, and the
// page says so rather than manufacturing an update.

export type PriceField =
  | 'introMo'
  | 'firstBill'
  | 'renewYr'
  | 'monthlyMo'
  | 'introYr'
  | 'familyIntro'
  | 'familyRenew';

export const FIELD_LABELS: Record<PriceField, string> = {
  introMo: 'Intro rate / month',
  firstBill: 'First bill',
  renewYr: 'Renewal / year',
  monthlyMo: 'Month-to-month rate',
  introYr: 'Intro / year',
  familyIntro: 'Family intro',
  familyRenew: 'Family renewal',
};

/** A promotion running at the time the price was read. */
export interface Promotion {
  /** Signals lifted from the vendor's own page, e.g. "FALL SALE", "Save 85%". */
  signals: string[];
  /** The struck-through list price the vendor showed beside the sale price. */
  listPriceShown?: number | null;
}

export interface PriceChange {
  /** ISO date the change was confirmed. */
  date: string;
  /** Brand, matching the Reviews tab. */
  vendor: string;
  /** The exact product row in the comparison data. */
  product: string;
  field: PriceField;
  /** null means the figure was previously unrecorded. */
  from: number | null;
  to: number;
  /**
   * Present when the new price is promotional rather than list. A price that
   * moved because of a sale is a different fact from one that moved because
   * the vendor raised its rates, and the page distinguishes them.
   */
  promo?: Promotion;
  /** Where the new figure was read from. */
  source: string;
  /** Optional one-line explanation. */
  note?: string;
}

export type FindingKind = 'correction' | 'observation' | 'method';

export const FINDING_LABELS: Record<FindingKind, string> = {
  correction: 'Correction',
  observation: 'Observation',
  method: 'Method',
};

export interface Finding {
  date: string;
  kind: FindingKind;
  title: string;
  /** Brands this concerns; empty when it is about the site itself. */
  vendors: string[];
  /** Paragraphs. */
  body: string[];
  sources?: { label: string; url: string }[];
}

// ---------------------------------------------------------------------------
// Changes, newest first.
// ---------------------------------------------------------------------------

export const PRICE_CHANGES: PriceChange[] = [
  {
    date: '2026-09-20',
    vendor: 'Surfshark',
    product: 'Surfshark Starter',
    field: 'firstBill',
    from: 53.73,
    to: 67.23,
    promo: { signals: ['Save 85%', 'sale price'], listPriceShown: 444.15 },
    source: 'https://surfshark.com/pricing',
    note: 'The page carries $2.49/mo with 3 extra months and bills $67.23 for the first 27 months. The $53.73 previously on record is a lapsed promotional total and appears nowhere on the page.',
  },
  {
    date: '2026-09-20',
    vendor: 'Private Internet Access',
    product: 'Private Internet Access',
    field: 'firstBill',
    from: 79.0,
    to: 69.81,
    promo: { signals: ['FALL SALE', '85% Off'], listPriceShown: null },
    source: 'https://www.privateinternetaccess.com/buy-vpn-online',
    note: 'The 3 Years + 3 Months bundle now bills $69.81 rather than $79.00.',
  },
  {
    date: '2026-09-20',
    vendor: 'Private Internet Access',
    product: 'Private Internet Access',
    field: 'introMo',
    from: 2.19,
    to: 1.79,
    promo: { signals: ['FALL SALE', '85% Off'], listPriceShown: null },
    source: 'https://www.privateinternetaccess.com/buy-vpn-online',
    note: '$69.81 across the 39-month term is $1.79/mo, the rate PIA advertises for the bundle.',
  },
];

// ---------------------------------------------------------------------------
// Findings, newest first.
// ---------------------------------------------------------------------------

export const FINDINGS: Finding[] = [
  {
    date: '2026-09-20',
    kind: 'correction',
    title: 'We corrected two VPN rows in the wrong direction before fixing them properly',
    vendors: ['Surfshark', 'Private Internet Access'],
    body: [
      'Two VPN rows quoted a monthly intro rate that did not reconcile with the term and first bill recorded beside it. Surfshark read $2.49/mo over 27 months against a $53.73 first bill, when $2.49 x 27 is $67.23. Private Internet Access read $2.19/mo over 39 months against $79.00, when $2.19 x 39 is $85.41.',
      'Our first correction assumed the first bill was right and adjusted the monthly rate to match it. That was the wrong side of the equation. Both vendors’ own pages show the monthly rate was correct and the first bill had gone stale: Surfshark now bills $67.23 for 27 months, and PIA $69.81 for 39. Neither $53.73 nor $79.00 appears on the respective page any more.',
      'The lesson is recorded here rather than quietly fixed: when two figures disagree, the tie is broken by the vendor, not by whichever number looks tidier. The scheduled audit now checks exactly that, by asking whether each recorded price still appears on the page it came from.',
    ],
    sources: [
      { label: 'Surfshark pricing', url: 'https://surfshark.com/pricing' },
      { label: 'PIA pricing', url: 'https://www.privateinternetaccess.com/buy-vpn-online' },
    ],
  },
  {
    date: '2026-09-20',
    kind: 'observation',
    title: 'A high Trustpilot score measures review solicitation, not treatment',
    vendors: ['TotalAV', 'Norton', 'Proton', 'McAfee'],
    body: [
      'Comparing App Store ratings against TrustScores across all 16 companies in this index turned up an almost inverse relationship. Proton holds the highest App Store score here and the lowest TrustScore. McAfee scores 4.72 on one platform and 1.3 on the other.',
      'The clearest signal is not either score but the ratio between the sample sizes. TotalAV is the only vendor in the index with more Trustpilot reviews than App Store ratings, and it runs one of the steepest renewal multipliers we track. Vendors that never solicit reviews, such as Bitwarden at 89 App Store ratings per Trustpilot review, collect only the aggrieved minority.',
      'Zero-knowledge providers are penalised twice over. A provider that cannot decrypt your vault also cannot reset your password, so every locked-out user becomes a one-star review about support — a direct consequence of the encryption that makes the product worth buying.',
    ],
  },
  {
    date: '2026-09-20',
    kind: 'method',
    title: 'Why we do not scrape prices automatically',
    vendors: [],
    body: [
      'The scheduled audit checks whether each price we publish still appears on the vendor’s page. It does not read a new price off the page and publish it.',
      'Vendor pricing pages vary by geography and A/B bucket, and some render prices only in JavaScript — Proton serves $0.00 placeholders to a plain request. Several vendors also answer an automated request with HTTP 403 while serving the same URL normally to a browser. Any of these can turn a confident scrape into a confident error.',
      'On a site whose masthead promises audited pricing, publishing an unverified number is worse than publishing a stale one. So the audit raises a flag, a person confirms it against the vendor, and only then does the figure change here.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Derived views
// ---------------------------------------------------------------------------

/** Distinct audit dates, newest first. */
export function changeDates(): string[] {
  return [...new Set(PRICE_CHANGES.map((c) => c.date))].sort().reverse();
}

/** Changes for one audit date. */
export function changesOn(date: string): PriceChange[] {
  return PRICE_CHANGES.filter((c) => c.date === date);
}

/** Whether a change was driven by a promotion rather than a list-price move. */
export function isPromotional(change: PriceChange): boolean {
  return Boolean(change.promo && change.promo.signals.length);
}

/** The most recent audit date on record, or null if nothing has been audited. */
export function lastAudit(): string | null {
  return changeDates()[0] ?? null;
}
