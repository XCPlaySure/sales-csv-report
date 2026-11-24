export const CRITICAL_PCT = 0.25;
export const LOW_PCT = 0.5;
export const BELOW_PCT = 1;

export function tierFor(ratio) {
  if (!Number.isFinite(ratio)) return 'OK';
  if (ratio < CRITICAL_PCT) return 'CRITICAL';
  if (ratio < LOW_PCT) return 'LOW';
  if (ratio < BELOW_PCT) return 'BELOW';
  return 'OK';
}
