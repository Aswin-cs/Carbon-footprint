import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from './navbar';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href as string} {...props}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('NavBar – desktop navigation', () => {
  it('renders all primary navigation links correctly', () => {
    render(<NavBar />);
    
    // Home links
    const homeLinks = screen.getAllByRole('link', { name: /home/i });
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(homeLinks[0]).toHaveAttribute('href', '/');

    // Tracker links
    const trackerLinks = screen.getAllByRole('link', { name: /tracker/i });
    expect(trackerLinks.length).toBeGreaterThan(0);
    const trackerLink = trackerLinks.find(l => l.getAttribute('href') === '/tracker');
    expect(trackerLink).toBeDefined();

    // Insight links
    const insightLinks = screen.getAllByRole('link', { name: /insights/i });
    expect(insightLinks.length).toBeGreaterThan(0);
    const insightLink = insightLinks.find(l => l.getAttribute('href') === '/insight');
    expect(insightLink).toBeDefined();

    // Achievement links
    const achievementLinks = screen.getAllByRole('link', { name: /achievements/i });
    expect(achievementLinks.length).toBeGreaterThan(0);
    const achievementLink = achievementLinks.find(l => l.getAttribute('href') === '/achievement');
    expect(achievementLink).toBeDefined();
  });

  it('renders the brand logo link', () => {
    render(<NavBar />);
    // EcoTrack brand link to /
    const brandLinks = screen.getAllByRole('link');
    const brandLink = brandLinks.find(l => l.getAttribute('href') === '/');
    expect(brandLink).toBeDefined();
  });

  it('renders the brand name', () => {
    render(<NavBar />);
    expect(screen.getByText('Carbon Footprint Tracker')).toBeInTheDocument();
  });
});

describe('NavBar – mobile menu', () => {
  it('renders the menu toggle button', () => {
    render(<NavBar />);
    expect(screen.getByTitle('Menu')).toBeInTheDocument();
  });

  it('opens the mobile menu on button click', async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    const menuBtn = screen.getByTitle('Menu');
    await user.click(menuBtn);
    // After opening, the modal portal creates a "Navigation" label
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('shows all mobile nav links when menu is open', async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    await user.click(screen.getByTitle('Menu'));
    expect(screen.getByText('Home Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tracker Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Insights & Tips')).toBeInTheDocument();
    // 'Achievements' appears in both desktop and mobile nav, so use getAllByText
    expect(screen.getAllByText('Achievements').length).toBeGreaterThanOrEqual(2);
  });

  it('closes the mobile menu when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    // Open menu
    await user.click(screen.getByTitle('Menu'));
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    // Find the close button inside the menu modal (not the hamburger toggle)
    // The menu modal has a button with an X icon after the "Navigation" label
    const closeButtons = screen.getAllByRole('button');
    // The second-to-last button within the modal is the close button (after Navigation label)
    // Let's find it by filtering - it's not the "Menu" button
    const closeBtn = closeButtons.find(btn => btn !== screen.getByTitle('Menu') && !btn.title);
    if (closeBtn) {
      await user.click(closeBtn);
    }
    // Menu should close
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });
});
