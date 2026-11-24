# Design

## Context

See `proposal.md` - Why. This change is a follow-up to the already-scaffolded
`sales-csv-report` change, which produced a working app with 100% test coverage and
a passing CI gate. The four UX refinements below were confirmed against a live
run.

## Goals / Non-Goals

**Goals:**

- Hide the upload prompt after a file is chosen; hide the mapping panel once
  results are rendered. Only the current stage is visible.
- Show a legend explaining the severity tiers (CRITICAL/LOW/BELOW/OK).
- Build the Telegram share link as
  `https://t.me/share/url?url=<page>&text=<summary>` and rely on Telegram to
  handle recipient selection and sign-in.
- Add a basis note under the summary stating row/invoice/outlet/region counts
  and skipped-row count.

**Non-Goals:**

- No changes to parsing, aggregation, or summary logic.
- No new backend, no new runtime dependencies.
- No additional tiers beyond the four existing.

## Decisions

### Decision: Stage-based visibility

Keep three stage states (upload, mapping, results) in component state and drive
visibility from a single boolean per stage. The mapping panel is rendered only
while awaiting confirmation; once processing starts and results are ready, mapping
is hidden and results shown. Reset returns to the upload stage.

- Alternatives: single-page scroll orchestration; conditional rendering per
  stage. The chosen approach is the least code and already covered by the
  existing UI tests' structure.

### Decision: Tier legend

Render the legend inline in the weakest-outlet view, derived from the same
threshold constants (`CRITICAL_PCT`, `LOW_PCT`, `BELOW_PCT`) so the legend and
tags stay in sync when thresholds change.

### Decision: Telegram share via t.me/share

Use the official share endpoint with both a `url` and a `text` parameter. The
share page handles recipient choice and sign-in; the app performs no direct
Telegram calls.

### Decision: Summary basis

Compute the basis line from the same aggregate result that backs the summary.
Include row count, invoice count, outlet count, region count, and skipped-row
count. Omit the basis when no rows exist.

## Risks / Trade-offs

- [Stage transitions not animated] -> Not in scope; visibility switches are
  immediate.
- [Legend duplication when tiers change] -> Mitigated by deriving the legend from
  the same constants as tier tags.

## Migration Plan

None required; UI-only refinements. The prior change
(`sales-csv-report`) remains as the reference implementation and the tasks for
that change are already complete.

## Open Questions

None at this point.