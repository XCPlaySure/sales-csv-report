# Sales CSV Report

A small, browser-only tool that turns a sales CSV into a clear performance
dashboard and a one-paragraph summary you can copy or send through Telegram.
Files are read locally in the browser, so the app needs no server, upload
endpoint, account, or API key.

The app is built for real-world exports: column names vary, regions appear with
different casing, refunds show up as negative lines, and some rows have no
salesman. It adapts to those cases instead of rejecting the file.

## Main features

### CSV input

- Reads the selected file entirely in the browser with `FileReader`; contents
  never leave the machine.
- The parser handles quoted fields with embedded commas, escaped quotes,
  newlines inside quotes, CRLF and lone-CR line endings, a byte-order mark, and
  blank lines.
- Detects columns from the header row by normalized name (case, spaces, and
  underscores ignored) plus synonyms. For example, `wilayah` maps to region and
  `omzet` maps to net sales.
- Shows a **Confirm columns** panel before processing: every field, its guessed
  column, and a sample value. Required fields are `region`, `outlet_id`, and
  `net_sales`. If net sales is absent but gross sales and discount are present,
  the app offers `gross - discount`.
- Treats branch, date, invoice number, outlet name/type, salesman, brand, SKU,
  carton quantity, carton price, gross sales, and discount as optional. Missing
  optional fields simply hide the views that need them.
- Skips rows with a blank region/outlet ID or an invalid required numeric value,
  and reports them as a file issue with guidance to fix and re-upload. Invalid
  optional numeric values are omitted from that field with a warning, while the
  row's net sales stay in the totals.
- Numeric cells must use plain decimal notation with an optional sign, such as
  `940500`, `-528000`, or `1234.50`. Formatted values such as `1.728.036.900`
  and `1.728.036,90`, plus exponents and hexadecimal notation, are not accepted
  as input. Indonesian formatting applies to output only.

### Analysis

- Aggregates net sales, gross sales, discounts, invoice count, outlets, and
  branches.
- Groups regions by the exact text in the file. `Jawa Barat` and `JAWA BARAT`
  stay separate; region cleanup remains with the data owner. An outlet ID seen
  under multiple region labels is tracked once per region so tier calculations
  use the correct average.
- Computes each region's share of total net sales; suppresses share when the
  total is zero or negative.
- Validates complete dates and computes month-over-month growth only for
  consecutive months with a positive earlier-month baseline. Otherwise the
  comparison is omitted and the dashboard notes why.
- Ranks the **five lowest-selling outlets** by absolute net sales, grouped by
  outlet ID and region.
- Tags outlets by net sales relative to their region's average:

| Tier | Share of region average |
|------|-------------------------|
| CRITICAL | below 25% |
| LOW | 25% to below 50% |
| BELOW | 50% to below 100% |
| OK | 100% or above |

- Adds explanatory notes for single month, single region, near-equal outlets,
  negative or zero totals, refund lines, missing salesman lines, blank invoice
  numbers, non-consecutive months, and outlet IDs spanning regions.
- Formats money Indonesian-style (`Rp 1.728.036.900`) and percentages with one
  decimal and a comma (`72,7%`).

### Report and summary

- Moves through three clear steps: upload, confirm columns, results. Only the
  current step is shown.
- Dashboard sections: headline, net sales by region, net sales by branch when
  mapped, and lowest-selling outlets.
- Report tables have a numbered `#` column and odd/even row striping. The tier
  legend sits below the weakest-outlet table as smaller supporting text for the
  Tier column.
- Builds the summary from guarded clauses, so every comparison or ranking is
  backed by the data. A basis line states rows, invoices, outlets, regions, and
  skipped rows, all read from the same aggregate as the dashboard.
- **Copy summary** writes the full paragraph to the clipboard, with a selection
  fallback when the browser blocks clipboard access.

### Sharing

- **Send via Telegram** opens `https://t.me/share/url?url=<page>&text=<summary>`.
  You choose the recipient; no bot token or chat ID exists in the page.
- Telegram sign-in is required; if you are not signed in, use Copy summary
  instead.
- The shared `url` is the current page address, so sharing is most useful when
  the app is hosted at a reachable address rather than opened from a local
  file.

### Quality gates

- 117 tests across 10 files, with 100% line, branch, function, and statement
  coverage enforced by Istanbul.
- A golden test runs the full pipeline against the bundled `sales.csv`
  (1,891 rows, 15 columns) and checks known figures: net `Rp 1.728.036.900`,
  824 invoices, 61 outlet-region pairs, and 10 raw region strings.
- GitHub Actions runs `npm ci && npm run coverage` on every push and pull
  request.

## Working with reports

The app focuses on one report at a time. To try another file or revisit the
column mapping, reload the page and start again from the upload step.

## Install and run

Prerequisites: Node.js 24 or newer and npm (developed with Node 24.19.0 and npm
12.0.2). No environment variables or credentials are needed.

```bash
npm ci          # install exact locked dependencies
npm run dev     # start the Vite dev server
```

Open the URL Vite prints (usually `http://localhost:5173`), choose `sales.csv`
or another sales CSV, confirm the column mapping, then click **Process CSV**.

Other commands:

```bash
npm test              # run the Vitest suite once
npm run coverage      # run tests with 100% coverage thresholds
npm run build         # produce the static site in dist/
npm run preview       # preview the production build locally
```

## Directory structure

```
sales-csv-report/
+-- .github/workflows/test.yml   CI: checkout, Node 24, npm ci, coverage
+-- .gitignore                   ignores node_modules/, dist/, coverage/
+-- README.md                    this guide
+-- index.html                   single page: upload, mapping, dashboard, summary
+-- package.json                 scripts and devDependencies
+-- package-lock.json            exact dependency lockfile
+-- vite.config.js               Vite root '.' and build outDir 'dist'
+-- vitest.config.js             jsdom environment, Istanbul, 100% thresholds
+-- sales.csv                    bundled sample dataset (1,891 rows)
+-- src/
|   +-- entry.js                 browser entry point; bootstraps with document/window
|   +-- main.js                  wires initApp with browser adapters
|   +-- app.js                   stage flow, DOM wiring, event handlers
|   +-- style.css                layout, tables, striping, tier legend
|   +-- lib/
|   |   +-- parse.js             CSV parser, header synonyms, mapping validation, row parsing
|   |   +-- analyze.js           aggregation, months/growth, weakest outlets, flags
|   |   +-- summary.js           guarded-clause summary and basis line
|   |   +-- tiers.js             severity thresholds and tierFor()
|   |   +-- format.js            Indonesian IDR and percentage formatting
|   +-- ui/
|       +-- views.js             HTML for the mapping panel and dashboard
|       +-- adapters.js          FileReader, clipboard, selection, Telegram URL, window.open
+-- test/
|   +-- fixtures.js              shared in-memory datasets
|   +-- *.test.js                unit, DOM, and golden tests
+-- openspec/
|   +-- config.yaml              spec-driven schema
|   +-- specs/                   durable capability specs
|   +-- changes/                 active and archived changes
```

Data flow:

```
sales.csv
   |
   v
parseCsv --> headers + rows
   |
   v
detectMapping --> Confirm columns panel --> validateMapping
   |
   v
parseRows --> records + skipped
   |
   v
analyze --> aggregate (totals, regions, branches, outlets, flags)
   |
   +--> dashboardHtml --> region / branch / weakest tables + legend
   |
   +--> buildSummary + summaryBasis --> summary text + basis line
                |
                +--> Copy summary
                +--> Send via Telegram
```

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | Vanilla JavaScript ES modules | No framework or runtime dependency |
| Markup / style | HTML + CSS | Single `index.html`, one `style.css` |
| Dev server / build | Vite 6.4.6 | Static output in `dist/` |
| Test runner | Vitest 3.2.7 | jsdom 26.1.0 for DOM tests |
| Coverage | @vitest/coverage-istanbul 3.2.7 | 100% thresholds on all four metrics |
| CI | GitHub Actions | Node 24, `npm ci`, `npm run coverage` |
| Spec workflow | OpenSpec, spec-driven schema | 7 durable capability specs |

The production app is plain static HTML, CSS, and JavaScript. Vite and Vitest
are development tooling only. There is no backend, no database, no runtime
dependency, and no Telegram credential in the project.
