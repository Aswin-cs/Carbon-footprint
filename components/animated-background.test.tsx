import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AnimatedBackground from './animated-background';

vi.mock('framer-motion', () => ({
  motion: {
    div: (props: React.ComponentProps<'div'>) => <div data-testid="animated-bg" className={props.className} />,
  },
}));

describe('AnimatedBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<AnimatedBackground />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders a div with testid', () => {
    const { getByTestId } = render(<AnimatedBackground />);
    expect(getByTestId('animated-bg')).toBeInTheDocument();
  });

  it('has pointer-events-none class for non-interactive behavior', () => {
    const { getByTestId } = render(<AnimatedBackground />);
    expect(getByTestId('animated-bg').className).toContain('pointer-events-none');
  });
});
