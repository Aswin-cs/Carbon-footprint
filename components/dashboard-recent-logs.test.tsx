import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardRecentLogs } from './dashboard-recent-logs';
import type { LogEntry } from '@/components/eco-provider';

vi.mock('@/components/custom-select', () => ({
  CustomSelect: ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="filter-category"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  ),
}));

const sampleLogs: LogEntry[] = [
  { id: '1', date: new Date('2024-01-15T10:00:00').toISOString(), category: 'Transport', emission: 2.5, message: 'Bus ride' },
  { id: '2', date: new Date('2024-01-15T12:00:00').toISOString(), category: 'Food', emission: 1.0, message: 'Vegan lunch' },
  { id: '3', date: new Date('2024-01-15T18:00:00').toISOString(), category: 'Energy', emission: 0.6, message: 'Solar energy' },
];

const defaultProps = {
  logs: sampleLogs,
  hasRealData: true,
  selectedDay: null,
  filterCategory: 'All Categories',
  setFilterCategory: vi.fn(),
  deleteLogs: vi.fn(),
};

describe('DashboardRecentLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Footprint Log heading', () => {
    render(<DashboardRecentLogs {...defaultProps} />);
    expect(screen.getByText('Footprint Log')).toBeInTheDocument();
  });

  it('renders all logs in the table', () => {
    render(<DashboardRecentLogs {...defaultProps} />);
    // Each category name appears in the table
    expect(screen.getAllByText('Transport').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Food').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Energy').length).toBeGreaterThan(0);
  });

  it('shows empty state message when no real data logs exist and passes real empty logs', () => {
    // When hasRealData=true but logs=[], the real-data path shows the empty message
    render(<DashboardRecentLogs {...defaultProps} logs={[]} hasRealData={true} />);
    expect(screen.getByText(/No carbon footprints recorded yet/i)).toBeInTheDocument();
  });

  it('shows "Export JSON" button when logs exist', () => {
    render(<DashboardRecentLogs {...defaultProps} />);
    expect(screen.getByTitle(/download json/i)).toBeInTheDocument();
  });

  it('shows selected day heading when a day is selected', () => {
    render(<DashboardRecentLogs {...defaultProps} selectedDay="Mon" />);
    expect(screen.getByText("Mon's Footprints")).toBeInTheDocument();
  });

  it('shows Delete Selected button when rows are selected and calls deleteLogs', async () => {
    const user = userEvent.setup();
    const deleteLogs = vi.fn();
    render(<DashboardRecentLogs {...defaultProps} deleteLogs={deleteLogs} />);

    // Select all via the desktop table "select all" checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // select all
    
    const deleteBtn = screen.getByRole('button', { name: /delete selected/i });
    expect(deleteBtn).toBeInTheDocument();
    await user.click(deleteBtn);
    // deleteLogs is called with all IDs (order matches filteredAndSortedLogs which sorts by date desc)
    expect(deleteLogs).toHaveBeenCalledWith(expect.arrayContaining(['1', '2', '3']));
    expect(deleteLogs).toHaveBeenCalledTimes(1);
  });

  it('filters logs by category via CustomSelect', async () => {
    const user = userEvent.setup();
    const setFilterCategory = vi.fn();
    render(<DashboardRecentLogs {...defaultProps} setFilterCategory={setFilterCategory} />);
    const select = screen.getByRole('combobox', { name: /filter-category/i });
    await user.selectOptions(select, 'Transport');
    expect(setFilterCategory).toHaveBeenCalledWith('Transport');
  });

  it('shows mock log data when there is no real data (auto-generates sample logs)', () => {
    render(<DashboardRecentLogs {...defaultProps} logs={[]} hasRealData={false} />);
    // The component generates mock logs internally when hasRealData=false, so the table should show
    // and NOT show the "no carbon footprints" message
    expect(screen.queryByText(/No carbon footprints recorded yet/i)).not.toBeInTheDocument();
    // Mock logs contain sample data
    expect(screen.getAllByText('Transport').length).toBeGreaterThan(0);
  });
});
