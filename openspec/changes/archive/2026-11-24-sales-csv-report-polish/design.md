# Design

## Context

See `proposal.md` - Why. This is a presentation-only follow-up to two archived
changes (`sales-csv-report`, `sales-csv-report-improved`). All core logic is
stable; only HTML generation and CSS change.

## Goals / Non-Goals

**Goals:**

- Legend below the weakest table, smaller and muted, framed as Tier-column
  supplementary information.
- Telegram sign-in helper note beside the button.
- Summary heading "Summary report".
- `#` column and odd/even striping on the three report tables.

**Non-Goals:**

- No change to mapping table, parsing, aggregation, summary text, or share URL.
- No new dependencies, no backend.

## Decisions

### Decision: Legend after table

Move the `tierLegendHtml()` call from before the weakest table to after its
closing `</tbody></table>`, and style `.tier-legend` with a smaller font and
muted color. The wording "Tiers (% of region average):" stays; it already
describes the Tier column.

### Decision: Telegram helper note

Add a static `<p class="hint">` after the action buttons in `index.html`.
Telegram's login wall is external and cannot be detected from the page, so a
static note is the honest, zero-logic fix; Copy summary remains adjacent.

### Decision: Numbered rows and striping

Add a `#` header and 1-based `<td>` to region, branch, and weakest tables in
`dashboardHtml`. The branch table gets a `<thead>` for consistency. Odd/even
striping via `tbody tr:nth-child(odd)` in a scoped `.report-table` class, so the
mapping table is unaffected.

### Decision: Heading wording

Update only the `<h2>` in `index.html`; no test currently asserts the old string.

## Risks / Trade-offs

- [Row numbers restart per table] -> Intentional; each table is its own view.
- [Static sign-in note] -> Cannot detect login state; note is always shown.

## Migration Plan

None. UI-only change; archive after syncing modified specs to main specs.

## Open Questions

None.