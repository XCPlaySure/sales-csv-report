import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseCsv, detectMapping, validateMapping, parseRows } from '../src/lib/parse.js';
import { analyze } from '../src/lib/analyze.js';

const csv = readFileSync(resolve(process.cwd(), 'sales.csv'), 'utf8');

describe('golden sales.csv', () => {
  it('reproduces the known headline figures', () => {
    const { headers, rows } = parseCsv(csv);
    expect(headers).toHaveLength(15);
    expect(rows).toHaveLength(1891);

    const mapping = detectMapping(headers);
    expect(validateMapping(mapping).ok).toBe(true);

    const { records, skipped } = parseRows(rows, mapping);
    expect(skipped).toHaveLength(0);

    const agg = analyze(records, mapping);
    expect(agg.totals.gross).toBe(1758432000);
    expect(agg.totals.net).toBe(1728036900);
    expect(agg.totals.invoices).toBe(824);
    expect(agg.totals.outlets).toBe(52);
    expect(agg.regions).toHaveLength(10);
    expect(agg.weakest.map((outlet) => outlet.id)).toEqual([
      'OUT1003',
      'OUT1026',
      'OUT1035',
      'OUT1045',
      'OUT1042',
    ]);
  });
});
