import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomSelect } from './custom-select';

describe('CustomSelect', () => {
  const options = ['Option 1', 'Option 2', 'Option 3'];
  const mockOnChange = vi.fn();

  it('renders with placeholder when no value is provided', () => {
    render(<CustomSelect value="" onChange={mockOnChange} options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders with selected value', () => {
    render(<CustomSelect value="Option 2" onChange={mockOnChange} options={options} />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<CustomSelect value="" onChange={mockOnChange} options={options} placeholder="Select an option" />);
    
    const trigger = screen.getByRole('combobox');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    await user.click(trigger);
    
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    // Check if options are rendered
    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('calls onChange and closes dropdown when an option is selected', async () => {
    const user = userEvent.setup();
    render(<CustomSelect value="" onChange={mockOnChange} options={options} placeholder="Select an option" />);
    
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    
    const optionButton = screen.getByText('Option 3');
    await user.click(optionButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('Option 3');
    
    // Using queryByRole because Framer Motion might delay removal, but it should be starting to exit
    // Wait for exit animation or just check if it's no longer expanded
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <CustomSelect value="" onChange={mockOnChange} options={options} placeholder="Select an option" />
      </div>
    );
    
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    await user.click(screen.getByTestId('outside'));
    
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
