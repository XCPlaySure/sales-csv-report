# Proposal

## Why

The first version of the sales report app works, but real user testing surfaced
four UX problems: results appear far down the page behind the still-visible
mapping panel, the severity tier labels (CRITICAL/LOW/BELOW/OK) carry no
explanation, the Telegram button lands on telegram.org home instead of a
prefilled share screen, and the summary paragraph gives no statement of what
it is based on, so a reader cannot gauge its coverage. This change fixes those
four without touching the core reporting logic.

## What Changes

- **Progressive disclosure.** Only the current stage of the app is visible:
  upload prompt, then column mapping, then results. The upload prompt is hidden
  once a file is chosen, and the mapping panel is hidden once results are
  rendered, so results appear at the top of the page with nothing to scroll
  past.
- **Severity tier legend.** The weakest-outlet view shows a legend that states
  what each tier means as a share of the outlet's region average: CRITICAL
  below 25%, LOW 25% to below 50%, BELOW 50% to below 100%, OK 100% or more.
- **Telegram share link.** The Send via Telegram button now builds
  `https://t.me/share/url?url=<page>&text=<summary>`, which opens Telegram with
  the summary prefilled for the user to choose a recipient, and prompts a
  login if they are not signed in. No bot token or chat id is used.
- **Summary basis line.** A short line under the summary states what the
  paragraph is based on (number of rows, invoices, outlets, regions) and notes
  any rows that were skipped, so the reader can judge the summary's coverage.

## Capabilities

### New Capabilities
- `ui-flow`: controls which stage of the app is visible (upload, mapping, or
  results), so the user only interacts with the current step.
- `tier-legend`: explains the severity tier labels used in the weakest-outlet
  view.
- `telegram-share`: builds the Telegram share link and its expected behavior
  (prefilled text, recipient choice, login prompt).
- `summary-basis`: states the data provenance under the summary paragraph.

### Modified Capabilities
- None. This is a new change with new capability specs; no existing main spec
  is being modified.

## Impact

- UI-only changes to `index.html`, `src/ui/views.js`, and `src/app.js`. No
  changes to parsing, aggregation, or summary logic.
- The Telegram share link now includes a `url` parameter pointing at the page.
- Test coverage must remain at 100% and the CI gate must stay green.