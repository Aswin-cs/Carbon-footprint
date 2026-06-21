import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsightPage from './page';

vi.mock('@/components/eco-provider', () => ({
  useEco: () => ({
    logs: [
      { id: '1', date: new Date().toISOString(), category: 'Transport', emission: 5.0, message: 'Bus' },
    ],
    categoryEmissions: [
      { name: 'Transport', value: 5.0 },
      { name: 'Food', value: 2.0 },
      { name: 'Energy', value: 1.0 },
    ],
    weeklyEmissions: [
      { name: 'Mon', emissions: 5.0 },
      { name: 'Tue', emissions: 3.0 },
    ],
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: React.ComponentProps<'a'>) => <a href={href as string}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => <img {...props} alt={props.alt ?? ''} />,
}));

describe('Insight Page', () => {
  it('renders without crashing and shows the main heading', () => {
    render(<InsightPage />);
    expect(screen.getByText('Environmental Insights')).toBeInTheDocument();
  });

  it('renders the insight page subheading', () => {
    render(<InsightPage />);
    expect(screen.getByText(/Analyze the ecological footprints/i)).toBeInTheDocument();
  });

  it('renders the Personal Biosphere section', () => {
    render(<InsightPage />);
    expect(screen.getByTitle(/Show Biosphere Info/i)).toBeInTheDocument();
  });

  it('renders the TRANSPORT PLEDGES section', () => {
    render(<InsightPage />);
    expect(screen.getByText(/TRANSPORT PLEDGES/i)).toBeInTheDocument();
  });
});
