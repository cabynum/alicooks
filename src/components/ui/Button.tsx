/**
 * Button Component
 *
 * A reusable button with multiple visual variants and sizes.
 * All buttons meet the 44px minimum touch target requirement for mobile.
 */

import { type ReactNode, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Visual style variant */
  variant: 'primary' | 'secondary' | 'ghost';
  /** Button size - all meet 44px minimum touch target */
  size?: 'sm' | 'md' | 'lg';
  /** Expand to fill container width */
  fullWidth?: boolean;
  /** Disable interactions */
  disabled?: boolean;
  /** Show loading spinner and disable interactions */
  loading?: boolean;
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Loading spinner component displayed when button is in loading state
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Base styles shared across all button variants.
 * Ensures consistent sizing, touch targets, and transitions.
 */
const baseStyles = [
  // Layout
  'inline-flex items-center justify-center gap-2',
  // Typography
  'font-semibold',
  // Touch target & sizing (minimum 44px height for mobile)
  'min-h-[44px] px-4',
  // Rounded corners
  'rounded-lg',
  // Transitions for smooth interactions
  'transition-all duration-150 ease-out',
  // Focus ring for accessibility
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  // Disabled state
  'disabled:opacity-50 disabled:cursor-not-allowed',
  // Active press effect
  'active:scale-[0.98]',
].join(' ');

/**
 * Variant-specific styles for different visual treatments
 */
const variantStyles = {
  primary: [
    'bg-amber-500 text-white',
    'hover:bg-amber-600',
    'focus-visible:ring-amber-500',
    'shadow-sm hover:shadow-md',
  ].join(' '),

  secondary: [
    'bg-stone-100 text-stone-800',
    'hover:bg-stone-200',
    'focus-visible:ring-stone-400',
    'border border-stone-300',
  ].join(' '),

  ghost: [
    'bg-transparent text-stone-700',
    'hover:bg-stone-100',
    'focus-visible:ring-stone-400',
  ].join(' '),
};

/**
 * Size-specific styles
 * Note: All sizes maintain minimum 44px height for touch accessibility
 */
const sizeStyles = {
  sm: 'text-sm min-h-[44px] px-3',
  md: 'text-base min-h-[44px] px-4',
  lg: 'text-lg min-h-[52px] px-6',
};

/**
 * Button component for user actions.
 *
 * Features:
 * - Three variants: primary (calls-to-action), secondary (less emphasis), ghost (minimal)
 * - Three sizes: sm, md, lg - all meet 44px minimum touch target
 * - Loading state with spinner
 * - Full accessibility support with focus rings
 *
 * @example
 * // Primary action button
 * <Button variant="primary" onClick={handleSave}>
 *   Save Dish
 * </Button>
 *
 * @example
 * // Loading state
 * <Button variant="primary" loading onClick={handleSubmit}>
 *   Saving...
 * </Button>
 */
export function Button({
  variant,
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      {...rest}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}

