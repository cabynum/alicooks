/**
 * LockIndicator Component Tests
 *
 * Tests for the plan locking indicator UI.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LockIndicator } from '@/components/meals/LockIndicator';

// Mock the locks service for formatLockTime
vi.mock('@/services', async () => {
  const actual = await vi.importActual('@/services');
  return {
    ...actual,
    formatLockTime: (lockedAt: string | undefined) => {
      if (!lockedAt) return '';
      return '2 min ago';
    },
  };
});

describe('LockIndicator', () => {
  // =========================================================================
  // Banner Variant (default)
  // =========================================================================

  describe('banner variant', () => {
    it('renders with locked by name', () => {
      render(
        <LockIndicator
          lockedByName="Alice"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
        />
      );

      expect(screen.getByText('Plan is being edited')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('shows default name when lockedByName not provided', () => {
      render(
        <LockIndicator
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
        />
      );

      expect(screen.getByText('Someone')).toBeInTheDocument();
    });

    it('shows time ago when lockedAt provided', () => {
      render(
        <LockIndicator
          lockedByName="Bob"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
        />
      );

      expect(screen.getByText(/2 min ago/)).toBeInTheDocument();
    });

    it('shows waiting message for non-stale locks', () => {
      render(
        <LockIndicator
          lockedByName="Charlie"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
        />
      );

      expect(screen.getByText(/Please wait until they finish/)).toBeInTheDocument();
    });

    it('shows unlock message for stale locks', () => {
      render(
        <LockIndicator
          lockedByName="Dave"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
        />
      );

      expect(screen.getByText(/You can take over if they forgot to save/)).toBeInTheDocument();
    });

    it('shows stale warning for stale locks', () => {
      render(
        <LockIndicator
          lockedByName="Eve"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
        />
      );

      expect(screen.getByText(/This lock appears to be stale/)).toBeInTheDocument();
    });

    it('shows unlock button only when stale and callback provided', () => {
      const handleUnlock = vi.fn();

      render(
        <LockIndicator
          lockedByName="Frank"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
          onForceUnlock={handleUnlock}
        />
      );

      expect(screen.getByRole('button', { name: /Unlock & Edit/i })).toBeInTheDocument();
    });

    it('does not show unlock button when not stale', () => {
      const handleUnlock = vi.fn();

      render(
        <LockIndicator
          lockedByName="Grace"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
          onForceUnlock={handleUnlock}
        />
      );

      expect(screen.queryByRole('button', { name: /Unlock/i })).not.toBeInTheDocument();
    });

    it('calls onForceUnlock when unlock button clicked', () => {
      const handleUnlock = vi.fn();

      render(
        <LockIndicator
          lockedByName="Henry"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
          onForceUnlock={handleUnlock}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Unlock & Edit/i }));

      expect(handleUnlock).toHaveBeenCalledOnce();
    });

    it('shows loading state when unlocking', () => {
      render(
        <LockIndicator
          lockedByName="Ivy"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
          onForceUnlock={() => {}}
          isUnlocking={true}
        />
      );

      expect(screen.getByRole('button', { name: /Unlocking/i })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('has role="alert" for accessibility', () => {
      render(
        <LockIndicator
          lockedByName="Jack"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Inline Variant
  // =========================================================================

  describe('inline variant', () => {
    it('renders inline variant', () => {
      render(
        <LockIndicator
          lockedByName="Kate"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
          variant="inline"
        />
      );

      expect(screen.getByText('Kate')).toBeInTheDocument();
      expect(screen.getByText(/is editing/)).toBeInTheDocument();
    });

    it('shows time in inline variant', () => {
      render(
        <LockIndicator
          lockedByName="Leo"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={false}
          variant="inline"
        />
      );

      expect(screen.getByText(/2 min ago/)).toBeInTheDocument();
    });

    it('shows unlock link for stale locks in inline variant', () => {
      const handleUnlock = vi.fn();

      render(
        <LockIndicator
          lockedByName="Mike"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
          onForceUnlock={handleUnlock}
          variant="inline"
        />
      );

      const unlockButton = screen.getByRole('button', { name: 'Unlock' });
      expect(unlockButton).toBeInTheDocument();

      fireEvent.click(unlockButton);
      expect(handleUnlock).toHaveBeenCalledOnce();
    });

    it('shows unlocking state in inline variant', () => {
      render(
        <LockIndicator
          lockedByName="Nancy"
          lockedAt="2024-01-01T10:00:00Z"
          isStale={true}
          onForceUnlock={() => {}}
          isUnlocking={true}
          variant="inline"
        />
      );

      expect(screen.getByRole('button', { name: 'Unlocking...' })).toBeDisabled();
    });
  });
});
