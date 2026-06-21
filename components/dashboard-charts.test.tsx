import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardCharts } from './dashboard-charts';

// Mock recharts entirely so no SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <g>{children}</g>,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <g>{children}</g>,
  Cell: () => null,
  Legend: () => null,
}));

const defaultProps = {
  chartMode: 'total' as const,
  setChartMode: vi.fn(),
  selectedDay: null,
  setSelectedDay: vi.fn(),
  chartData: [
    { name: 'Mon', emissions: 5.0 },
    { name: 'Tue', emissions: 8.0 },
  ],
  displayCategoryEmissions: [
    { name: 'Transport', value: 10 },
    { name: 'Food', value: 5 },
  ],
  hasRealData: true,
  filterCategory: 'All Categories',
  setFilterCategory: vi.fn(),
};

describe('DashboardCharts', () => {
  it('renders weekly emissions heading in total mode', () => {
    render(<DashboardCharts {...defaultProps} />);
    expect(screen.getByText('Weekly Emissions')).toBeInTheDocument();
  });

  it('renders weekly trends heading in weekly mode', () => {
    render(<DashboardCharts {...defaultProps} chartMode="weekly" />);
    expect(screen.getByText('Weekly Trends')).toBeInTheDocument();
  });

  it('renders "Emissions by Category" heading when no day selected', () => {
    render(<DashboardCharts {...defaultProps} />);
    expect(screen.getByText("Emissions by Category")).toBeInTheDocument();
  });

  it('renders selected day heading when a day is selected', () => {
    render(<DashboardCharts {...defaultProps} selectedDay="Mon" />);
    expect(screen.getByText("Mon's Emissions")).toBeInTheDocument();
  });

  it('shows Sample badge when no real data', () => {
    render(<DashboardCharts {...defaultProps} hasRealData={false} />);
    expect(screen.getByText('Sample')).toBeInTheDocument();
    expect(screen.getByText('Sample Data')).toBeInTheDocument();
  });

  it('switches to Weekly chart mode on button click', async () => {
    const user = userEvent.setup();
    const setChartMode = vi.fn();
    render(<DashboardCharts {...defaultProps} setChartMode={setChartMode} />);
    await user.click(screen.getByRole('button', { name: /weekly/i }));
    expect(setChartMode).toHaveBeenCalledWith('weekly');
  });

  it('switches to Total chart mode on button click', async () => {
    const user = userEvent.setup();
    const setChartMode = vi.fn();
    render(<DashboardCharts {...defaultProps} chartMode="weekly" setChartMode={setChartMode} />);
    await user.click(screen.getByRole('button', { name: /total/i }));
    expect(setChartMode).toHaveBeenCalledWith('total');
  });

  it('shows and clears day filter badge when a day is selected', async () => {
    const user = userEvent.setup();
    const setSelectedDay = vi.fn();
    render(<DashboardCharts {...defaultProps} selectedDay="Tue" setSelectedDay={setSelectedDay} />);
    // Multiple elements contain 'Tue' (badge + heading), so use getAllByText and click the badge span
    const badges = screen.getAllByText(/Tue/);
    const badge = badges.find(el => el.tagName.toLowerCase() === 'span')!;
    expect(badge).toBeInTheDocument();
    await user.click(badge);
    expect(setSelectedDay).toHaveBeenCalledWith(null);
  });
});
