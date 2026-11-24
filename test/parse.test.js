import { describe, it, expect } from 'vitest';
import {
  parseCsv,
  normalizeHeader,
  detectMapping,
  validateMapping,
  parseRows,
} from '../src/lib/parse.js';

describe('parseCsv', () => {
  it('parses a simple file', () => {
    expect(parseCsv('a,b\n1,2\n')).toEqual({ headers: ['a', 'b'], rows: [['1', '2']] });
  });

  it('handles quoted fields with embedded commas and escaped quotes', () => {
    const result = parseCsv('name,note\n"Smith, John","say ""hi"""\n');
    expect(result.rows).toEqual([['Smith, John', 'say "hi"']]);
  });

  it('handles CRLF line endings', () => {
    expect(parseCsv('a,b\r\n1,2\r\n').rows).toEqual([['1', '2']]);
  });

  it('handles a lone carriage return as a newline', () => {
    expect(parseCsv('a,b\r1,2').rows).toEqual([['1', '2']]);
  });

  it('strips a leading byte-order mark', () => {
    expect(parseCsv('\uFEFFa,b\n1,2').headers).toEqual(['a', 'b']);
  });

  it('handles a newline inside a quoted field', () => {
    expect(parseCsv('a,b\n"x\ny",2\n').rows).toEqual([['x\ny', '2']]);
  });

  it('returns empty output for empty or blank input', () => {
    expect(parseCsv('')).toEqual({ headers: [], rows: [] });
    expect(parseCsv('\n\n')).toEqual({ headers: [], rows: [] });
  });
});

describe('normalizeHeader', () => {
  it('lowercases and strips spaces, underscores, and a BOM', () => {
    expect(normalizeHeader('\uFEFF Net_Sales_IDR ')).toBe('netsalesidr');
  });
});

describe('detectMapping', () => {
  it('maps exact headers', () => {
    const mapping = detectMapping([
      'region',
      'outlet_id',
      'net_sales_idr',
      'branch',
      'date',
      'salesman',
    ]);
    expect(mapping.region).toBe(0);
    expect(mapping.outlet_id).toBe(1);
    expect(mapping.net_sales).toBe(2);
    expect(mapping.branch).toBe(3);
    expect(mapping.date).toBe(4);
    expect(mapping.salesman).toBe(5);
  });

  it('maps known synonyms', () => {
    const mapping = detectMapping(['wilayah', 'outlet', 'omzet']);
    expect(mapping.region).toBe(0);
    expect(mapping.outlet_id).toBe(1);
    expect(mapping.net_sales).toBe(2);
  });

  it('leaves unknown headers unmapped', () => {
    const mapping = detectMapping(['foo', 'bar']);
    expect(mapping.region).toBeNull();
    expect(mapping.net_sales).toBeNull();
  });

  it('does not reuse a column for two fields', () => {
    const mapping = detectMapping(['outlet', 'outletname']);
    expect(mapping.outlet_id).toBe(0);
    expect(mapping.outlet_name).toBe(1);
  });
});

describe('validateMapping', () => {
  it('accepts a complete mapping', () => {
    const result = validateMapping({ region: 0, outlet_id: 1, net_sales: 2 });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('flags a missing required field', () => {
    const result = validateMapping({ region: 0, outlet_id: 1, net_sales: null });
    expect(result.ok).toBe(false);
    expect(result.unresolved).toContain('net_sales');
    expect(result.errors[0]).toContain('net_sales');
  });

  it('flags a missing outlet id and region', () => {
    const result = validateMapping({ region: null, outlet_id: null, net_sales: 2 });
    expect(result.unresolved).toEqual(['region', 'outlet_id']);
  });

  it('does not derive net sales when the discount column is missing', () => {
    const result = validateMapping({
      region: 0,
      outlet_id: 1,
      net_sales: null,
      gross_sales: 2,
      discount: null,
    });
    expect(result.netDerived).toBe(false);
    expect(result.unresolved).toContain('net_sales');
  });

  it('accepts derived net sales from gross minus discount', () => {
    const result = validateMapping({
      region: 0,
      outlet_id: 1,
      net_sales: null,
      gross_sales: 2,
      discount: 3,
    });
    expect(result.netDerived).toBe(true);
    expect(result.ok).toBe(true);
  });

  it('flags duplicate column mappings and skips undefined entries', () => {
    const result = validateMapping({ region: 0, outlet_id: 0, net_sales: 2, branch: undefined });
    expect(result.ok).toBe(false);
    expect(result.duplicates).toEqual([0]);
    expect(result.errors.some((message) => message.includes('column index 0'))).toBe(true);
  });
});

describe('parseRows', () => {
  const mapping = {
    region: 0,
    outlet_id: 1,
    net_sales: 2,
    gross_sales: 3,
    discount: 4,
    salesman: 5,
    date: 6,
    invoice_no: 7,
    outlet_name: 8,
    branch: 9,
    qty_carton: 10,
  };

  it('parses numeric and text fields', () => {
    const { records, skipped } = parseRows(
      [['R', 'O1', '100', '120', '20', 'Sam', '2026-09-01', 'I1', 'Alpha', 'B1', '5']],
      mapping,
    );
    expect(skipped).toEqual([]);
    expect(records[0]).toMatchObject({
      region: 'R',
      outlet_id: 'O1',
      net_sales: 100,
      gross_sales: 120,
      discount: 20,
      salesman: 'Sam',
      qty_carton: 5,
      outlet_name: 'Alpha',
    });
  });

  it('skips a row with a non-numeric mapped value', () => {
    const { records, skipped } = parseRows(
      [['R', 'O1', 'abc', '120', '20', 'Sam', 'd', 'I1', 'A', 'B', '5']],
      mapping,
    );
    expect(records).toEqual([]);
    expect(skipped).toEqual([
      { rowIndex: 0, field: 'net_sales', reason: 'invalid_numeric' },
    ]);
  });

  it('skips a row with an empty numeric value', () => {
    const { skipped } = parseRows(
      [['R', 'O1', '', '120', '20', 'Sam', 'd', 'I1', 'A', 'B', '5']],
      mapping,
    );
    expect(skipped[0].field).toBe('net_sales');
  });

  it('skips a row where the numeric cell is missing entirely', () => {
    const { skipped } = parseRows([['R', 'O1']], { region: 0, outlet_id: 1, net_sales: 2 });
    expect(skipped[0].field).toBe('net_sales');
  });

  it('keeps a valid row and omits a non-numeric optional numeric field', () => {
    const { records, skipped, invalidOptionalCount } = parseRows(
      [['R', 'O1', '100', '120', '20', 'Sam', 'd', 'I1', 'A', 'B', 'x']],
      mapping,
    );
    expect(records).toHaveLength(1);
    expect(records[0].net_sales).toBe(100);
    expect(records[0].qty_carton).toBeUndefined();
    expect(skipped).toEqual([]);
    expect(invalidOptionalCount).toBe(1);
  });

  it('derives net sales from gross minus discount', () => {
    const derivedMapping = { region: 0, outlet_id: 1, net_sales: null, gross_sales: 2, discount: 3 };
    const { records } = parseRows([['R', 'O1', '120', '20']], derivedMapping);
    expect(records[0].net_sales).toBe(100);
  });

  it('defaults a missing text cell to an empty string', () => {
    const textMapping = { region: 0, outlet_id: 1, net_sales: 2, salesman: 5 };
    const { records } = parseRows([['R', 'O1', '100']], textMapping);
    expect(records[0].salesman).toBe('');
  });

  it('omits a blank optional numeric value without a warning', () => {
    const { records, skipped, invalidOptionalCount } = parseRows(
      [['R', 'O1', '100', '', '20']],
      { region: 0, outlet_id: 1, net_sales: 2, gross_sales: 3, discount: 4 },
    );
    expect(records).toHaveLength(1);
    expect(records[0].gross_sales).toBeUndefined();
    expect(skipped).toEqual([]);
    expect(invalidOptionalCount).toBe(0);
  });

  it('omits invalid optional gross sales while keeping valid net sales', () => {
    const { records, invalidOptionalCount } = parseRows(
      [['R', 'O1', '100', 'bad', '20']],
      { region: 0, outlet_id: 1, net_sales: 2, gross_sales: 3, discount: 4 },
    );
    expect(records).toHaveLength(1);
    expect(records[0].gross_sales).toBeUndefined();
    expect(records[0].net_sales).toBe(100);
    expect(invalidOptionalCount).toBe(1);
  });

  it('reports every invalid optional numeric field in a row', () => {
    const { records, invalidOptionalCount } = parseRows(
      [['R', 'O1', '100', 'bad', 'also bad', 'Sam', 'd', 'I1', 'A', 'B', 'x']],
      mapping,
    );
    expect(records).toHaveLength(1);
    expect(invalidOptionalCount).toBe(3);
  });

  it('skips a row with a blank region', () => {
    const { records, skipped } = parseRows([['', 'O1', '100']], {
      region: 0,
      outlet_id: 1,
      net_sales: 2,
    });
    expect(records).toEqual([]);
    expect(skipped).toEqual([{ rowIndex: 0, field: 'region', reason: 'blank_required' }]);
  });

  it('skips a row with a blank outlet id', () => {
    const { records, skipped } = parseRows([['R', '   ', '100']], {
      region: 0,
      outlet_id: 1,
      net_sales: 2,
    });
    expect(records).toEqual([]);
    expect(skipped).toEqual([{ rowIndex: 0, field: 'outlet_id', reason: 'blank_required' }]);
  });

  it('skips a derived row with an invalid required numeric value', () => {
    const derivedMapping = { region: 0, outlet_id: 1, gross_sales: 2, discount: 3 };
    const { records, skipped } = parseRows([['R', 'O1', 'bad', '20']], derivedMapping);
    expect(records).toEqual([]);
    expect(skipped).toEqual([{ rowIndex: 0, field: 'gross_sales', reason: 'invalid_numeric' }]);
  });

  it('does not require unmapped text fields', () => {
    const { records, skipped } = parseRows([['R', '100']], { region: 0, net_sales: 1 });
    expect(records).toHaveLength(1);
    expect(skipped).toEqual([]);
  });

  it('accepts an explicit plus sign but rejects other JavaScript numeric formats', () => {
    const mapping = { region: 0, outlet_id: 1, net_sales: 2 };
    expect(parseRows([['R', 'O1', '+100']], mapping).records[0].net_sales).toBe(100);
    for (const value of ['Infinity', '0x10', '1e3', '1.728.036.900', '1.728.036,90']) {
      const { records, skipped } = parseRows([['R', 'O1', value]], mapping);
      expect(records).toEqual([]);
      expect(skipped[0].reason).toBe('invalid_numeric');
    }
  });

  it('skips derived rows with blank gross or discount values', () => {
    const derivedMapping = { region: 0, outlet_id: 1, gross_sales: 2, discount: 3 };
    for (const row of [['R', 'O1', '', '20'], ['R', 'O1', '120', ''], ['R', 'O1', '', '']]) {
      const { records, skipped } = parseRows([row], derivedMapping);
      expect(records).toEqual([]);
      expect(skipped[0].reason).toBe('invalid_numeric');
    }
  });
});
