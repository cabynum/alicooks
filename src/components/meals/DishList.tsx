/**
 * DishList Component
 *
 * Displays a list of dishes as DishCards, or a friendly empty state
 * when no dishes exist.
 */

import { type Dish } from '@/types';
import { EmptyState } from '@/components/ui';
import { DishCard } from './DishCard';

export interface DishListProps {
  /** Array of dishes to display */
  dishes: Dish[];
  /** Called when a dish is clicked */
  onDishClick?: (dish: Dish) => void;
  /** Called when the "Add Dish" action is clicked in empty state */
  onAddClick?: () => void;
  /** Show dish type badges (default: true) */
  showType?: boolean;
  /** Use compact card styling */
  compact?: boolean;
  /** Custom empty state title */
  emptyTitle?: string;
  /** Custom empty state message */
  emptyMessage?: string;
}

/**
 * A simple bowl/plate icon for the empty state
 */
function PlateIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Plate/bowl shape */}
      <ellipse cx="12" cy="14" rx="9" ry="4" />
      <path d="M3 14c0-4 4-8 9-8s9 4 9 8" />
      {/* Steam lines */}
      <path d="M8 6c0-1 .5-2 1-2" opacity="0.5" />
      <path d="M12 5c0-1.5.5-3 1-3" opacity="0.5" />
      <path d="M16 6c0-1 .5-2 1-2" opacity="0.5" />
    </svg>
  );
}

/**
 * List component for displaying dishes.
 *
 * Features:
 * - Renders DishCards in a vertical list
 * - Shows friendly empty state when no dishes
 * - Optional "Add Dish" action in empty state
 * - Customizable empty state messaging
 *
 * @example
 * // Basic usage with click handling
 * <DishList
 *   dishes={dishes}
 *   onDishClick={(dish) => navigate(`/edit/${dish.id}`)}
 *   onAddClick={() => navigate('/add')}
 * />
 *
 * @example
 * // Compact list without click handling
 * <DishList dishes={dishes} compact showType={false} />
 */
export function DishList({
  dishes,
  onDishClick,
  onAddClick,
  showType = true,
  compact = false,
  emptyTitle = 'No dishes yet',
  emptyMessage = 'Add your first dish to start building your meal collection.',
}: DishListProps) {
  // Empty state
  if (dishes.length === 0) {
    return (
      <EmptyState
        icon={<PlateIcon />}
        title={emptyTitle}
        message={emptyMessage}
        action={
          onAddClick
            ? {
                label: 'Add a Dish',
                onClick: onAddClick,
              }
            : undefined
        }
      />
    );
  }

  // Dish list
  return (
    <ul className="space-y-2" role="list" aria-label="Dishes">
      {dishes.map((dish) => (
        <li key={dish.id}>
          <DishCard
            dish={dish}
            onClick={onDishClick ? () => onDishClick(dish) : undefined}
            showType={showType}
            compact={compact}
          />
        </li>
      ))}
    </ul>
  );
}

