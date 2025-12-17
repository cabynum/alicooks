/**
 * EmptyState Component
 *
 * A friendly message displayed when no content exists.
 * Encourages users to take action.
 */

import { type ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Optional icon displayed above the title */
  icon?: ReactNode;
  /** Main heading text */
  title: string;
  /** Descriptive message below the title */
  message: string;
  /** Optional call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState component for empty lists and initial states.
 *
 * Features:
 * - Optional icon for visual interest
 * - Title and message for context
 * - Optional action button to guide users
 * - Friendly, encouraging appearance
 *
 * @example
 * // No dishes yet
 * <EmptyState
 *   icon={<DishIcon />}
 *   title="No dishes yet"
 *   message="Add your first dish to get started with meal planning."
 *   action={{
 *     label: "Add a Dish",
 *     onClick: () => navigate('/add')
 *   }}
 * />
 *
 * @example
 * // Simple empty state without action
 * <EmptyState
 *   title="No results"
 *   message="Try adjusting your search or filters."
 * />
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-stone-400" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>

      {/* Message */}
      <p className="text-stone-500 max-w-xs mb-6">{message}</p>

      {/* Action button */}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

