/**
 * DishTypeSelector Component Tests
 *
 * Tests for the segmented control used to select dish type.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DishTypeSelector } from '@/components/meals/DishTypeSelector';

describe('DishTypeSelector', () => {
  describe('rendering', () => {
    it('renders all three options', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      expect(screen.getByRole('radio', { name: 'Entree' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Side Dish' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Other' })).toBeInTheDocument();
    });

    it('renders a label', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('has radiogroup role for accessibility', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      expect(screen.getByRole('radiogroup', { name: 'Dish type' })).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('shows entree as selected when value is entree', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      const entreeButton = screen.getByRole('radio', { name: 'Entree' });
      expect(entreeButton).toHaveAttribute('aria-checked', 'true');
      expect(entreeButton).toHaveClass('bg-amber-500');
    });

    it('shows side as selected when value is side', () => {
      render(
        <DishTypeSelector value="side" onChange={() => {}} />
      );

      const sideButton = screen.getByRole('radio', { name: 'Side Dish' });
      expect(sideButton).toHaveAttribute('aria-checked', 'true');
      expect(sideButton).toHaveClass('bg-amber-500');
    });

    it('shows other as selected when value is other', () => {
      render(
        <DishTypeSelector value="other" onChange={() => {}} />
      );

      const otherButton = screen.getByRole('radio', { name: 'Other' });
      expect(otherButton).toHaveAttribute('aria-checked', 'true');
      expect(otherButton).toHaveClass('bg-amber-500');
    });

    it('shows unselected options with unselected styles', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      const sideButton = screen.getByRole('radio', { name: 'Side Dish' });
      const otherButton = screen.getByRole('radio', { name: 'Other' });

      expect(sideButton).toHaveAttribute('aria-checked', 'false');
      expect(sideButton).toHaveClass('bg-stone-100');

      expect(otherButton).toHaveAttribute('aria-checked', 'false');
      expect(otherButton).toHaveClass('bg-stone-100');
    });
  });

  describe('interaction', () => {
    it('calls onChange with entree when Entree is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="side" onChange={handleChange} />
      );

      await user.click(screen.getByRole('radio', { name: 'Entree' }));
      expect(handleChange).toHaveBeenCalledWith('entree');
    });

    it('calls onChange with side when Side Dish is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={handleChange} />
      );

      await user.click(screen.getByRole('radio', { name: 'Side Dish' }));
      expect(handleChange).toHaveBeenCalledWith('side');
    });

    it('calls onChange with other when Other is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={handleChange} />
      );

      await user.click(screen.getByRole('radio', { name: 'Other' }));
      expect(handleChange).toHaveBeenCalledWith('other');
    });

    it('calls onChange even when clicking already selected option', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={handleChange} />
      );

      await user.click(screen.getByRole('radio', { name: 'Entree' }));
      expect(handleChange).toHaveBeenCalledWith('entree');
    });
  });

  describe('disabled state', () => {
    it('disables all options when disabled is true', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} disabled />
      );

      expect(screen.getByRole('radio', { name: 'Entree' })).toBeDisabled();
      expect(screen.getByRole('radio', { name: 'Side Dish' })).toBeDisabled();
      expect(screen.getByRole('radio', { name: 'Other' })).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={handleChange} disabled />
      );

      await user.click(screen.getByRole('radio', { name: 'Side Dish' }));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('all options have minimum 44px touch target', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      const options = screen.getAllByRole('radio');
      options.forEach((option) => {
        expect(option).toHaveClass('min-h-[44px]');
      });
    });

    it('options are keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      // Tab to first option
      await user.tab();
      expect(screen.getByRole('radio', { name: 'Entree' })).toHaveFocus();

      // Tab to second option
      await user.tab();
      expect(screen.getByRole('radio', { name: 'Side Dish' })).toHaveFocus();

      // Tab to third option
      await user.tab();
      expect(screen.getByRole('radio', { name: 'Other' })).toHaveFocus();
    });

    it('can select option with Enter key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={handleChange} />
      );

      await user.tab();
      await user.tab(); // Focus on Side Dish
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith('side');
    });

    it('can select option with Space key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <DishTypeSelector value="entree" onChange={handleChange} />
      );

      await user.tab();
      await user.tab();
      await user.tab(); // Focus on Other
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith('other');
    });
  });

  describe('button type', () => {
    it('all options have type="button" to prevent form submission', () => {
      render(
        <DishTypeSelector value="entree" onChange={() => {}} />
      );

      const options = screen.getAllByRole('radio');
      options.forEach((option) => {
        expect(option).toHaveAttribute('type', 'button');
      });
    });
  });
});

