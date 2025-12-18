/**
 * DaySlot Component Tests
 *
 * Tests for the day slot component used in meal plan week view.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DaySlot } from '@/components/meals/DaySlot';
import { type Dish } from '@/types';

/**
 * Factory for creating test dishes
 */
function createTestDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: 'test-dish-1',
    name: 'Grilled Chicken',
    type: 'entree',
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z',
    ...overrides,
  };
}

describe('DaySlot', () => {
  const defaultProps = {
    date: '2024-12-16', // Monday
    dishes: [],
    onClick: vi.fn(),
  };

  describe('rendering', () => {
    it('renders the day name', () => {
      render(<DaySlot {...defaultProps} />);
      expect(screen.getByText('Mon')).toBeInTheDocument();
    });

    it('renders the day number', () => {
      render(<DaySlot {...defaultProps} />);
      expect(screen.getByText('16')).toBeInTheDocument();
    });

    it('renders different day names correctly', () => {
      const { rerender } = render(<DaySlot {...defaultProps} date="2024-12-17" />);
      expect(screen.getByText('Tue')).toBeInTheDocument();

      rerender(<DaySlot {...defaultProps} date="2024-12-20" />);
      expect(screen.getByText('Fri')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state message when no dishes', () => {
      render(<DaySlot {...defaultProps} dishes={[]} />);
      expect(screen.getByText('Tap to add dishes')).toBeInTheDocument();
    });

    it('includes plate emoji in empty state', () => {
      render(<DaySlot {...defaultProps} dishes={[]} />);
      expect(screen.getByText('🍽️')).toBeInTheDocument();
    });
  });

  describe('with dishes', () => {
    it('renders dish names', () => {
      const dishes = [
        createTestDish({ id: '1', name: 'Chicken' }),
        createTestDish({ id: '2', name: 'Rice', type: 'side' }),
      ];
      render(<DaySlot {...defaultProps} dishes={dishes} />);

      expect(screen.getByText('Chicken')).toBeInTheDocument();
      expect(screen.getByText('Rice')).toBeInTheDocument();
    });

    it('shows only first 3 dishes', () => {
      const dishes = [
        createTestDish({ id: '1', name: 'Dish 1' }),
        createTestDish({ id: '2', name: 'Dish 2' }),
        createTestDish({ id: '3', name: 'Dish 3' }),
        createTestDish({ id: '4', name: 'Dish 4' }),
      ];
      render(<DaySlot {...defaultProps} dishes={dishes} />);

      expect(screen.getByText('Dish 1')).toBeInTheDocument();
      expect(screen.getByText('Dish 2')).toBeInTheDocument();
      expect(screen.getByText('Dish 3')).toBeInTheDocument();
      expect(screen.queryByText('Dish 4')).not.toBeInTheDocument();
    });

    it('shows "+N more" when more than 3 dishes', () => {
      const dishes = [
        createTestDish({ id: '1', name: 'Dish 1' }),
        createTestDish({ id: '2', name: 'Dish 2' }),
        createTestDish({ id: '3', name: 'Dish 3' }),
        createTestDish({ id: '4', name: 'Dish 4' }),
        createTestDish({ id: '5', name: 'Dish 5' }),
      ];
      render(<DaySlot {...defaultProps} dishes={dishes} />);

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('does not show "+N more" with 3 or fewer dishes', () => {
      const dishes = [
        createTestDish({ id: '1', name: 'Dish 1' }),
        createTestDish({ id: '2', name: 'Dish 2' }),
        createTestDish({ id: '3', name: 'Dish 3' }),
      ];
      render(<DaySlot {...defaultProps} dishes={dishes} />);

      expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    });
  });

  describe('today highlighting', () => {
    it('shows "Today" label when isToday is true', () => {
      render(<DaySlot {...defaultProps} isToday />);
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('does not show "Today" label when isToday is false', () => {
      render(<DaySlot {...defaultProps} isToday={false} />);
      expect(screen.queryByText('Today')).not.toBeInTheDocument();
    });

    it('applies amber styling to day number when today', () => {
      render(<DaySlot {...defaultProps} isToday />);
      const dayNumber = screen.getByText('16');
      expect(dayNumber).toHaveClass('bg-amber-500', 'text-white');
    });

    it('applies amber styling to day name when today', () => {
      render(<DaySlot {...defaultProps} isToday />);
      const dayName = screen.getByText('Mon');
      expect(dayName).toHaveClass('text-amber-600');
    });
  });

  describe('interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<DaySlot {...defaultProps} onClick={onClick} />);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is a button element', () => {
      render(<DaySlot {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible label with day and dish count', () => {
      const dishes = [createTestDish({ id: '1', name: 'Chicken' })];
      render(<DaySlot {...defaultProps} dishes={dishes} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Mon 16, 1 dishes assigned'
      );
    });

    it('has accessible label for empty day', () => {
      render(<DaySlot {...defaultProps} dishes={[]} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Mon 16, no dishes assigned'
      );
    });
  });

  describe('dish type indicators', () => {
    it('shows amber dot for entree', () => {
      const dishes = [createTestDish({ type: 'entree' })];
      const { container } = render(<DaySlot {...defaultProps} dishes={dishes} />);

      // Find the dot element (first one in the dish row)
      const dot = container.querySelector('.bg-amber-400');
      expect(dot).toBeInTheDocument();
    });

    it('shows emerald dot for side dish', () => {
      const dishes = [createTestDish({ type: 'side' })];
      const { container } = render(<DaySlot {...defaultProps} dishes={dishes} />);

      const dot = container.querySelector('.bg-emerald-400');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('has minimum height for touch target', () => {
      render(<DaySlot {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[80px]');
    });

    it('has border highlighting when today', () => {
      render(<DaySlot {...defaultProps} isToday />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-amber-400');
    });

    it('has default border when not today', () => {
      render(<DaySlot {...defaultProps} isToday={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-stone-200');
    });
  });
});

