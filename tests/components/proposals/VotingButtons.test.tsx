/**
 * VotingButtons Component Tests
 *
 * Tests for the approve/reject voting buttons.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VotingButtons } from '@/components/proposals/VotingButtons';

// ============================================================================
// Tests
// ============================================================================

describe('VotingButtons', () => {
  describe('rendering', () => {
    it('renders two voting buttons', () => {
      render(<VotingButtons onVote={() => {}} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('renders approve button with "Sounds good" text', () => {
      render(<VotingButtons onVote={() => {}} />);

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByText('Sounds good')).toBeInTheDocument();
    });

    it('renders reject button with "Not tonight" text', () => {
      render(<VotingButtons onVote={() => {}} />);

      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
      expect(screen.getByText('Not tonight')).toBeInTheDocument();
    });

    it('has proper group role for accessibility', () => {
      render(<VotingButtons onVote={() => {}} />);

      expect(screen.getByRole('group', { name: /vote on this proposal/i })).toBeInTheDocument();
    });
  });

  describe('voting interactions', () => {
    it('calls onVote with "approve" when approve button clicked', async () => {
      const user = userEvent.setup();
      const onVote = vi.fn();

      render(<VotingButtons onVote={onVote} />);

      await user.click(screen.getByRole('button', { name: /approve/i }));

      expect(onVote).toHaveBeenCalledTimes(1);
      expect(onVote).toHaveBeenCalledWith('approve');
    });

    it('calls onVote with "reject" when reject button clicked', async () => {
      const user = userEvent.setup();
      const onVote = vi.fn();

      render(<VotingButtons onVote={onVote} />);

      await user.click(screen.getByRole('button', { name: /reject/i }));

      expect(onVote).toHaveBeenCalledTimes(1);
      expect(onVote).toHaveBeenCalledWith('reject');
    });
  });

  describe('current vote state', () => {
    it('shows "Approved" when user has approved', () => {
      render(<VotingButtons currentVote="approve" onVote={() => {}} />);

      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.queryByText('Sounds good')).not.toBeInTheDocument();
    });

    it('shows "Rejected" when user has rejected', () => {
      render(<VotingButtons currentVote="reject" onVote={() => {}} />);

      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.queryByText('Not tonight')).not.toBeInTheDocument();
    });

    it('marks approve button as pressed when approved', () => {
      render(<VotingButtons currentVote="approve" onVote={() => {}} />);

      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks reject button as pressed when rejected', () => {
      render(<VotingButtons currentVote="reject" onVote={() => {}} />);

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      expect(rejectButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('disabled state', () => {
    it('disables both buttons when disabled prop is true', () => {
      render(<VotingButtons disabled onVote={() => {}} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('disables both buttons when loading prop is true', () => {
      render(<VotingButtons loading onVote={() => {}} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('does not call onVote when disabled', async () => {
      const user = userEvent.setup();
      const onVote = vi.fn();

      render(<VotingButtons disabled onVote={onVote} />);

      await user.click(screen.getByRole('button', { name: /approve/i }));
      await user.click(screen.getByRole('button', { name: /reject/i }));

      expect(onVote).not.toHaveBeenCalled();
    });
  });

  describe('allows changing vote', () => {
    it('can vote again after already voting', async () => {
      const user = userEvent.setup();
      const onVote = vi.fn();

      render(<VotingButtons currentVote="approve" onVote={onVote} />);

      // User already approved but can change to reject
      await user.click(screen.getByRole('button', { name: /reject/i }));

      expect(onVote).toHaveBeenCalledWith('reject');
    });
  });
});
