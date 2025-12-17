/**
 * Input Component Tests
 *
 * Tests for the Input UI primitive component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      expect(screen.getByLabelText('Dish Name')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(
        <Input
          label="Dish Name"
          value=""
          onChange={() => {}}
          placeholder="Enter dish name"
        />
      );

      expect(screen.getByPlaceholderText('Enter dish name')).toBeInTheDocument();
    });

    it('renders with current value', () => {
      render(
        <Input label="Dish Name" value="Chicken" onChange={() => {}} />
      );

      expect(screen.getByDisplayValue('Chicken')).toBeInTheDocument();
    });

    it('has minimum 48px height for touch target', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('min-h-[48px]');
    });
  });

  describe('label and accessibility', () => {
    it('links label to input via htmlFor', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      const label = screen.getByText('Dish Name');
      const input = screen.getByRole('textbox');

      // Label should have htmlFor matching input id
      expect(label).toHaveAttribute('for');
      expect(input).toHaveAttribute('id', label.getAttribute('for'));
    });

    it('can be found by label text', () => {
      render(
        <Input label="My Label" value="" onChange={() => {}} />
      );

      // getByLabelText should work due to proper label linking
      expect(screen.getByLabelText('My Label')).toBeInTheDocument();
    });
  });

  describe('onChange', () => {
    it('calls onChange with new value when typing', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Input label="Dish Name" value="" onChange={handleChange} />
      );

      await user.type(screen.getByRole('textbox'), 'a');
      expect(handleChange).toHaveBeenCalledWith('a');
    });

    it('calls onChange for each character typed', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Input label="Dish Name" value="" onChange={handleChange} />
      );

      await user.type(screen.getByRole('textbox'), 'abc');
      expect(handleChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('error state', () => {
    it('does not show error by default', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error message when error prop is provided', () => {
      render(
        <Input
          label="Dish Name"
          value=""
          onChange={() => {}}
          error="Name is required"
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
    });

    it('applies error styling to input', () => {
      render(
        <Input
          label="Dish Name"
          value=""
          onChange={() => {}}
          error="Required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <Input
          label="Dish Name"
          value=""
          onChange={() => {}}
          error="Required"
        />
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('links error to input via aria-describedby', () => {
      render(
        <Input
          label="Dish Name"
          value=""
          onChange={() => {}}
          error="Required"
        />
      );

      const input = screen.getByRole('textbox');
      const error = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', error.id);
    });

    it('does not have aria-describedby when no error', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} disabled />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Input
          label="Dish Name"
          value=""
          onChange={handleChange}
          disabled
        />
      );

      // Attempt to type - should not trigger onChange
      await user.type(screen.getByRole('textbox'), 'test');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('autoFocus', () => {
    it('does not focus by default', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });

    it('focuses input when autoFocus is true', () => {
      render(
        <Input label="Dish Name" value="" onChange={() => {}} autoFocus />
      );

      expect(screen.getByRole('textbox')).toHaveFocus();
    });
  });

  describe('custom className', () => {
    it('merges custom className with default styles', () => {
      render(
        <Input
          label="Dish Name"
          value=""
          onChange={() => {}}
          className="custom-class"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('w-full'); // Still has default styles
    });
  });

  describe('keyboard interaction', () => {
    it('can receive focus via tab', async () => {
      const user = userEvent.setup();

      render(
        <Input label="Dish Name" value="" onChange={() => {}} />
      );

      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('supports typing text', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Input label="Dish Name" value="" onChange={handleChange} />
      );

      await user.type(screen.getByRole('textbox'), 'Hello');

      // Each keystroke calls onChange with the character typed
      // (since this is a controlled component with a static value prop,
      // each call receives just that character)
      expect(handleChange).toHaveBeenCalledTimes(5);
      expect(handleChange).toHaveBeenNthCalledWith(1, 'H');
      expect(handleChange).toHaveBeenNthCalledWith(2, 'e');
      expect(handleChange).toHaveBeenNthCalledWith(3, 'l');
      expect(handleChange).toHaveBeenNthCalledWith(4, 'l');
      expect(handleChange).toHaveBeenNthCalledWith(5, 'o');
    });
  });
});

