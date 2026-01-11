/**
 * HouseholdCreatePage - Create a new household.
 *
 * This page allows authenticated users to create a new household.
 * After creation, they become the creator/admin of that household.
 * 
 * If the user is not authenticated, they are redirected to sign in first.
 * If they have local dishes, offers to migrate them to the new household.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Utensils } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useHousehold } from '@/hooks';
import { useAuthContext } from '@/components/auth';
import { getLocalDishCount, migrateLocalDishes } from '@/services/sync';
import { getUserFriendlyError } from '@/utils';

export function HouseholdCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthContext();
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
  const [migrateDishes, setMigrateDishes] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Check for local dishes
  const localDishCount = getLocalDishCount();
  const hasLocalDishes = localDishCount > 0;

  const isLoading = hookLoading || isSubmitting || isMigrating;

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
      
      // Migrate local dishes if user opted in
      if (hasLocalDishes && migrateDishes && user) {
        setIsMigrating(true);
        const result = await migrateLocalDishes(household.id, user.id);
        if (!result.success) {
          console.error('Migration failed:', result.error);
          // Continue anyway - dishes are still in localStorage
        }
        setIsMigrating(false);
      }
      
      // Navigate to the new household's page
      navigate(`/household/${household.id}`, { replace: true });
    } catch (err) {
      setError(getUserFriendlyError(err));
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

            {/* Migration option - show if user has local dishes */}
            {hasLocalDishes && (
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  <Utensils size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={migrateDishes}
                      onChange={(e) => setMigrateDishes(e.target.checked)}
                      disabled={isLoading}
                      className="w-5 h-5 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span
                      className="font-medium"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Bring my {localDishCount} dish{localDishCount !== 1 ? 'es' : ''}
                    </span>
                  </label>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Add your existing dishes to this household so everyone can see them.
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isMigrating ? 'Migrating dishes...' : 'Create Household'}
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
