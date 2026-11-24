# Design

## Context

See `proposal.md` - Why. The project is greenfield: no code, no specs, one sample file (`sales.csv`, 1,891 line items, 15 columns, two months, dirty region casing and a few blank fields). The app must run with no backend.

Two constraints shape everything:

- The Telegram Bot API sends no CORS headers, so a browser cannot call it directly. A bot token placed in the page would be exposed.
- "Sales by region" requires binding CSV columns to semantic roles; the file cannot be assumed to match `sales.csv` forever.

## Goals / Non-Goals

**Goals:**

- A static app built from ES modules in Vanilla JavaScript (no runtime dependencies) with a Vite dev/build toolchain, running entirely in the browser.
- Full automated test coverage of app JavaScript (100% lines, branches, functions, statements) enforced as a CI gate.
- Flexible ingestion: read any CSV's header row, auto-detect columns, and let the user confirm a mapping before processing.
- Correct, honest reporting: numbers agree between dashboard and summary, and the summary never claims what the data does not support.
- Graceful behavior on dirty and limited data without crashing or blaming the app.

**Non-Goals:**

- No region normalization or data cleaning (user's responsibility; see Decisions).
- No server, database, authentication, or persistence between reloads.
- No LLM or network call for the summary.
- No bot-token-based Telegram posting.
- No automated browser E2E suite; coverage targets JavaScript, not HTML markup or CSS.

## Decisions

### Decision: Static browser-only app with ES modules and a Vite toolchain

Vanilla JavaScript split into ES modules, built and served by Vite, with copy-to-clipboard and a prefilled Telegram share link. The build output is plain static files; there is still no backend.

- Module layout: `src/lib/*` holds pure, DOM-free logic (parsing, analysis, tiers, summary, formatting); `src/ui/*` holds the thin DOM layer; browser APIs (file reading, clipboard, Telegram open) sit behind small injectable adapters so they can be stubbed in tests.
- Alternatives: single backend (rejected - adds a process to run and deploy for a read-only report); static page + thin proxy (rejected - two pieces, and the only server-side need was Telegram, which the share link removes); a single inline-script file (rejected - cannot be imported or instrumented, so it blocks unit tests and coverage).

### Decision: Flexible schema binding with confirmation

Read the header row, auto-detect each known field by normalized name and a synonym list, and show a mapping panel with sample values. Processing starts only after confirmation.

- Required fields: region, outlet id, and a net-sales source. Optional: branch, date, qty, discount, outlet name, salesman, brand, outlet type, sku, price, gross.
- Net sales may be derived as gross minus discount when no net-sales column exists; the panel states that it is derived.
- Alternatives: fixed expected headers (rejected - rejects valid files with different names); positional columns (rejected - fragile).

### Decision: Minimal CSV parser, not naive split

A small parser that handles quoted fields and embedded commas, because the flexible approach means other files may quote fields. `sales.csv` itself has no quotes, so the parser is still small.

### Decision: No region normalization

Group by the exact region string in the file.

- Consequence accepted: `Jawa Barat`, `JAWA BARAT`, and `Jabar` are three regions, so `sales.csv` renders 10 region rows until cleaned. This is intended, not a bug.
- Outlet identity is keyed by outlet id, so outlet-level results are unaffected. When one outlet id carries conflicting region strings, the first occurrence supplies its region label.

### Decision: Rank weakest by absolute net, tag by region-relative tier

Show the up-to-five lowest-net outlets, each tagged CRITICAL (<25% of region average), LOW (25-50%), BELOW (50-100%), or OK (>=100%). Thresholds are named constants at the top of the script.

- Why absolute ranking: matches the plain meaning "lowest-selling outlets" and is transparent.
- Why the tier: absolute ranking alone cannot tell a dormant outlet from a naturally small one; the tier adds that context. In `sales.csv` the absolute and region-relative bottom five coincide, so the tag adds context without changing the set.
- Alternatives: rank by ratio-to-region (rejected as the primary sort - less intuitive to a manager); peer group by outlet type (deferred - more correct but more code; noted as a future refinement).

### Decision: Guarded-clause template for the summary

The paragraph is assembled from clauses; each clause is emitted only when its condition holds (two or more months for growth, multiple regions for a leader, mapped branch for branch detail, negative lines for a refund caveat, blank salesman for an attribution caveat). No subjective judgments ("within normal range") are emitted.

- Alternatives: a single static sentence with filled slots (rejected - can assert false comparisons); an LLM (rejected - needs a key in the browser, costs, and varies run to run).

### Decision: Single source of truth

One aggregate result object feeds both the dashboard and the summary. The summary never recomputes a figure independently.

### Decision: Indonesian number format

`Rp 1.728.036.900` - `Rp` prefix, dot thousands, comma decimal.

### Decision: Delivery without credentials

Copy writes the paragraph to the clipboard. Send via Telegram opens `https://t.me/share/url?text=...` with the text prefilled; the user picks the chat. No token or chat id in the page.

### Decision: Testing and 100% coverage

The app's JavaScript is tested with Vitest in a jsdom environment, and coverage is measured with the Istanbul provider over `src/**` with thresholds of 100% lines, branches, functions, and statements. Tests cover pure logic exhaustively and exercise UI handlers and failure paths (clipboard denied, invalid file, unreadable date) through the injectable adapters.

- Alternatives: `node:test` + jsdom (rejected - no built-in coverage thresholds, more manual wiring); Playwright (deferred - heavy, and pure logic is where defects live).

### Decision: CI gate

`.github/workflows/test.yml` runs on push and pull request: install dependencies, then `npm run coverage`. Coverage below 100% fails the build. A golden test parses the real `sales.csv` and asserts headline totals and the weakest-outlet list, so a regression in parsing, aggregation, or ranking fails CI.

- Alternatives: run tests only locally (rejected - no merge gate).

## Risks / Trade-offs

- [Dirty region casing splits regions] -> Intended; stated in the UI as the file's responsibility to clean.
- [Conflicting region per outlet id] -> Use first occurrence for the label; outlet totals still keyed by id.
- [Auto-detection guesses wrong] -> Confirmation panel with sample values lets the user correct before processing.
- [Clipboard permission denied] -> Fall back to selecting the summary text so the user can copy manually.
- [Telegram share behavior differs on desktop/mobile] -> Share link opens the Telegram app or web; the copy button covers cases where it does not.
- [Large files] -> In-browser parse is fine for tens of thousands of rows; no target beyond that.
- [Outlier outlet type] -> A Warung compared against a region average dominated by Grosirs can be mislabeled; documented, tunable later via peer-group tiers.
- [100% coverage is not correctness] -> Coverage is a floor, not a proof; the golden test on real data adds behavioral confidence.
- [ES modules require serving] -> Vite dev server locally and static hosting (e.g., GitHub Pages) in production; opening via `file://` is not supported.
