import { describe, it, expect } from 'vitest';
import { tierFor } from '../src/lib/tiers.js';

describe('tierFor', () => {
  it('tags below 25% as CRITICAL', () => {
    expect(tierFor(0.1)).toBe('CRITICAL');
  });

  it('tags 25% to below 50% as LOW', () => {
    expect(tierFor(0.25)).toBe('LOW');
    expect(tierFor(0.49)).toBe('LOW');
  });

  it('tags 50% to below 100% as BELOW', () => {
    expect(tierFor(0.5)).toBe('BELOW');
    expect(tierFor(0.99)).toBe('BELOW');
  });

  it('tags 100% and above as OK', () => {
    expect(tierFor(1)).toBe('OK');
    expect(tierFor(2)).toBe('OK');
  });

  it('treats non-finite ratios as OK', () => {
    expect(tierFor(NaN)).toBe('OK');
    expect(tierFor(Infinity)).toBe('OK');
    expect(tierFor(null)).toBe('OK');
  });
});
