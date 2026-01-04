/**
 * HouseholdSwitcher Component
 *
 * Dropdown/modal for switching between households.
 * Shows the current household and allows switching to others.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Plus, Settings } from 'lucide-react';
import type { Household } from '@/types';

export interface HouseholdSwitcherProps {
  /** The currently active household */
  currentHousehold: Household;
  /** All households the user belongs to */
  households: Household[];
  /** Called when user switches to a different household */
  onSwitch: (householdId: string) => void;
}

/**
 * HouseholdSwitcher - Switch between multiple households.
 *
 * Features:
 * - Shows current household name
 * - Dropdown with other households
 * - "Create new" option
 * - Touch-friendly 44px targets
 */
export function HouseholdSwitcher({
  currentHousehold,
  households,
  onSwitch,
}: HouseholdSwitcherProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  /**
   * Toggle dropdown
   */
  function handleToggle() {
    setIsOpen((prev) => !prev);
  }

  /**
   * Select a household
   */
  function handleSelect(householdId: string) {
    onSwitch(householdId);
    setIsOpen(false);
  }

  /**
   * Navigate to create page
   */
  function handleCreate() {
    setIsOpen(false);
    navigate('/household/create');
  }

  /**
   * Navigate to household settings
   */
  function handleSettings() {
    setIsOpen(false);
    navigate('/household');
  }

  // Only show if there are multiple households or to allow creation
  const showDropdown = households.length > 0;

  if (!showDropdown) {
    return (
      <button
        type="button"
        onClick={() => navigate('/household/create')}
        className={[
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'text-sm font-medium',
          'bg-white/15 hover:bg-white/25',
          'text-white',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        ].join(' ')}
      >
        <Plus size={16} />
        Create Household
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        className={[
          'flex items-center gap-2 px-3 py-2 rounded-lg min-h-[44px]',
          'text-sm font-medium',
          'bg-white/15 hover:bg-white/25',
          'text-white',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        ].join(' ')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate max-w-[150px]">{currentHousehold.name}</span>
        <ChevronDown
          size={16}
          className={[
            'transition-transform duration-150',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={[
            'absolute right-0 mt-2 w-64 z-50',
            'rounded-xl shadow-lg overflow-hidden',
            'border',
          ].join(' ')}
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-bg-muted)',
          }}
          role="listbox"
          aria-label="Select household"
        >
          {/* Household list */}
          <ul className="py-1">
            {households.map((household) => {
              const isSelected = household.id === currentHousehold.id;

              return (
                <li key={household.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(household.id)}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-3 min-h-[44px]',
                      'text-left text-sm',
                      'transition-colors duration-150',
                      isSelected
                        ? ''
                        : 'hover:bg-stone-50',
                    ].join(' ')}
                    style={{
                      backgroundColor: isSelected ? 'var(--color-bg-muted)' : undefined,
                      color: 'var(--color-text)',
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="flex-1 truncate">{household.name}</span>
                    {isSelected && (
                      <Check
                        size={18}
                        style={{ color: 'var(--color-accent)' }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div
            className="border-t"
            style={{ borderColor: 'var(--color-bg-muted)' }}
          />

          {/* Actions */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleSettings}
              className={[
                'w-full flex items-center gap-3 px-4 py-3 min-h-[44px]',
                'text-left text-sm',
                'hover:bg-stone-50',
                'transition-colors duration-150',
              ].join(' ')}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Settings size={18} />
              Household Settings
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className={[
                'w-full flex items-center gap-3 px-4 py-3 min-h-[44px]',
                'text-left text-sm',
                'hover:bg-stone-50',
                'transition-colors duration-150',
              ].join(' ')}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Plus size={18} />
              Create New Household
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
