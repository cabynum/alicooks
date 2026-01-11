/**
 * DayAssignmentPage - Assign dishes to a specific day in a meal plan.
 *
 * Shows the current day's assignments and allows adding/removing dishes.
 * Users can also get a suggestion for this day.
 *
 * In synced mode, this page acquires a lock on the plan to prevent
 * concurrent edits by other household members.
 */

import { useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, X, Dices } from 'lucide-react';
import { usePlans, useDishes, useSuggestion, usePlanLock, useHousehold } from '@/hooks';
import { DishCard, LockIndicator } from '@/components/meals';
import { Button, EmptyState } from '@/components/ui';
import { useAuthContext } from '@/components/auth';

/**
 * Formats a date string for display (e.g., "Monday, December 16")
 */
function formatDateLong(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function DayAssignmentPage() {
  const navigate = useNavigate();
  const { planId, date } = useParams<{ planId: string; date: string }>();
  const { getPlanById, assignDishToDay, removeDishFromDay, isLoading: plansLoading, isSyncedMode } = usePlans();
  const { dishes, getDishById, isLoading: dishesLoading } = useDishes();
  const { suggestion, generate, isAvailable: canSuggest } = useSuggestion();
  const { isAuthenticated } = useAuthContext();
  const { members } = useHousehold();

  // Plan locking for collaborative editing
  const {
    lockStatus,
    acquireLock,
    releaseLock,
    forceUnlock,
    isReleasing,
  } = usePlanLock(planId ?? null);

  // Determine if we should use locking (only in synced mode)
  const shouldLock = isSyncedMode && isAuthenticated;

  // Find the display name of the user who has the lock
  const lockedByName = useMemo(() => {
    if (!lockStatus.lockedBy) return undefined;
    const member = members.find((m) => m.userId === lockStatus.lockedBy);
    return member?.profile?.displayName ?? 'Someone';
  }, [lockStatus.lockedBy, members]);

  // Acquire lock when entering edit mode
  useEffect(() => {
    if (shouldLock && planId) {
      acquireLock();
    }

    // Release lock when leaving the page
    return () => {
      if (shouldLock && planId) {
        releaseLock();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLock, planId]);

  // Check if editing is blocked by another user's lock
  const isEditBlocked = shouldLock && lockStatus.isLocked && !lockStatus.isLockedByCurrentUser;

  // Get the current plan and day
  const plan = planId ? getPlanById(planId) : null;
  const dayAssignment = plan?.days.find((d) => d.date === date);

  // Resolve assigned dish IDs to actual dish objects
  const assignedDishes = useMemo(() => {
    if (!dayAssignment) return [];
    return dayAssignment.dishIds
      .map((id) => getDishById(id))
      .filter((d): d is NonNullable<typeof d> => d !== undefined);
  }, [dayAssignment, getDishById]);

  // Get dishes available to add (not already assigned to this day)
  const availableDishes = useMemo(() => {
    if (!dayAssignment) return dishes;
    const assignedSet = new Set(dayAssignment.dishIds);
    return dishes.filter((d) => !assignedSet.has(d.id));
  }, [dishes, dayAssignment]);

  const isLoading = plansLoading || dishesLoading;

  const handleBack = () => {
    if (planId) {
      navigate(`/plan/${planId}`);
    } else {
      navigate('/');
    }
  };

  const handleAddDish = (dishId: string) => {
    if (isEditBlocked) return; // Blocked by lock
    if (planId && date) {
      assignDishToDay(planId, date, dishId);
    }
  };

  const handleRemoveDish = (dishId: string) => {
    if (isEditBlocked) return; // Blocked by lock
    if (planId && date) {
      removeDishFromDay(planId, date, dishId);
    }
  };

  const handleSuggest = () => {
    generate();
  };

  const handleAddSuggestion = () => {
    if (isEditBlocked) return; // Blocked by lock
    if (!suggestion || !planId || !date) return;

    // Add the entree
    assignDishToDay(planId, date, suggestion.entree.id);

    // Add all sides
    suggestion.sides.forEach((side) => {
      assignDishToDay(planId, date, side.id);
    });
  };

  // Redirect if plan or date not found
  if (!isLoading && (!plan || !dayAssignment || !date)) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <header
          className="sticky top-0 z-10 border-b backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(255, 254, 247, 0.95)',
            borderColor: 'var(--color-bg-muted)',
          }}
        >
          <div className="max-w-lg mx-auto px-4 py-4">
            <div
              className="h-7 rounded w-48 animate-pulse"
              style={{ backgroundColor: 'var(--color-bg-muted)' }}
            />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(255, 254, 247, 0.95)',
          borderColor: 'var(--color-bg-muted)',
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2"
              style={{ color: 'var(--color-text)' }}
              aria-label="Go back"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <div>
              <h1
                className="text-xl font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text)',
                }}
              >
                {date ? formatDateLong(date) : 'Plan Day'}
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                {assignedDishes.length === 0
                  ? 'No dishes assigned yet'
                  : `${assignedDishes.length} ${assignedDishes.length === 1 ? 'dish' : 'dishes'} assigned`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Lock indicator if blocked by another user */}
        {isEditBlocked && (
          <div className="mb-6">
            <LockIndicator
              lockedByName={lockedByName}
              lockedAt={lockStatus.lockedAt}
              isStale={lockStatus.isStale}
              onForceUnlock={lockStatus.isStale ? forceUnlock : undefined}
              isUnlocking={isReleasing}
            />
          </div>
        )}

        {/* Currently assigned dishes */}
        {assignedDishes.length > 0 && (
          <section className="mb-8">
            <h2
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Today's Meal
            </h2>
            <div className="space-y-2">
              {assignedDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <DishCard dish={dish} compact />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDish(dish.id)}
                    disabled={isEditBlocked}
                    className="p-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => {
                      if (isEditBlocked) return;
                      e.currentTarget.style.color = 'var(--color-error)';
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    aria-label={`Remove ${dish.name}`}
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Suggestion section */}
        {canSuggest && (
          <section className="mb-8">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(218, 165, 32, 0.1) 100%)',
                border: '1px solid rgba(255, 184, 0, 0.3)',
              }}
            >
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-secondary)' }}
              >
                Need inspiration?
              </h3>
              {suggestion ? (
                <div className="space-y-3">
                  <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                    <span className="font-medium">{suggestion.entree.name}</span>
                    {suggestion.sides.length > 0 && (
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {' '}with {suggestion.sides.map((s) => s.name).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddSuggestion}
                      disabled={isEditBlocked}
                    >
                      <span className="flex items-center gap-1">
                        <Check size={16} strokeWidth={2.5} />
                        Add This
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSuggest}
                    >
                      Try Another
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSuggest}
                >
                  <span className="flex items-center gap-1">
                    <Dices size={16} strokeWidth={2} />
                    Get a Suggestion
                  </span>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Available dishes to add */}
        <section>
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Add Dishes
          </h2>

          {availableDishes.length === 0 ? (
            <div
              className="text-center py-8 rounded-xl"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-bg-muted)',
              }}
            >
              {dishes.length === 0 ? (
                <EmptyState
                  imageSrc="/mascot-duo.png"
                  imageAlt="DishCourse mascots"
                  title="No Dishes Yet"
                  message="Add some dishes to your collection first."
                  action={{
                    label: 'Add a Dish',
                    onClick: () => navigate('/add'),
                  }}
                />
              ) : (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  All dishes are already assigned to this day!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {availableDishes.map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => handleAddDish(dish.id)}
                  disabled={isEditBlocked}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left cursor-pointer transition-all duration-150 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-bg-muted)',
                  }}
                  onMouseEnter={(e) => {
                    if (isEditBlocked) return;
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 184, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-bg-muted)';
                    e.currentTarget.style.backgroundColor = 'var(--color-card)';
                  }}
                >
                  <span className="flex-1 flex items-center gap-3">
                    <span
                      className="font-medium truncate"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {dish.name}
                    </span>
                    <span
                      className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor:
                          dish.type === 'entree'
                            ? 'var(--color-entree-bg)'
                            : dish.type === 'side'
                            ? 'var(--color-side-bg)'
                            : 'var(--color-bg-muted)',
                        color:
                          dish.type === 'entree'
                            ? '#92400E'
                            : dish.type === 'side'
                            ? '#166534'
                            : 'var(--color-text-muted)',
                      }}
                    >
                      {dish.type === 'entree' ? 'Entree' : dish.type === 'side' ? 'Side' : 'Other'}
                    </span>
                  </span>
                  <span style={{ color: 'var(--color-accent)' }}>
                    <Plus size={16} strokeWidth={2} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
