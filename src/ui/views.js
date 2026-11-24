import { formatIDR, formatPct } from '../lib/format.js';
import { CRITICAL_PCT, LOW_PCT, BELOW_PCT } from '../lib/tiers.js';

const FIELD_LABELS = [
  ['region', 'Region', true],
  ['outlet_id', 'Outlet ID', true],
  ['net_sales', 'Net sales', true],
  ['branch', 'Branch', false],
  ['date', 'Date', false],
  ['invoice_no', 'Invoice no', false],
  ['outlet_name', 'Outlet name', false],
  ['outlet_type', 'Outlet type', false],
  ['salesman', 'Salesman', false],
  ['brand', 'Brand', false],
  ['sku', 'SKU', false],
  ['qty_carton', 'Qty carton', false],
  ['price_per_carton', 'Price per carton', false],
  ['gross_sales', 'Gross sales', false],
  ['discount', 'Discount', false],
];

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
}

export function mappingPanelHtml(headers, sampleRow, mapping, validation) {
  const rows = FIELD_LABELS.map(([field, label, required]) => {
    const selected = mapping[field];
    const options = ['<option value="">-- not mapped --</option>']
      .concat(
        headers.map(
          (header, index) =>
            `<option value="${index}"${selected === index ? ' selected' : ''}>${escapeHtml(header)}</option>`,
        ),
      )
      .join('');
    const sample = selected != null ? escapeHtml(sampleRow[selected] ?? '') : '';
    return `<tr><th>${label}${required ? ' *' : ''}</th><td><select data-field="${field}">${options}</select></td><td class="sample">${sample}</td></tr>`;
  }).join('');

  const derived = validation.netDerived
    ? '<p class="derived">Net sales will be derived as gross minus discount.</p>'
    : '';

  return `<h2>Confirm columns</h2><table class="mapping-table"><tbody>${rows}</tbody></table>${derived}<p class="mapping-errors">${escapeHtml(validation.errors.join(' '))}</p><button id="process-btn" type="button"${validation.ok ? '' : ' disabled'}>Process CSV</button>`;
}

export function dashboardHtml(agg) {
  const { totals, flags } = agg;
  const parts = [];

  parts.push('<h2>Headline</h2><ul class="headline">');
  parts.push(`<li>Net sales: <strong>${formatIDR(totals.net)}</strong></li>`);
  parts.push(`<li>Gross sales: <strong>${formatIDR(totals.gross)}</strong></li>`);
  parts.push(`<li>Discounts: <strong>${formatIDR(totals.discount)}</strong></li>`);
  if (totals.invoices != null) parts.push(`<li>Invoices: <strong>${totals.invoices}</strong></li>`);
  parts.push(`<li>Outlets: <strong>${totals.outlets}</strong></li>`);
  parts.push('</ul>');

  if (flags.negativeTotal) {
    parts.push('<p class="note">Net sales are negative: returns exceeded sales.</p>');
  }
  if (flags.zeroTotal) {
    parts.push('<p class="note">Net sales are zero; share is unavailable.</p>');
  }

  parts.push('<h2>Net sales by region</h2>');
  if (!flags.shareAvailable) {
    parts.push('<p class="note">Share is unavailable because total net sales are not positive.</p>');
  }
  parts.push(
    '<table class="region-table report-table"><thead><tr><th>#</th><th>Region</th><th>Net sales</th><th>Share</th></tr></thead><tbody>',
  );
  agg.regions.forEach((region, index) => {
    const share = flags.shareAvailable ? formatPct(region.share) : 'n/a';
    parts.push(
      `<tr><td>${index + 1}</td><td>${escapeHtml(region.name)}</td><td>${formatIDR(region.net)}</td><td>${share}</td></tr>`,
    );
  });
  parts.push('</tbody></table>');

  if (flags.hasBranch && agg.branches.length > 0) {
    parts.push('<h2>Net sales by branch</h2><table class="branch-table report-table"><thead><tr><th>#</th><th>Branch</th><th>Net sales</th></tr></thead><tbody>');
    agg.branches.forEach((branch, index) => {
      parts.push(`<tr><td>${index + 1}</td><td>${escapeHtml(branch.name)}</td><td>${formatIDR(branch.net)}</td></tr>`);
    });
    parts.push('</tbody></table>');
  }

  parts.push(
    `<h2>Lowest-selling outlets${agg.weakest.length > 0 ? ` (${agg.weakest.length})` : ''}</h2>`,
  );
  if (agg.weakest.length > 0) {
    parts.push(
      '<table class="weakest-table report-table"><thead><tr><th>#</th><th>Outlet</th><th>Region</th><th>Net sales</th><th>% of region avg</th><th>Tier</th></tr></thead><tbody>',
    );
    agg.weakest.forEach((outlet, index) => {
      const ratio = outlet.ratio == null ? 'n/a' : formatPct(outlet.ratio);
      parts.push(
        `<tr><td>${index + 1}</td><td>${escapeHtml(outlet.name)}</td><td>${escapeHtml(outlet.region)}</td><td>${formatIDR(outlet.net)}</td><td>${ratio}</td><td class="tier ${outlet.tier}">${outlet.tier}</td></tr>`,
      );
    });
    parts.push('</tbody></table>');
    parts.push(tierLegendHtml());
    if (!agg.hasCritical) {
      parts.push('<p class="note">None of these outlets is critically underperforming.</p>');
    }
  } else {
    parts.push('<p class="note">No outlets to rank.</p>');
  }

  if (flags.allOutletsEqual && agg.weakest.length > 0) {
    parts.push('<p class="note">Outlets perform similarly; the ranking is not meaningful.</p>');
  }
  if (flags.singleMonth) {
    parts.push('<p class="note">Single month of data; no month-over-month comparison.</p>');
  }
  if (flags.singleRegion) {
    parts.push('<p class="note">Only one region in this file.</p>');
  }

  return parts.join('');
}

function tierLegendHtml() {
  return [
    '<div class="tier-legend"><span class="legend-title">Tiers (% of region average):</span>',
    `<span class="tier CRITICAL">CRITICAL</span> below ${formatPct(CRITICAL_PCT)} ·`,
    `<span class="tier LOW">LOW</span> ${formatPct(CRITICAL_PCT)} to below ${formatPct(LOW_PCT)} ·`,
    `<span class="tier BELOW">BELOW</span> ${formatPct(LOW_PCT)} to below ${formatPct(BELOW_PCT)} ·`,
    `<span class="tier OK">OK</span> ${formatPct(BELOW_PCT)} or more`,
    '</div>',
  ].join('');
}

export function faultHtml(message) {
  return `<div class="fault"><strong>Problem with this CSV file.</strong> ${escapeHtml(message)}</div>`;
}
