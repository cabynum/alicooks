/**
 * useAuth Hook Tests
 *
 * Tests the React hook for managing authentication state.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock auth service
const mockGetCurrentUser = vi.fn();
const mockGetProfile = vi.fn();
const mockSendOtpCode = vi.fn();
const mockVerifyOtpCode = vi.fn();
const mockSignOut = vi.fn();
const mockUpdateProfile = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/services', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  getProfile: (userId: string) => mockGetProfile(userId),
  sendOtpCode: (email: string) => mockSendOtpCode(email),
  verifyOtpCode: (email: string, code: string) => mockVerifyOtpCode(email, code),
  signOut: () => mockSignOut(),
  updateProfile: (userId: string, updates: unknown) => mockUpdateProfile(userId, updates),
  onAuthStateChange: (callback: (user: unknown) => void) => mockOnAuthStateChange(callback),
}));

import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to no user
    mockGetCurrentUser.mockResolvedValue(null);
    mockOnAuthStateChange.mockReturnValue(() => {});
  });

  describe('initial state', () => {
    it('starts with isLoading true', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isLoading).toBe(true);
    });

    it('sets isLoading false after init', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('is not authenticated when no user', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it('loads user and profile on mount', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = { id: 'user-123', displayName: 'Test User', email: 'test@example.com' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  describe('signIn', () => {
    it('calls sendOtpCode service', async () => {
      mockSendOtpCode.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com');
      });

      expect(mockSendOtpCode).toHaveBeenCalledWith('test@example.com');
    });

    it('sets error on failure', async () => {
      mockSendOtpCode.mockRejectedValue(new Error('Send failed'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Send failed');
    });
  });

  describe('verifyCode', () => {
    it('calls verifyOtpCode service', async () => {
      mockVerifyOtpCode.mockResolvedValue({ id: 'user-123' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.verifyCode('test@example.com', '123456');
      });

      expect(mockVerifyOtpCode).toHaveBeenCalledWith('test@example.com', '123456');
    });

    it('sets error on verification failure', async () => {
      mockVerifyOtpCode.mockRejectedValue(new Error('Invalid code'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.verifyCode('test@example.com', '000000');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Invalid code');
    });
  });

  describe('signOut', () => {
    it('calls signOut service and clears state', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetProfile.mockResolvedValue({ id: 'user-123', displayName: 'Test' });
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets error on failure', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.signOut();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Sign out failed');
    });
  });

  describe('updateProfile', () => {
    it('updates profile and refreshes state', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const originalProfile = { id: 'user-123', displayName: 'Original', email: 'test@example.com' };
      const updatedProfile = { id: 'user-123', displayName: 'Updated', email: 'test@example.com' };

      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetProfile.mockResolvedValue(originalProfile);
      mockUpdateProfile.mockResolvedValue(updatedProfile);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.profile?.displayName).toBe('Original');
      });

      await act(async () => {
        await result.current.updateProfile({ displayName: 'Updated' });
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith('user-123', { displayName: 'Updated' });
      expect(result.current.profile?.displayName).toBe('Updated');
    });

    it('throws error when not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.updateProfile({ displayName: 'Test' });
        } catch (err) {
          expect((err as Error).message).toBe('Not authenticated');
        }
      });

      expect(result.current.error).toBe('You must be signed in to update your profile.');
    });
  });

  describe('clearError', () => {
    it('clears the error state', async () => {
      mockSendOtpCode.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger an error
      await act(async () => {
        try {
          await result.current.signIn('test@example.com');
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('auth state changes', () => {
    it('subscribes to auth state changes on mount', () => {
      renderHook(() => useAuth());

      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    it('unsubscribes on unmount', () => {
      const mockUnsubscribe = vi.fn();
      mockOnAuthStateChange.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('updates user and profile on auth state change', async () => {
      let authCallback: ((user: unknown) => void) | undefined;
      mockOnAuthStateChange.mockImplementation((cb) => {
        authCallback = cb;
        return () => {};
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate sign in
      const newUser = { id: 'new-user', email: 'new@example.com' };
      const newProfile = { id: 'new-user', displayName: 'New User', email: 'new@example.com' };
      mockGetProfile.mockResolvedValue(newProfile);

      await act(async () => {
        authCallback?.(newUser);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(newUser);
      });
    });

    it('clears profile on sign out', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser);
      mockGetProfile.mockResolvedValue({ id: 'user-123', displayName: 'Test' });

      let authCallback: ((user: unknown) => void) | undefined;
      mockOnAuthStateChange.mockImplementation((cb) => {
        authCallback = cb;
        return () => {};
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Simulate sign out
      await act(async () => {
        authCallback?.(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
    });
  });
});
