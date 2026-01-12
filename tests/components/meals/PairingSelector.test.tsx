/**
 * Tests for PairingSelector Component
 *
 * Verifies the chip-based side dish selection for pairing with entrees.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PairingSelector } from '@/components/meals/PairingSelector';
import type { Dish } from '@/types';

// Helper to create test dishes
function createTestDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: crypto.randomUUID(),
    name: 'Test Side',
    type: 'side',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('PairingSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all sides as chips', () => {
      const sides = [
        createTestDish({ name: 'Rice' }),
        createTestDish({ name: 'Salad' }),
        createTestDish({ name: 'Fries' }),
      ];

      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={sides}
        />
      );

      expect(screen.getByText('Rice')).toBeInTheDocument();
      expect(screen.getByText('Salad')).toBeInTheDocument();
      expect(screen.getByText('Fries')).toBeInTheDocument();
    });

    it('renders label text', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[createTestDish()]}
        />
      );

      expect(screen.getByText('Pairs well with')).toBeInTheDocument();
    });

    it('shows empty state when no sides available', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[]}
        />
      );

      expect(screen.getByText(/No side dishes added yet/i)).toBeInTheDocument();
    });

    it('shows hint text when no sides selected', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[createTestDish()]}
        />
      );

      expect(screen.getByText(/Tap to select sides/i)).toBeInTheDocument();
    });

    it('hides hint text when sides are selected', () => {
      const side = createTestDish();
      render(
        <PairingSelector
          selectedIds={[side.id]}
          onChange={() => {}}
          sides={[side]}
        />
      );

      expect(screen.queryByText(/Tap to select sides/i)).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('highlights selected chips', () => {
      const sides = [
        createTestDish({ id: 'side-1', name: 'Rice' }),
        createTestDish({ id: 'side-2', name: 'Salad' }),
      ];

      render(
        <PairingSelector
          selectedIds={['side-1']}
          onChange={() => {}}
          sides={sides}
        />
      );

      const riceButton = screen.getByRole('button', { name: /Rice/i });
      const saladButton = screen.getByRole('button', { name: /Salad/i });

      expect(riceButton).toHaveAttribute('aria-pressed', 'true');
      expect(saladButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onChange with added ID when unselected chip clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const sides = [createTestDish({ id: 'side-1', name: 'Rice' })];

      render(
        <PairingSelector
          selectedIds={[]}
          onChange={handleChange}
          sides={sides}
        />
      );

      await user.click(screen.getByRole('button', { name: /Rice/i }));

      expect(handleChange).toHaveBeenCalledWith(['side-1']);
    });

    it('calls onChange with removed ID when selected chip clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const sides = [
        createTestDish({ id: 'side-1', name: 'Rice' }),
        createTestDish({ id: 'side-2', name: 'Salad' }),
      ];

      render(
        <PairingSelector
          selectedIds={['side-1', 'side-2']}
          onChange={handleChange}
          sides={sides}
        />
      );

      await user.click(screen.getByRole('button', { name: /Rice/i }));

      expect(handleChange).toHaveBeenCalledWith(['side-2']);
    });

    it('supports multi-select', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const sides = [
        createTestDish({ id: 'side-1', name: 'Rice' }),
        createTestDish({ id: 'side-2', name: 'Salad' }),
      ];

      const { rerender } = render(
        <PairingSelector
          selectedIds={[]}
          onChange={handleChange}
          sides={sides}
        />
      );

      // Select first side
      await user.click(screen.getByRole('button', { name: /Rice/i }));
      expect(handleChange).toHaveBeenCalledWith(['side-1']);

      // Rerender with updated selection
      rerender(
        <PairingSelector
          selectedIds={['side-1']}
          onChange={handleChange}
          sides={sides}
        />
      );

      // Select second side
      await user.click(screen.getByRole('button', { name: /Salad/i }));
      expect(handleChange).toHaveBeenCalledWith(['side-1', 'side-2']);
    });
  });

  describe('Add New Side button', () => {
    it('shows Add Side button when onAddNewSide provided', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[createTestDish()]}
          onAddNewSide={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /Add Side/i })).toBeInTheDocument();
    });

    it('hides Add Side button when onAddNewSide not provided', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[createTestDish()]}
        />
      );

      expect(screen.queryByRole('button', { name: /Add Side/i })).not.toBeInTheDocument();
    });

    it('calls onAddNewSide when Add Side clicked', async () => {
      const user = userEvent.setup();
      const handleAddNewSide = vi.fn();

      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[createTestDish()]}
          onAddNewSide={handleAddNewSide}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Side/i }));

      expect(handleAddNewSide).toHaveBeenCalled();
    });

    it('shows Add Side button even with no sides', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[]}
          onAddNewSide={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /Add Side/i })).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables all chips when disabled', () => {
      const sides = [
        createTestDish({ name: 'Rice' }),
        createTestDish({ name: 'Salad' }),
      ];

      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={sides}
          disabled
        />
      );

      expect(screen.getByRole('button', { name: /Rice/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Salad/i })).toBeDisabled();
    });

    it('disables Add Side button when disabled', () => {
      render(
        <PairingSelector
          selectedIds={[]}
          onChange={() => {}}
          sides={[createTestDish()]}
          onAddNewSide={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('button', { name: /Add Side/i })).toBeDisabled();
    });
  });
});
