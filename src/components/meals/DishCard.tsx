/**
 * DishCard Component
 *
 * Displays a single dish with its type badge and recipe source icons.
 * Used in lists and grids. Designed for mobile with 44px minimum touch targets.
 */

import { type Dish, type DishType } from '@/types';
import { getUrlIcon, getDomain } from '@/components/ui';

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
  /** Show recipe URL icons (default: true) */
  showRecipeIcons?: boolean;
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
 * - Recipe source icons (Instagram, YouTube, TikTok, etc.) with tap-to-open
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
  showRecipeIcons = true,
}: DishCardProps) {
  const isInteractive = Boolean(onClick);
  const badge = typeBadgeStyles[dish.type];
  const hasRecipeUrls = dish.recipeUrls && dish.recipeUrls.length > 0;
  const shouldShowIcons = showRecipeIcons && hasRecipeUrls;

  /**
   * Opens a recipe URL in a new tab.
   * Uses standard window.open which will deep-link to apps on mobile if supported.
   */
  const handleRecipeClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
    // Interactive styles (only when no recipe icons that need separate buttons)
    isInteractive && !shouldShowIcons && [
      'cursor-pointer',
      'transition-all duration-150',
      'hover:border-stone-300 hover:shadow-sm',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
      'active:scale-[0.98]',
    ],
    // Interactive styles when we have icons (div container)
    isInteractive && shouldShowIcons && [
      'cursor-pointer',
      'transition-all duration-150',
      'hover:border-stone-300 hover:shadow-sm',
    ],
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  /**
   * Handle card click - only when container is a div (when we have recipe icons)
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on a recipe icon button
    if ((e.target as HTMLElement).closest('[data-recipe-icon]')) {
      return;
    }
    onClick?.();
  };

  /**
   * Handle keyboard navigation for div container
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // When we have recipe icons AND an onClick, we need to render as a div
  // to avoid nested buttons (button inside button is invalid HTML)
  if (isInteractive && shouldShowIcons) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={containerClasses}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        aria-label={`${dish.name}, ${badge.label}`}
      >
        {/* Dish name - truncates on overflow */}
        <span
          className={[
            'truncate flex-1 text-left',
            'font-medium',
            compact ? 'text-sm' : 'text-base',
            'text-stone-800',
          ].join(' ')}
        >
          {dish.name}
        </span>

        {/* Right side: Recipe icons and type badge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Recipe source icons */}
          <div className="flex items-center gap-1">
            {dish.recipeUrls!.map((url) => (
              <button
                key={url}
                type="button"
                data-recipe-icon
                onClick={(e) => handleRecipeClick(url, e)}
                className={[
                  'p-1.5 rounded-full',
                  'hover:bg-stone-100',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                  'transition-colors duration-150',
                ].join(' ')}
                aria-label={`Open recipe on ${getDomain(url)}`}
                title={getDomain(url)}
              >
                {getUrlIcon(url)}
              </button>
            ))}
          </div>

          {/* Type badge */}
          {showType && (
            <span
              className={[
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
        </div>
      </div>
    );
  }

  // Standard content for button or non-interactive div
  const content = (
    <>
      {/* Dish name - truncates on overflow */}
      <span
        className={[
          'truncate flex-1 text-left',
          'font-medium',
          compact ? 'text-sm' : 'text-base',
          'text-stone-800',
        ].join(' ')}
      >
        {dish.name}
      </span>

      {/* Right side: Recipe icons (only when not interactive) and type badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Recipe source icons - only when not interactive (no nested buttons issue) */}
        {shouldShowIcons && (
          <div className="flex items-center gap-1">
            {dish.recipeUrls!.map((url) => (
              <button
                key={url}
                type="button"
                onClick={(e) => handleRecipeClick(url, e)}
                className={[
                  'p-1.5 rounded-full',
                  'hover:bg-stone-100',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                  'transition-colors duration-150',
                ].join(' ')}
                aria-label={`Open recipe on ${getDomain(url)}`}
                title={getDomain(url)}
              >
                {getUrlIcon(url)}
              </button>
            ))}
          </div>
        )}

        {/* Type badge */}
        {showType && (
          <span
            className={[
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
      </div>
    </>
  );

  // Interactive without recipe icons - can use button
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

  // Non-interactive
  return <div className={containerClasses}>{content}</div>;
}
