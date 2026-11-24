import { describe, it, expect } from 'vitest';
import { formatIDR, formatPct } from '../src/lib/format.js';

describe('formatIDR', () => {
  it('formats a positive amount with dot thousands', () => {
    expect(formatIDR(1728036900)).toBe('Rp 1.728.036.900');
  });

  it('formats zero', () => {
    expect(formatIDR(0)).toBe('Rp 0');
  });

  it('formats a negative amount', () => {
    expect(formatIDR(-1234567)).toBe('-Rp 1.234.567');
  });

  it('rounds to the nearest whole amount', () => {
    expect(formatIDR(1234.6)).toBe('Rp 1.235');
  });
});

describe('formatPct', () => {
  it('uses one decimal and a comma', () => {
    expect(formatPct(0.287)).toBe('28,7%');
  });

  it('formats zero', () => {
    expect(formatPct(0)).toBe('0,0%');
  });

  it('formats a negative ratio', () => {
    expect(formatPct(-0.5)).toBe('-50,0%');
  });
});
