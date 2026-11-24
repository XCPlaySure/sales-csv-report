export const FIELD_SYNONYMS = {
  region: ['region', 'wilayah', 'area', 'provinsi', 'province'],
  branch: ['branch', 'cabang'],
  outlet_id: ['outletid', 'outlet', 'outletcode', 'idoutlet', 'storeid', 'store'],
  outlet_name: ['outletname', 'namatoko', 'namaoutlet', 'storename', 'toko'],
  outlet_type: ['outlettype', 'tipeoutlet', 'tipetoko', 'type'],
  salesman: ['salesman', 'salesperson', 'salesrep', 'spg'],
  brand: ['brand', 'merek'],
  sku: ['sku', 'product', 'produk', 'item', 'barang'],
  date: ['date', 'tanggal', 'tgl'],
  invoice_no: ['invoiceno', 'invoice', 'invoiceid', 'faktur', 'nonota'],
  qty_carton: ['qtycarton', 'qty', 'quantity', 'kuantitas', 'jumlah'],
  price_per_carton: ['pricepercarton', 'pricepercartonidr', 'price', 'harga', 'hargaperkarton'],
  gross_sales: ['grosssales', 'grosssalesidr', 'gross', 'bruto', 'grossrevenue'],
  discount: ['discount', 'discountidr', 'diskon', 'potongan'],
  net_sales: ['netsales', 'netsalesidr', 'net', 'netrevenue', 'omzet', 'netto', 'penjualan'],
};

export const REQUIRED_TEXT_FIELDS = ['region', 'outlet_id'];

export const NUMERIC_FIELDS = [
  'qty_carton',
  'price_per_carton',
  'gross_sales',
  'discount',
  'net_sales',
];

const PLAIN_DECIMAL = /^[+-]?\d+(?:\.\d+)?$/;

const TEXT_FIELDS = [
  'region',
  'branch',
  'outlet_id',
  'outlet_name',
  'outlet_type',
  'salesman',
  'brand',
  'sku',
  'date',
  'invoice_no',
];

export function normalizeHeader(header) {
  return String(header)
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '');
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = String(text).replace(/^\uFEFF/, '');

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (ch === '\r') {
      if (src[i + 1] !== '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      }
    } else {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const cleaned = rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
  if (cleaned.length === 0) return { headers: [], rows: [] };
  const [headers, ...dataRows] = cleaned;
  return { headers, rows: dataRows };
}

export function detectMapping(headers) {
  const normalized = headers.map(normalizeHeader);
  const mapping = {};
  const used = new Set();

  for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    let found = null;
    for (let i = 0; i < normalized.length; i += 1) {
      if (!used.has(i) && synonyms.includes(normalized[i])) {
        found = i;
        break;
      }
    }
    if (found !== null) used.add(found);
    mapping[field] = found;
  }

  return mapping;
}

export function validateMapping(mapping) {
  const seen = {};
  const duplicates = [];
  for (const [field, index] of Object.entries(mapping)) {
    if (index === null || index === undefined) continue;
    if (seen[index] !== undefined) {
      duplicates.push(index);
    } else {
      seen[index] = field;
    }
  }

  const netDerived =
    mapping.net_sales == null && mapping.gross_sales != null && mapping.discount != null;

  const unresolved = [];
  if (mapping.region == null) unresolved.push('region');
  if (mapping.outlet_id == null) unresolved.push('outlet_id');
  if (mapping.net_sales == null && !netDerived) unresolved.push('net_sales');

  const uniqueDuplicates = [...new Set(duplicates)];
  const errors = [];
  if (unresolved.length > 0) {
    errors.push(`Map these required fields: ${unresolved.join(', ')}.`);
  }
  if (uniqueDuplicates.length > 0) {
    errors.push(
      `The same column is mapped to more than one field (column index ${uniqueDuplicates.join(', ')}).`,
    );
  }

  return {
    ok: unresolved.length === 0 && uniqueDuplicates.length === 0,
    unresolved,
    duplicates: uniqueDuplicates,
    netDerived,
    errors,
  };
}

export function parseRows(rows, mapping) {
  const records = [];
  const skipped = [];
  let invalidOptionalCount = 0;
  const netDerived =
    mapping.net_sales == null && mapping.gross_sales != null && mapping.discount != null;
  const requiredNumeric = new Set(netDerived ? ['gross_sales', 'discount'] : ['net_sales']);
  const numericMapped = NUMERIC_FIELDS.filter((field) => mapping[field] != null);

  rows.forEach((row, rowIndex) => {
    const record = {};
    let rowInvalidOptionals = 0;
    let badField = null;

    for (const field of numericMapped) {
      const text = String(row[mapping[field]] ?? '').trim();
      const blank = text === '';
      const value = blank || !PLAIN_DECIMAL.test(text) ? NaN : Number(text);
      if (!Number.isFinite(value)) {
        if (requiredNumeric.has(field)) {
          badField = field;
          break;
        }
        if (!blank) rowInvalidOptionals += 1;
        continue;
      }
      record[field] = value;
    }

    if (badField !== null) {
      skipped.push({ rowIndex, field: badField, reason: 'invalid_numeric' });
      return;
    }

    for (const field of TEXT_FIELDS) {
      if (mapping[field] != null) {
        record[field] = row[mapping[field]] ?? '';
      }
    }

    const blankRequired = REQUIRED_TEXT_FIELDS.find(
      (field) => mapping[field] != null && String(record[field]).trim() === '',
    );
    if (blankRequired) {
      skipped.push({ rowIndex, field: blankRequired, reason: 'blank_required' });
      return;
    }

    invalidOptionalCount += rowInvalidOptionals;

    if (netDerived) {
      record.net_sales = record.gross_sales - record.discount;
    }

    records.push(record);
  });

  return { records, skipped, invalidOptionalCount };
}
