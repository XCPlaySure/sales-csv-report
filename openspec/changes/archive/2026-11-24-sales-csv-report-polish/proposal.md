# Proposal

## Why

A final round of user testing found four presentation issues: the tier legend
sits above the weakest-outlet table where it reads as a heading rather than a
note on the Tier column, the Telegram button gives no guidance to users who are
not signed in (Telegram's own login wall appears), the summary heading uses
stale wording, and the report tables lack row numbering and row striping that
would make rows easier to distinguish. Fix these without changing the report
logic.

## What Changes

- Move the tier legend below the weakest-outlet table, render it in smaller
  muted text, and word it as additional information for the Tier column.
- Add a short helper note beside the Telegram button explaining that sign-in is
  required and that Copy summary is the alternative. No share-link logic change.
- Rename the summary heading from "Summary for your sales manager" to
  "Summary report".
- Add a numbered `#` column and odd/even row striping to the three report
  tables (region, branch, weakest outlets). The mapping panel is unchanged.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `tier-legend`: move the legend below the table and present it as smaller
  supplementary text for the Tier column.
- `telegram-share`: add a helper note about Telegram sign-in and the copy
  fallback.
- `ui-flow`: add row numbering and odd/even striping to the region, branch, and
  weakest-outlet tables.
- `summary-basis`: update the summary section heading wording.

## Impact

- UI-only changes to `index.html`, `src/ui/views.js`, and `src/style.css`.
- Tests in `test/views.test.js` updated for legend placement and numbered rows;
  100% coverage and CI gate must remain green.
- No changes to parsing, aggregation, or summary generation logic.