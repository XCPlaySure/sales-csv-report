import { tierFor } from './tiers.js';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function monthKey(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date).trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[1]}-${match[2]}`;
}

function monthIndex(key) {
  return Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7)) - 1;
}

export function monthLabel(key) {
  return `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
}

function addTo(map, key, amount) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function outletsEqual(outlets, regionMap) {
  const byRegion = new Map();
  for (const outlet of outlets) {
    if (!byRegion.has(outlet.region)) byRegion.set(outlet.region, []);
    byRegion.get(outlet.region).push(outlet.net);
  }

  for (const [region, nets] of byRegion) {
    if (nets.length < 2) continue;
    const average = regionMap.get(region) / nets.length;
    if (average <= 0) continue;
    const spread = (Math.max(...nets) - Math.min(...nets)) / average;
    if (spread > 0.01) return false;
  }

  return true;
}

export function analyze(records, mapping) {
  const totals = { gross: 0, net: 0, discount: 0, records: records.length };
  const regionMap = new Map();
  const branchMap = new Map();
  const outletMap = new Map();
  const monthMap = new Map();
  const invoiceSet = new Set();
  let negativeLines = 0;
  let negativeSum = 0;
  let missingSalesman = 0;
  let blankInvoices = 0;

  const hasInvoice = mapping.invoice_no != null;
  const hasDate = mapping.date != null;
  const hasBranch = mapping.branch != null;
  const hasSalesman = mapping.salesman != null;

  for (const record of records) {
    const net = record.net_sales;
    totals.net += net;
    totals.gross += record.gross_sales ?? 0;
    totals.discount += record.discount ?? 0;

    if (net < 0) {
      negativeLines += 1;
      negativeSum += net;
    }

    if (hasInvoice) {
      const invoice = String(record.invoice_no ?? '').trim();
      if (invoice) invoiceSet.add(invoice);
      else blankInvoices += 1;
    }
    if (hasSalesman && record.salesman.trim() === '') missingSalesman += 1;

    addTo(regionMap, record.region, net);
    if (hasBranch) addTo(branchMap, record.branch, net);

    const outletKey = `${record.outlet_id}\u0000${record.region}`;
    if (!outletMap.has(outletKey)) {
      outletMap.set(outletKey, {
        id: record.outlet_id,
        name: record.outlet_name || record.outlet_id,
        region: record.region,
        net: 0,
      });
    }
    outletMap.get(outletKey).net += net;

    if (hasDate) {
      const key = monthKey(record.date);
      if (key) addTo(monthMap, key, net);
    }
  }

  const regions = [...regionMap.entries()]
    .map(([name, net]) => ({ name, net }))
    .sort((a, b) => b.net - a.net);

  const shareAvailable = totals.net > 0;
  if (shareAvailable) {
    for (const region of regions) region.share = region.net / totals.net;
  }

  let branches = null;
  if (hasBranch) {
    branches = [...branchMap.entries()]
      .map(([name, net]) => ({ name, net }))
      .sort((a, b) => b.net - a.net);
  }

  const outlets = [...outletMap.values()];
  const regionCounts = new Map();
  const regionsByOutlet = new Map();
  for (const outlet of outlets) {
    addTo(regionCounts, outlet.region, 1);
    if (!regionsByOutlet.has(outlet.id)) regionsByOutlet.set(outlet.id, new Set());
    regionsByOutlet.get(outlet.id).add(outlet.region);
  }
  const outletRegionConflicts = [...regionsByOutlet.values()].filter(
    (regions) => regions.size > 1,
  ).length;

  for (const outlet of outlets) {
    const average = regionMap.get(outlet.region) / regionCounts.get(outlet.region);
    outlet.regionAverage = average;
    outlet.ratio = average > 0 ? outlet.net / average : null;
    outlet.tier = tierFor(outlet.ratio);
  }

  const sortedOutlets = [...outlets].sort((a, b) => a.net - b.net);
  const weakest = sortedOutlets.slice(0, 5);
  const hasCritical = weakest.some((outlet) => outlet.tier === 'CRITICAL');
  const criticalCount = outlets.filter((outlet) => outlet.tier === 'CRITICAL').length;

  const variantMap = new Map();
  for (const region of regions) {
    const key = region.name.trim().toUpperCase();
    if (!variantMap.has(key)) variantMap.set(key, []);
    variantMap.get(key).push(region.name);
  }
  const regionVariants = [...variantMap.values()].filter((names) => names.length > 1);

  const months = [...monthMap.keys()].sort();
  const monthSeries = months.map((month) => ({ month, net: monthMap.get(month) }));
  let growth = null;
  let nonConsecutiveMonths = false;
  let growthBaselineInvalid = false;
  if (months.length >= 2) {
    const previousKey = months[months.length - 2];
    const lastKey = months[months.length - 1];
    const previous = monthMap.get(previousKey);
    const last = monthMap.get(lastKey);
    nonConsecutiveMonths = monthIndex(lastKey) - monthIndex(previousKey) !== 1;
    if (nonConsecutiveMonths) {
      growth = null;
    } else if (previous <= 0) {
      growthBaselineInvalid = true;
    } else {
      growth = (last - previous) / previous;
    }
  }

  return {
    totals: {
      ...totals,
      invoices: hasInvoice ? invoiceSet.size : null,
      outlets: outlets.length,
      branches: branches === null ? null : branches.length,
    },
    regions,
    branches,
    outlets,
    weakest,
    hasCritical,
    months,
    monthSeries,
    growth,
    flags: {
      hasDate,
      hasBranch,
      hasInvoice,
      shareAvailable,
      singleMonth: months.length <= 1,
      singleRegion: regions.length <= 1,
      allOutletsEqual: outletsEqual(outlets, regionMap),
      negativeTotal: totals.net < 0,
      zeroTotal: totals.net === 0,
      negativeLines,
      negativeSum,
      missingSalesman,
      blankInvoices,
      nonConsecutiveMonths,
      growthBaselineInvalid,
      outletRegionConflicts,
    },
  };
}
