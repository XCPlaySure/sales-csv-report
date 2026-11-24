# Tasks

## 1. Project setup

- [x] 1.1 Scaffold a Vite vanilla-JS project: `package.json` (`"type":"module"`, scripts `dev`, `build`, `preview`, `test`, `coverage`), `vite.config.js`, `index.html` entry, and a `src/` layout with `src/lib/` and `src/ui/`. Verify: `npm run dev` serves the page and `npm run build` succeeds.
- [x] 1.2 Configure `vitest.config.js`: jsdom environment, Istanbul coverage provider, include `src/**`, thresholds of 100 for lines, branches, functions, and statements. Verify: `npm run coverage` runs and fails while coverage is below 100%.
- [x] 1.3 Create browser adapters (`readFile`, `copyText`, `openTelegram`) as injectable functions so tests can stub `FileReader`, `navigator.clipboard`, and `window.open`. Verify: each adapter is imported by the UI layer and stubbed in a test.

## 2. App shell

- [x] 2.1 Build `index.html` with an upload prompt and hidden dashboard/summary containers. Verify: the dev server shows only the upload prompt before a file is chosen.
- [x] 2.2 Add the `CRITICAL_PCT`, `LOW_PCT`, and `BELOW_PCT` threshold constants in `src/lib/tiers.js`. Verify: changing a constant changes tier tags with no other edit and its tests still pass.

## 3. CSV ingestion

- [x] 3.1 Implement CSV parsing in `src/lib/parse.js` that handles quoted fields and embedded commas. Verify: parsing `sales.csv` yields 15 columns and 1,891 data rows (asserted by a unit test).
- [x] 3.2 Implement header auto-detection: normalize names (lowercase, strip `_` and spaces) and match a synonym list per field. Verify: `sales.csv` auto-maps region, outlet id, net sales, branch, date, and salesman.
- [x] 3.3 Build the mapping panel in `src/ui/mapping.js`: one control per field, prefilled with detected columns, a sample value per mapped field, and a Process button disabled until required fields resolve. Verify: with `sales.csv`, required fields resolve and Process enables in one click.
- [x] 3.4 Implement required-field validation (region, outlet id, net sales) with duplicate-mapping rejection and gross-minus-discount derivation. Verify: clearing the net-sales mapping and mapping gross + discount offers derived net sales and labels it derived.
- [x] 3.5 Implement optional-field degradation so an unmapped branch or date removes only dependent views and clauses. Verify: unmapping branch hides the branch breakdown and branch summary text without error.
- [x] 3.6 Implement row parsing and file-fault reporting: skip unparseable numeric rows, count them, show a fix-the-file message, and handle empty and all-invalid files. Verify: a file with one non-numeric net-sales value reports "1 row skipped" and processes the rest.

## 4. Analytics and dashboard

- [x] 4.1 Implement region aggregation in `src/lib/analyze.js`, grouping by the exact region string and computing share. Verify: `sales.csv` renders 10 region rows with `Jawa Barat` and `JAWA BARAT` separate.
- [x] 4.2 Implement branch aggregation and the branch breakdown when branch is mapped. Verify: `sales.csv` shows 13 branches.
- [x] 4.3 Rank outlets by absolute net sales, grouped by outlet id, listing up to five. Verify: `sales.csv` lists OUT1003, OUT1026, OUT1035, OUT1045, OUT1042 in ascending order.
- [x] 4.4 Tag each listed outlet with its severity tier versus region average and add the "none critical" note when applicable. Verify: all five `sales.csv` outlets are CRITICAL, each under 25% of region average.
- [x] 4.5 Implement limited-data and non-positive-total handling: single month, single region, all-equal outlets, negative total, zero total. Verify: a single-month slice omits month-over-month; a negative-total slice suppresses share and notes returns exceeded sales.
- [x] 4.6 Implement Indonesian currency formatting in `src/lib/format.js`. Verify: 1728036900 displays as `Rp 1.728.036.900`.

## 5. Manager summary

- [x] 5.1 Implement the guarded-clause builder in `src/lib/summary.js`, emitting each clause only when its condition holds. Verify: a two-month dataset includes a growth clause with the correct grew/fell word; a one-month dataset omits it.
- [x] 5.2 Add the leader, branch, weakest-outlet, refund, and missing-salesman clauses, each guarded. Verify: `sales.csv` names the top region, mentions branches, describes the five critical outlets, and notes the refund and 5 lines with no salesman.
- [x] 5.3 Ensure the summary reads from the same aggregate as the dashboard. Verify: total net sales in the summary equals the dashboard total.
- [x] 5.4 Implement Copy with a manual-select fallback when clipboard access is denied. Verify: Copy places the full paragraph on the clipboard, and denial triggers the fallback.
- [x] 5.5 Implement Send via Telegram with a `t.me/share` link and no credentials. Verify: activating it opens Telegram with the paragraph prefilled and the built page contains no token.

## 6. Test suite (100% coverage)

- [x] 6.1 Write unit tests for `parse.js`: quoted fields, embedded commas, CRLF, exact and synonym headers, unknown header, duplicate mapping, derived net sales, bad-row skip, and empty file.
- [x] 6.2 Write unit tests for `analyze.js` and `tiers.js`: raw region grouping, branch totals, weakest ranking, outlet-id grouping, tier boundaries at 25/50/100, negative and zero totals, and single month/region.
- [x] 6.3 Write unit tests for `summary.js`: every guard on and off, grew vs fell, leader only with multiple regions, branch clause, refund caveat, missing-salesman caveat, and the none-critical note.
- [x] 6.4 Write unit tests for `format.js`: Indonesian currency, including zero and negative values.
- [x] 6.5 Write jsdom tests for the UI layer and adapters: mapping panel behavior, file-read adapter, copy success and denial fallback, and Telegram share URL construction.
- [x] 6.6 Write a golden test that parses `sales.csv` and asserts gross `1.758.432.000`, net `1.728.036.900`, 824 invoices, 52 outlets, 10 region rows, and the five weakest outlets in order.
- [x] 6.7 Reach 100% lines, branches, functions, and statements. Verify: `npm run coverage` exits 0 with all thresholds met.

## 7. CI gate

- [x] 7.1 Add `.github/workflows/test.yml` triggered on push and pull request: setup Node, `npm ci`, `npm run coverage`. Verify: the workflow file is valid and `npm ci && npm run coverage` passes locally.

## 8. End-to-end verification

- [x] 8.1 Run `npm run build && npm run preview`, load `sales.csv`, and confirm headline figures: gross `Rp 1.758.432.000`, net `Rp 1.728.036.900`, 824 invoices, 52 outlets.
- [x] 8.2 Confirm no network request occurs during upload, processing, and summary generation. Verify: the browser network panel stays empty until the user shares to Telegram.
