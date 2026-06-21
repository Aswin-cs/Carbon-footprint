import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tracker from './page';

vi.mock('@/components/eco-provider', () => ({
  useEco: () => ({
    addEmission: vi.fn(),
    logs: [],
    addLog: vi.fn(),
    deleteLog: vi.fn(),
    deleteLogs: vi.fn(),
  }),
}));

vi.mock('@/components/tracker-form', () => ({
  TrackerForm: () => <div data-testid="tracker-form">TrackerForm</div>,
}));

describe('Tracker Page', () => {
  it('renders without crashing and shows the main heading', () => {
    render(<Tracker />);
    expect(screen.getByText('Carbon Tracker')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<Tracker />);
    expect(screen.getByText(/Record your daily activities to track your carbon footprint/i)).toBeInTheDocument();
  });

  it('renders the TrackerForm component', () => {
    render(<Tracker />);
    expect(screen.getByTestId('tracker-form')).toBeInTheDocument();
  });
});
