export const rich = {
  mapping: { branch: 0, date: 0, invoice_no: 0, salesman: 0 },
  records: [
    {
      region: 'R1',
      branch: 'B1',
      outlet_id: 'O1',
      outlet_name: 'Alpha',
      salesman: 'Sam',
      date: '2026-09-05',
      invoice_no: 'I1',
      gross_sales: 1100,
      discount: 100,
      net_sales: 1000,
    },
    {
      region: 'R1',
      branch: 'B1',
      outlet_id: 'O2',
      outlet_name: 'Beta',
      salesman: '',
      date: '2026-09-10',
      invoice_no: 'I1',
      gross_sales: 220,
      discount: 20,
      net_sales: 200,
    },
    {
      region: 'R2',
      branch: 'B2',
      outlet_id: 'O3',
      outlet_name: 'Gamma',
      salesman: 'Kim',
      date: '2026-10-01',
      invoice_no: 'I2',
      gross_sales: 500,
      discount: 0,
      net_sales: 500,
    },
    {
      region: 'R2',
      branch: 'B2',
      outlet_id: 'O4',
      outlet_name: 'Delta',
      salesman: 'Kim',
      date: '2026-10-02',
      invoice_no: 'I3',
      gross_sales: 0,
      discount: 50,
      net_sales: -50,
    },
  ],
};

export const plain = {
  mapping: {},
  records: [
    { region: 'R', outlet_id: 'O1', net_sales: 100 },
    { region: 'R', outlet_id: 'O2', net_sales: 100 },
  ],
};

export const mixedRegionSizes = {
  mapping: {},
  records: [
    { region: 'R', outlet_id: 'O1', net_sales: 100 },
    { region: 'S', outlet_id: 'O2', net_sales: 50 },
    { region: 'S', outlet_id: 'O3', net_sales: 50 },
  ],
};

export const negativeMulti = {
  mapping: { branch: 0, date: 0, invoice_no: 0, salesman: 0 },
  records: [
    {
      region: 'R1',
      branch: 'B1',
      outlet_id: 'O1',
      outlet_name: '',
      salesman: 'S',
      date: '2026-09-01',
      invoice_no: 'I1',
      net_sales: -100,
    },
    {
      region: 'R1',
      branch: 'B1',
      outlet_id: 'O2',
      outlet_name: 'X',
      salesman: 'S',
      date: '2026-09-02',
      invoice_no: 'I2',
      net_sales: -100,
    },
    {
      region: 'R2',
      branch: 'B1',
      outlet_id: 'O3',
      outlet_name: 'Y',
      salesman: 'S',
      date: '2026-09-03',
      invoice_no: 'I3',
      net_sales: 50,
    },
  ],
};

export const zero = {
  mapping: {},
  records: [
    { region: 'R', outlet_id: 'O1', net_sales: 100 },
    { region: 'R', outlet_id: 'O2', net_sales: -100 },
  ],
};

export const invalidDates = {
  mapping: { date: 0 },
  records: [
    { region: 'R', outlet_id: 'O1', date: 'not-a-date', net_sales: 100 },
    { region: 'R', outlet_id: 'O2', date: '2026-13-01', net_sales: 100 },
  ],
};

export const prevZero = {
  mapping: { date: 0 },
  records: [
    { region: 'R', outlet_id: 'O1', date: '2026-09-01', net_sales: 0 },
    { region: 'R', outlet_id: 'O2', date: '2026-10-01', net_sales: 100 },
  ],
};

export const growing = {
  mapping: { date: 0 },
  records: [
    { region: 'R', outlet_id: 'O1', date: '2026-09-01', net_sales: 100 },
    { region: 'R', outlet_id: 'O2', date: '2026-10-01', net_sales: 200 },
  ],
};
