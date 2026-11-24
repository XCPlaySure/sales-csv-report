# Tasks

## 1. Tier legend placement

- [x] 1.1 Move `tierLegendHtml()` call after the weakest table's `</tbody></table>` in `src/ui/views.js`.
- [x] 1.2 Style `.tier-legend` smaller and muted in `src/style.css`; keep wording as Tier-column info. Verify: legend appears below table, not above.

## 2. Telegram helper note

- [x] 2.1 Add a `<p class="hint">` after the action buttons in `index.html` stating sign-in is required and Copy summary is the alternative. Verify: note visible whenever summary section is shown.

## 3. Summary heading

- [x] 3.1 Change `<h2>` in `index.html` from "Summary for your sales manager" to "Summary report".

## 4. Numbered and striped report tables

- [x] 4.1 Add `#` header and 1-based row numbers to region, branch, and weakest tables in `src/ui/views.js`; add `<thead>` to branch table.
- [x] 4.2 Scope odd/even striping to report tables in `src/style.css` (`tbody tr:nth-child(odd)`), leaving mapping table unchanged.

## 5. Tests and verification

- [x] 5.1 Update `test/views.test.js` for legend-after-table order and numbered rows.
- [x] 5.2 Run `npm run coverage` at 100% and `npm run build` successfully.
- [x] 5.3 Sync modified specs to main specs and archive this change.