/**
 * Card Component
 *
 * A container component with configurable padding and optional elevation.
 * Can be made interactive with an onClick handler.
 */

import { type ReactNode } from 'react';

export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Click handler - makes card interactive with hover/focus states */
  onClick?: () => void;
  /** Internal padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Add shadow for elevated appearance */
  elevated?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Padding classes for each size option
 */
const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Card component for grouping related content.
 *
 * Features:
 * - Four padding options: none, sm, md, lg
 * - Optional elevation (shadow)
 * - Interactive mode with onClick (adds hover/focus states)
 * - Minimum 44px height when interactive for touch targets
 *
 * @example
 * // Basic card
 * <Card padding="md">
 *   <p>Card content here</p>
 * </Card>
 *
 * @example
 * // Elevated, clickable card
 * <Card padding="lg" elevated onClick={() => navigate('/details')}>
 *   <h3>Dish Name</h3>
 *   <p>Click to view details</p>
 * </Card>
 */
export function Card({
  children,
  onClick,
  padding = 'md',
  elevated = false,
  className = '',
}: CardProps) {
  const isInteractive = Boolean(onClick);

  const classes = [
    // Base styles
    'bg-white rounded-xl',
    // Padding
    paddingStyles[padding],
    // Elevation
    elevated ? 'shadow-md' : 'shadow-sm',
    // Interactive styles
    isInteractive && [
      'cursor-pointer',
      'min-h-[44px]', // Touch target
      'transition-all duration-150',
      'hover:shadow-lg hover:scale-[1.01]',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
      'active:scale-[0.99]',
    ],
    // Custom classes
    className,
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  if (isInteractive) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}

