// Review & rating intelligence for every SaaS vendor in the index.
//
// TWO KINDS OF NUMBER LIVE IN THIS FILE, AND THEY MUST NEVER BE BLENDED:
//
//   1. MEASURED  — App Store and Trustpilot figures. Transcribed from the
//      public source on `asOf`, each with the URL it came from. Nobody here
//      invents these. Refresh the App Store side with
//      `node scripts/fetch-app-store-ratings.mjs`; the Trustpilot side is
//      hand-audited because Trustpilot has no API that covers companies you
//      do not own (TrustBox widgets are own-business-only, and their data
//      plans start in the hundreds per month).
//
//   2. ASSESSED  — the eight category scores. Editorial 1-5 judgements
//      against the rubric in SCORE_RUBRIC, each carrying the evidence that
//      justifies it. Two of the eight are not judgements at all: `jurisdiction`
//      and `billing` are COMPUTED from data.ts, so they cannot drift away from
//      the pricing and legal research the rest of the site already publishes.
//
// The page renders these two kinds differently on purpose. A reader should
// never have to guess whether a number was observed or argued.

import {
  PW_MANAGERS,
  SUITES,
  VPN_COMPARE,
  AV_COMPARE,
  JurisdictionInfo,
} from './data';

export type ProductCategory = 'password' | 'vpn' | 'antivirus' | 'suite';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  password: 'Password Managers',
  vpn: 'VPNs',
  antivirus: 'Antivirus',
  suite: 'All-in-One Suites',
};

/** A rating transcribed from a public source on a given date. */
export interface MeasuredRating {
  /** 0-5. null means the vendor has no comparable profile on that platform. */
  score: number | null;
  reviewCount: number | null;
  url: string;
  /** ISO date the figure was read from the source. */
  asOf: string;
  /** Shown when score is null, to explain the absence rather than hide it. */
  unavailableReason?: string;
}

export interface AppStoreRating extends MeasuredRating {
  appId: number | null;
  appName: string;
}

/** An editorial 1-5 judgement plus the reasoning behind it. */
export interface AssessedScore {
  /** 1-5, or null where the category does not apply to this product type. */
  score: number | null;
  evidence: string;
}

export type ScoreKey =
  | 'ui'
  | 'speed'
  | 'platforms'
  | 'support'
  | 'encryption'
  | 'audit'
  | 'jurisdiction'
  | 'billing';

export interface ScoreMeta {
  key: ScoreKey;
  label: string;
  group: 'usability' | 'security';
  /** What a reader is actually being told by this number. */
  question: string;
  /** How the number is arrived at. */
  method: 'assessed' | 'computed';
  anchors: string;
}

// The rubric is published on the page. A score with no stated rubric is just
// an opinion wearing a number.
export const SCORE_RUBRIC: ScoreMeta[] = [
  {
    key: 'ui',
    label: 'Seamless UI',
    group: 'usability',
    question: 'How much friction is there in setup and in daily use?',
    method: 'assessed',
    anchors:
      '5 = installs and gets out of the way; a non-technical relative can run it unaided. 3 = usable but has rough edges or nags. 1 = confusing, cluttered, or actively pushes upsells during normal use.',
  },
  {
    key: 'speed',
    label: 'Speed Impact',
    group: 'usability',
    question:
      'What does it cost you in throughput or system performance while running?',
    method: 'assessed',
    anchors:
      'For VPNs: retained download speed on a nearby server. For antivirus: background system overhead during a scan. For vaults: sync and autofill latency. 5 = negligible. 1 = you notice it constantly.',
  },
  {
    key: 'platforms',
    label: 'Cross-Platform Reach',
    group: 'usability',
    question: 'Will it cover every device in the household, not just the popular ones?',
    method: 'assessed',
    anchors:
      '5 = every mainstream desktop and mobile OS plus browsers, with router or Linux support where relevant. 1 = effectively single-platform.',
  },
  {
    key: 'support',
    label: 'Support & Recovery',
    group: 'usability',
    question:
      'When you are locked out or overbilled, can a human actually resolve it?',
    method: 'assessed',
    anchors:
      '5 = responsive human support and a documented, safe recovery path. 1 = no reachable support, or billing disputes that go nowhere. Note: strong zero-knowledge encryption legitimately caps this category — see the divergence note on the page.',
  },
  {
    key: 'encryption',
    label: 'Encryption Architecture',
    group: 'security',
    question: 'Can the vendor read your data if someone compels them to?',
    method: 'assessed',
    anchors:
      '5 = end-to-end/zero-knowledge; the vendor holds no usable key. 3 = encrypted in transit and at rest, but the vendor holds keys. 1 = no meaningful confidentiality claim.',
  },
  {
    key: 'audit',
    label: 'Independent Verification',
    group: 'security',
    question: 'Has an outside party actually checked the claims?',
    method: 'assessed',
    anchors:
      '5 = open source AND recurring published third-party audits. 3 = audited but closed source, or open source without recent audit. 1 = no public independent verification.',
  },
  {
    key: 'jurisdiction',
    label: 'Jurisdiction Exposure',
    group: 'security',
    question: 'Which intelligence-sharing regime can compel this company?',
    method: 'computed',
    anchors:
      'Computed from the alliance classification already published in the Compare tab: Swiss = 5, Non-14-Eyes = 4, 14-Eyes = 3, 9-Eyes = 2, 5-Eyes = 1.',
  },
  {
    key: 'billing',
    label: 'Billing Transparency',
    group: 'security',
    question: 'Does the price you are quoted resemble the price you will pay?',
    method: 'computed',
    anchors:
      'Computed from this site’s own audited pricing: the renewal-to-intro multiplier. Up to 1.05x = 5, up to 1.3x = 4, up to 1.8x = 3, up to 2.5x = 2, above 2.5x = 1. Free products score 5.',
  },
];

/**
 * What is actually producing the distance between the two scores. The table
 * on the page groups companies by this rather than repeating a generic line,
 * because "the app is good and the billing is not" is true of several entries
 * for quite different reasons.
 */
export type GapDriver =
  | 'solicited'
  | 'lockout'
  | 'billing'
  | 'thin-sample'
  | 'aligned'
  | 'not-comparable';

export const GAP_DRIVER_LABELS: Record<GapDriver, string> = {
  solicited: 'Solicited reviews',
  lockout: 'Zero-knowledge lockouts',
  billing: 'Billing disputes',
  'thin-sample': 'Thin Trustpilot sample',
  aligned: 'Both samples agree',
  'not-comparable': 'Not comparable',
};

/** Drivers that should read as a warning rather than a neutral observation. */
export const CAUTION_DRIVERS: ReadonlySet<GapDriver> = new Set<GapDriver>([
  'solicited',
  'billing',
  'thin-sample',
]);

/**
 * The live numbers a gap explanation is allowed to quote. Every figure the
 * prose cites is interpolated from here rather than typed by hand, for the
 * same reason the jurisdiction and billing scores are computed: a sentence
 * reading "364 reviews" goes quietly wrong the moment the ratings are
 * refreshed, and nothing in a build catches a stale number inside a string.
 */
export interface GapFacts {
  /** e.g. "4.84" */
  appScore: string;
  /** e.g. "8,146" */
  appCount: string;
  /** e.g. "2.2" */
  tpScore: string;
  /** e.g. "1,789" */
  tpCount: string;
  /** Signed, e.g. "+2.64". */
  gap: string;
  /** Unsigned, e.g. "2.64". */
  gapAbs: string;
  /** App Store ratings per Trustpilot review, e.g. "4.6". */
  ratio: string;
  /** Trustpilot reviews per App Store rating — only meaningful below 1:1. */
  ratioInverse: string;
  /** Renewal-to-intro multiplier, e.g. "2.34". */
  renewalMult: string;
  /** Rank by sample fullness, 1 = fullest. Word form, e.g. "third". */
  fullnessOrdinal: string;
  /** Rank by Trustpilot review count, 1 = largest. Word form. */
  tpCountOrdinal: string;
}

export interface GapAnatomy {
  driver: GapDriver;
  /** One specific sentence about THIS company, built from its live figures. */
  detail: (f: GapFacts) => string;
}

export interface CompanyReview {
  slug: string;
  name: string;
  /** Corporate parent, where it differs from the brand. */
  parent?: string;
  categories: ProductCategory[];
  /** Product names exactly as they appear in the data.ts arrays. */
  products: string[];
  /** Which data.ts entry supplies pricing for the computed billing score. */
  priceRef: { kind: 'pw' | 'suite' | 'vpn' | 'av'; name: string } | null;
  /** Which data.ts entry supplies the jurisdiction for the computed score. */
  jurisdictionRef: { kind: 'pw' | 'suite' | 'vpn' | 'av'; name: string };
  appStore: AppStoreRating;
  trustpilot: MeasuredRating;
  scores: Record<ScoreKey, AssessedScore>;
  /** Short, specific breakdown of the gap, shown in the divergence table. */
  gapAnatomy: GapAnatomy;
  /** Longer plain reading of why the two measured scores disagree. */
  divergenceNote: string;
}

const APPLE = (id: number) => `https://apps.apple.com/us/app/id${id}`;
const TP = (domain: string) => `https://www.trustpilot.com/review/${domain}`;

// Every measured figure below was read from its source URL on this date.
export const RATINGS_AS_OF = '2026-09-20';

export const COMPANY_REVIEWS: CompanyReview[] = [
  {
    slug: 'bitwarden',
    name: 'Bitwarden',
    categories: ['password'],
    products: ['Bitwarden'],
    priceRef: { kind: 'pw', name: 'Bitwarden' },
    jurisdictionRef: { kind: 'pw', name: 'Bitwarden' },
    appStore: {
      appId: 1137397744,
      appName: 'Bitwarden Password Manager',
      score: 4.76,
      reviewCount: 32489,
      url: APPLE(1137397744),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 3.3,
      reviewCount: 364,
      url: TP('bitwarden.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 4, evidence: 'Clean and fast, but the interface is functional rather than polished and autofill occasionally needs a manual nudge.' },
      speed: { score: 5, evidence: 'Vault sync and autofill are effectively instant; no measurable system overhead.' },
      platforms: { score: 5, evidence: 'Windows, macOS, Linux, iOS, Android, every major browser, plus a CLI and self-hosting.' },
      support: { score: 3, evidence: 'Community forum and email support only; no phone line. Zero-knowledge design means a lost master password is unrecoverable by anyone.' },
      encryption: { score: 5, evidence: 'AES-256 client-side zero-knowledge. Servers never hold master keys or plaintext vault items.' },
      audit: { score: 5, evidence: 'Fully open source and independently audited on a recurring basis.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'thin-sample',
      detail: (f) =>
        `The most lopsided pair in the index: ${f.ratio} App Store ratings for every Trustpilot review. At ${f.tpCount} reviews, a few dozen people locked out of a vault nobody can unlock set the entire score.`,
    },
    divergenceNote:
      'A 364-review Trustpilot sample against 32,536 App Store ratings. The Trustpilot page is dominated by people who were locked out of a vault nobody can unlock for them — a direct consequence of the encryption that earns its 5 above.',
  },
  {
    slug: '1password',
    name: '1Password',
    parent: 'AgileBits Inc.',
    categories: ['password'],
    products: ['1Password'],
    priceRef: { kind: 'pw', name: '1Password' },
    jurisdictionRef: { kind: 'pw', name: '1Password' },
    appStore: {
      appId: 1511601750,
      appName: '1Password: Password Manager',
      score: 4.66,
      reviewCount: 39354,
      url: APPLE(1511601750),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.2,
      reviewCount: 12478,
      url: TP('1password.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'The most polished vault in the category; shared and personal vaults are clearly separated and permissions are legible.' },
      speed: { score: 5, evidence: 'Native apps on every platform; autofill and unlock are immediate.' },
      platforms: { score: 5, evidence: 'All desktop and mobile platforms, all major browsers, plus Linux and CLI.' },
      support: { score: 4, evidence: 'Responsive documented support and a Secret Key recovery model that is safer than most, though still not a password reset.' },
      encryption: { score: 5, evidence: 'Zero-knowledge with an account Secret Key layered on top of the master password.' },
      audit: { score: 4, evidence: 'Recurring published third-party audits, but the client is closed source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'aligned',
      detail: (f) =>
        `${f.tpCount} Trustpilot reviews against ${f.appCount} App Store ratings makes this the ${f.fullnessOrdinal}-fullest Trustpilot sample here, and it agrees with the app to within half a point.`,
    },
    divergenceNote:
      'The two systems broadly agree here, which is what agreement looks like: a large sample on both sides and no aggressive review solicitation distorting either.',
  },
  {
    slug: 'nordpass',
    name: 'NordPass',
    parent: 'Nord Security',
    categories: ['password'],
    products: ['NordPass'],
    priceRef: { kind: 'pw', name: 'NordPass' },
    jurisdictionRef: { kind: 'pw', name: 'NordPass' },
    appStore: {
      appId: 1486322860,
      appName: 'NordPass: Password Manager',
      score: 4.65,
      reviewCount: 12895,
      url: APPLE(1486322860),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.0,
      reviewCount: 2070,
      url: TP('nordpass.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'Deliberately simple; the easiest vault to hand to a less-technical relative.' },
      speed: { score: 5, evidence: 'Lightweight clients with fast sync and no noticeable overhead.' },
      platforms: { score: 4, evidence: 'All mainstream desktop and mobile platforms and browsers; no CLI or self-hosting.' },
      support: { score: 4, evidence: '24/7 chat support inherited from the Nord Security estate.' },
      encryption: { score: 5, evidence: 'XChaCha20 client-side zero-knowledge encryption.' },
      audit: { score: 3, evidence: 'Independently audited but closed source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'billing',
      detail: (f) =>
        `A modest ${f.gapAbs} gap on a ${f.ratio}:1 sample. The complaints that exist cluster on the ${f.renewalMult}x second-year price rather than on the vault.`,
    },
    divergenceNote:
      'Modest gap. Note the renewal multiplier in the computed billing score — the Trustpilot complaints that do exist cluster around the second-year price, not the product.',
  },
  {
    slug: 'dashlane',
    name: 'Dashlane',
    categories: ['password'],
    products: ['Dashlane'],
    priceRef: { kind: 'pw', name: 'Dashlane' },
    jurisdictionRef: { kind: 'pw', name: 'Dashlane' },
    appStore: {
      appId: 517914548,
      appName: 'Dashlane Password Manager',
      score: 4.79,
      reviewCount: 106939,
      url: APPLE(517914548),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 2.8,
      reviewCount: 6131,
      url: TP('dashlane.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'Among the highest-rated mobile experiences in the index, with strong autofill.' },
      speed: { score: 4, evidence: 'Responsive in daily use; the bundled VPN is a lightweight third-party integration rather than a full client.' },
      platforms: { score: 4, evidence: 'Web-first architecture after the desktop app was retired; mobile and browser coverage is complete.' },
      support: { score: 2, evidence: 'The dominant theme of its 6,131 Trustpilot reviews is billing and cancellation friction rather than product failure.' },
      encryption: { score: 5, evidence: 'AES-256 zero-knowledge with a patented key architecture.' },
      audit: { score: 3, evidence: 'Independently audited but closed source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'billing',
      detail: (f) =>
        `${f.appScore} from ${f.appCount} people asked inside a working app; ${f.tpScore} from ${f.tpCount} who went looking for a complaints page after trying to cancel. Same product, different question.`,
    },
    divergenceNote:
      'A 1.99-point gap — one of the widest in the index. The app is genuinely excellent and the billing experience is not; each platform is measuring a different half of that.',
  },
  {
    slug: 'proton',
    name: 'Proton',
    parent: 'Proton AG',
    categories: ['password', 'vpn', 'suite'],
    products: ['Proton Pass', 'Proton VPN Plus', 'Proton Unlimited / Family'],
    priceRef: { kind: 'vpn', name: 'Proton VPN Plus' },
    jurisdictionRef: { kind: 'pw', name: 'Proton Pass' },
    appStore: {
      appId: 6443490629,
      appName: 'Proton Pass — Password Manager',
      score: 4.84,
      reviewCount: 8146,
      url: APPLE(6443490629),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 2.2,
      reviewCount: 1789,
      url: TP('proton.me'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 4, evidence: 'Consistent, privacy-forward design across Pass, VPN and Mail; the unified account can be confusing at first.' },
      speed: { score: 4, evidence: 'Proton VPN retains strong throughput on nearby servers; NetShield filtering adds no meaningful cost.' },
      platforms: { score: 5, evidence: 'Every desktop and mobile platform including first-class Linux support and open-source clients.' },
      support: { score: 2, evidence: 'Email-only support with no phone line, and accounts locked by the encryption model cannot be recovered by staff at any tier.' },
      encryption: { score: 5, evidence: 'End-to-end zero-knowledge across the suite, with published open-source cryptographic implementations.' },
      audit: { score: 5, evidence: 'Open source across clients with recurring published independent audits.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'lockout',
      detail: (f) =>
        `Proton sends no review invitations, so only unresolved complaints accumulate — disproportionately account lockouts a zero-knowledge provider is unable to fix. Its ${f.appScore} is still the highest App Store score in the index.`,
    },
    divergenceNote:
      'The sharpest inversion in the index: the best App Store score of any vendor here (4.84) against the worst Trustpilot score (2.2). Proton never solicits reviews, so its Trustpilot page collects only the self-selected minority with an unresolved complaint — disproportionately account lockouts that a zero-knowledge provider is architecturally unable to fix.',
  },
  {
    slug: 'aura',
    name: 'Aura',
    categories: ['suite'],
    products: ['Aura'],
    priceRef: { kind: 'suite', name: 'Aura' },
    jurisdictionRef: { kind: 'suite', name: 'Aura' },
    appStore: {
      appId: 1547735089,
      appName: 'Aura: Security & Protection',
      score: 4.67,
      reviewCount: 107479,
      url: APPLE(1547735089),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.3,
      reviewCount: 1280,
      url: TP('aura.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'Single dashboard with no tier-gating, so nothing in the interface is an advertisement for a higher plan.' },
      speed: { score: 4, evidence: 'Monitoring runs server-side; the bundled VPN and antivirus trail dedicated tools but impose little local cost.' },
      platforms: { score: 4, evidence: 'Desktop and mobile coverage with unlimited devices on the family plan.' },
      support: { score: 4, evidence: 'US-based phone support with white-glove identity-restoration case handling.' },
      encryption: { score: 3, evidence: 'Standard transport and at-rest encryption. Identity monitoring inherently requires Aura to hold readable personal data.' },
      audit: { score: 3, evidence: 'Regulated under FCRA and GLBA safeguards rather than published cryptographic audits.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'thin-sample',
      detail: (f) =>
        `Only ${f.tpCount} Trustpilot reviews against ${f.appCount} App Store ratings. Splits of ${f.ratio}:1 usually produce a low score — yet the two land just ${f.gapAbs} apart. Neither reflects the ${f.renewalMult}x renewal.`,
    },
    divergenceNote:
      'Both platforms agree the product is good. Neither captures the renewal jump, which is why the computed billing score below disagrees with both.',
  },
  {
    slug: 'norton',
    name: 'Norton',
    parent: 'Gen Digital Inc.',
    categories: ['antivirus', 'suite'],
    products: ['Norton 360 Deluxe'],
    priceRef: { kind: 'av', name: 'Norton 360 Deluxe' },
    jurisdictionRef: { kind: 'suite', name: 'Norton 360 Deluxe' },
    appStore: {
      appId: 1278474169,
      appName: 'Norton 360 Security & VPN',
      score: 4.66,
      reviewCount: 182782,
      url: APPLE(1278474169),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.7,
      reviewCount: 87191,
      url: TP('norton.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 3, evidence: 'Capable but busy, with persistent prompts to upgrade to LifeLock tiers during ordinary use.' },
      speed: { score: 4, evidence: 'Modern engine with modest background overhead; full scans are still noticeable on older hardware.' },
      platforms: { score: 4, evidence: 'Windows, macOS, iOS and Android, capped at 5 devices on Deluxe.' },
      support: { score: 4, evidence: '24/7 phone and chat support, reflected in an unusually high Trustpilot score for the category.' },
      encryption: { score: 3, evidence: 'Standard transport and at-rest encryption; the bundled VPN is not zero-knowledge.' },
      audit: { score: 4, evidence: 'Consistently strong AV-TEST and AV-Comparatives detection results; closed source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'solicited',
      detail: (f) =>
        `${f.tpCount} Trustpilot reviews, the ${f.tpCountOrdinal}-largest here, at a ${f.ratio}:1 ratio. Norton invites reviews after support contact, which is legitimate but samples a far happier slice than a page nobody is pointed to.`,
    },
    divergenceNote:
      'The highest Trustpilot score in the index, built on 87,191 reviews. Norton actively solicits reviews post-support-contact; that is legitimate, but it means this score measures a far more satisfied slice than a page nobody is invited to.',
  },
  {
    slug: 'mcafee',
    name: 'McAfee',
    parent: 'McAfee, LLC',
    categories: ['antivirus', 'suite'],
    products: ['McAfee+ (Family)', 'McAfee Total Protection'],
    priceRef: { kind: 'av', name: 'McAfee Total Protection' },
    jurisdictionRef: { kind: 'suite', name: 'McAfee+ (Family)' },
    appStore: {
      appId: 724596345,
      appName: 'McAfee: Stay Secure & Private',
      score: 4.72,
      reviewCount: 238085,
      url: APPLE(724596345),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 1.3,
      reviewCount: 3444,
      url: TP('mcafee.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 3, evidence: 'Straightforward dashboard undercut by frequent upsell prompts and renewal notices.' },
      speed: { score: 4, evidence: 'Low idle overhead; scans are heavier than Bitdefender or Defender.' },
      platforms: { score: 5, evidence: 'Unlimited devices across Windows, macOS, iOS and Android on the family plan.' },
      support: { score: 1, evidence: 'The lowest Trustpilot score in the index at 1.3, with reviews dominated by auto-renewal charges and refund difficulty.' },
      encryption: { score: 3, evidence: 'Standard transport and at-rest encryption; identity features require readable personal data.' },
      audit: { score: 4, evidence: 'Solid independent lab detection scores; closed source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'billing',
      detail: (f) =>
        `${f.tpCount} people reached Trustpilot unprompted and wrote about auto-renewal charges and refused refunds. The ${f.appCount} App Store raters were asked inside a working app, and never saw the ${f.renewalMult}x renewal.`,
    },
    divergenceNote:
      'The widest gap in the entire index at 3.42 points. 238,085 people rating the app 4.72 and 3,444 people rating the company 1.3 are not contradicting each other — they are answering different questions, and only one of those questions is about billing.',
  },
  {
    slug: 'surfshark',
    name: 'Surfshark',
    parent: 'Nord Security',
    categories: ['vpn', 'antivirus', 'suite'],
    products: ['Surfshark Starter', 'Surfshark One', 'Surfshark One+'],
    priceRef: { kind: 'vpn', name: 'Surfshark Starter' },
    jurisdictionRef: { kind: 'vpn', name: 'Surfshark Starter' },
    appStore: {
      appId: 1391782046,
      appName: 'Surfshark VPN: Fast & Secure',
      score: 4.7,
      reviewCount: 129563,
      url: APPLE(1391782046),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.3,
      reviewCount: 31321,
      url: TP('surfshark.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'Clean client with CleanWeb filtering on by default and no per-device seat management to think about.' },
      speed: { score: 5, evidence: 'WireGuard throughout with strong retained throughput on nearby servers.' },
      platforms: { score: 5, evidence: 'Unlimited simultaneous devices on every plan, plus router support and Linux.' },
      support: { score: 4, evidence: '24/7 chat support; 4.3 across a substantial 31,321-review sample.' },
      encryption: { score: 4, evidence: 'Audited no-logs WireGuard with RAM-only servers; not zero-knowledge in the vault sense.' },
      audit: { score: 4, evidence: 'Independently audited no-logs claims and open-source client components.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'aligned',
      detail: (f) =>
        `${f.tpCount} Trustpilot reviews at ${f.ratio}:1 is a full sample rather than a complaints bin, and it lands ${f.gapAbs} from the app.`,
    },
    divergenceNote:
      'Close agreement across two large samples — the profile of a vendor whose product and billing experience match.',
  },
  {
    slug: 'nordvpn',
    name: 'NordVPN',
    parent: 'Nord Security',
    categories: ['vpn'],
    products: ['NordVPN Basic'],
    priceRef: { kind: 'vpn', name: 'NordVPN Basic' },
    jurisdictionRef: { kind: 'vpn', name: 'NordVPN Basic' },
    appStore: {
      appId: 905953485,
      appName: 'NordVPN: VPN Fast & Secure',
      score: 4.66,
      reviewCount: 702869,
      url: APPLE(905953485),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.2,
      reviewCount: 50513,
      url: TP('nordvpn.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'Map-based server picker with Threat Protection built in; the largest App Store sample in the index at 702,869 ratings.' },
      speed: { score: 5, evidence: 'NordLynx (WireGuard-derived) delivers among the highest retained throughput of any provider here.' },
      platforms: { score: 5, evidence: '10 devices per account, unlimited via router, with Linux and browser clients.' },
      support: { score: 4, evidence: '24/7 chat support across a large 50,513-review Trustpilot sample.' },
      encryption: { score: 4, evidence: 'Audited no-logs policy on RAM-only infrastructure.' },
      audit: { score: 4, evidence: 'Repeated independent no-logs audits; client partially open source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'aligned',
      detail: (f) =>
        `${f.appCount} App Store ratings is the largest sample in the index, set against ${f.tpCount} on Trustpilot. At that volume individual grievances stop moving the average and both platforms converge.`,
    },
    divergenceNote:
      'Two of the largest samples in the index, 0.46 apart. When both platforms have hundreds of thousands of data points, they tend to converge.',
  },
  {
    slug: 'expressvpn',
    name: 'ExpressVPN',
    parent: 'Kape Technologies',
    categories: ['vpn'],
    products: ['ExpressVPN Basic'],
    priceRef: { kind: 'vpn', name: 'ExpressVPN Basic' },
    jurisdictionRef: { kind: 'vpn', name: 'ExpressVPN Basic' },
    appStore: {
      appId: 886492891,
      appName: 'ExpressVPN · Secure & Fast VPN',
      score: 4.69,
      reviewCount: 418845,
      url: APPLE(886492891),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.4,
      reviewCount: 29053,
      url: TP('expressvpn.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 5, evidence: 'The most beginner-proof VPN client in the index; one button and sensible defaults.' },
      speed: { score: 5, evidence: 'Lightway protocol with consistently high retained throughput.' },
      platforms: { score: 5, evidence: 'Every mainstream platform plus dedicated router firmware.' },
      support: { score: 5, evidence: '24/7 live chat with a strong reputation, reflected in the highest VPN Trustpilot score here.' },
      encryption: { score: 4, evidence: 'Audited no-logs on RAM-only TrustedServer infrastructure.' },
      audit: { score: 4, evidence: 'Repeated published independent audits; Lightway source is open.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'aligned',
      detail: (f) =>
        `${f.appCount} and ${f.tpCount}, both large, ${f.gapAbs} apart — and at ${f.tpScore} the highest VPN TrustScore here, earned on a sample big enough to mean it.`,
    },
    divergenceNote:
      'Strong agreement. Worth noting separately from either score: Kape Technologies also owns Private Internet Access and CyberGhost, so three entries in this index share one parent.',
  },
  {
    slug: 'pia',
    name: 'Private Internet Access',
    parent: 'Kape Technologies',
    categories: ['vpn'],
    products: ['Private Internet Access'],
    priceRef: { kind: 'vpn', name: 'Private Internet Access' },
    jurisdictionRef: { kind: 'vpn', name: 'Private Internet Access' },
    appStore: {
      appId: 955626407,
      appName: 'VPN by Private Internet Access',
      score: 4.69,
      reviewCount: 149518,
      url: APPLE(955626407),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.2,
      reviewCount: 11004,
      url: TP('privateinternetaccess.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 4, evidence: 'Highly configurable, which is a strength for tinkerers and a liability for everyone else.' },
      speed: { score: 4, evidence: 'WireGuard support with good throughput, slightly behind the fastest clients here.' },
      platforms: { score: 5, evidence: 'Unlimited devices with first-class Linux and router support.' },
      support: { score: 4, evidence: '24/7 support with a solid 11,004-review Trustpilot sample.' },
      encryption: { score: 4, evidence: 'No-logs policy proven in court on multiple occasions.' },
      audit: { score: 5, evidence: 'Fully open-source clients with independent audits and courtroom-tested no-logs claims.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'aligned',
      detail: (f) =>
        `Consistent across ${f.appCount} and ${f.tpCount}. Unusually for a ${f.ratio}:1 split, the smaller sample is not carrying a hidden billing story.`,
    },
    divergenceNote:
      'Consistent across both platforms. The open-source client and repeatedly court-tested no-logs record are the strongest verification story of any commercial VPN here.',
  },
  {
    slug: 'mullvad',
    name: 'Mullvad',
    parent: 'Mullvad VPN AB',
    categories: ['vpn'],
    products: ['Mullvad'],
    priceRef: { kind: 'vpn', name: 'Mullvad' },
    jurisdictionRef: { kind: 'vpn', name: 'Mullvad' },
    appStore: {
      appId: 1488466513,
      appName: 'Mullvad VPN',
      score: 4.14,
      reviewCount: 1459,
      url: APPLE(1488466513),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 3.5,
      reviewCount: 187,
      url: TP('mullvad.net'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 3, evidence: 'Deliberately spartan. The account-number model means no email and no password, which is excellent for privacy and unfamiliar for everyone.' },
      speed: { score: 4, evidence: 'WireGuard throughout with solid throughput from a smaller server fleet than its rivals.' },
      platforms: { score: 4, evidence: 'All major platforms with strong Linux support; no router firmware of its own.' },
      support: { score: 3, evidence: 'Email-only support. The anonymous account model means there is very little account state anyone can help you with.' },
      encryption: { score: 5, evidence: 'No account identifiers at all — a random account number, cash accepted by post, nothing to hand over.' },
      audit: { score: 5, evidence: 'Open source with recurring published independent audits.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'thin-sample',
      detail: (f) =>
        `Both samples are the smallest in the index at ${f.appCount} and ${f.tpCount}, so neither number is stable. A service that refuses to collect an email address has no way to invite anyone to review it.`,
    },
    divergenceNote:
      'The smallest samples in the index on both platforms (1,459 and 187), so both scores are noisy. A privacy tool that refuses to collect an email address also has no way to invite anyone to review it.',
  },
  {
    slug: 'microsoft-defender',
    name: 'Microsoft Defender',
    parent: 'Microsoft Corporation',
    categories: ['antivirus'],
    products: ['Microsoft Defender (built-in)'],
    priceRef: { kind: 'av', name: 'Microsoft Defender (built-in)' },
    jurisdictionRef: { kind: 'av', name: 'Microsoft Defender (built-in)' },
    appStore: {
      appId: 1526737990,
      appName: 'Microsoft Defender: Security',
      score: 4.68,
      reviewCount: 21364,
      url: APPLE(1526737990),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: null,
      reviewCount: null,
      url: TP('microsoft.com'),
      asOf: RATINGS_AS_OF,
      unavailableReason:
        'No product-level Trustpilot profile exists. The microsoft.com profile covers every Microsoft consumer product and says nothing specific about Defender, so quoting it here would be misleading.',
    },
    scores: {
      ui: { score: 4, evidence: 'Already installed and already on. Nothing to configure, and nothing to buy.' },
      speed: { score: 5, evidence: 'Deepest OS integration of anything in the index and the lowest measured background overhead.' },
      platforms: { score: 2, evidence: 'Windows-only for the real engine; macOS relies on the separate built-in XProtect and there is no household dashboard.' },
      support: { score: 3, evidence: 'General Microsoft support channels; no dedicated security-product support tier for consumers.' },
      encryption: { score: 3, evidence: 'Standard Microsoft cloud encryption. SmartScreen URL lookups and telemetry are subpoenable.' },
      audit: { score: 4, evidence: 'Scores consistently well in AV-TEST and AV-Comparatives testing; closed source.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'not-comparable',
      detail: () =>
        `No product-level Trustpilot profile exists, so there is no second number to compare. It is also the only entry here that cannot raise your price.`,
    },
    divergenceNote:
      'The one entry where no comparison is possible — and the only product here that cannot overcharge you at renewal, because it is free and already running.',
  },
  {
    slug: 'bitdefender',
    name: 'Bitdefender',
    parent: 'Bitdefender SRL',
    categories: ['antivirus'],
    products: ['Bitdefender Total Security'],
    priceRef: { kind: 'av', name: 'Bitdefender Total Security' },
    jurisdictionRef: { kind: 'av', name: 'Bitdefender Total Security' },
    appStore: {
      appId: 1255893012,
      appName: 'Bitdefender Mobile Security',
      score: 4.68,
      reviewCount: 37213,
      url: APPLE(1255893012),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.3,
      reviewCount: 12438,
      url: TP('bitdefender.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 4, evidence: 'Autopilot mode makes sensible decisions without asking; the console is dense but not pushy.' },
      speed: { score: 5, evidence: 'Consistently the lightest full antivirus suite in independent performance testing.' },
      platforms: { score: 5, evidence: 'Windows, macOS, iOS and Android with a shared household console.' },
      support: { score: 4, evidence: '24/7 support with a healthy 12,438-review Trustpilot sample at 4.3.' },
      encryption: { score: 3, evidence: 'Standard transport and at-rest encryption; the bundled VPN is a licensed third-party network.' },
      audit: { score: 5, evidence: 'Routinely the top scorer in AV-TEST and AV-Comparatives detection benchmarks.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'aligned',
      detail: (f) =>
        `Proportionally the ${f.fullnessOrdinal}-fullest Trustpilot sample here at ${f.ratio}:1, and both platforms agree. Neither of them prices in the ${f.renewalMult}x renewal.`,
    },
    divergenceNote:
      'Both platforms agree the product is strong. Watch the computed billing score below — year two costs more than double year one.',
  },
  {
    slug: 'totalav',
    name: 'TotalAV',
    parent: 'Total Security Limited',
    categories: ['antivirus'],
    products: ['TotalAV Internet Security'],
    priceRef: { kind: 'av', name: 'TotalAV Internet Security' },
    jurisdictionRef: { kind: 'av', name: 'TotalAV Internet Security' },
    appStore: {
      appId: 1130411958,
      appName: 'TotalAV',
      score: 4.58,
      reviewCount: 71955,
      url: APPLE(1130411958),
      asOf: RATINGS_AS_OF,
    },
    trustpilot: {
      score: 4.5,
      reviewCount: 139363,
      url: TP('totalav.com'),
      asOf: RATINGS_AS_OF,
    },
    scores: {
      ui: { score: 3, evidence: 'Friendly on the surface, but the interface leans heavily on scan-result prompts that lead to paid upgrades.' },
      speed: { score: 4, evidence: 'Reasonable overhead in normal use.' },
      platforms: { score: 4, evidence: 'Windows, macOS, iOS and Android coverage.' },
      support: { score: 4, evidence: 'Phone and chat support with an actively solicited review base.' },
      encryption: { score: 3, evidence: 'Standard transport and at-rest encryption.' },
      audit: { score: 3, evidence: 'Participates in independent lab testing but without the sustained top-tier record of Bitdefender or Norton.' },
      jurisdiction: { score: null, evidence: '' },
      billing: { score: null, evidence: '' },
    },
    gapAnatomy: {
      driver: 'solicited',
      detail: (f) =>
        `The only vendor here with more Trustpilot reviews (${f.tpCount}) than App Store ratings (${f.appCount}) — ${f.ratioInverse} of them for every rating. That inversion is what sustained review solicitation looks like, and it sits beside a ${f.renewalMult}x renewal multiplier.`,
    },
    divergenceNote:
      'The most instructive entry on the page. TotalAV carries 139,363 Trustpilot reviews — more than any other vendor here, and more than its own App Store count — at 4.5, while running one of the steepest renewal multipliers in the index. A high TrustScore is a measure of how well a company collects reviews, not of what it charges you in year two.',
  },
];

// ---------------------------------------------------------------------------
// Computed scores. These read from data.ts rather than being written by hand,
// so the pricing audit and the legal research stay the single source of truth.
// ---------------------------------------------------------------------------

type PriceRef = NonNullable<CompanyReview['priceRef']>;

/** Intro and renewal annual cost for a data.ts entry, or null if not found. */
export function resolvePricing(
  ref: PriceRef | null
): { intro: number; renew: number } | null {
  if (!ref) return null;

  if (ref.kind === 'pw') {
    const m = PW_MANAGERS.find((p) => p.name === ref.name);
    if (!m) return null;
    // Family pricing is the household-relevant figure this site optimises for.
    return { intro: m.price.familyIntro, renew: m.price.familyRenew };
  }
  if (ref.kind === 'suite') {
    const s = SUITES.find((p) => p.name === ref.name);
    if (!s) return null;
    return { intro: s.price.familyIntro, renew: s.price.familyRenew };
  }
  if (ref.kind === 'vpn') {
    const v = VPN_COMPARE.find((p) => p.name === ref.name);
    if (!v) return null;
    // `firstBill` is the lump sum for the whole intro term, which runs anywhere
    // from one month (Mullvad) to 28 months (ExpressVPN), while `renewYr` is a
    // single year. Dividing one by the other compares different lengths of time
    // and produces nonsense — it rated Mullvad, which charges a flat monthly
    // rate that never changes, as a 12x renewal jump. Annualise the advertised
    // intro rate instead, so both sides of the ratio cover twelve months. That
    // also matches what a subscriber actually experiences: this much per month
    // now, that much per year later.
    return { intro: v.introMo * 12, renew: v.renewYr };
  }
  const a = AV_COMPARE.find((p) => p.name === ref.name);
  if (!a) return null;
  return { intro: a.introYr, renew: a.renewYr };
}

/** How many times the intro price the renewal costs. null when unknown. */
export function renewalMultiplier(company: CompanyReview): number | null {
  const p = resolvePricing(company.priceRef);
  if (!p) return null;
  if (p.intro === 0 && p.renew === 0) return 1; // free, and free again next year
  if (p.intro <= 0) return null;
  return p.renew / p.intro;
}

/** Billing transparency, computed from the site's own audited pricing. */
export function billingScore(company: CompanyReview): AssessedScore {
  const mult = renewalMultiplier(company);
  const pricing = resolvePricing(company.priceRef);

  if (mult === null || !pricing) {
    return { score: null, evidence: 'No comparable annual pricing on record.' };
  }

  if (pricing.intro === 0 && pricing.renew === 0) {
    return { score: 5, evidence: 'Free, with no renewal to raise. Nothing to disclose and nothing to cancel.' };
  }

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const sku = company.priceRef ? `${company.priceRef.name} — ` : '';

  // VPN intro rates are advertised per month against a multi-year contract, so
  // the intro side is that rate annualised (see resolvePricing) while the
  // renewal is already quoted annually. Only the intro figure is derived.
  const introPer = company.priceRef?.kind === 'vpn' ? '/yr equivalent' : '/yr';

  // Intro terms here run from a single month to over three years, so "after
  // the intro term" lands on a different year for every vendor. Name the term
  // where it is recorded rather than letting the reader assume it is year two.
  const vpnTerm =
    company.priceRef?.kind === 'vpn'
      ? VPN_COMPARE.find((v) => v.name === company.priceRef!.name)?.term
      : undefined;
  const termNote = vpnTerm ? ` Intro term: ${vpnTerm}.` : '';

  const detail = `${sku}${fmt(pricing.intro)}${introPer} intro → ${fmt(pricing.renew)}/yr at renewal (${mult.toFixed(2)}×).`;

  let score: number;
  let verdict: string;
  if (mult <= 1.05) {
    score = 5;
    verdict = 'The quoted price is the price you keep paying.';
  } else if (mult <= 1.3) {
    score = 4;
    verdict = 'A mild increase, disclosed up front.';
  } else if (mult <= 1.8) {
    score = 3;
    verdict = 'A real increase that will surprise people who did not read the fine print.';
  } else if (mult <= 2.5) {
    score = 2;
    // Deliberately not "year two": a 2-year prepaid plan has already bought
    // year two at the intro rate.
    verdict = 'When the intro term ends, the price roughly doubles.';
  } else {
    score = 1;
    verdict = 'The advertised price bears little relation to what you will actually pay.';
  }

  return { score, evidence: `${detail}${termNote} ${verdict}` };
}

const ALLIANCE_SCORES: Record<JurisdictionInfo['allianceCategory'], number> = {
  Swiss: 5,
  'Non-14-Eyes': 4,
  '14-Eyes': 3,
  '9-Eyes': 2,
  '5-Eyes': 1,
};

export function resolveJurisdiction(
  ref: CompanyReview['jurisdictionRef']
): JurisdictionInfo | null {
  if (ref.kind === 'pw') return PW_MANAGERS.find((p) => p.name === ref.name)?.jurisdiction ?? null;
  if (ref.kind === 'suite') return SUITES.find((p) => p.name === ref.name)?.jurisdiction ?? null;
  if (ref.kind === 'vpn') return VPN_COMPARE.find((p) => p.name === ref.name)?.jurisdiction ?? null;
  return AV_COMPARE.find((p) => p.name === ref.name)?.jurisdiction ?? null;
}

/** Jurisdiction exposure, computed from the alliance research in data.ts. */
export function jurisdictionScore(company: CompanyReview): AssessedScore {
  const j = resolveJurisdiction(company.jurisdictionRef);
  if (!j) return { score: null, evidence: 'No jurisdiction on record.' };
  return {
    score: ALLIANCE_SCORES[j.allianceCategory],
    evidence: `${j.flag} ${j.country} — ${j.alliance}. ${j.subpoenaReach}`,
  };
}

/** Every score for a company, with the two computed ones filled in. */
export function resolveScores(company: CompanyReview): Record<ScoreKey, AssessedScore> {
  return {
    ...company.scores,
    jurisdiction: jurisdictionScore(company),
    billing: billingScore(company),
  };
}

/**
 * How far apart the two measured platforms are for a company.
 * null when one side has no comparable profile.
 */
export function ratingGap(company: CompanyReview): number | null {
  const a = company.appStore.score;
  const t = company.trustpilot.score;
  if (a === null || t === null) return null;
  return a - t;
}

/**
 * App Store ratings per Trustpilot review. The single most diagnostic number
 * on this page: a vendor that solicits reviews collects a Trustpilot sample
 * proportionally close to its app's (TotalAV sits below 1:1), while a vendor
 * that never asks collects only the aggrieved minority (Bitwarden is 89:1).
 */
export function reviewRatio(company: CompanyReview): number | null {
  const a = company.appStore.reviewCount;
  const t = company.trustpilot.reviewCount;
  if (a === null || t === null || t === 0) return null;
  return a / t;
}

const ORDINALS = [
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
  'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth',
  'sixteenth',
];

/** Companies with both scores, ordered by sample fullness (lowest ratio first). */
function rankedByFullness(): CompanyReview[] {
  return COMPANY_REVIEWS.filter((c) => reviewRatio(c) !== null).sort(
    (a, b) => reviewRatio(a)! - reviewRatio(b)!
  );
}

/** Companies with both scores, ordered by Trustpilot review count, largest first. */
function rankedByTrustpilotCount(): CompanyReview[] {
  return COMPANY_REVIEWS.filter((c) => c.trustpilot.reviewCount !== null).sort(
    (a, b) => b.trustpilot.reviewCount! - a.trustpilot.reviewCount!
  );
}

const nf = new Intl.NumberFormat('en-US');

/**
 * Live figures for a company's gap explanation. Ranks are derived rather than
 * asserted, so a claim like "the third-fullest sample" re-sorts itself when the
 * underlying counts change instead of silently becoming false.
 */
export function gapFacts(company: CompanyReview): GapFacts {
  const ratio = reviewRatio(company);
  const gap = ratingGap(company);
  const mult = renewalMultiplier(company);

  const fullnessIndex = rankedByFullness().findIndex((c) => c.slug === company.slug);
  const tpCountIndex = rankedByTrustpilotCount().findIndex((c) => c.slug === company.slug);

  return {
    appScore: company.appStore.score?.toFixed(2).replace(/0$/, '') ?? 'n/a',
    appCount: company.appStore.reviewCount !== null ? nf.format(company.appStore.reviewCount) : 'n/a',
    tpScore: company.trustpilot.score?.toFixed(1) ?? 'n/a',
    tpCount: company.trustpilot.reviewCount !== null ? nf.format(company.trustpilot.reviewCount) : 'n/a',
    gap: gap === null ? 'n/a' : `${gap > 0 ? '+' : ''}${gap.toFixed(2)}`,
    gapAbs: gap === null ? 'n/a' : Math.abs(gap).toFixed(2),
    ratio: ratio === null ? 'n/a' : ratio.toFixed(1).replace(/\.0$/, ''),
    ratioInverse:
      ratio === null || ratio === 0 ? 'n/a' : (1 / ratio).toFixed(1).replace(/\.0$/, ''),
    renewalMult: mult === null ? 'n/a' : mult.toFixed(2),
    fullnessOrdinal: fullnessIndex >= 0 ? ORDINALS[fullnessIndex] ?? `${fullnessIndex + 1}th` : 'n/a',
    tpCountOrdinal: tpCountIndex >= 0 ? ORDINALS[tpCountIndex] ?? `${tpCountIndex + 1}th` : 'n/a',
  };
}

/** The rendered gap explanation for a company. */
export function gapDetail(company: CompanyReview): string {
  return company.gapAnatomy.detail(gapFacts(company));
}

/** Companies ordered by how violently the two systems disagree. */
export function byDivergence(): CompanyReview[] {
  return [...COMPANY_REVIEWS]
    .filter((c) => ratingGap(c) !== null)
    .sort((a, b) => Math.abs(ratingGap(b)!) - Math.abs(ratingGap(a)!));
}

/** Mean of the assessed + computed scores that apply to a company. */
export function overallScore(company: CompanyReview): number | null {
  const vals = Object.values(resolveScores(company))
    .map((s) => s.score)
    .filter((s): s is number => s !== null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
