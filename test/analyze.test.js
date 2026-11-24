import { describe, it, expect } from 'vitest';
import { analyze, monthKey, monthLabel } from '../src/lib/analyze.js';
import * as fixtures from './fixtures.js';

function run(fixture) {
  return analyze(fixture.records, fixture.mapping);
}

describe('analyze rich data', () => {
  const agg = run(fixtures.rich);

  it('computes totals', () => {
    expect(agg.totals.net).toBe(1650);
    expect(agg.totals.gross).toBe(1820);
    expect(agg.totals.discount).toBe(170);
    expect(agg.totals.invoices).toBe(3);
    expect(agg.totals.outlets).toBe(4);
    expect(agg.totals.branches).toBe(2);
  });

  it('aggregates regions with share', () => {
    expect(agg.regions.map((region) => region.name)).toEqual(['R1', 'R2']);
    expect(agg.regions[0].net).toBe(1200);
    expect(agg.flags.shareAvailable).toBe(true);
    expect(agg.regions[0].share).toBeCloseTo(1200 / 1650);
  });

  it('ranks the weakest outlets by absolute net sales', () => {
    expect(agg.weakest.map((outlet) => outlet.id)).toEqual(['O4', 'O2', 'O3', 'O1']);
    expect(agg.hasCritical).toBe(true);
  });

  it('tracks negative lines, missing salesman, and growth', () => {
    expect(agg.flags.negativeLines).toBe(1);
    expect(agg.flags.negativeSum).toBe(-50);
    expect(agg.flags.missingSalesman).toBe(1);
    expect(agg.growth).toBeCloseTo(-0.625);
    expect(agg.flags.allOutletsEqual).toBe(false);
  });
});

describe('analyze plain data without optional columns', () => {
  const agg = run(fixtures.plain);

  it('omits optional aggregates', () => {
    expect(agg.totals.invoices).toBeNull();
    expect(agg.totals.branches).toBeNull();
    expect(agg.branches).toBeNull();
    expect(agg.growth).toBeNull();
    expect(agg.months).toEqual([]);
  });

  it('detects a single region with equal outlets', () => {
    expect(agg.flags.singleRegion).toBe(true);
    expect(agg.flags.singleMonth).toBe(true);
    expect(agg.flags.allOutletsEqual).toBe(true);
    expect(agg.hasCritical).toBe(false);
  });
});

describe('analyze mixed region sizes', () => {
  it('ignores single-outlet regions when checking equality', () => {
    const agg = run(fixtures.mixedRegionSizes);
    expect(agg.regions).toHaveLength(2);
    expect(agg.flags.allOutletsEqual).toBe(true);
    expect(agg.flags.singleRegion).toBe(false);
  });
});

describe('analyze negative and zero totals', () => {
  it('handles a negative total with non-positive region averages', () => {
    const agg = run(fixtures.negativeMulti);
    expect(agg.totals.net).toBe(-150);
    expect(agg.flags.negativeTotal).toBe(true);
    expect(agg.flags.shareAvailable).toBe(false);
    expect(agg.branches).toHaveLength(1);
    const negativeOutlet = agg.outlets.find((outlet) => outlet.id === 'O1');
    expect(negativeOutlet.ratio).toBeNull();
    expect(agg.flags.allOutletsEqual).toBe(true);
  });

  it('handles a zero total', () => {
    const agg = run(fixtures.zero);
    expect(agg.totals.net).toBe(0);
    expect(agg.flags.zeroTotal).toBe(true);
    expect(agg.flags.shareAvailable).toBe(false);
    expect(agg.outlets[0].ratio).toBeNull();
  });
});

describe('analyze dates and growth', () => {
  it('ignores unreadable and out-of-range dates', () => {
    const agg = run(fixtures.invalidDates);
    expect(agg.months).toEqual([]);
    expect(agg.flags.singleMonth).toBe(true);
  });

  it('does not compute growth when the previous month is zero', () => {
    const agg = run(fixtures.prevZero);
    expect(agg.months).toEqual(['2026-09', '2026-10']);
    expect(agg.growth).toBeNull();
  });

  it('computes positive growth', () => {
    const agg = run(fixtures.growing);
    expect(agg.growth).toBeCloseTo(1);
  });
});

describe('analyze empty input', () => {
  it('returns empty aggregates', () => {
    const agg = analyze([], {});
    expect(agg.regions).toEqual([]);
    expect(agg.weakest).toEqual([]);
    expect(agg.flags.allOutletsEqual).toBe(true);
    expect(agg.flags.singleRegion).toBe(true);
    expect(agg.flags.singleMonth).toBe(true);
    expect(agg.flags.zeroTotal).toBe(true);
  });
});

describe('month helpers', () => {
  it('returns null for unreadable dates', () => {
    expect(monthKey('not-a-date')).toBeNull();
    expect(monthKey('2026-13-01')).toBeNull();
  });

  it('extracts a month key', () => {
    expect(monthKey('2026-09-15')).toBe('2026-09');
  });

  it('labels a month key', () => {
    expect(monthLabel('2026-09')).toBe('September 2026');
  });
});
