import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Economy from './page';

const mockRedeemReward = vi.fn();

vi.mock('@/components/eco-provider', () => ({
  useEco: () => ({
    logs: [],
    redeemedRewards: [],
    redeemReward: mockRedeemReward,
    currentStreak: 0,
    earnedBadgesMap: {},
  }),
}));

describe('Achievement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and shows the main heading', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText('Initiatives & Badges')).toBeInTheDocument();
  });

  it('renders the page description', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText(/Support eco-initiatives and earn unique impact badges/i)).toBeInTheDocument();
  });

  it('renders the Community Initiatives section', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText('Community Initiatives')).toBeInTheDocument();
  });

  it('renders all 4 reward names', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText('Plant 1 Tree')).toBeInTheDocument();
    expect(screen.getByText('Clean 10L Water')).toBeInTheDocument();
    expect(screen.getByText('Solar Project')).toBeInTheDocument();
    expect(screen.getByText('Wind Energy')).toBeInTheDocument();
  });

  it('renders all Support Initiative buttons enabled when nothing is redeemed', async () => {
    render(<Economy />);
    await act(async () => {});
    const buttons = screen.getAllByRole('button', { name: /Support Initiative/i });
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    buttons.forEach(btn => expect(btn).not.toBeDisabled());
  });

  it('renders the Your Badges section', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText('Your Badges')).toBeInTheDocument();
  });

  it('renders the First Step badge', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getAllByText('First Step').length).toBeGreaterThan(0);
  });

  it('renders the Daily Starter badge', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText('Daily Starter')).toBeInTheDocument();
  });

  it('renders Achievements Timeline heading', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText('Achievements Timeline')).toBeInTheDocument();
  });

  it('shows "Start your timeline" message when no badges are active', async () => {
    render(<Economy />);
    await act(async () => {});
    expect(screen.getByText(/Complete your first action to start your timeline/i)).toBeInTheDocument();
  });

  it('calls redeemReward when Support Initiative is clicked', async () => {
    const user = userEvent.setup();
    render(<Economy />);
    await act(async () => {});
    const buttons = screen.getAllByRole('button', { name: /Support Initiative/i });
    await user.click(buttons[0]);
    expect(mockRedeemReward).toHaveBeenCalledTimes(1);
    expect(mockRedeemReward).toHaveBeenCalledWith(expect.any(String));
  });

  it('shows confetti message immediately after clicking Support Initiative', async () => {
    const user = userEvent.setup();
    render(<Economy />);
    await act(async () => {});
    const buttons = screen.getAllByRole('button', { name: /Support Initiative/i });
    await user.click(buttons[0]);
    // After click, confetti UI should briefly appear
    expect(screen.getByText(/Success/i)).toBeInTheDocument();
  });

  it('renders progress bars for inactive badges', async () => {
    render(<Economy />);
    await act(async () => {});
    // All badges are inactive with empty logs/streak, so progress should be shown
    expect(screen.getAllByText('Progress').length).toBeGreaterThan(0);
  });
});
