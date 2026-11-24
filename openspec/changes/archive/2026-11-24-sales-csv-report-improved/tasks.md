# Tasks

## 1. Stage-based UI (progressive disclosure)

- [x] 1.1 Add stage state (upload/mapping/results) and hide the upload prompt once a valid CSV is chosen. Verify: after upload, only the mapping panel is visible.
- [x] 1.2 Hide the mapping panel when results are rendered; keep upload prompt hidden. Verify: after Process, only the dashboard and summary are visible at the top of the page.
- [x] 1.3 Confirm no results appear behind any other panel (nothing below that requires scrolling to discover).

## 2. Severity tier legend

- [x] 2.1 Import the tier constants (`CRITICAL_PCT`, `LOW_PCT`, `BELOW_PCT`) into the views module.
- [x] 2.2 Render a legend under the weakest-outlet view explaining CRITICAL / LOW / BELOW / OK as shares of region average. Verify: legend text matches the thresholds.
- [x] 2.3 Omit the legend when there are no outlets to rank. Verify: empty case shows no tier legend.

## 3. Telegram share link

- [x] 3.1 Change `telegramUrl` to accept `url` and `text`, producing `https://t.me/share/url?url=<page>&text=<summary>`. Verify: produced link contains both parameters.
- [x] 3.2 Wire the Send via Telegram button to use the current page URL as `url`. Verify: clicking opens Telegram with the summary prefilled and no token exposed.

## 4. Summary basis line

- [x] 4.1 Add a `summaryBasis` helper that reports row/invoice/outlet/region counts plus skipped-row count from the aggregate. Verify: counts match the dashboard.
- [x] 4.2 Render the basis note under the summary paragraph; omit it when there are no data rows. Verify: basis text present with figures; absent on empty input.

## 5. Coverage and CI

- [x] 5.1 Add tests for stage visibility, tier legend, Telegram URL, and summary basis. Verify: all new tests pass.
- [x] 5.2 Reach 100% lines/branches/functions/statements. Verify: `npm run coverage` exits 0.
- [x] 5.3 Confirm CI gate (`npm ci && npm run coverage`) passes. Verify: workflow file valid locally.