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
  /** Name of who added the dish (for collaborative mode) */
  addedByName?: string;
  /** When the dish was added (ISO timestamp, for collaborative mode) */
  addedAt?: string;
}

/**
 * Badge styling for each dish type
 * Uses CSS custom properties from the design system
 */
const typeBadgeStyles: Record<DishType, { label: string; style: React.CSSProperties }> = {
  entree: {
    label: 'Entree',
    style: {
      backgroundColor: 'var(--color-entree-bg)',
      color: '#92400E', // Warm brown for contrast
    },
  },
  side: {
    label: 'Side',
    style: {
      backgroundColor: 'var(--color-side-bg)',
      color: '#166534', // Deep green for contrast
    },
  },
  other: {
    label: 'Other',
    style: {
      backgroundColor: 'var(--color-bg-muted)',
      color: 'var(--color-text-muted)',
    },
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
  addedByName,
  addedAt,
}: DishCardProps) {
  const isInteractive = Boolean(onClick);
  const badge = typeBadgeStyles[dish.type];
  const hasRecipeUrls = dish.recipeUrls && dish.recipeUrls.length > 0;
  const shouldShowIcons = showRecipeIcons && hasRecipeUrls;
  
  // Format "Added by" text
  const formatAddedBy = () => {
    if (!addedByName) return null;
    let text = `Added by ${addedByName}`;
    if (addedAt) {
      const date = new Date(addedAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        text += ' today';
      } else if (diffDays === 1) {
        text += ' yesterday';
      } else if (diffDays < 7) {
        text += ` ${diffDays} days ago`;
      } else {
        text += ` on ${date.toLocaleDateString()}`;
      }
    }
    return text;
  };

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
    'rounded-xl',
    'border',
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
      'hover:shadow-md',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'active:scale-[0.98]',
    ],
    // Interactive styles when we have icons (div container)
    isInteractive && shouldShowIcons && [
      'cursor-pointer',
      'transition-all duration-150',
      'hover:shadow-md',
    ],
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-card)',
    borderColor: selected ? 'var(--color-accent)' : 'transparent',
    boxShadow: selected 
      ? '0 0 0 3px rgba(255, 184, 0, 0.2), var(--shadow-sm)' 
      : 'var(--shadow-sm)',
  };

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
    const addedByText = formatAddedBy();
    return (
      <div
        role="button"
        tabIndex={0}
        className={containerClasses}
        style={containerStyle}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        aria-label={`${dish.name}, ${badge.label}`}
      >
        {/* Left side: Name and attribution */}
        <div className="flex-1 min-w-0">
          {/* Dish name - truncates on overflow */}
          <span
            className={[
              'truncate block',
              'font-medium',
              compact ? 'text-sm' : 'text-base',
            ].join(' ')}
            style={{ color: 'var(--color-text)' }}
          >
            {dish.name}
          </span>
          
          {/* Attribution line */}
          {addedByText && (
            <span
              className="text-xs truncate block"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {addedByText}
            </span>
          )}
        </div>

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
              className="px-2.5 py-1 text-xs font-semibold rounded-full"
              style={badge.style}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Standard content for button or non-interactive div
  const addedByText = formatAddedBy();
  const content = (
    <>
      {/* Left side: Name and attribution */}
      <div className="flex-1 min-w-0 text-left">
        {/* Dish name - truncates on overflow */}
        <span
          className={[
            'truncate block',
            'font-medium',
            compact ? 'text-sm' : 'text-base',
          ].join(' ')}
          style={{ color: 'var(--color-text)' }}
        >
          {dish.name}
        </span>
        
        {/* Attribution line */}
        {addedByText && (
          <span
            className="text-xs truncate block"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {addedByText}
          </span>
        )}
      </div>

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
            className="px-2.5 py-1 text-xs font-semibold rounded-full"
            style={badge.style}
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
        style={containerStyle}
        onClick={onClick}
        aria-label={`${dish.name}, ${badge.label}`}
      >
        {content}
      </button>
    );
  }

  // Non-interactive
  return (
    <div className={containerClasses} style={containerStyle}>
      {content}
    </div>
  );
}
