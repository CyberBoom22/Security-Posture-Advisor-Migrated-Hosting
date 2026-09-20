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
4. Record the sale price and, crucially, the renewal price in
   `src/promotions.ts`. The renewal figure is the one a sale does not change
   and the reason the Sales tab exists.
5. Update `src/promotions.ts` for anything on sale:
   - A discount seen for the first time is added with `confirmations: 1`.
   - One already listed and still running has `lastSeen` set to today and
     `confirmations` incremented.
   - One that has disappeared is removed.

   A sale is announced on the public Sales tab only once `confirmations`
   reaches `REQUIRED_SCANS` (3). With the scan running on the 24th, 26th and
   28th, a genuine sale clears that in four days, and a flash promotion never
   does. Do not raise the number to publish something sooner — that is the
   whole point of the threshold.

Where the arithmetic is unambiguous the report proposes a replacement, but it is
a proposal — confirm it against the vendor before taking it.

If the report is empty this pull request should not exist; close it.
