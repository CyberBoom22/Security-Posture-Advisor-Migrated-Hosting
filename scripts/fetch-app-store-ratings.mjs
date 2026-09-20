#!/usr/bin/env node
/**
 * Refreshes the App Store figures in src/reviews.ts from Apple's public
 * iTunes Lookup endpoint.
 *
 * Why a build-time script and not a fetch in the browser: index.html serves a
 * Content-Security-Policy with `connect-src 'self'`, so the page cannot call
 * Apple at all. It also should not want to — Apple throttles the reviews
 * endpoints per egress IP and answers a throttled request with an empty body,
 * so every visitor sharing a NAT would poison each other's ratings. Fetching
 * once here and committing the result keeps the page static, instant and
 * honest about when the number was read.
 *
 * Usage:
 *   node scripts/fetch-app-store-ratings.mjs          # report drift only
 *   node scripts/fetch-app-store-ratings.mjs --write  # rewrite src/reviews.ts
 *
 * Trustpilot is deliberately not automated here. It publishes no API covering
 * companies you do not own, so those figures stay hand-audited with an asOf
 * date, the same way this site already audits renewal pricing.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REVIEWS_PATH = resolve(HERE, '../src/reviews.ts');
const WRITE = process.argv.includes('--write');

/** Apple throttles hard per IP and returns an empty body when it does. */
async function lookup(appId, attempt = 0) {
  const url = `https://itunes.apple.com/lookup?id=${appId}&country=us`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'security-hub-ratings/1.0' } });
    const text = (await res.text()).trim();
    if (text) {
      const data = JSON.parse(text);
      if (data.resultCount > 0) return data.results[0];
    }
  } catch {
    // fall through to the retry below
  }
  if (attempt < 5) {
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    return lookup(appId, attempt + 1);
  }
  return null;
}

const source = await readFile(REVIEWS_PATH, 'utf8');

// Each appStore block in reviews.ts, captured so the numbers can be replaced
// in place without disturbing anything else in the file.
const BLOCK = /appId: (\d+),\s*\n(\s*)appName: ('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),\s*\n\s*score: ([\d.]+),\s*\n\s*reviewCount: (\d+),/g;

const blocks = [...source.matchAll(BLOCK)];
if (!blocks.length) {
  console.error('No App Store blocks found in src/reviews.ts — has the shape changed?');
  process.exit(1);
}

console.log(`Checking ${blocks.length} apps against Apple's lookup API...\n`);

let updated = source;
let drifted = 0;
let failed = 0;

for (const match of blocks) {
  const [full, appIdRaw, indent, appNameRaw, oldScore, oldCount] = match;
  const appId = Number(appIdRaw);
  const result = await lookup(appId);

  if (!result) {
    console.log(`  ?  ${appId} — no response after retries (Apple throttling); left unchanged`);
    failed++;
    continue;
  }

  const score = Number((result.averageUserRating ?? 0).toFixed(2));
  const count = result.userRatingCount ?? 0;
  const name = result.trackName;

  const scoreMoved = String(score) !== oldScore;
  const countMoved = String(count) !== oldCount;

  if (scoreMoved || countMoved) {
    drifted++;
    console.log(
      `  ~  ${name}\n     ${oldScore} (${Number(oldCount).toLocaleString()}) -> ${score} (${count.toLocaleString()})`
    );
    const replacement =
      `appId: ${appId},\n${indent}appName: ${appNameRaw},\n${indent}score: ${score},\n${indent}reviewCount: ${count},`;
    updated = updated.replace(full, replacement);
  } else {
    console.log(`  =  ${name} — unchanged at ${score} (${count.toLocaleString()})`);
  }

  await new Promise((r) => setTimeout(r, 1200)); // stay under Apple's throttle
}

const today = new Date().toISOString().slice(0, 10);

console.log(
  `\n${drifted} changed, ${blocks.length - drifted - failed} unchanged, ${failed} unreachable.`
);

if (!WRITE) {
  console.log('\nDry run. Re-run with --write to apply, then update RATINGS_AS_OF.');
  process.exit(0);
}

if (drifted) {
  updated = updated.replace(
    /export const RATINGS_AS_OF = '[\d-]+';/,
    `export const RATINGS_AS_OF = '${today}';`
  );
  await writeFile(REVIEWS_PATH, updated, 'utf8');
  console.log(`\nWrote src/reviews.ts and set RATINGS_AS_OF to ${today}.`);
  console.log('Re-audit the Trustpilot figures by hand before publishing — they are not fetched.');
} else {
  console.log('\nNothing to write.');
}
