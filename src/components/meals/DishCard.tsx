/**
 * DishCard Component
 *
 * Displays a single dish with its type badge. Used in lists and grids.
 * Designed for mobile with 44px minimum touch targets.
 */

import { type Dish, type DishType } from '@/types';

export interface DishCardProps {
  /** The dish to display */
  dish: Dish;
  /** Click handler - makes card tappable */
  onClick?: () => void;
  /** Show the dish type badge (default: true) */
  showType?: boolean;
  /** Highlight as selected */
  selected?: boolean;
  /** Smaller version for compact lists */
  compact?: boolean;
}

/**
 * Badge styling for each dish type
 */
const typeBadgeStyles: Record<DishType, { bg: string; text: string; label: string }> = {
  entree: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'Entree',
  },
  side: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    label: 'Side',
  },
  other: {
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    label: 'Other',
  },
};

/**
 * Card component for displaying a single dish.
 *
 * Features:
 * - Type badge with color coding (Entree=amber, Side=emerald, Other=stone)
 * - Long name truncation with ellipsis
 * - 44px minimum height for touch targets
 * - Tap feedback with scale animation
 * - Selected state with ring highlight
 * - Compact mode for denser lists
 *
 * @example
 * // Basic usage
 * <DishCard dish={dish} onClick={() => navigate(`/edit/${dish.id}`)} />
 *
 * @example
 * // Compact, no type badge
 * <DishCard dish={dish} compact showType={false} />
 *
 * @example
 * // Selected state
 * <DishCard dish={dish} selected onClick={toggleSelection} />
 */
export function DishCard({
  dish,
  onClick,
  showType = true,
  selected = false,
  compact = false,
}: DishCardProps) {
  const isInteractive = Boolean(onClick);
  const badge = typeBadgeStyles[dish.type];

  const containerClasses = [
    // Base styles
    'w-full',
    'bg-white rounded-xl',
    'border',
    selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-stone-200',
    // Padding based on compact mode
    compact ? 'px-3 py-2' : 'px-4 py-3',
    // Minimum touch target
    'min-h-[44px]',
    // Flex layout
    'flex items-center justify-between gap-3',
    // Interactive styles
    isInteractive && [
      'cursor-pointer',
      'transition-all duration-150',
      'hover:border-stone-300 hover:shadow-sm',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
      'active:scale-[0.98]',
    ],
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {/* Dish name - truncates on overflow */}
      <span
        className={[
          'truncate',
          'font-medium',
          compact ? 'text-sm' : 'text-base',
          'text-stone-800',
        ].join(' ')}
      >
        {dish.name}
      </span>

      {/* Type badge */}
      {showType && (
        <span
          className={[
            'shrink-0',
            'px-2 py-0.5',
            'text-xs font-medium',
            'rounded-full',
            badge.bg,
            badge.text,
          ].join(' ')}
        >
          {badge.label}
        </span>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className={containerClasses}
        onClick={onClick}
        aria-label={`${dish.name}, ${badge.label}`}
      >
        {content}
      </button>
    );
  }

  return <div className={containerClasses}>{content}</div>;
}

