/**
 * ProposalCard Component Tests
 *
 * Tests for the proposal display and voting card.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import type { Proposal, Dish, HouseholdMemberWithProfile } from '@/types';

// ============================================================================
// Test Helpers
// ============================================================================

function createDish(id: string, name: string, type: 'entree' | 'side'): Dish {
  return {
    id,
    name,
    type,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
}

function createMember(
  userId: string,
  displayName: string
): HouseholdMemberWithProfile {
  return {
    id: `member-${userId}`,
    householdId: 'household-1',
    userId,
    role: 'member',
    joinedAt: '2024-01-01T00:00:00Z',
    profile: {
      id: userId,
      displayName,
      email: `${displayName.toLowerCase().replace(' ', '')}@test.com`,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  };
}

function createProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: 'proposal-1',
    householdId: 'household-1',
    proposedBy: 'user-1',
    proposedAt: new Date().toISOString(),
    targetDate: new Date().toISOString().split('T')[0],
    meal: {
      entreeId: 'dish-1',
      sideIds: ['dish-2'],
    },
    status: 'pending',
    votes: [],
    dismissals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const defaultDishes: Dish[] = [
  createDish('dish-1', 'Grilled Chicken', 'entree'),
  createDish('dish-2', 'Mashed Potatoes', 'side'),
];

const defaultMembers: HouseholdMemberWithProfile[] = [
  createMember('user-1', 'Alice'),
  createMember('user-2', 'Bob'),
];

// ============================================================================
// Tests
// ============================================================================

describe('ProposalCard', () => {
  describe('rendering', () => {
    it('displays the entree name', () => {
      const proposal = createProposal();

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
    });

    it('displays side dishes', () => {
      const proposal = createProposal();

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Mashed Potatoes')).toBeInTheDocument();
    });

    it('displays proposer name', () => {
      const proposal = createProposal({ proposedBy: 'user-1' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('shows "You" when current user is proposer', () => {
      const proposal = createProposal({ proposedBy: 'user-1' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-1"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('status badges', () => {
    it('shows Pending badge for pending proposals', () => {
      const proposal = createProposal({ status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows Approved badge for approved proposals', () => {
      const proposal = createProposal({ status: 'approved' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('shows Rejected badge for rejected proposals', () => {
      const proposal = createProposal({ status: 'rejected' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('shows Withdrawn badge for withdrawn proposals', () => {
      const proposal = createProposal({ status: 'withdrawn' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Withdrawn')).toBeInTheDocument();
    });

    it('shows Expired badge for expired proposals', () => {
      const proposal = createProposal({ status: 'expired' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByText('Expired')).toBeInTheDocument();
    });
  });

  describe('voting', () => {
    it('shows voting buttons for pending proposals', () => {
      const proposal = createProposal({ status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });

    it('does not show voting buttons for non-pending proposals', () => {
      const proposal = createProposal({ status: 'approved' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      // The approve/reject voting buttons have specific aria-labels
      expect(screen.queryByRole('button', { name: /approve this proposal/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reject this proposal/i })).not.toBeInTheDocument();
    });

    it('calls onVote when vote button clicked', async () => {
      const user = userEvent.setup();
      const onVote = vi.fn();
      const proposal = createProposal({ status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={onVote}
        />
      );

      await user.click(screen.getByRole('button', { name: /approve/i }));

      expect(onVote).toHaveBeenCalledWith('approve');
    });
  });

  describe('vote tally', () => {
    it('shows vote count for pending proposals', () => {
      const proposal = createProposal({
        status: 'pending',
        votes: [{ voterId: 'user-1', vote: 'approve', votedAt: new Date().toISOString() }],
      });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      // Vote count shows "1 of 2 voted" for pending
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/voted/i)).toBeInTheDocument();
    });

    it('can expand vote details', async () => {
      const user = userEvent.setup();
      const proposal = createProposal({
        status: 'pending',
        // Use user-2 to vote so Alice (user-1) is shown as "waiting"
        votes: [{ voterId: 'user-2', vote: 'approve', votedAt: new Date().toISOString() }],
      });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      // Click to expand - the button contains the vote count
      const expandButton = screen.getByRole('button', { expanded: false });
      await user.click(expandButton);

      // Should show who voted - "You" voted (user-2), Alice is waiting
      expect(screen.getByText('You')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
    });
  });

  describe('withdraw action', () => {
    it('shows withdraw button for proposer on pending proposals', () => {
      const proposal = createProposal({ proposedBy: 'user-1', status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-1"
          onVote={() => {}}
          onWithdraw={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument();
    });

    it('does not show withdraw button for non-proposer', () => {
      const proposal = createProposal({ proposedBy: 'user-1', status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onWithdraw={() => {}}
        />
      );

      expect(screen.queryByRole('button', { name: /withdraw/i })).not.toBeInTheDocument();
    });

    it('calls onWithdraw when clicked', async () => {
      const user = userEvent.setup();
      const onWithdraw = vi.fn();
      const proposal = createProposal({ proposedBy: 'user-1', status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-1"
          onVote={() => {}}
          onWithdraw={onWithdraw}
        />
      );

      await user.click(screen.getByRole('button', { name: /withdraw/i }));

      expect(onWithdraw).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismiss action (Rule 4)', () => {
    it('shows dismiss button for closed proposals', () => {
      const proposal = createProposal({ status: 'approved' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onDismiss={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('does not show dismiss button for pending proposals', () => {
      const proposal = createProposal({ status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onDismiss={() => {}}
        />
      );

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('calls onDismiss when clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      const proposal = createProposal({ status: 'rejected' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onDismiss={onDismiss}
        />
      );

      await user.click(screen.getByRole('button', { name: /clear/i }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('add to plan action', () => {
    it('shows add to plan button for approved proposals', () => {
      const proposal = createProposal({ status: 'approved' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onAddToPlan={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /add to plan/i })).toBeInTheDocument();
    });

    it('does not show add to plan button for pending proposals', () => {
      const proposal = createProposal({ status: 'pending' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onAddToPlan={() => {}}
        />
      );

      expect(screen.queryByRole('button', { name: /add to plan/i })).not.toBeInTheDocument();
    });

    it('calls onAddToPlan when clicked', async () => {
      const user = userEvent.setup();
      const onAddToPlan = vi.fn();
      const proposal = createProposal({ status: 'approved' });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
          onAddToPlan={onAddToPlan}
        />
      );

      await user.click(screen.getByRole('button', { name: /add to plan/i }));

      expect(onAddToPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe('target date display', () => {
    it('displays the target date', () => {
      const today = new Date().toISOString().split('T')[0];
      const proposal = createProposal({ targetDate: today });

      render(
        <ProposalCard
          proposal={proposal}
          dishes={defaultDishes}
          members={defaultMembers}
          currentUserId="user-2"
          onVote={() => {}}
        />
      );

      // Check that date section is rendered (the span with "proposed for X")
      expect(screen.getByText(/proposed for/)).toBeInTheDocument();
    });

    it('renders without crashing for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const proposal = createProposal({
        targetDate: futureDate.toISOString().split('T')[0],
      });

      // Should not throw
      expect(() =>
        render(
          <ProposalCard
            proposal={proposal}
            dishes={defaultDishes}
            members={defaultMembers}
            currentUserId="user-2"
            onVote={() => {}}
          />
        )
      ).not.toThrow();
    });
  });
});
