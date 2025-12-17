/**
 * Input Component
 *
 * A text input field with integrated label and error display.
 * Styled for mobile with larger touch targets.
 */

import { type InputHTMLAttributes, useId } from 'react';

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'id'
  > {
  /** Label text displayed above the input */
  label: string;
  /** Current input value (controlled) */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Error message to display below input */
  error?: string;
  /** Focus input on mount */
  autoFocus?: boolean;
}

/**
 * Input component for text entry.
 *
 * Features:
 * - Integrated label with proper accessibility (label linked via htmlFor)
 * - Error message display with visual indicator
 * - Mobile-friendly sizing (minimum 44px touch target)
 * - Auto-focus support
 *
 * @example
 * // Basic usage
 * <Input
 *   label="Dish Name"
 *   value={name}
 *   onChange={setName}
 *   placeholder="e.g., Chicken Parmesan"
 * />
 *
 * @example
 * // With error
 * <Input
 *   label="Dish Name"
 *   value={name}
 *   onChange={setName}
 *   error="Name is required"
 * />
 */
export function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoFocus,
  disabled,
  className = '',
  ...rest
}: InputProps) {
  // Generate unique ID for accessibility (links label to input)
  const id = useId();
  const errorId = `${id}-error`;

  const hasError = Boolean(error);

  const inputClasses = [
    // Base styles
    'block w-full px-4 py-3',
    'text-base text-stone-900 placeholder:text-stone-400',
    // Border and background
    'bg-white border rounded-lg',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500',
    // Focus ring
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    // Minimum touch target (44px height via padding + line-height)
    'min-h-[48px]',
    // Disabled state
    'disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed',
    // Transition
    'transition-colors duration-150',
    // Custom classes
    className,
  ].join(' ');

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-stone-700"
      >
        {label}
      </label>

      {/* Input field */}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        {...rest}
      />

      {/* Error message */}
      {hasError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

