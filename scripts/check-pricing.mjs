#!/usr/bin/env node
/**
 * Checks the recorded VPN and antivirus pricing against each vendor's live
 * pricing page and reports what no longer matches.
 *
 * It deliberately does NOT scrape a price and overwrite the data file. Vendor
 * pricing pages vary by geography and A/B bucket, some render prices only in
 * JavaScript (Proton serves "$0.00" placeholders to a plain fetch), and a
 * markup change can silently turn a confident scrape into a confident lie.
 * On a site whose masthead promises audited pricing, publishing an unverified
 * number is worse than publishing a stale one.
 *
 * So it asks a narrower question that is robust to all of that:
 *
 *     do the prices we have on record still appear on the vendor's page?
 *
 * A recorded price that has vanished is the signal worth acting on. That is
 * exactly how the stale Surfshark row was caught by hand: $53.73 was on record
 * and appeared nowhere on surfshark.com/pricing, which had moved to $67.23.
 *
 * Where the arithmetic is unambiguous the report proposes a replacement:
 * if some candidate price P on the page satisfies introMo x termMonths == P,
 * that is almost certainly the new first bill. Everything else is left for a
 * human to confirm.
 *
 * Promotions are recorded too, because a price that moved because of a sale
 * is a different fact from a list-price change, and the Dispatch page says so.
 *
 * Usage:
 *   node scripts/check-pricing.mjs              # human-readable report
 *   node scripts/check-pricing.mjs --json       # machine-readable
 *   node scripts/check-pricing.mjs --out FILE   # also write JSON to FILE
 *
 * Exit codes: 0 = nothing changed, 10 = changes found, 1 = error.
 * The workflow keys off 10 so a quiet month opens no pull request.
 */

import { writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
import { VPN_COMPARE, AV_COMPARE, termMonths } from '../src/data.ts';

const JSON_ONLY = process.argv.includes('--json');
const outIdx = process.argv.indexOf('--out');
const OUT_FILE = outIdx !== -1 ? process.argv[outIdx + 1] : null;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/**
 * Vendors whose pricing page renders prices only in JavaScript. A plain fetch
 * sees placeholders, so a "missing" price here would be meaningless noise.
 * They are reported as needing a manual look rather than silently skipped.
 */
const MANUAL_REVIEW = new Map([
  ['Proton VPN Plus', 'Pricing page renders prices in JavaScript; a plain fetch reads only "$0.00" placeholders.'],
  ['Proton Unlimited / Family', 'Pricing page renders prices in JavaScript; a plain fetch reads only "$0.00" placeholders.'],
  ['Mullvad', 'Priced in EUR (a flat EUR 5/month). The figures on record are USD conversions, so matching dollar amounts against the page is meaningless.'],
]);

/** Words that mean the price on the page is promotional rather than list. */
const PROMO_PATTERNS = [
  /\b(black friday|cyber monday|fall sale|spring sale|summer sale|winter sale|new year)\b/i,
  /\bsave\s+[1-9]\d?%/i,
  /\b[1-9]\d?%\s*off\b/i,
  /\bsale price\b/i,
  /\blimited[- ]time\b/i,
  /\bdeal of the\b/i,
];

/**
 * Fetched with curl rather than Node's fetch. NordVPN and McAfee answer a
 * Node fetch with HTTP 403 and curl with HTTP 200 for the identical URL and
 * User-Agent: the block keys off the TLS fingerprint, not the headers. curl
 * ships on GitHub's ubuntu runners, so this needs no dependency.
 */
async function fetchPage(url, attempt = 0) {
  try {
    const { stdout } = await run(
      'curl',
      ['-sS', '-L', '--compressed', '--max-time', '25', '-A', UA,
       '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       '-H', 'Accept-Language: en-US,en;q=0.9',
       url],
      { maxBuffer: 32 * 1024 * 1024 }
    );
    if (stdout && stdout.length > 500) return stdout;
  } catch {
    // fall through to retry
  }
  if (attempt < 3) {
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    return fetchPage(url, attempt + 1);
  }
  return null;
}

/** Every "$12.34" style amount on the page, de-duplicated. */
function candidatePrices(html) {
  const found = new Set();
  for (const m of html.matchAll(/\$\s?(\d{1,4}(?:\.\d{2})?)/g)) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) found.add(n);
  }
  return [...found].sort((a, b) => a - b);
}

/** Promotion signals, with a little surrounding text for the changelog. */
function detectPromo(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const hits = [];
  for (const re of PROMO_PATTERNS) {
    const m = text.match(re);
    if (m) hits.push(m[0].trim());
  }
  // "old price $444.15 sale price $67.23" is how Surfshark marks a discount.
  const struck = text.match(/old price\s*\$?\s?(\d+(?:\.\d{2})?)/i);
  return hits.length || struck
    ? {
        signals: [...new Set(hits)],
        listPriceShown: struck ? Number(struck[1]) : null,
      }
    : null;
}

/** Is `value` present on the page, allowing for a cent of rounding? */
function present(prices, value) {
  return prices.some((p) => Math.abs(p - value) < 0.011);
}

function checkVendor(entry, html, fields) {
  const prices = candidatePrices(html);
  const promo = detectPromo(html);
  const missing = [];

  // Some vendors print only the total and compute the per-month figure in
  // JavaScript (PIA shows "$69.81" in the HTML but renders "$1.79/mo" client
  // side). Where the total is on the page and introMo x months reproduces it,
  // the monthly rate is confirmed by arithmetic and should not be reported
  // missing just because the literal string is absent.
  const months = entry.term !== undefined ? termMonths(entry.term) : null;
  const impliedTotal =
    months && entry.introMo ? Number((entry.introMo * months).toFixed(2)) : null;
  const introConfirmedByTotal =
    impliedTotal !== null &&
    present(prices, impliedTotal) &&
    Math.abs(impliedTotal - entry.firstBill) < 0.011;

  for (const [field, value] of Object.entries(fields)) {
    if (value === 0 || value === null || value === undefined) continue;
    if (field === 'introMo' && introConfirmedByTotal) continue;
    if (field === 'firstBill' && introConfirmedByTotal) continue;
    if (!present(prices, value)) missing.push({ field, recorded: value });
  }

  // Where the term is known, a candidate that satisfies
  // introMo x months is almost certainly the new first bill.
  let proposal = null;
  if (impliedTotal !== null && present(prices, impliedTotal) && Math.abs(impliedTotal - entry.firstBill) >= 0.011) {
    proposal = {
      field: 'firstBill',
      from: entry.firstBill,
      to: impliedTotal,
      reason: `introMo ${entry.introMo} x ${months} months = ${impliedTotal}, which appears on the page; the recorded first bill does not.`,
    };
  }

  return { missing, proposal, promo, candidateCount: prices.length, prices };
}

const targets = [
  ...VPN_COMPARE.map((v) => ({
    entry: v,
    kind: 'vpn',
    fields: { introMo: v.introMo, firstBill: v.firstBill, renewYr: v.renewYr, monthlyMo: v.monthlyMo },
  })),
  ...AV_COMPARE.filter((a) => a.introYr > 0).map((a) => ({
    entry: a,
    kind: 'av',
    fields: { introYr: a.introYr, renewYr: a.renewYr },
  })),
];

const report = {
  checkedAt: new Date().toISOString().slice(0, 10),
  vendors: [],
  changed: false,
};

for (const t of targets) {
  const { entry, kind, fields } = t;

  if (MANUAL_REVIEW.has(entry.name)) {
    report.vendors.push({
      name: entry.name, kind, url: entry.url,
      status: 'manual', reason: MANUAL_REVIEW.get(entry.name),
    });
    continue;
  }

  const html = await fetchPage(entry.url);
  if (!html) {
    report.vendors.push({
      name: entry.name, kind, url: entry.url,
      status: 'unreachable', reason: 'No response after retries.',
    });
    continue;
  }

  const r = checkVendor(entry, html, fields);
  const status = r.missing.length ? 'changed' : 'ok';
  if (status === 'changed') report.changed = true;

  report.vendors.push({
    name: entry.name, kind, url: entry.url, status,
    missing: r.missing, proposal: r.proposal, promo: r.promo,
    candidateCount: r.candidateCount,
  });

  await new Promise((rs) => setTimeout(rs, 800)); // be a polite client
}

if (OUT_FILE) await writeFile(OUT_FILE, JSON.stringify(report, null, 2), 'utf8');

if (JSON_ONLY) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const money = (n) => `$${Number(n).toFixed(2)}`;
  console.log(`Pricing audit — ${report.checkedAt}\n`);
  for (const v of report.vendors) {
    const mark = { ok: '  ok  ', changed: ' CHECK', manual: 'manual', unreachable: '  ??  ' }[v.status];
    console.log(`[${mark}] ${v.name}`);
    if (v.status === 'manual' || v.status === 'unreachable') {
      console.log(`          ${v.reason}`);
    }
    for (const m of v.missing ?? []) {
      console.log(`          ${m.field} on record is ${money(m.recorded)}, which is no longer on the page`);
    }
    if (v.proposal) {
      console.log(`          proposed: ${v.proposal.field} ${money(v.proposal.from)} -> ${money(v.proposal.to)}`);
      console.log(`          because:  ${v.proposal.reason}`);
    }
    if (v.promo?.signals?.length) {
      const list = v.promo.listPriceShown ? `, list price shown as ${money(v.promo.listPriceShown)}` : '';
      console.log(`          promotion: ${v.promo.signals.join(', ')}${list}`);
    }
    if (v.status === 'changed') console.log(`          ${v.url}`);
  }
  console.log(
    `\n${report.vendors.filter((v) => v.status === 'changed').length} need a look, ` +
    `${report.vendors.filter((v) => v.status === 'ok').length} unchanged, ` +
    `${report.vendors.filter((v) => v.status !== 'ok' && v.status !== 'changed').length} could not be checked.`
  );
  if (!report.changed) console.log('\nNothing moved. No pull request, no changelog entry.');
}

process.exit(report.changed ? 10 : 0);
