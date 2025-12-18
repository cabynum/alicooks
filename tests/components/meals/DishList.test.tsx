/**
 * DishList Component Tests
 *
 * Tests for the list that displays dishes or empty state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DishList } from '@/components/meals/DishList';
import { type Dish } from '@/types';

/**
 * Factory for creating test dishes
 */
function createTestDish(overrides: Partial<Dish> = {}): Dish {
  const id = overrides.id || `dish-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    name: 'Test Dish',
    type: 'entree',
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z',
    ...overrides,
  };
}

describe('DishList', () => {
  describe('empty state', () => {
    it('shows empty state when dishes array is empty', () => {
      render(<DishList dishes={[]} />);

      expect(screen.getByText('No dishes yet')).toBeInTheDocument();
    });

    it('shows default empty message', () => {
      render(<DishList dishes={[]} />);

      expect(
        screen.getByText('Add your first dish to start building your meal collection.')
      ).toBeInTheDocument();
    });

    it('shows custom empty title when provided', () => {
      render(<DishList dishes={[]} emptyTitle="Nothing here" />);

      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('shows custom empty message when provided', () => {
      render(<DishList dishes={[]} emptyMessage="Custom message here" />);

      expect(screen.getByText('Custom message here')).toBeInTheDocument();
    });

    it('shows Add a Dish button when onAddClick is provided', () => {
      render(<DishList dishes={[]} onAddClick={() => {}} />);

      expect(screen.getByRole('button', { name: 'Add a Dish' })).toBeInTheDocument();
    });

    it('does not show Add button when onAddClick is not provided', () => {
      render(<DishList dishes={[]} />);

      expect(screen.queryByRole('button', { name: 'Add a Dish' })).not.toBeInTheDocument();
    });

    it('calls onAddClick when Add button is clicked', async () => {
      const handleAddClick = vi.fn();
      const user = userEvent.setup();

      render(<DishList dishes={[]} onAddClick={handleAddClick} />);

      await user.click(screen.getByRole('button', { name: 'Add a Dish' }));
      expect(handleAddClick).toHaveBeenCalledTimes(1);
    });

    it('renders plate icon in empty state', () => {
      render(<DishList dishes={[]} />);

      // The icon should have aria-hidden
      const icon = document.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('with dishes', () => {
    it('renders all dishes', () => {
      const dishes = [
        createTestDish({ name: 'Grilled Chicken' }),
        createTestDish({ name: 'Roasted Vegetables' }),
        createTestDish({ name: 'Rice Pilaf' }),
      ];

      render(<DishList dishes={dishes} />);

      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
      expect(screen.getByText('Roasted Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Rice Pilaf')).toBeInTheDocument();
    });

    it('renders as a list with proper role', () => {
      const dishes = [createTestDish()];

      render(<DishList dishes={dishes} />);

      expect(screen.getByRole('list', { name: 'Dishes' })).toBeInTheDocument();
    });

    it('renders each dish in a list item', () => {
      const dishes = [
        createTestDish({ name: 'Dish 1' }),
        createTestDish({ name: 'Dish 2' }),
      ];

      render(<DishList dishes={dishes} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('does not show empty state when dishes exist', () => {
      const dishes = [createTestDish()];

      render(<DishList dishes={dishes} />);

      expect(screen.queryByText('No dishes yet')).not.toBeInTheDocument();
    });
  });

  describe('dish click handling', () => {
    it('calls onDishClick with the dish when clicked', async () => {
      const handleDishClick = vi.fn();
      const user = userEvent.setup();
      const dish = createTestDish({ name: 'Clickable Dish' });

      render(<DishList dishes={[dish]} onDishClick={handleDishClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleDishClick).toHaveBeenCalledWith(dish);
    });

    it('makes dishes interactive when onDishClick is provided', () => {
      const dishes = [createTestDish()];

      render(<DishList dishes={dishes} onDishClick={() => {}} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('dishes are not interactive when onDishClick is not provided', () => {
      const dishes = [createTestDish()];

      render(<DishList dishes={dishes} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('showType prop', () => {
    it('shows type badges by default', () => {
      const dishes = [createTestDish({ type: 'entree' })];

      render(<DishList dishes={dishes} />);

      expect(screen.getByText('Entree')).toBeInTheDocument();
    });

    it('hides type badges when showType is false', () => {
      const dishes = [createTestDish({ type: 'entree' })];

      render(<DishList dishes={dishes} showType={false} />);

      expect(screen.queryByText('Entree')).not.toBeInTheDocument();
    });
  });

  describe('compact prop', () => {
    it('passes compact to DishCards', () => {
      const dishes = [createTestDish()];

      render(<DishList dishes={dishes} compact />);

      // In compact mode, text should be smaller
      expect(screen.getByText(dishes[0].name)).toHaveClass('text-sm');
    });

    it('uses normal size by default', () => {
      const dishes = [createTestDish()];

      render(<DishList dishes={dishes} />);

      expect(screen.getByText(dishes[0].name)).toHaveClass('text-base');
    });
  });

  describe('list styling', () => {
    it('has spacing between items', () => {
      const dishes = [createTestDish(), createTestDish()];

      render(<DishList dishes={dishes} />);

      expect(screen.getByRole('list')).toHaveClass('space-y-2');
    });
  });

  describe('unique keys', () => {
    it('renders dishes with different ids correctly', () => {
      const dishes = [
        createTestDish({ id: 'dish-1', name: 'First Dish' }),
        createTestDish({ id: 'dish-2', name: 'Second Dish' }),
        createTestDish({ id: 'dish-3', name: 'Third Dish' }),
      ];

      render(<DishList dishes={dishes} />);

      expect(screen.getByText('First Dish')).toBeInTheDocument();
      expect(screen.getByText('Second Dish')).toBeInTheDocument();
      expect(screen.getByText('Third Dish')).toBeInTheDocument();
    });
  });
});

