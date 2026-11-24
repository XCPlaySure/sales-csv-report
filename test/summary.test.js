import { describe, it, expect } from 'vitest';
import { analyze } from '../src/lib/analyze.js';
import { buildSummary, summaryBasis } from '../src/lib/summary.js';
import * as fixtures from './fixtures.js';

function summaryFor(fixture) {
  return buildSummary(analyze(fixture.records, fixture.mapping));
}

describe('buildSummary rich data', () => {
  const text = summaryFor(fixtures.rich);

  it('includes the headline, growth, leader, branch, weakest, and caveats', () => {
    expect(text).toContain('Across September 2026 to October 2026');
    expect(text).toContain('Rp 1.650 in net sales from 3 invoices');
    expect(text).toContain('Net sales fell 62,5% month over month.');
    expect(text).toContain('R1 led with');
    expect(text).toContain('The strongest branch was B1');
    expect(text).toContain('4 outlets were critically weak');
    expect(text).toContain('1 refund line(s) totalling -Rp 50');
    expect(text).toContain('1 line(s) have no salesman assigned');
  });
});

describe('buildSummary plain data', () => {
  const text = summaryFor(fixtures.plain);

  it('omits unsupported clauses and reports no critical outlets', () => {
    expect(text).toContain('In the uploaded data');
    expect(text).not.toContain('invoices');
    expect(text).not.toContain('month over month');
    expect(text).not.toContain('led with');
    expect(text).not.toContain('strongest branch');
    expect(text).toContain('None of the lowest-selling outlets was critically underperforming.');
    expect(text).not.toContain('refund');
    expect(text).not.toContain('salesman');
  });
});

describe('buildSummary negative totals', () => {
  const text = summaryFor(fixtures.negativeMulti);

  it('notes negative sales and skips the leader and branch clauses', () => {
    expect(text).toContain('In September 2026');
    expect(text).toContain('Net sales were negative because returns exceeded sales.');
    expect(text).not.toContain('led with');
    expect(text).not.toContain('strongest branch');
    expect(text).toContain('2 refund line(s)');
  });
});

describe('buildSummary dates', () => {
  it('falls back to the generic period when dates are unreadable', () => {
    expect(summaryFor(fixtures.invalidDates)).toContain('In the uploaded data');
  });

  it('reports growth with grew', () => {
    expect(summaryFor(fixtures.growing)).toContain('Net sales grew 100,0% month over month.');
  });

  it('omits growth when the previous month is zero', () => {
    expect(summaryFor(fixtures.prevZero)).not.toContain('month over month');
  });
});

describe('summaryBasis', () => {
  it('reports counts from the aggregate and skipped rows', () => {
    const text = summaryBasis(analyze(fixtures.rich.records, fixtures.rich.mapping), 2);
    expect(text).toBe('Based on 4 data rows, 3 invoices, 4 outlets, 2 regions, 2 skipped row(s).');
  });

  it('omits invoices when not mapped', () => {
    const text = summaryBasis(analyze(fixtures.plain.records, fixtures.plain.mapping));
    expect(text).toBe('Based on 2 data rows, 2 outlets, 1 regions.');
  });

  it('returns an empty string when there are no data rows', () => {
    expect(summaryBasis(analyze([], {}))).toBe('');
  });
});

describe('buildSummary empty data', () => {
  it('produces only a headline', () => {
    const text = buildSummary(analyze([], {}));
    expect(text).toBe('In the uploaded data the business booked Rp 0 in net sales.');
  });
});
