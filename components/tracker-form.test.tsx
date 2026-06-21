import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackerForm } from './tracker-form';

const mockAddEmission = vi.fn();
const mockAddLog = vi.fn();
const mockDeleteLog = vi.fn();
const mockDeleteLogs = vi.fn();

vi.mock('@/components/eco-provider', () => ({
  useEco: () => ({
    addEmission: mockAddEmission,
    addLog: mockAddLog,
    deleteLog: mockDeleteLog,
    deleteLogs: mockDeleteLogs,
    logs: [],
  }),
}));

// CustomSelect uses framer-motion; mock it to avoid animation issues
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

describe('TrackerForm – Transport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the transport section', () => {
    render(<TrackerForm />);
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  it('Record Transport button is disabled when distance is empty', () => {
    render(<TrackerForm />);
    const btn = screen.getByRole('button', { name: /record transport/i });
    expect(btn).toBeDisabled();
  });

  it('enables and submits transport log with valid distance', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const input = screen.getByPlaceholderText('e.g. 15');
    await user.type(input, '10');
    const btn = screen.getByRole('button', { name: /record transport/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(mockAddEmission).toHaveBeenCalledWith(0.5, 'Transport');
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({ category: 'Transport' }));
  });

  it('shows eco-insight tips after logging transport', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    await user.type(screen.getByPlaceholderText('e.g. 15'), '10');
    await user.click(screen.getByRole('button', { name: /record transport/i }));
    await waitFor(() => {
      expect(screen.getByText(/Eco-Insights/i)).toBeInTheDocument();
    });
  });

  it('calculates zero emission for Bicycle mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[0], 'Bicycle / Walking');
    await user.type(screen.getByPlaceholderText('e.g. 15'), '10');
    await user.click(screen.getByRole('button', { name: /record transport/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(0, 'Transport');
  });

  it('calculates emission for Electric Vehicle mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[0], 'Electric Vehicle');
    await user.type(screen.getByPlaceholderText('e.g. 15'), '10');
    await user.click(screen.getByRole('button', { name: /record transport/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(0.8, 'Transport'); // 10 * 0.08
  });

  it('calculates emission for Gasoline Car mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[0], 'Gasoline Car');
    await user.type(screen.getByPlaceholderText('e.g. 15'), '10');
    await user.click(screen.getByRole('button', { name: /record transport/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(2, 'Transport'); // 10 * 0.2
  });

  it('calculates emission for Gasoline Car mode with long distance', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[0], 'Gasoline Car');
    await user.type(screen.getByPlaceholderText('e.g. 15'), '50');
    await user.click(screen.getByRole('button', { name: /record transport/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(10, 'Transport'); // 50 * 0.2
  });

  it('1-tap Metro quick action logs correctly', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    await user.click(screen.getByRole('button', { name: /metro/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(0.3, 'Transport');
  });
});

describe('TrackerForm – Food', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the food section', () => {
    render(<TrackerForm />);
    expect(screen.getByText('Food & Diet')).toBeInTheDocument();
  });

  it('Record Meal button is disabled when servings is empty', () => {
    render(<TrackerForm />);
    const btn = screen.getByRole('button', { name: /record meal/i });
    expect(btn).toBeDisabled();
  });

  it('enables and submits food log with valid servings', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const input = screen.getByPlaceholderText('e.g. 0');
    await user.type(input, '2');
    const btn = screen.getByRole('button', { name: /record meal/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(mockAddEmission).toHaveBeenCalledWith(1, 'Food'); // 2 * 0.5
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({ category: 'Food' }));
  });

  it('calculates emission for Vegetarian Meal mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[1], 'Vegetarian Meal');
    await user.type(screen.getByPlaceholderText('e.g. 0'), '2');
    await user.click(screen.getByRole('button', { name: /record meal/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(1.6, 'Food'); // 2 * 0.8
  });

  it('calculates emission for Chicken/Fish Meal mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[1], 'Chicken / Fish');
    await user.type(screen.getByPlaceholderText('e.g. 0'), '2');
    await user.click(screen.getByRole('button', { name: /record meal/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(3, 'Food'); // 2 * 1.5
  });

  it('calculates emission for Beef/Lamb Meal mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[1], 'Beef / Lamb (High Impact)');
    await user.type(screen.getByPlaceholderText('e.g. 0'), '2');
    await user.click(screen.getByRole('button', { name: /record meal/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(7, 'Food'); // 2 * 3.5
  });

  it('1-tap Plant-Based quick action logs correctly', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    await user.click(screen.getByRole('button', { name: /plant-based/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(0.5, 'Food');
  });
});

describe('TrackerForm – Energy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the energy section', () => {
    render(<TrackerForm />);
    expect(screen.getByText('Energy Source')).toBeInTheDocument();
  });

  it('Record Energy button is disabled when duration is empty', () => {
    render(<TrackerForm />);
    const btn = screen.getByRole('button', { name: /record energy/i });
    expect(btn).toBeDisabled();
  });

  it('enables and submits energy log with valid hours', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const input = screen.getByPlaceholderText('e.g. 4');
    await user.type(input, '5');
    const btn = screen.getByRole('button', { name: /record energy/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(mockAddEmission).toHaveBeenCalledWith(0.5, 'Energy'); // 5 * 0.1
    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({ category: 'Energy' }));
  });

  it('calculates emission for Energy Saving Mode', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[2], 'Energy Saving Mode Used');
    await user.type(screen.getByPlaceholderText('e.g. 4'), '5');
    await user.click(screen.getByRole('button', { name: /record energy/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(1.5, 'Energy'); // 5 * 0.3
  });

  it('calculates emission for Unplugged Unused Devices', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[2], 'Unplugged Unused Devices');
    await user.type(screen.getByPlaceholderText('e.g. 4'), '5');
    await user.click(screen.getByRole('button', { name: /record energy/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(0, 'Energy'); // 5 * 0
  });

  it('calculates emission for Standard Grid Power', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[2], 'Standard Grid Usage');
    await user.type(screen.getByPlaceholderText('e.g. 4'), '5');
    await user.click(screen.getByRole('button', { name: /record energy/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(3, 'Energy'); // 5 * 0.6
  });

  it('1-tap Unplug Devices quick action logs correctly (when selected manually)', async () => {
    const user = userEvent.setup();
    render(<TrackerForm />);
    // Select Unplugged first so the internal state matches the expected branch
    const selects = screen.getAllByTestId('custom-select');
    await user.selectOptions(selects[2], 'Unplugged Unused Devices');
    await user.click(screen.getByRole('button', { name: /unplug devices/i }));
    expect(mockAddEmission).toHaveBeenCalledWith(0, 'Energy');
  });
});
