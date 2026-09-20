## Scheduled pricing audit

Two different things happen in this pull request, and they carry different weight.

**Applied automatically.** App Store ratings, refreshed from Apple's public
lookup API. Apple publishes these through a real endpoint, so the figures are
authoritative and `src/reviews.ts` is updated in place.

**Flagged only, not applied.** Pricing. The checker reports which figures in
`src/data.ts` no longer appear on the vendor's own page. It does not read a
replacement price off the page, because vendor pricing varies by geography and
A/B bucket, some pages render prices only in JavaScript, and several vendors
answer an automated request with an error while serving a browser normally.

### What to do

1. Download the `pricing-audit` artifact attached to this run, or read the job
   log, for the list of figures that no longer match.
2. Open each flagged vendor's page yourself and read the current numbers.
3. Update `src/data.ts`, keeping the row internally consistent: `introMo` times
   the months implied by `term` should equal `firstBill`.
4. Record each confirmed change in `src/changelog.ts` under `PRICE_CHANGES`,
   with its source and, if a sale was running, the promotion.
5. Anything worth explaining goes in `FINDINGS` in the same file.

Where the arithmetic is unambiguous the report proposes a replacement, but it is
a proposal — confirm it against the vendor before taking it.

If the report is empty this pull request should not exist; close it.
