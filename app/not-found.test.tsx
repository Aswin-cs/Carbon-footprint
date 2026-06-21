import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

// Mock framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: React.ComponentProps<'div'>) => <div className={className}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: React.ComponentProps<'a'>) => <a href={href as string}>{children}</a>,
}));

describe('NotFound Page', () => {
  it('renders without crashing', () => {
    render(<NotFound />);
    expect(document.body).toBeTruthy();
  });

  it('shows the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('shows "Lost in the Wilderness" subheading', () => {
    render(<NotFound />);
    expect(screen.getByText('Lost in the Wilderness')).toBeInTheDocument();
  });

  it('renders the Return to Dashboard link pointing to /', () => {
    render(<NotFound />);
    const homeLink = screen.getByRole('link', { name: /Return to Dashboard/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders the Go Back button', () => {
    render(<NotFound />);
    expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument();
  });

  it('renders the Eco Tip section', () => {
    render(<NotFound />);
    expect(screen.getByText('Eco Tip')).toBeInTheDocument();
    expect(screen.getByText(/Running a web search produces/i)).toBeInTheDocument();
  });
});
