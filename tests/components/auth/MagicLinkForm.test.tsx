/**
 * MagicLinkForm Component Tests
 *
 * Tests the magic link authentication form.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';

describe('MagicLinkForm', () => {
  const mockOnSuccess = vi.fn();
  const mockSendMagicLink = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMagicLink.mockResolvedValue(undefined);
  });

  function renderForm(mode: 'signin' | 'signup' = 'signin') {
    return render(
      <MagicLinkForm
        mode={mode}
        onSuccess={mockOnSuccess}
        sendMagicLink={mockSendMagicLink}
      />
    );
  }

  describe('rendering', () => {
    it('renders email input', () => {
      renderForm();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders submit button for signin', () => {
      renderForm('signin');

      expect(screen.getByRole('button', { name: /send sign-in link/i })).toBeInTheDocument();
    });

    it('renders submit button for signup', () => {
      renderForm('signup');

      expect(screen.getByRole('button', { name: /continue with email/i })).toBeInTheDocument();
    });

    it('renders magic link explanation', () => {
      renderForm();

      expect(screen.getByText(/no password needed/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows error for empty email', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    it('shows error for whitespace-only email', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), '   ');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    it('accepts valid email format', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'valid@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      expect(mockSendMagicLink).toHaveBeenCalledWith('valid@example.com');
    });
  });

  describe('submission', () => {
    it('trims and lowercases email', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), '  Test@Example.COM  ');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      expect(mockSendMagicLink).toHaveBeenCalledWith('test@example.com');
    });

    it('shows loading state during submission', async () => {
      // Make the promise pending
      let resolvePromise: () => void;
      mockSendMagicLink.mockImplementation(
        () => new Promise((resolve) => { resolvePromise = resolve; })
      );

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      const submitButton = screen.getByRole('button', { name: /send sign-in link/i });
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolvePromise!();
    });

    it('calls onSuccess after successful submission', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('success state', () => {
    it('shows check your email message after success', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('displays the email address in success message', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'myemail@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.getByText(/myemail@example.com/)).toBeInTheDocument();
      });
    });

    it('shows link expiry info in success state', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.getByText(/expires in 1 hour/i)).toBeInTheDocument();
      });
    });

    it('allows using different email after success', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/use a different email/i));

      // Should be back to form state
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    });
  });

  describe('error handling', () => {
    it('displays error from sendMagicLink failure', async () => {
      mockSendMagicLink.mockRejectedValue(new Error('Unable to send sign-in link.'));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.getByText(/unable to send sign-in link/i)).toBeInTheDocument();
      });
    });

    it('does not show success state on error', async () => {
      mockSendMagicLink.mockRejectedValue(new Error('Failed'));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      });
    });

    it('does not call onSuccess on error', async () => {
      mockSendMagicLink.mockRejectedValue(new Error('Failed'));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible email input', () => {
      renderForm();

      const input = screen.getByLabelText(/email address/i);
      expect(input).toHaveAttribute('type', 'email');
    });

    it('has accessible submit button', () => {
      renderForm();

      const button = screen.getByRole('button', { name: /send sign-in link/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('shows error as alert', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole('button', { name: /send sign-in link/i }));

      const error = screen.getByText(/please enter your email/i);
      expect(error).toBeInTheDocument();
    });
  });
});
