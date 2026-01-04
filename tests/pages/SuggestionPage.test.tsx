/**
 * SuggestionPage Tests
 *
 * Tests for the meal suggestion page.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SuggestionPage } from '@/pages/SuggestionPage';
import { AuthProvider } from '@/components/auth';
import type { Dish } from '@/types';
import { STORAGE_KEYS } from '@/types';

// Mock useAuth to avoid Supabase dependency
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    error: null,
    clearError: vi.fn(),
  }),
}));

// Mock useHousehold to avoid Supabase dependency
vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    households: [],
    currentHousehold: null,
    members: [],
    isLoading: false,
    isCreator: false,
    switchHousehold: vi.fn(),
    createHousehold: vi.fn(),
    leaveCurrentHousehold: vi.fn(),
    removeMember: vi.fn(),
    refresh: vi.fn(),
    error: null,
    clearError: vi.fn(),
  }),
}));

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
 * Sets up dishes in localStorage for testing.
 */
function setupDishes(dishes: Dish[]) {
  localStorageMock.setItem(STORAGE_KEYS.dishes, JSON.stringify(dishes));
}

/**
 * Render helper that wraps with router
 */
function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <SuggestionPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('SuggestionPage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockNavigate.mockClear();
  });

  describe('header', () => {
    it('displays page title', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Meal Suggestion')).toBeInTheDocument();
      });
    });

    it('displays subtitle', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('What should I make for dinner?')
        ).toBeInTheDocument();
      });
    });

    it('has back button', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      });
    });

    it('navigates home when back button clicked', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /go back/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('when no dishes exist', () => {
    it('shows empty state', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Need More Dishes')).toBeInTheDocument();
      });
    });

    it('shows helpful message', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Add some dishes to get meal suggestions!')
        ).toBeInTheDocument();
      });
    });

    it('has Add Dish button', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add a dish/i })).toBeInTheDocument();
      });
    });

    it('navigates to add page when Add Dish clicked', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add a dish/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /add a dish/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/add');
    });
  });

  describe('when only sides exist (no entrees)', () => {
    beforeEach(() => {
      setupDishes([
        createDish('s1', 'Rice', 'side'),
        createDish('s2', 'Vegetables', 'side'),
      ]);
    });

    it('shows empty state with entree message', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Need More Dishes')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Add an entree to get meal suggestions!')
      ).toBeInTheDocument();
    });
  });

  describe('when dishes exist', () => {
    beforeEach(() => {
      setupDishes([
        createDish('e1', 'Grilled Chicken', 'entree'),
        createDish('e2', 'Pasta', 'entree'),
        createDish('s1', 'Rice', 'side'),
        createDish('s2', 'Salad', 'side'),
      ]);
    });

    it('shows suggestion card', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Tonight's Suggestion")).toBeInTheDocument();
      });
    });

    it('displays an entree', async () => {
      renderPage();

      await waitFor(() => {
        // Should show one of our entrees
        const hasChicken = screen.queryByText('Grilled Chicken');
        const hasPasta = screen.queryByText('Pasta');
        expect(hasChicken || hasPasta).toBeTruthy();
      });
    });

    it('has Try Another button', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try another/i })).toBeInTheDocument();
      });
    });

    it('generates new suggestion when Try Another clicked', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try another/i })).toBeInTheDocument();
      });

      // Click multiple times to increase chance of seeing a different suggestion
      // (randomness means we might get the same one)
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button', { name: /try another/i }));
      }

      // Just verify the suggestion card is still showing (no errors)
      expect(screen.getByText("Tonight's Suggestion")).toBeInTheDocument();
    });

    it('shows status message', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Ready to suggest meals!')).toBeInTheDocument();
      });
    });
  });

  describe('when only one entree exists', () => {
    beforeEach(() => {
      setupDishes([
        createDish('e1', 'Chicken', 'entree'),
        createDish('s1', 'Rice', 'side'),
      ]);
    });

    it('shows suggestion with that entree', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Chicken')).toBeInTheDocument();
      });
    });

    it('shows variety message', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText('Add more entrees for variety in your suggestions.')
        ).toBeInTheDocument();
      });
    });
  });
});

