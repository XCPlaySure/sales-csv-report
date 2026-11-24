import { formatIDR, formatPct } from './format.js';
import { monthLabel } from './analyze.js';

function periodLabel(agg) {
  if (!agg.flags.hasDate || agg.months.length === 0) return 'In the uploaded data';
  if (agg.months.length === 1) return `In ${monthLabel(agg.months[0])}`;
  return `Across ${monthLabel(agg.months[0])} to ${monthLabel(agg.months[agg.months.length - 1])}`;
}

export function buildSummary(agg) {
  const parts = [];
  const { totals, flags } = agg;

  let headline = `${periodLabel(agg)} the business booked ${formatIDR(totals.net)} in net sales`;
  if (totals.invoices != null) headline += ` from ${totals.invoices} invoices`;
  parts.push(`${headline}.`);

  if (flags.negativeTotal) {
    parts.push('Net sales were negative because returns exceeded sales.');
  }

  if (agg.growth != null) {
    const direction = agg.growth >= 0 ? 'grew' : 'fell';
    parts.push(`Net sales ${direction} ${formatPct(Math.abs(agg.growth))} month over month.`);
  }

  if (!flags.singleRegion && flags.shareAvailable) {
    const top = agg.regions[0];
    parts.push(`${top.name} led with ${formatPct(top.share)} of sales.`);
  }

  if (flags.hasBranch && agg.branches.length >= 2) {
    const top = agg.branches[0];
    parts.push(`The strongest branch was ${top.name} with ${formatIDR(top.net)} in net sales.`);
  }

  if (agg.weakest.length > 0) {
    if (agg.hasCritical) {
      const worst = agg.weakest[0];
      parts.push(
        `${agg.weakest.length} outlets were critically weak, led by ${worst.name} at ${formatPct(worst.ratio)} of its region average.`,
      );
    } else {
      parts.push('None of the lowest-selling outlets was critically underperforming.');
    }
  }

  if (flags.negativeLines > 0) {
    parts.push(
      `Figures include ${flags.negativeLines} refund line(s) totalling ${formatIDR(flags.negativeSum)}.`,
    );
  }

  if (flags.missingSalesman > 0) {
    parts.push(
      `${flags.missingSalesman} line(s) have no salesman assigned and are excluded from salesman attribution.`,
    );
  }

  return parts.join(' ');
}

export function summaryBasis(agg, skippedCount = 0) {
  if (agg.totals.records === 0) return '';
  const parts = [`Based on ${agg.totals.records} data rows`];
  if (agg.totals.invoices != null) parts.push(`${agg.totals.invoices} invoices`);
  parts.push(`${agg.totals.outlets} outlets`, `${agg.regions.length} regions`);
  if (skippedCount > 0) parts.push(`${skippedCount} skipped row(s)`);
  return `${parts.join(', ')}.`;
}
