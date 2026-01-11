/**
 * OTP Authentication Form Tests
 *
 * Tests the OTP code authentication form (formerly MagicLinkForm).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';

describe('MagicLinkForm (OTP)', () => {
  const mockOnSuccess = vi.fn();
  const mockSendMagicLink = vi.fn();
  const mockVerifyCode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMagicLink.mockResolvedValue(undefined);
    mockVerifyCode.mockResolvedValue({ user: { id: '123' } });
  });

  function renderForm(mode: 'signin' | 'signup' = 'signin') {
    return render(
      <MagicLinkForm
        mode={mode}
        onSuccess={mockOnSuccess}
        sendMagicLink={mockSendMagicLink}
        verifyCode={mockVerifyCode}
      />
    );
  }

  describe('email step - rendering', () => {
    it('renders email input', () => {
      renderForm();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders submit button for signin', () => {
      renderForm('signin');

      expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
    });

    it('renders submit button for signup', () => {
      renderForm('signup');

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('renders no password explanation', () => {
      renderForm();

      expect(screen.getByText(/no password needed/i)).toBeInTheDocument();
    });
  });

  describe('email step - validation', () => {
    it('shows error for empty email', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.click(screen.getByRole('button', { name: /send code/i }));

      expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    it('shows error for whitespace-only email', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), '   ');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    it('does not call send for invalid email format', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'notanemail');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      // The send function should not be called for invalid emails
      expect(mockSendMagicLink).not.toHaveBeenCalled();
    });

    it('accepts valid email format', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'valid@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      expect(mockSendMagicLink).toHaveBeenCalledWith('valid@example.com');
    });
  });

  describe('email step - submission', () => {
    it('trims and lowercases email', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), '  Test@Example.COM  ');
      await user.click(screen.getByRole('button', { name: /send code/i }));

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
      const submitButton = screen.getByRole('button', { name: /send code/i });
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolvePromise!();
    });

    it('transitions to code step after successful submission', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });
  });

  describe('code step - rendering', () => {
    async function goToCodeStep() {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      return user;
    }

    it('shows check your email message', async () => {
      await goToCodeStep();

      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    it('displays the email address', async () => {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText(/email address/i), 'myemail@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/myemail@example.com/)).toBeInTheDocument();
      });
    });

    it('shows verification code input', async () => {
      await goToCodeStep();

      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });

    it('shows sign in button', async () => {
      await goToCodeStep();

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows resend option', async () => {
      await goToCodeStep();

      expect(screen.getByText(/didn't get the code/i)).toBeInTheDocument();
    });

    it('shows back button', async () => {
      await goToCodeStep();

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  describe('code step - validation', () => {
    async function goToCodeStep() {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      return user;
    }

    it('sign in button is disabled until 6 digits entered', async () => {
      await goToCodeStep();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).toBeDisabled();
    });

    it('enables sign in button when 6 digits entered', async () => {
      const user = await goToCodeStep();

      await user.type(screen.getByLabelText(/verification code/i), '123456');

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      expect(signInButton).not.toBeDisabled();
    });
  });

  describe('code step - verification', () => {
    async function goToCodeStep() {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      return user;
    }

    it('calls verifyCode with email and code', async () => {
      const user = await goToCodeStep();

      await user.type(screen.getByLabelText(/verification code/i), '123456');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockVerifyCode).toHaveBeenCalledWith('test@example.com', '123456');
    });

    it('calls onSuccess after successful verification', async () => {
      const user = await goToCodeStep();

      await user.type(screen.getByLabelText(/verification code/i), '123456');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('displays error on verification failure', async () => {
      mockVerifyCode.mockRejectedValue(new Error('Invalid code'));

      const user = await goToCodeStep();

      await user.type(screen.getByLabelText(/verification code/i), '123456');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid code/i)).toBeInTheDocument();
      });
    });
  });

  describe('code step - navigation', () => {
    async function goToCodeStep() {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      return user;
    }

    it('back button returns to email step', async () => {
      const user = await goToCodeStep();

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('displays error from sendMagicLink failure', async () => {
      mockSendMagicLink.mockRejectedValue(new Error('Unable to send code.'));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/unable to send code/i)).toBeInTheDocument();
      });
    });

    it('does not transition to code step on error', async () => {
      mockSendMagicLink.mockRejectedValue(new Error('Failed'));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });

      // Should still be on email step
      expect(screen.queryByLabelText(/verification code/i)).not.toBeInTheDocument();
    });

    it('does not call onSuccess on send error', async () => {
      mockSendMagicLink.mockRejectedValue(new Error('Failed'));

      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

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

      const button = screen.getByRole('button', { name: /send code/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('code input has numeric input mode', async () => {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        const codeInput = screen.getByLabelText(/verification code/i);
        expect(codeInput).toHaveAttribute('inputmode', 'numeric');
      });
    });
  });
});
