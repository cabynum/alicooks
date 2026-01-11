/**
 * LockIndicator Component
 *
 * Displays when a meal plan is locked by another user.
 * Shows who is editing and how long ago they started.
 * Provides an "Unlock" button for stale locks (older than 5 minutes).
 */

import { Lock, Unlock } from 'lucide-react';
import { formatLockTime } from '@/services';
import { Button } from '@/components/ui';

export interface LockIndicatorProps {
  /** The name of the user who has the lock */
  lockedByName?: string;
  /** ISO 8601 timestamp when the lock was acquired */
  lockedAt?: string;
  /** Whether the lock is stale (older than 5 minutes) */
  isStale: boolean;
  /** Callback when the user wants to force unlock */
  onForceUnlock?: () => void;
  /** Whether an unlock operation is in progress */
  isUnlocking?: boolean;
  /** Compact variant for inline display */
  variant?: 'banner' | 'inline';
}

/**
 * LockIndicator component for showing plan lock status.
 *
 * Features:
 * - Shows who is currently editing the plan
 * - Displays how long ago they started
 * - Provides force unlock for stale locks
 * - Two variants: banner (prominent) and inline (subtle)
 *
 * @example
 * ```tsx
 * <LockIndicator
 *   lockedByName="Alice"
 *   lockedAt="2024-12-16T10:30:00Z"
 *   isStale={false}
 * />
 * ```
 *
 * @example Stale lock with unlock button
 * ```tsx
 * <LockIndicator
 *   lockedByName="Bob"
 *   lockedAt="2024-12-16T10:00:00Z"
 *   isStale={true}
 *   onForceUnlock={handleUnlock}
 *   isUnlocking={isUnlocking}
 * />
 * ```
 */
export function LockIndicator({
  lockedByName = 'Someone',
  lockedAt,
  isStale,
  onForceUnlock,
  isUnlocking = false,
  variant = 'banner',
}: LockIndicatorProps) {
  const timeAgo = formatLockTime(lockedAt);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-600">
        <Lock size={14} className="text-stone-400" aria-hidden="true" />
        <span>
          <span className="font-medium">{lockedByName}</span> is editing
          {timeAgo && (
            <span className="text-stone-400"> · {timeAgo}</span>
          )}
        </span>
        {isStale && onForceUnlock && (
          <button
            type="button"
            onClick={onForceUnlock}
            disabled={isUnlocking}
            className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2 disabled:opacity-50"
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        )}
      </div>
    );
  }

  // Banner variant (default)
  return (
    <div
      className={[
        'rounded-xl',
        'p-4',
        'border',
        isStale
          ? 'bg-amber-50 border-amber-200'
          : 'bg-stone-50 border-stone-200',
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={[
            'flex-shrink-0',
            'w-10 h-10',
            'rounded-full',
            'flex items-center justify-center',
            isStale ? 'bg-amber-100' : 'bg-stone-100',
          ].join(' ')}
        >
          <Lock
            size={20}
            className={isStale ? 'text-amber-600' : 'text-stone-500'}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold text-stone-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Plan is being edited
          </h3>
          <p className="text-sm text-stone-600 mt-0.5">
            <span className="font-medium">{lockedByName}</span> started editing
            {timeAgo && ` ${timeAgo}`}.
            {isStale
              ? ' You can take over if they forgot to save.'
              : ' Please wait until they finish.'}
          </p>

          {/* Actions */}
          {isStale && onForceUnlock && (
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onForceUnlock}
                disabled={isUnlocking}
              >
                <span className="flex items-center gap-2">
                  <Unlock size={16} strokeWidth={2} />
                  <span>{isUnlocking ? 'Unlocking...' : 'Unlock & Edit'}</span>
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stale indicator */}
      {isStale && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <p className="text-xs text-amber-600">
            This lock appears to be stale (over 5 minutes old). The editor may have left without saving.
          </p>
        </div>
      )}
    </div>
  );
}
