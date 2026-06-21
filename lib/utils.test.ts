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

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined and null-like values', () => {
    expect(cn(undefined, null as unknown as string, 'valid')).toBe('valid');
  });

  it('handles array of classes', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });

  it('handles object form (conditional object)', () => {
    expect(cn({ 'text-red-500': true, 'text-green-500': false })).toBe('text-red-500');
  });
});

describe('calculateCarbonEmissions utility', () => {
  it('correctly calculates transportation carbon metrics', () => {
    const result = calculateCarbonEmissions('transportation', 10);
    expect(result).toBe(2.0);
  });

  it('correctly calculates transport (short alias) carbon metrics', () => {
    const result = calculateCarbonEmissions('transport', 10);
    expect(result).toBe(2.0);
  });

  it('correctly calculates food carbon metrics', () => {
    const result = calculateCarbonEmissions('food', 2);
    expect(result).toBe(7.0);
  });

  it('correctly calculates energy carbon metrics', () => {
    const result = calculateCarbonEmissions('energy', 5);
    expect(result).toBe(3.0);
  });

  it('is case-insensitive for category name', () => {
    expect(calculateCarbonEmissions('FOOD', 2)).toBe(7.0);
    expect(calculateCarbonEmissions('Transportation', 10)).toBe(2.0);
  });

  it('returns 0 for negative inputs', () => {
    expect(calculateCarbonEmissions('energy', -5)).toBe(0);
  });

  it('returns 0 for zero input', () => {
    expect(calculateCarbonEmissions('transportation', 0)).toBe(0);
  });

  it('returns 0 for unknown category', () => {
    expect(calculateCarbonEmissions('unknown-category', 10)).toBe(0);
  });

  it('handles decimal values correctly', () => {
    const result = calculateCarbonEmissions('food', 1.5);
    expect(result).toBe(5.3); // 1.5 * 3.5 = 5.25 -> toFixed(1) = 5.3
  });

  it('returns a number type', () => {
    expect(typeof calculateCarbonEmissions('transport', 5)).toBe('number');
  });
});
