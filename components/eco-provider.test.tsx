import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { EcoProvider, useEco } from './eco-provider';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const TestComponent = () => {
  const { 
    addEmission, 
    weeklyEmissions, 
    categoryEmissions, 
    logs, 
    addLog 
  } = useEco();

  return (
    <div>
      <button data-testid="add-emission-btn" onClick={() => addEmission(10, 'Transport')}>
        Add Transport Emission
      </button>
      <button data-testid="add-log-btn" onClick={() => addLog({ category: 'Transport', emission: 10, message: 'Logged Transport' })}>
        Add Log
      </button>
      <div data-testid="total-logs">{logs.length}</div>
      <div data-testid="transport-category-emission">
        {categoryEmissions.find(c => c.name === 'Transport')?.value}
      </div>
    </div>
  );
};

describe('EcoProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('provides default emissions and updates them via addEmission', () => {
    render(
      <EcoProvider>
        <TestComponent />
      </EcoProvider>
    );

    expect(screen.getByTestId('transport-category-emission').textContent).toBe('0');

    act(() => {
      screen.getByTestId('add-emission-btn').click();
    });

    expect(screen.getByTestId('transport-category-emission').textContent).toBe('10');
  });

  it('updates logs list via addLog', () => {
    render(
      <EcoProvider>
        <TestComponent />
      </EcoProvider>
    );

    expect(screen.getByTestId('total-logs').textContent).toBe('0');

    act(() => {
      screen.getByTestId('add-log-btn').click();
    });

    expect(screen.getByTestId('total-logs').textContent).toBe('1');
  });
});
