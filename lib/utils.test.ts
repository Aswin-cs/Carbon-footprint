import { describe, it, expect } from 'vitest';
import { cn, calculateCarbonEmissions } from './utils';

describe('cn utility function', () => {
  it('combines class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles falsy values and conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('handles tailwind merges correctly', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
  });
});

describe('calculateCarbonEmissions utility', () => {
  it('correctly calculates transportation carbon metrics', () => {
    const result = calculateCarbonEmissions('transportation', 10);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe('number');
    expect(result).toBe(2.0);
  });

  it('correctly calculates food carbon metrics', () => {
    const result = calculateCarbonEmissions('food', 2);
    expect(result).toBe(7.0);
  });

  it('returns 0 for negative or zero inputs', () => {
    expect(calculateCarbonEmissions('energy', -5)).toBe(0);
    expect(calculateCarbonEmissions('transportation', 0)).toBe(0);
  });
});
