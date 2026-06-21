import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickTracker from './quick-tracker';

const mockAddEmission = vi.fn();
const mockAddLog = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/components/eco-provider', () => ({
  useEco: () => ({
    addEmission: mockAddEmission,
    addLog: mockAddLog,
  }),
}));

vi.mock('@/components/custom-select', () => ({
  CustomSelect: ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select
      data-testid="custom-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="select"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  ),
}));

describe('QuickTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the FAB button', () => {
    render(<QuickTracker />);
    expect(screen.getByTitle('Quick Footprint (Ctrl+K)')).toBeInTheDocument();
  });

  it('opens modal on click, allows input and submit', async () => {
    const user = userEvent.setup();
    render(<QuickTracker />);
    
    // Open modal
    const fab = screen.getByTitle('Quick Footprint (Ctrl+K)');
    await user.click(fab);
    
    // Check if modal is open
    expect(screen.getByText('Quick Footprint Record')).toBeInTheDocument();
    
    // Find input and type value
    const input = screen.getByPlaceholderText('0');
    await user.type(input, '10');
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /record footprint/i });
    await user.click(submitBtn);
    
    // Assert mocked functions were called correctly (Transport -> Public Transit -> 10km -> 0.5 emission)
    expect(mockAddEmission).toHaveBeenCalledWith(0.5, 'Transport');
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({
      category: 'Transport',
      emission: 0.5
    }));
  });

  it('handles 1-tap quick logs', async () => {
    const user = userEvent.setup();
    render(<QuickTracker />);
    
    await user.click(screen.getByTitle('Quick Footprint (Ctrl+K)'));
    
    const veganQuickBtn = screen.getByText(/Plant-Based/i);
    await user.click(veganQuickBtn);
    
    expect(mockAddEmission).toHaveBeenCalledWith(0.5, 'Food');
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({
      category: 'Food',
      emission: 0.5
    }));
  });

  it('closes modal on Close button click', async () => {
    const user = userEvent.setup();
    render(<QuickTracker />);
    
    // Open modal
    await user.click(screen.getByTitle('Quick Footprint (Ctrl+K)'));
    expect(screen.getByText('Quick Footprint Record')).toBeInTheDocument();
    
    // Find and click the close button (the one inside the header with X icon)
    // We can query by role 'button' since it's the first button inside the modal header,
    // or just find by a specific parent/class. Let's find by svg 'lucide-x' or aria-label if we added one.
    // It's safer to find the second button (first is the FAB).
    const buttons = screen.getAllByRole('button');
    // The close button is likely the second button rendered
    await user.click(buttons[1]);
    
    expect(screen.queryByText('Quick Footprint Record')).not.toBeInTheDocument();
  });

  it('allows switching to Food category and submitting', async () => {
    const user = userEvent.setup();
    render(<QuickTracker />);
    
    // Open modal
    await user.click(screen.getByTitle('Quick Footprint (Ctrl+K)'));
    
    // Switch to Food category
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[0], 'Food');
    
    // Switch subcategory to Beef/Lamb (High Impact) so we can predict the multiplier
    await user.selectOptions(selects[1], 'Beef / Lamb (High Impact)');
    
    // Find input and type value
    const input = screen.getByPlaceholderText('0');
    await user.type(input, '3');
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /record footprint/i });
    await user.click(submitBtn);
    
    // Beef/Lamb default -> 3 * 3.5 = 10.5
    expect(mockAddEmission).toHaveBeenCalledWith(10.5, 'Food');
  });
});
