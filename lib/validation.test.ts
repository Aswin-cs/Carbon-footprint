import { describe, it, expect } from 'vitest';
import { ActivityInputSchema } from './validation';

describe('ActivityInputSchema', () => {
  // --- Valid cases ---
  it('validates a correct Transport input', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 10.5, label: 'Bus Ride' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.category).toBe('Transport');
  });

  it('validates a correct Food input', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Food', value: 2, label: 'Vegan Meal' });
    expect(result.success).toBe(true);
  });

  it('validates a correct Energy input', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Energy', value: 5, label: 'Solar Power' });
    expect(result.success).toBe(true);
  });

  it('validates lowercase "transportation" category', () => {
    const result = ActivityInputSchema.safeParse({ category: 'transportation', value: 5, label: 'Drive' });
    expect(result.success).toBe(true);
  });

  it('validates lowercase "food" category', () => {
    const result = ActivityInputSchema.safeParse({ category: 'food', value: 1, label: 'Lunch' });
    expect(result.success).toBe(true);
  });

  it('validates lowercase "energy" category', () => {
    const result = ActivityInputSchema.safeParse({ category: 'energy', value: 2, label: 'Lights' });
    expect(result.success).toBe(true);
  });

  it('accepts a label up to 100 characters', () => {
    const label = 'A'.repeat(100);
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 1, label });
    expect(result.success).toBe(true);
  });

  // --- Invalid cases ---
  it('fails if value is 0', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 0, label: 'Walk' });
    expect(result.success).toBe(false);
  });

  it('fails if value is negative', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: -5, label: 'Reverse' });
    expect(result.success).toBe(false);
  });

  it('fails if label is empty', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 10, label: '' });
    expect(result.success).toBe(false);
  });

  it('fails if label exceeds 100 characters', () => {
    const label = 'A'.repeat(101);
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 10, label });
    expect(result.success).toBe(false);
  });

  it('fails if category is invalid', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Unknown', value: 10, label: 'Test' });
    expect(result.success).toBe(false);
  });

  it('fails if value is not a number', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 'ten', label: 'Drive' });
    expect(result.success).toBe(false);
  });

  it('fails if label is missing', () => {
    const result = ActivityInputSchema.safeParse({ category: 'Transport', value: 10 });
    expect(result.success).toBe(false);
  });

  it('fails if category is missing', () => {
    const result = ActivityInputSchema.safeParse({ value: 10, label: 'Test' });
    expect(result.success).toBe(false);
  });

  it('fails if entire object is empty', () => {
    const result = ActivityInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('fails for null input', () => {
    const result = ActivityInputSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  // --- XSS sanitization ---
  it('strips XSS characters < and > from the label', () => {
    const result = ActivityInputSchema.safeParse({
      category: 'Transport',
      value: 10,
      label: '<script>alert("xss")</script>',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe('scriptalert("xss")/script');
      expect(result.data.label).not.toContain('<');
      expect(result.data.label).not.toContain('>');
    }
  });

  it('does not strip non-special characters', () => {
    const label = 'Clean label with spaces & numbers 123';
    const result = ActivityInputSchema.safeParse({ category: 'Food', value: 1, label });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe(label);
    }
  });
});
