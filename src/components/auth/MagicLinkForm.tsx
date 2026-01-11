/**
 * MagicLinkForm Component
 *
 * Email input form for passwordless authentication via magic link.
 * Sends a sign-in link to the user's email — no password required.
 *
 * Follows Constitution principle I: User-First Simplicity — magic links
 * are intuitive and don't require remembering passwords.
 */

import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { getUserFriendlyError } from '@/utils';

export interface MagicLinkFormProps {
  /** Called when magic link is successfully sent */
  onSuccess: () => void;
  /** Whether the form is for sign in or sign up */
  mode: 'signin' | 'signup';
  /** Externally controlled loading state */
  loading?: boolean;
  /** Function to send the magic link */
  sendMagicLink: (email: string) => Promise<void>;
}

/**
 * Validates email format.
 * Basic check — Supabase will do the real validation.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * MagicLinkForm - Passwordless email authentication.
 *
 * Features:
 * - Email input with validation
 * - Loading state during send
 * - Success state showing "check your email" message
 * - Error display for failures
 * - Mobile-friendly with proper touch targets
 *
 * @example
 * ```tsx
 * <MagicLinkForm
 *   mode="signin"
 *   sendMagicLink={signIn}
 *   onSuccess={() => setShowSuccess(true)}
 * />
 * ```
 */
export function MagicLinkForm({
  onSuccess,
  mode,
  loading: externalLoading,
  sendMagicLink,
}: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const loading = externalLoading ?? isLoading;

  /**
   * Handle form submission.
   * Validates email and sends magic link.
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate email
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await sendMagicLink(trimmedEmail);
      setIsSent(true);
      onSuccess();
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }

  // Success state — email has been sent
  if (isSent) {
    return (
      <div className="text-center space-y-4 py-8">
        {/* Email icon */}
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: 'var(--color-primary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h2
          className="text-xl font-semibold font-display"
          style={{ color: 'var(--color-text)' }}
        >
          Check your email
        </h2>

        <p
          className="text-base"
          style={{ color: 'var(--color-text-muted)' }}
        >
          We sent a sign-in link to{' '}
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            {email}
          </span>
        </p>

        <p
          className="text-sm"
          style={{ color: 'var(--color-text-light)' }}
        >
          Click the link in the email to sign in. It expires in 1 hour.
        </p>

        <button
          type="button"
          onClick={() => {
            setIsSent(false);
            setEmail('');
          }}
          className="text-sm underline hover:no-underline transition-all"
          style={{ color: 'var(--color-secondary)' }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  // Form state
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Input
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          autoFocus
          disabled={loading}
          error={error ?? undefined}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {mode === 'signin' ? 'Send sign-in link' : 'Continue with email'}
      </Button>

      <p
        className="text-center text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        No password needed — we&apos;ll email you a magic link.
      </p>
    </form>
  );
}
