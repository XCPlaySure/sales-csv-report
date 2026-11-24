export function formatIDR(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded));
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${grouped}`;
}

export function formatPct(ratio) {
  return `${(ratio * 100).toFixed(1).replace('.', ',')}%`;
}
