/**
 * AddDishPage Tests
 *
 * Tests the full add dish flow including form submission,
 * storage interaction, and navigation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AddDishPage } from '@/pages/AddDishPage';
import { AuthProvider } from '@/components/auth';
import { getDishes } from '@/services';

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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Track navigation
let navigatedTo: string | null = null;

/**
 * Helper to render AddDishPage with router and auth context
 */
function renderAddDishPage() {
  navigatedTo = null;

  function HomePage() {
    navigatedTo = '/';
    return <div>Home Page</div>;
  }

  return render(
    <MemoryRouter initialEntries={['/add']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddDishPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AddDishPage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    navigatedTo = null;
  });

  describe('rendering', () => {
    it('renders page title', () => {
      renderAddDishPage();

      expect(
        screen.getByRole('heading', { name: 'Add a Dish' })
      ).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      renderAddDishPage();

      expect(
        screen.getByText('Add a new dish to your collection')
      ).toBeInTheDocument();
    });

    it('renders the dish form', () => {
      renderAddDishPage();

      expect(screen.getByLabelText('Dish Name')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Dish type' })).toBeInTheDocument();
    });

    it('renders submit button with "Add Dish" label', () => {
      renderAddDishPage();

      expect(
        screen.getByRole('button', { name: 'Add Dish' })
      ).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      renderAddDishPage();

      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('saves dish to storage when form is submitted', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      // Fill in the form
      const nameInput = screen.getByLabelText('Dish Name');
      await user.type(nameInput, 'Spaghetti Bolognese');

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Add Dish' }));

      // Check that dish was saved
      const dishes = getDishes();
      expect(dishes).toHaveLength(1);
      expect(dishes[0].name).toBe('Spaghetti Bolognese');
      expect(dishes[0].type).toBe('entree'); // Default type
    });

    it('saves dish with selected type', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      // Fill in the form
      await user.type(screen.getByLabelText('Dish Name'), 'Mashed Potatoes');

      // Select "Side Dish" type
      await user.click(screen.getByRole('radio', { name: 'Side Dish' }));

      // Submit
      await user.click(screen.getByRole('button', { name: 'Add Dish' }));

      // Check saved dish
      const dishes = getDishes();
      expect(dishes[0].type).toBe('side');
    });

    it('navigates to home after successful submission', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      await user.type(screen.getByLabelText('Dish Name'), 'Test Dish');
      await user.click(screen.getByRole('button', { name: 'Add Dish' }));

      // Should have navigated to home
      expect(navigatedTo).toBe('/');
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('does not save when name is empty', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      // Try to submit without entering a name
      await user.click(screen.getByRole('button', { name: 'Add Dish' }));

      // Should show error and stay on page
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(getDishes()).toHaveLength(0);
      expect(navigatedTo).toBeNull();
    });

    it('trims whitespace from dish name', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      await user.type(screen.getByLabelText('Dish Name'), '  Pasta Primavera  ');
      await user.click(screen.getByRole('button', { name: 'Add Dish' }));

      const dishes = getDishes();
      expect(dishes[0].name).toBe('Pasta Primavera');
    });
  });

  describe('cancel', () => {
    it('navigates to home when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(navigatedTo).toBe('/');
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('does not save dish when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      // Type something but then cancel
      await user.type(screen.getByLabelText('Dish Name'), 'Should not save');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(getDishes()).toHaveLength(0);
    });
  });

  describe('accessibility', () => {
    it('focuses the name input on page load', () => {
      renderAddDishPage();

      expect(screen.getByLabelText('Dish Name')).toHaveFocus();
    });

    it('form can be submitted with Enter key', async () => {
      const user = userEvent.setup();
      renderAddDishPage();

      const nameInput = screen.getByLabelText('Dish Name');
      await user.type(nameInput, 'Keyboard Test{Enter}');

      // Should have submitted and navigated
      expect(getDishes()).toHaveLength(1);
      expect(navigatedTo).toBe('/');
    });
  });
});

