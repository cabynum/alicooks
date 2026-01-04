import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '@/App'

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

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('DishCourse')).toBeInTheDocument()
  })

  it('renders the greeting', () => {
    render(<App />)
    // The redesigned HomePage shows a greeting instead of tagline
    expect(screen.getByText(/Good/)).toBeInTheDocument()
  })
})
