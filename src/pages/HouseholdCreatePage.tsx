/**
 * HouseholdCreatePage - Create a new household.
 *
 * This page allows authenticated users to create a new household.
 * After creation, they become the creator/admin of that household.
 * 
 * If the user is not authenticated, they are redirected to sign in first.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useHousehold } from '@/hooks';
import { useAuthContext } from '@/components/auth';

export function HouseholdCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { createHousehold, isLoading: hookLoading } = useHousehold();

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth?redirectTo=/household/create', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = hookLoading || isSubmitting;

  /**
   * Handle back navigation
   */
  function handleBack() {
    navigate(-1);
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a name for your household.');
      return;
    }
    if (trimmedName.length > 100) {
      setError('Household name must be 100 characters or less.');
      return;
    }

    setIsSubmitting(true);

    try {
      const household = await createHousehold({ name: trimmedName });
      // Navigate to the new household's page
      navigate(`/household/${household.id}`, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create household.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="max-w-lg mx-auto flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className={[
              'p-2 -ml-2 rounded-lg',
              'text-white/80 hover:text-white hover:bg-white/10',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
            ].join(' ')}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-white ml-2">
            Create Household
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Users
                size={32}
                style={{ color: 'var(--color-primary)' }}
              />
            </div>
          </div>

          <h2
            className="text-xl font-semibold text-center mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}
          >
            Start a Household
          </h2>

          <p
            className="text-center mb-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Create a shared space for your family to manage dishes and meal plans together.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Household name"
              value={name}
              onChange={setName}
              placeholder="e.g., Smith Family"
              autoFocus
              disabled={isLoading}
              error={error ?? undefined}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Create Household
            </Button>
          </form>
        </div>

        {/* Help text */}
        <div className="mt-6 space-y-4">
          <p
            className="text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            After creating your household, you can invite family members to join.
          </p>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--color-bg-muted)' }}
          >
            <h3
              className="font-medium mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              What happens next?
            </h3>
            <ul
              className="text-sm space-y-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <li>• You become the household creator</li>
              <li>• You can invite others via link or code</li>
              <li>• All members share dishes and meal plans</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
