/**
 * CookTimePicker Component
 *
 * A picker for selecting cook time with hours and minutes dropdowns.
 * Returns the total time in minutes for storage.
 */

import { useId } from 'react';

export interface CookTimePickerProps {
  /** Label text displayed above the picker */
  label: string;
  /** Current value in minutes (e.g., 90 = 1h 30m) */
  value: number | undefined;
  /** Called when value changes */
  onChange: (minutes: number | undefined) => void;
  /** Disable the picker */
  disabled?: boolean;
}

/** Maximum hours to show in picker */
const MAX_HOURS = 4;

/** Minute increment options */
const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/**
 * Converts total minutes to hours and minutes.
 */
function minutesToHoursAndMinutes(totalMinutes: number | undefined): { hours: number; minutes: number } {
  if (totalMinutes === undefined || totalMinutes === 0) {
    return { hours: 0, minutes: 0 };
  }
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

/**
 * Formats cook time for display.
 * @example formatCookTime(90) => "1h 30m"
 * @example formatCookTime(30) => "30m"
 * @example formatCookTime(60) => "1h"
 */
export function formatCookTime(totalMinutes: number | undefined): string {
  if (totalMinutes === undefined || totalMinutes === 0) {
    return '';
  }
  const { hours, minutes } = minutesToHoursAndMinutes(totalMinutes);
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Cook time picker with hours and minutes dropdowns.
 *
 * Features:
 * - Separate hours (0-4) and minutes (0-55 in 5-min increments) selects
 * - Returns total minutes for easy storage
 * - Clears to undefined when both are 0
 * - Mobile-friendly with large touch targets
 *
 * @example
 * <CookTimePicker
 *   label="Cook Time"
 *   value={cookTimeMinutes}
 *   onChange={setCookTimeMinutes}
 * />
 */
export function CookTimePicker({
  label,
  value,
  onChange,
  disabled = false,
}: CookTimePickerProps) {
  const id = useId();
  const { hours, minutes } = minutesToHoursAndMinutes(value);

  const handleHoursChange = (newHours: number) => {
    const totalMinutes = newHours * 60 + minutes;
    onChange(totalMinutes === 0 ? undefined : totalMinutes);
  };

  const handleMinutesChange = (newMinutes: number) => {
    const totalMinutes = hours * 60 + newMinutes;
    onChange(totalMinutes === 0 ? undefined : totalMinutes);
  };

  const selectClasses = [
    // Base styles
    'block w-full px-3 py-3',
    'text-base text-stone-900',
    // Border and background
    'bg-white border border-stone-300 rounded-lg',
    // Focus styles
    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
    // Minimum touch target
    'min-h-[48px]',
    // Disabled state
    'disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed',
    // Transition
    'transition-colors duration-150',
    // Appearance for custom arrow
    'appearance-none bg-no-repeat bg-right',
    'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")]',
    'bg-[length:1.5rem_1.5rem]',
    'bg-[position:right_0.5rem_center]',
    'pr-10',
  ].join(' ');

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label
        htmlFor={`${id}-hours`}
        className="block text-sm font-medium text-stone-700"
      >
        {label}
      </label>

      {/* Hours and Minutes selects */}
      <div className="flex gap-3">
        {/* Hours */}
        <div className="flex-1">
          <select
            id={`${id}-hours`}
            value={hours}
            onChange={(e) => handleHoursChange(Number(e.target.value))}
            disabled={disabled}
            className={selectClasses}
            aria-label="Hours"
          >
            {Array.from({ length: MAX_HOURS + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i} {i === 1 ? 'hour' : 'hours'}
              </option>
            ))}
          </select>
        </div>

        {/* Minutes */}
        <div className="flex-1">
          <select
            id={`${id}-minutes`}
            value={minutes}
            onChange={(e) => handleMinutesChange(Number(e.target.value))}
            disabled={disabled}
            className={selectClasses}
            aria-label="Minutes"
          >
            {MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

