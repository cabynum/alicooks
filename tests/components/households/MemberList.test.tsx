/**
 * MemberList Component Tests
 *
 * Tests for the household member list with removal functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberList } from '@/components/households/MemberList';
import type { HouseholdMemberWithProfile } from '@/types';

/**
 * Factory for creating test members
 */
function createTestMember(overrides: Partial<HouseholdMemberWithProfile> = {}): HouseholdMemberWithProfile {
  return {
    id: 'member-1',
    householdId: 'household-1',
    userId: 'user-1',
    role: 'member',
    joinedAt: '2024-12-28T00:00:00Z',
    profile: {
      id: 'user-1',
      displayName: 'John Doe',
      email: 'john@example.com',
    },
    ...overrides,
  };
}

describe('MemberList', () => {
  const defaultProps = {
    members: [],
    currentUserId: 'current-user',
    isCreator: false,
  };

  describe('rendering', () => {
    it('shows empty state when no members', () => {
      render(<MemberList {...defaultProps} />);

      expect(screen.getByText('No members yet.')).toBeInTheDocument();
    });

    it('renders each member', () => {
      const members = [
        createTestMember({ id: 'm1', userId: 'u1', profile: { id: 'u1', displayName: 'Alice', email: 'alice@test.com' } }),
        createTestMember({ id: 'm2', userId: 'u2', profile: { id: 'u2', displayName: 'Bob', email: 'bob@test.com' } }),
      ];

      render(<MemberList {...defaultProps} members={members} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('shows email for each member', () => {
      const members = [
        createTestMember({ profile: { id: 'u1', displayName: 'Test User', email: 'test@example.com' } }),
      ];

      render(<MemberList {...defaultProps} members={members} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('shows "(you)" label next to current user', () => {
      const members = [
        createTestMember({ userId: 'current-user', profile: { id: 'current-user', displayName: 'Me', email: 'me@test.com' } }),
      ];

      render(<MemberList {...defaultProps} members={members} currentUserId="current-user" />);

      expect(screen.getByText('(you)')).toBeInTheDocument();
    });

    it('shows Creator badge for creator role', () => {
      const members = [
        createTestMember({ role: 'creator', profile: { id: 'u1', displayName: 'Creator User', email: 'creator@test.com' } }),
      ];

      render(<MemberList {...defaultProps} members={members} />);

      expect(screen.getByText('Creator')).toBeInTheDocument();
    });

    it('shows initials in avatar', () => {
      const members = [
        createTestMember({ profile: { id: 'u1', displayName: 'John Doe', email: 'jd@test.com' } }),
      ];

      render(<MemberList {...defaultProps} members={members} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles single-word names for initials', () => {
      const members = [
        createTestMember({ profile: { id: 'u1', displayName: 'Madonna', email: 'm@test.com' } }),
      ];

      render(<MemberList {...defaultProps} members={members} />);

      expect(screen.getByText('M')).toBeInTheDocument();
    });
  });

  describe('remove member (creator only)', () => {
    it('shows remove button for creator viewing other members', () => {
      const members = [
        createTestMember({ userId: 'other-user', profile: { id: 'other-user', displayName: 'Other User', email: 'other@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="creator-user"
          isCreator={true}
          onRemoveMember={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Remove Other User' })).toBeInTheDocument();
    });

    it('does not show remove button for non-creators', () => {
      const members = [
        createTestMember({ userId: 'other-user', profile: { id: 'other-user', displayName: 'Other User', email: 'other@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="current-user"
          isCreator={false}
          onRemoveMember={vi.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: 'Remove Other User' })).not.toBeInTheDocument();
    });

    it('does not show remove button for creator on themselves', () => {
      const members = [
        createTestMember({ userId: 'creator-user', role: 'creator', profile: { id: 'creator-user', displayName: 'Creator', email: 'creator@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="creator-user"
          isCreator={true}
          onRemoveMember={vi.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: 'Remove Creator' })).not.toBeInTheDocument();
    });

    it('shows confirmation when remove button is clicked', async () => {
      const user = userEvent.setup();
      const members = [
        createTestMember({ userId: 'other-user', profile: { id: 'other-user', displayName: 'Other User', email: 'other@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="creator-user"
          isCreator={true}
          onRemoveMember={vi.fn()}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Remove Other User' }));

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('calls onRemoveMember when confirmed', async () => {
      const user = userEvent.setup();
      const onRemoveMember = vi.fn().mockResolvedValue(undefined);
      const members = [
        createTestMember({ id: 'member-to-remove', userId: 'other-user', profile: { id: 'other-user', displayName: 'Other User', email: 'other@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="creator-user"
          isCreator={true}
          onRemoveMember={onRemoveMember}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Remove Other User' }));
      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onRemoveMember).toHaveBeenCalledWith('member-to-remove');
    });

    it('hides confirmation when cancel is clicked', async () => {
      const user = userEvent.setup();
      const members = [
        createTestMember({ userId: 'other-user', profile: { id: 'other-user', displayName: 'Other User', email: 'other@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="creator-user"
          isCreator={true}
          onRemoveMember={vi.fn()}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Remove Other User' }));
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      // The remove icon button should be back
      expect(screen.getByRole('button', { name: 'Remove Other User' })).toBeInTheDocument();
    });

    it('handles removal error gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onRemoveMember = vi.fn().mockRejectedValue(new Error('Failed'));
      const members = [
        createTestMember({ userId: 'other-user', profile: { id: 'other-user', displayName: 'Other User', email: 'other@test.com' } }),
      ];

      render(
        <MemberList
          {...defaultProps}
          members={members}
          currentUserId="creator-user"
          isCreator={true}
          onRemoveMember={onRemoveMember}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Remove Other User' }));
      await user.click(screen.getByRole('button', { name: 'Remove' }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
