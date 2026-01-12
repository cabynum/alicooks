/**
 * Proposals Service Tests
 *
 * Tests for proposal resolution logic and voting rules.
 * These are pure functions that can be tested without mocking Supabase.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveProposal,
  shouldExpireProposal,
  shouldAutoClearResult,
  isVisibleToUser,
} from '@/services/proposals';
import type { Proposal, Vote, ProposalDismissal } from '@/types';

// ============================================================================
// Test Helpers
// ============================================================================

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

function createVote(
  voterId: string,
  vote: 'approve' | 'reject',
  hoursAgo = 0
): Vote {
  const votedAt = new Date();
  votedAt.setHours(votedAt.getHours() - hoursAgo);
  return {
    voterId,
    vote,
    votedAt: votedAt.toISOString(),
  };
}

function createDismissal(userId: string): ProposalDismissal {
  return {
    userId,
    dismissedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Tests: resolveProposal
// ============================================================================

describe('resolveProposal', () => {
  describe('Rule 1: Strict veto (any rejection = rejected)', () => {
    it('rejects proposal when any member votes reject', () => {
      const proposal = createProposal({
        votes: [
          createVote('user-1', 'approve'),
          createVote('user-2', 'reject'),
        ],
      });

      const result = resolveProposal(proposal, 3);

      expect(result).toBe('rejected');
    });

    it('rejects proposal with single rejection even if others approve', () => {
      const proposal = createProposal({
        votes: [
          createVote('user-1', 'approve'),
          createVote('user-2', 'approve'),
          createVote('user-3', 'reject'),
        ],
      });

      const result = resolveProposal(proposal, 4);

      expect(result).toBe('rejected');
    });

    it('rejects proposal when first vote is rejection', () => {
      const proposal = createProposal({
        votes: [createVote('user-1', 'reject')],
      });

      const result = resolveProposal(proposal, 3);

      expect(result).toBe('rejected');
    });
  });

  describe('Rule 2: All members must vote for approval', () => {
    it('approves when all members vote approve', () => {
      const proposal = createProposal({
        votes: [
          createVote('user-1', 'approve'),
          createVote('user-2', 'approve'),
        ],
      });

      const result = resolveProposal(proposal, 2);

      expect(result).toBe('approved');
    });

    it('stays pending when not all members have voted', () => {
      const proposal = createProposal({
        votes: [createVote('user-1', 'approve')],
      });

      const result = resolveProposal(proposal, 2);

      expect(result).toBe('pending');
    });

    it('stays pending with no votes', () => {
      const proposal = createProposal({ votes: [] });

      const result = resolveProposal(proposal, 3);

      expect(result).toBe('pending');
    });

    it('approves 3-member household when all approve', () => {
      const proposal = createProposal({
        votes: [
          createVote('user-1', 'approve'),
          createVote('user-2', 'approve'),
          createVote('user-3', 'approve'),
        ],
      });

      const result = resolveProposal(proposal, 3);

      expect(result).toBe('approved');
    });
  });

  describe('Rule 6: Solo households', () => {
    it('stays pending for solo households', () => {
      const proposal = createProposal({
        votes: [createVote('user-1', 'approve')],
      });

      const result = resolveProposal(proposal, 1);

      expect(result).toBe('pending');
    });

    it('stays pending for solo even with no votes', () => {
      const proposal = createProposal({ votes: [] });

      const result = resolveProposal(proposal, 1);

      expect(result).toBe('pending');
    });
  });

  describe('already resolved proposals', () => {
    it('returns existing status for approved proposals', () => {
      const proposal = createProposal({ status: 'approved' });

      const result = resolveProposal(proposal, 2);

      expect(result).toBe('approved');
    });

    it('returns existing status for rejected proposals', () => {
      const proposal = createProposal({ status: 'rejected' });

      const result = resolveProposal(proposal, 2);

      expect(result).toBe('rejected');
    });

    it('returns existing status for withdrawn proposals', () => {
      const proposal = createProposal({ status: 'withdrawn' });

      const result = resolveProposal(proposal, 2);

      expect(result).toBe('withdrawn');
    });

    it('returns existing status for expired proposals', () => {
      const proposal = createProposal({ status: 'expired' });

      const result = resolveProposal(proposal, 2);

      expect(result).toBe('expired');
    });
  });
});

// ============================================================================
// Tests: shouldExpireProposal
// ============================================================================

describe('shouldExpireProposal', () => {
  describe('Rule 2: 24-hour expiration', () => {
    it('returns false for proposal created just now', () => {
      const proposal = createProposal({
        proposedAt: new Date().toISOString(),
      });

      expect(shouldExpireProposal(proposal)).toBe(false);
    });

    it('returns false for proposal created 23 hours ago', () => {
      const proposedAt = new Date();
      proposedAt.setHours(proposedAt.getHours() - 23);
      const proposal = createProposal({
        proposedAt: proposedAt.toISOString(),
      });

      expect(shouldExpireProposal(proposal)).toBe(false);
    });

    it('returns true for proposal created 24 hours ago', () => {
      const proposedAt = new Date();
      proposedAt.setHours(proposedAt.getHours() - 24);
      const proposal = createProposal({
        proposedAt: proposedAt.toISOString(),
      });

      expect(shouldExpireProposal(proposal)).toBe(true);
    });

    it('returns true for proposal created 48 hours ago', () => {
      const proposedAt = new Date();
      proposedAt.setHours(proposedAt.getHours() - 48);
      const proposal = createProposal({
        proposedAt: proposedAt.toISOString(),
      });

      expect(shouldExpireProposal(proposal)).toBe(true);
    });
  });

  describe('only pending proposals expire', () => {
    it('returns false for approved proposals regardless of age', () => {
      const proposedAt = new Date();
      proposedAt.setHours(proposedAt.getHours() - 48);
      const proposal = createProposal({
        status: 'approved',
        proposedAt: proposedAt.toISOString(),
      });

      expect(shouldExpireProposal(proposal)).toBe(false);
    });

    it('returns false for rejected proposals regardless of age', () => {
      const proposedAt = new Date();
      proposedAt.setHours(proposedAt.getHours() - 48);
      const proposal = createProposal({
        status: 'rejected',
        proposedAt: proposedAt.toISOString(),
      });

      expect(shouldExpireProposal(proposal)).toBe(false);
    });
  });
});

// ============================================================================
// Tests: shouldAutoClearResult
// ============================================================================

describe('shouldAutoClearResult', () => {
  describe('Rule 5: 24-hour auto-clear', () => {
    it('returns false for pending proposals', () => {
      const proposal = createProposal({ status: 'pending' });

      expect(shouldAutoClearResult(proposal)).toBe(false);
    });

    it('returns false for closed proposal without closedAt', () => {
      const proposal = createProposal({
        status: 'approved',
        closedAt: undefined,
      });

      expect(shouldAutoClearResult(proposal)).toBe(false);
    });

    it('returns false for recently closed proposal', () => {
      const proposal = createProposal({
        status: 'approved',
        closedAt: new Date().toISOString(),
      });

      expect(shouldAutoClearResult(proposal)).toBe(false);
    });

    it('returns false for proposal closed 23 hours ago', () => {
      const closedAt = new Date();
      closedAt.setHours(closedAt.getHours() - 23);
      const proposal = createProposal({
        status: 'approved',
        closedAt: closedAt.toISOString(),
      });

      expect(shouldAutoClearResult(proposal)).toBe(false);
    });

    it('returns true for proposal closed 24 hours ago', () => {
      const closedAt = new Date();
      closedAt.setHours(closedAt.getHours() - 24);
      const proposal = createProposal({
        status: 'approved',
        closedAt: closedAt.toISOString(),
      });

      expect(shouldAutoClearResult(proposal)).toBe(true);
    });

    it('returns true for rejected proposal closed 24+ hours ago', () => {
      const closedAt = new Date();
      closedAt.setHours(closedAt.getHours() - 25);
      const proposal = createProposal({
        status: 'rejected',
        closedAt: closedAt.toISOString(),
      });

      expect(shouldAutoClearResult(proposal)).toBe(true);
    });
  });
});

// ============================================================================
// Tests: isVisibleToUser
// ============================================================================

describe('isVisibleToUser', () => {
  describe('Rule 4: User dismissals', () => {
    it('returns true for proposal not dismissed by user', () => {
      const proposal = createProposal({
        status: 'approved',
        closedAt: new Date().toISOString(),
        dismissals: [],
      });

      expect(isVisibleToUser(proposal, 'user-1')).toBe(true);
    });

    it('returns false for proposal dismissed by user', () => {
      const proposal = createProposal({
        status: 'approved',
        closedAt: new Date().toISOString(),
        dismissals: [createDismissal('user-1')],
      });

      expect(isVisibleToUser(proposal, 'user-1')).toBe(false);
    });

    it('returns true for other users when one user dismisses', () => {
      const proposal = createProposal({
        status: 'approved',
        closedAt: new Date().toISOString(),
        dismissals: [createDismissal('user-1')],
      });

      expect(isVisibleToUser(proposal, 'user-2')).toBe(true);
    });
  });

  describe('Rule 5: Auto-clear integration', () => {
    it('returns false for auto-cleared proposal', () => {
      const closedAt = new Date();
      closedAt.setHours(closedAt.getHours() - 25);
      const proposal = createProposal({
        status: 'approved',
        closedAt: closedAt.toISOString(),
        dismissals: [],
      });

      expect(isVisibleToUser(proposal, 'user-1')).toBe(false);
    });
  });

  describe('pending proposals', () => {
    it('returns true for pending proposal', () => {
      const proposal = createProposal({
        status: 'pending',
        dismissals: [],
      });

      expect(isVisibleToUser(proposal, 'user-1')).toBe(true);
    });
  });
});
