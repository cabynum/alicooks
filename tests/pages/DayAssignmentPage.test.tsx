/**
 * DayAssignmentPage Tests
 *
 * Tests for the day assignment page where users add/remove dishes from a specific day.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DayAssignmentPage } from '@/pages/DayAssignmentPage';
import type { Dish, MealPlan } from '@/types';
import { STORAGE_KEYS } from '@/types';

// ============================================================================
// Test Setup
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${Date.now()}`,
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Creates a test dish with the given properties.
 */
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

/**
 * Creates a test meal plan.
 */
function createPlan(
  id: string,
  name: string,
  startDate: string,
  days: { date: string; dishIds: string[] }[]
): MealPlan {
  return {
    id,
    name,
    startDate,
    days,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

/**
 * Sets up dishes in localStorage for testing.
 */
function setupDishes(dishes: Dish[]) {
  localStorageMock.setItem(STORAGE_KEYS.dishes, JSON.stringify(dishes));
}

/**
 * Sets up plans in localStorage for testing.
 */
function setupPlans(plans: MealPlan[]) {
  localStorageMock.setItem(STORAGE_KEYS.plans, JSON.stringify(plans));
}

/**
 * Render helper for day assignment page
 */
function renderPage(planId: string, date: string) {
  return render(
    <MemoryRouter initialEntries={[`/plan/${planId}/${date}`]}>
      <Routes>
        <Route path="/plan/:planId/:date" element={<DayAssignmentPage />} />
      </Routes>
    </MemoryRouter>
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('DayAssignmentPage', () => {
  const testPlan = createPlan('plan-1', 'Test Week', '2024-12-16', [
    { date: '2024-12-16', dishIds: [] },
    { date: '2024-12-17', dishIds: ['e1'] },
    { date: '2024-12-18', dishIds: ['e1', 's1'] },
  ]);

  const testDishes = [
    createDish('e1', 'Chicken', 'entree'),
    createDish('e2', 'Pasta', 'entree'),
    createDish('s1', 'Rice', 'side'),
    createDish('s2', 'Salad', 'side'),
  ];

  beforeEach(() => {
    localStorageMock.clear();
    mockNavigate.mockClear();
    setupDishes(testDishes);
    setupPlans([testPlan]);
  });

  describe('header', () => {
    it('displays the formatted date', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(screen.getByText('Monday, December 16')).toBeInTheDocument();
      });
    });

    it('shows dish count for day with dishes', async () => {
      renderPage('plan-1', '2024-12-18');

      await waitFor(() => {
        expect(screen.getByText('2 dishes assigned')).toBeInTheDocument();
      });
    });

    it('shows "no dishes" for empty day', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(screen.getByText('No dishes assigned yet')).toBeInTheDocument();
      });
    });

    it('has back button', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /go back/i })
        ).toBeInTheDocument();
      });
    });

    it('navigates to plan when back button clicked', async () => {
      const user = userEvent.setup();
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /go back/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /go back/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/plan/plan-1');
    });
  });

  describe('assigned dishes section', () => {
    it('shows assigned dishes', async () => {
      renderPage('plan-1', '2024-12-18');

      await waitFor(() => {
        expect(screen.getByText("Today's Meal")).toBeInTheDocument();
        // Dishes may appear multiple times (assigned section + suggestion section)
        expect(screen.getAllByText('Chicken').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Rice').length).toBeGreaterThan(0);
      });
    });

    it('hides section when no dishes assigned', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(screen.queryByText("Today's Meal")).not.toBeInTheDocument();
      });
    });

    it('has remove button for each assigned dish', async () => {
      renderPage('plan-1', '2024-12-18');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /remove chicken/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /remove rice/i })
        ).toBeInTheDocument();
      });
    });

    it('removes dish when remove button clicked', async () => {
      const user = userEvent.setup();
      renderPage('plan-1', '2024-12-18');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /remove chicken/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /remove chicken/i }));

      // Chicken should be removed from assigned dishes
      await waitFor(() => {
        // The dish should now appear in the "Add Dishes" section
        const addButtons = screen.getAllByRole('button');
        const chickenAddButton = addButtons.find(
          (btn) => btn.textContent?.includes('Chicken') && btn.textContent?.includes('Entree')
        );
        expect(chickenAddButton).toBeTruthy();
      });
    });
  });

  describe('available dishes section', () => {
    it('shows dishes not assigned to this day', async () => {
      renderPage('plan-1', '2024-12-17'); // Has only e1 (Chicken)

      await waitFor(() => {
        expect(screen.getByText('Add Dishes')).toBeInTheDocument();
        // Pasta, Rice, Salad should be available (may appear in suggestion too)
        expect(screen.getAllByText('Pasta').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Salad').length).toBeGreaterThan(0);
      });
    });

    it('shows all dishes for empty day', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        // Use getAllByText since dishes may appear in both suggestion area and add dishes list
        expect(screen.getAllByText('Chicken').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Pasta').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Rice').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Salad').length).toBeGreaterThan(0);
      });
    });

    it('adds dish when clicked', async () => {
      const user = userEvent.setup();
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        // Wait for the "Add Dishes" section
        expect(screen.getByText('Add Dishes')).toBeInTheDocument();
      });

      // Find and click the Pasta button (won't appear in suggestion if Chicken is selected)
      const addButtons = screen.getAllByRole('button');
      const pastaButton = addButtons.find(
        (btn) => btn.textContent?.includes('Pasta') && btn.textContent?.includes('Entree')
      );
      if (pastaButton) {
        await user.click(pastaButton);
      }

      // Now dish should appear in assigned section
      await waitFor(() => {
        expect(screen.getByText("Today's Meal")).toBeInTheDocument();
      });
    });

    it('shows message when all dishes are assigned', async () => {
      // Set up a day with all dishes assigned
      const fullPlan = createPlan('plan-full', 'Full Plan', '2024-12-16', [
        { date: '2024-12-16', dishIds: ['e1', 'e2', 's1', 's2'] },
      ]);
      setupPlans([fullPlan]);

      renderPage('plan-full', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByText('All dishes are already assigned to this day!')
        ).toBeInTheDocument();
      });
    });
  });

  describe('suggestion section', () => {
    it('shows suggestion area when suggestions available', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(screen.getByText('Need inspiration?')).toBeInTheDocument();
      });
    });

    it('shows suggestion with Add This button', async () => {
      // The useSuggestion hook auto-generates a suggestion on mount when dishes exist
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add this/i })
        ).toBeInTheDocument();
      });
    });

    it('has Try Another button', async () => {
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /try another/i })
        ).toBeInTheDocument();
      });
    });

    it('adds suggestion when Add This clicked', async () => {
      const user = userEvent.setup();
      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add this/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /add this/i }));

      // Should now have dishes assigned
      await waitFor(() => {
        expect(screen.getByText("Today's Meal")).toBeInTheDocument();
      });
    });
  });

  describe('empty dishes state', () => {
    it('shows empty state when no dishes exist', async () => {
      setupDishes([]);
      setupPlans([testPlan]);

      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(screen.getByText('No Dishes Yet')).toBeInTheDocument();
      });
    });

    it('has Add Dish button in empty state', async () => {
      setupDishes([]);
      setupPlans([testPlan]);

      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add a dish/i })
        ).toBeInTheDocument();
      });
    });

    it('navigates to add page when Add Dish clicked', async () => {
      const user = userEvent.setup();
      setupDishes([]);
      setupPlans([testPlan]);

      renderPage('plan-1', '2024-12-16');

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add a dish/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /add a dish/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/add');
    });
  });

  describe('non-existent plan/date', () => {
    it('redirects to home if plan not found', async () => {
      renderPage('nonexistent', '2024-12-16');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('redirects to home if date not in plan', async () => {
      renderPage('plan-1', '2024-12-25'); // Not in plan range

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });
});

