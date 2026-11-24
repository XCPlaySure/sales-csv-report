const idr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export function formatIDR(value) {
  const rounded = Math.round(value);
  return `${rounded < 0 ? '-' : ''}Rp ${idr.format(Math.abs(rounded))}`;
}

export function formatPct(ratio) {
  return `${(ratio * 100).toFixed(1).replace('.', ',')}%`;
}
