/**
 * MemberList Component
 *
 * Displays a list of household members with their roles.
 * Allows the creator to remove other members.
 */

import { useState } from 'react';
import { Crown, X } from 'lucide-react';
import type { HouseholdMemberWithProfile } from '@/types';
import { Button } from '@/components/ui';

export interface MemberListProps {
  /** Array of members with profile information */
  members: HouseholdMemberWithProfile[];
  /** The current user's ID */
  currentUserId: string;
  /** Whether the current user is the household creator */
  isCreator: boolean;
  /** Called when creator removes a member */
  onRemoveMember?: (memberId: string) => Promise<void>;
}

/**
 * Gets initials from a display name (first letter of first two words).
 */
function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * MemberList - Displays household members with roles and actions.
 *
 * Features:
 * - Member avatars with initials
 * - Role badge for creator
 * - Remove button for creator (except on self)
 * - Confirmation dialog before removal
 */
export function MemberList({
  members,
  currentUserId,
  isCreator,
  onRemoveMember,
}: MemberListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  /**
   * Handle remove button click - shows confirmation
   */
  function handleRemoveClick(memberId: string) {
    setConfirmingId(memberId);
  }

  /**
   * Cancel removal confirmation
   */
  function handleCancelRemove() {
    setConfirmingId(null);
  }

  /**
   * Confirm and execute removal
   */
  async function handleConfirmRemove(memberId: string) {
    if (!onRemoveMember) return;

    setRemovingId(memberId);
    setConfirmingId(null);

    try {
      await onRemoveMember(memberId);
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setRemovingId(null);
    }
  }

  if (members.length === 0) {
    return (
      <div
        className="text-center py-8"
        style={{ color: 'var(--color-text-muted)' }}
      >
        No members yet.
      </div>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: 'var(--color-bg-muted)' }}>
      {members.map((member) => {
        const isMe = member.userId === currentUserId;
        const isThisCreator = member.role === 'creator';
        const canRemove = isCreator && !isMe && !isThisCreator;
        const isRemoving = removingId === member.id;
        const isConfirming = confirmingId === member.id;

        return (
          <li
            key={member.id}
            className="flex items-center gap-3 py-3"
          >
            {/* Avatar with initials */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
              style={{
                backgroundColor: isThisCreator
                  ? 'var(--color-accent)'
                  : 'var(--color-bg-muted)',
                color: isThisCreator
                  ? 'var(--color-primary)'
                  : 'var(--color-text)',
              }}
            >
              {getInitials(member.profile.displayName)}
            </div>

            {/* Name and role */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-medium truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {member.profile.displayName}
                  {isMe && (
                    <span
                      className="font-normal ml-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      (you)
                    </span>
                  )}
                </span>
                {isThisCreator && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Crown size={12} />
                    Creator
                  </span>
                )}
              </div>
              <p
                className="text-sm truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {member.profile.email}
              </p>
            </div>

            {/* Remove button (creator only, not on self or other creator) */}
            {canRemove && (
              <div className="flex-shrink-0">
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelRemove}
                      disabled={isRemoving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConfirmRemove(member.id)}
                      loading={isRemoving}
                      disabled={isRemoving}
                      className="!bg-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveClick(member.id)}
                    disabled={isRemoving}
                    className={[
                      'p-2 rounded-lg',
                      'text-stone-400 hover:text-red-500 hover:bg-red-50',
                      'transition-colors duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    ].join(' ')}
                    aria-label={`Remove ${member.profile.displayName}`}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
