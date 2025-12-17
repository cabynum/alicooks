/**
 * DishTypeSelector Component
 *
 * A segmented control for selecting dish type (entree, side, other).
 * Designed for mobile with 44px minimum touch targets.
 */

import { type DishType } from '@/types';

export interface DishTypeSelectorProps {
  /** Currently selected dish type */
  value: DishType;
  /** Called when selection changes */
  onChange: (type: DishType) => void;
  /** Disable all interactions */
  disabled?: boolean;
}

/**
 * Configuration for each dish type option
 */
const options: { value: DishType; label: string }[] = [
  { value: 'entree', label: 'Entree' },
  { value: 'side', label: 'Side Dish' },
  { value: 'other', label: 'Other' },
];

/**
 * Segmented control for picking a dish type.
 *
 * Features:
 * - Three options: Entree, Side Dish, Other
 * - Clear visual selected state
 * - 44px minimum touch targets
 * - Keyboard accessible (uses native buttons)
 *
 * @example
 * <DishTypeSelector
 *   value={dishType}
 *   onChange={setDishType}
 * />
 */
export function DishTypeSelector({
  value,
  onChange,
  disabled = false,
}: DishTypeSelectorProps) {
  return (
    <div className="space-y-1.5">
      {/* Label */}
      <span className="block text-sm font-medium text-stone-700">Type</span>

      {/* Segmented control container */}
      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label="Dish type"
      >
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={[
                // Base styles
                'flex-1 min-h-[44px] px-3',
                'text-sm font-medium',
                'rounded-lg',
                'transition-all duration-150 ease-out',
                // Focus ring
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500',
                // Disabled state
                'disabled:opacity-50 disabled:cursor-not-allowed',
                // Selected vs unselected styles
                isSelected
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

