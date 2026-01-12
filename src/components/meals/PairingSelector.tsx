/**
 * PairingSelector Component
 *
 * A word bank of side dishes displayed as tappable chips for selecting
 * which sides pair well with an entree. Used in DishForm when editing entrees.
 */

import { type Dish } from '@/types';
import { Plus, Check } from 'lucide-react';

export interface PairingSelectorProps {
  /** IDs of currently selected side dishes */
  selectedIds: string[];
  /** Called when selection changes */
  onChange: (ids: string[]) => void;
  /** List of available side dishes to choose from */
  sides: Dish[];
  /** Optional callback when user wants to add a new side */
  onAddNewSide?: () => void;
  /** Disable all interactions */
  disabled?: boolean;
}

/**
 * Chip component for individual side dish selection.
 */
function SideChip({
  name,
  isSelected,
  onToggle,
  disabled,
}: {
  name: string;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isSelected}
      className={[
        // Base styles
        'inline-flex items-center gap-1.5',
        'px-3 py-2',
        'text-sm font-medium',
        'rounded-full',
        'transition-all duration-150 ease-out',
        // Touch target (meets 44px height with padding)
        'min-h-[36px]',
        // Focus ring
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500',
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Selected vs unselected styles
        isSelected
          ? 'bg-amber-500 text-white shadow-sm'
          : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
      ].join(' ')}
    >
      {isSelected && <Check size={14} strokeWidth={3} />}
      {name}
    </button>
  );
}

/**
 * "Add New Side" button styled as a chip with a plus icon.
 */
function AddSideChip({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        // Base styles matching SideChip
        'inline-flex items-center gap-1.5',
        'px-3 py-2',
        'text-sm font-medium',
        'rounded-full',
        'min-h-[36px]',
        // Dashed border style to indicate "add" action
        'border-2 border-dashed border-stone-300',
        'text-stone-500',
        'bg-transparent',
        'transition-all duration-150 ease-out',
        'hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50',
        // Focus ring
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500',
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ].join(' ')}
    >
      <Plus size={14} />
      Add Side
    </button>
  );
}

/**
 * Word bank component for selecting side pairings.
 *
 * Features:
 * - Displays all available sides as tappable chips
 * - Multi-select supported (tap to toggle)
 * - Selected chips show checkmark and highlight
 * - Optional "Add New Side" button at the end
 * - Empty state when no sides exist
 *
 * @example
 * <PairingSelector
 *   selectedIds={['side-1', 'side-2']}
 *   onChange={setSelectedPairings}
 *   sides={allSideDishes}
 *   onAddNewSide={() => openQuickAddModal()}
 * />
 */
export function PairingSelector({
  selectedIds,
  onChange,
  sides,
  onAddNewSide,
  disabled = false,
}: PairingSelectorProps) {
  /**
   * Toggle a side's selection status.
   */
  const handleToggle = (sideId: string) => {
    if (selectedIds.includes(sideId)) {
      // Remove from selection
      onChange(selectedIds.filter((id) => id !== sideId));
    } else {
      // Add to selection
      onChange([...selectedIds, sideId]);
    }
  };

  // Empty state: no sides available yet
  if (sides.length === 0 && !onAddNewSide) {
    return (
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-stone-700">
          Pairs well with
        </span>
        <p className="text-sm text-stone-500 italic">
          No side dishes added yet. Add some sides first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <span className="block text-sm font-medium text-stone-700">
        Pairs well with
      </span>

      {/* Chip container */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Select side dishes that pair well"
      >
        {sides.map((side) => (
          <SideChip
            key={side.id}
            name={side.name}
            isSelected={selectedIds.includes(side.id)}
            onToggle={() => handleToggle(side.id)}
            disabled={disabled}
          />
        ))}

        {/* Add New Side button */}
        {onAddNewSide && (
          <AddSideChip onClick={onAddNewSide} disabled={disabled} />
        )}
      </div>

      {/* Hint text when sides exist but none selected */}
      {sides.length > 0 && selectedIds.length === 0 && (
        <p className="text-xs text-stone-500">
          Tap to select sides that go well with this dish
        </p>
      )}
    </div>
  );
}
