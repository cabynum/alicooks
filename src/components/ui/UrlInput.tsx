/**
 * UrlInput Component
 *
 * A component for managing multiple recipe URLs.
 * Includes URL validation and displays domain-specific icons.
 */

import { useState, useId } from 'react';
import { Button } from './Button';

export interface UrlInputProps {
  /** Label text displayed above the input */
  label: string;
  /** Current list of URLs */
  value: string[];
  /** Called when URLs change */
  onChange: (urls: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the input */
  disabled?: boolean;
}

/**
 * Validates if a string is a valid URL.
 * Must start with http:// or https://
 */
export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts the domain from a URL for display.
 * @example getDomain('https://www.instagram.com/p/123') => 'instagram.com'
 */
export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Known recipe source domains with their display info.
 */
export type RecipeSource = 'instagram' | 'youtube' | 'tiktok' | 'pinterest' | 'other';

/**
 * Detects the recipe source from a URL.
 */
export function getRecipeSource(url: string): RecipeSource {
  const domain = getDomain(url).toLowerCase();
  
  if (domain.includes('instagram.com')) return 'instagram';
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
  if (domain.includes('tiktok.com')) return 'tiktok';
  if (domain.includes('pinterest.com')) return 'pinterest';
  
  return 'other';
}

/**
 * SVG icons for each recipe source.
 * Using simple, recognizable icons that work at small sizes.
 */
const sourceIcons: Record<RecipeSource, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};

/**
 * Colors for each source icon.
 */
const sourceColors: Record<RecipeSource, string> = {
  instagram: 'text-pink-600',
  youtube: 'text-red-600',
  tiktok: 'text-stone-900',
  pinterest: 'text-red-700',
  other: 'text-stone-500',
};

/**
 * Returns the icon component for a given URL.
 */
export function getUrlIcon(url: string): React.ReactNode {
  const source = getRecipeSource(url);
  return (
    <span className={sourceColors[source]}>
      {sourceIcons[source]}
    </span>
  );
}

/**
 * URL input component for managing multiple recipe links.
 *
 * Features:
 * - Add multiple URLs with validation
 * - Shows domain-specific icons (Instagram, YouTube, TikTok, Pinterest)
 * - Remove individual URLs
 * - Mobile-friendly with large touch targets
 *
 * @example
 * <UrlInput
 *   label="Recipe Links"
 *   value={urls}
 *   onChange={setUrls}
 *   placeholder="https://instagram.com/..."
 * />
 */
export function UrlInput({
  label,
  value,
  onChange,
  placeholder = 'https://',
  disabled = false,
}: UrlInputProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    
    if (!trimmed) {
      return;
    }

    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    // Check for duplicates
    if (value.includes(trimmed)) {
      setError('This URL has already been added');
      return;
    }

    onChange([...value, trimmed]);
    setInputValue('');
    setError(undefined);
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const inputClasses = [
    // Base styles
    'block w-full px-4 py-3',
    'text-base text-stone-900 placeholder:text-stone-400',
    // Border and background
    'bg-white border rounded-lg',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-stone-300 focus:border-amber-500 focus:ring-amber-500',
    // Focus ring
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    // Minimum touch target
    'min-h-[48px]',
    // Disabled state
    'disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed',
    // Transition
    'transition-colors duration-150',
  ].join(' ');

  return (
    <div className="space-y-3">
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-stone-700"
      >
        {label}
      </label>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          id={id}
          type="url"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(undefined);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Button
          variant="secondary"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          className="shrink-0 px-4"
          type="button"
        >
          Add
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* URL list */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((url) => (
            <li
              key={url}
              className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-lg border border-stone-200"
            >
              {/* Domain icon */}
              {getUrlIcon(url)}
              
              {/* Domain name */}
              <span className="flex-1 text-sm text-stone-700 truncate">
                {getDomain(url)}
              </span>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                disabled={disabled}
                className="shrink-0 p-1 text-stone-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors"
                aria-label={`Remove ${getDomain(url)}`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

