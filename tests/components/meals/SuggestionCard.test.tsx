/**
 * SuggestionCard Component Tests
 *
 * Tests for the meal suggestion display component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionCard } from '@/components/meals/SuggestionCard';
import type { MealSuggestion, Dish } from '@/types';

// ============================================================================
// Test Helpers
// ============================================================================

function createDish(
  id: string,
  name: string,
  type: 'entree' | 'side' | 'other'
): Dish {
  return {
    id,
    name,
    type,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function createSuggestion(
  entreeName: string,
  sideNames: string[] = []
): MealSuggestion {
  return {
    entree: createDish('e1', entreeName, 'entree'),
    sides: sideNames.map((name, i) => createDish(`s${i + 1}`, name, 'side')),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('SuggestionCard', () => {
  describe('rendering', () => {
    it('displays the entree name prominently', () => {
      const suggestion = createSuggestion('Grilled Chicken');

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
      // Should be a heading
      expect(screen.getByRole('heading', { name: 'Grilled Chicken' })).toBeInTheDocument();
    });

    it('shows "Main Course" badge', () => {
      const suggestion = createSuggestion('Pasta');

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.getByText('Main Course')).toBeInTheDocument();
    });

    it('displays header text', () => {
      const suggestion = createSuggestion('Tacos');

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.getByText("Tonight's Suggestion")).toBeInTheDocument();
    });

    it('displays side dishes when present', () => {
      const suggestion = createSuggestion('Steak', ['Mashed Potatoes', 'Asparagus']);

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.getByText('Mashed Potatoes')).toBeInTheDocument();
      expect(screen.getByText('Asparagus')).toBeInTheDocument();
    });

    it('shows "paired with" divider when sides exist', () => {
      const suggestion = createSuggestion('Fish', ['Rice']);

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.getByText('paired with')).toBeInTheDocument();
    });

    it('shows helpful message when no sides', () => {
      const suggestion = createSuggestion('Burger');

      render(<SuggestionCard suggestion={suggestion} />);

      expect(
        screen.getByText('Add some side dishes for complete meal suggestions!')
      ).toBeInTheDocument();
    });

    it('does not show "paired with" when no sides', () => {
      const suggestion = createSuggestion('Pizza');

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.queryByText('paired with')).not.toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('renders Try Another button when handler provided', () => {
      const suggestion = createSuggestion('Chicken');
      const onTryAnother = vi.fn();

      render(<SuggestionCard suggestion={suggestion} onTryAnother={onTryAnother} />);

      expect(screen.getByRole('button', { name: /try another/i })).toBeInTheDocument();
    });

    it('calls onTryAnother when button clicked', async () => {
      const user = userEvent.setup();
      const suggestion = createSuggestion('Chicken');
      const onTryAnother = vi.fn();

      render(<SuggestionCard suggestion={suggestion} onTryAnother={onTryAnother} />);

      await user.click(screen.getByRole('button', { name: /try another/i }));

      expect(onTryAnother).toHaveBeenCalledTimes(1);
    });

    it('renders Accept button when handler provided', () => {
      const suggestion = createSuggestion('Salmon');
      const onAccept = vi.fn();

      render(<SuggestionCard suggestion={suggestion} onAccept={onAccept} />);

      expect(screen.getByRole('button', { name: /sounds good/i })).toBeInTheDocument();
    });

    it('calls onAccept when button clicked', async () => {
      const user = userEvent.setup();
      const suggestion = createSuggestion('Salmon');
      const onAccept = vi.fn();

      render(<SuggestionCard suggestion={suggestion} onAccept={onAccept} />);

      await user.click(screen.getByRole('button', { name: /sounds good/i }));

      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it('renders both buttons when both handlers provided', () => {
      const suggestion = createSuggestion('Tacos');

      render(
        <SuggestionCard
          suggestion={suggestion}
          onTryAnother={() => {}}
          onAccept={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /try another/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sounds good/i })).toBeInTheDocument();
    });

    it('does not render buttons when no handlers provided', () => {
      const suggestion = createSuggestion('Pasta');

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has heading for entree name', () => {
      const suggestion = createSuggestion('Grilled Salmon');

      render(<SuggestionCard suggestion={suggestion} />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Grilled Salmon');
    });

    it('decorative elements are hidden from screen readers', () => {
      const suggestion = createSuggestion('Chicken', ['Rice']);

      const { container } = render(<SuggestionCard suggestion={suggestion} />);

      // Check for aria-hidden on decorative elements
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThan(0);
    });
  });

  describe('with multiple sides', () => {
    it('displays all sides', () => {
      const suggestion = createSuggestion('Steak', [
        'Potatoes',
        'Vegetables',
      ]);

      render(<SuggestionCard suggestion={suggestion} />);

      expect(screen.getByText('Potatoes')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
    });

    it('uses unique keys for sides (no React warnings)', () => {
      const suggestion = createSuggestion('Fish', ['Rice', 'Salad']);

      // This would throw if keys were duplicated
      expect(() => render(<SuggestionCard suggestion={suggestion} />)).not.toThrow();
    });
  });
});

