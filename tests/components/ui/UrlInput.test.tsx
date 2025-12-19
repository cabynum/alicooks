/**
 * UrlInput Component Tests
 *
 * Tests for the UrlInput UI component and utility functions.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  UrlInput,
  isValidUrl,
  getDomain,
  getRecipeSource,
} from '@/components/ui/UrlInput';

describe('UrlInput', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      expect(screen.getByText('Recipe Links')).toBeInTheDocument();
    });

    it('renders input field with placeholder', () => {
      render(
        <UrlInput
          label="Recipe Links"
          value={[]}
          onChange={() => {}}
          placeholder="https://example.com"
        />
      );

      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    });

    it('renders Add button', () => {
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders existing URLs', () => {
      render(
        <UrlInput
          label="Recipe Links"
          value={['https://instagram.com/post/123', 'https://youtube.com/watch?v=abc']}
          onChange={() => {}}
        />
      );

      expect(screen.getByText('instagram.com')).toBeInTheDocument();
      expect(screen.getByText('youtube.com')).toBeInTheDocument();
    });

    it('shows remove buttons for each URL', () => {
      render(
        <UrlInput
          label="Recipe Links"
          value={['https://instagram.com/post/123']}
          onChange={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: 'Remove instagram.com' })).toBeInTheDocument();
    });
  });

  describe('adding URLs', () => {
    it('calls onChange with new URL when Add is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={onChange} />
      );

      await user.type(screen.getByRole('textbox'), 'https://instagram.com/post/123');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(onChange).toHaveBeenCalledWith(['https://instagram.com/post/123']);
    });

    it('calls onChange with new URL when Enter is pressed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={onChange} />
      );

      await user.type(screen.getByRole('textbox'), 'https://youtube.com/watch{Enter}');

      expect(onChange).toHaveBeenCalledWith(['https://youtube.com/watch']);
    });

    it('appends new URLs to existing list', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <UrlInput
          label="Recipe Links"
          value={['https://instagram.com/post/123']}
          onChange={onChange}
        />
      );

      await user.type(screen.getByRole('textbox'), 'https://youtube.com/watch');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(onChange).toHaveBeenCalledWith([
        'https://instagram.com/post/123',
        'https://youtube.com/watch',
      ]);
    });

    it('clears input after adding', async () => {
      const user = userEvent.setup();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      await user.type(screen.getByRole('textbox'), 'https://instagram.com/post/123');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('validation', () => {
    it('shows error for invalid URL', async () => {
      const user = userEvent.setup();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      await user.type(screen.getByRole('textbox'), 'not-a-url');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Please enter a valid URL starting with http:// or https://'
      );
    });

    it('shows error for duplicate URL', async () => {
      const user = userEvent.setup();
      render(
        <UrlInput
          label="Recipe Links"
          value={['https://instagram.com/post/123']}
          onChange={() => {}}
        />
      );

      await user.type(screen.getByRole('textbox'), 'https://instagram.com/post/123');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'This URL has already been added'
      );
    });

    it('clears error when typing', async () => {
      const user = userEvent.setup();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      await user.type(screen.getByRole('textbox'), 'invalid');
      await user.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      await user.type(screen.getByRole('textbox'), 'a');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not call onChange for invalid URL', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={onChange} />
      );

      await user.type(screen.getByRole('textbox'), 'not-a-url');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('removing URLs', () => {
    it('calls onChange without removed URL', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <UrlInput
          label="Recipe Links"
          value={['https://instagram.com/post/123', 'https://youtube.com/watch']}
          onChange={onChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Remove instagram.com' }));

      expect(onChange).toHaveBeenCalledWith(['https://youtube.com/watch']);
    });
  });

  describe('disabled state', () => {
    it('disables input when disabled', () => {
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} disabled />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disables Add button when disabled', () => {
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} disabled />
      );

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('disables remove buttons when disabled', () => {
      render(
        <UrlInput
          label="Recipe Links"
          value={['https://instagram.com/post/123']}
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('button', { name: 'Remove instagram.com' })).toBeDisabled();
    });
  });

  describe('Add button state', () => {
    it('disables Add button when input is empty', () => {
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('enables Add button when input has text', async () => {
      const user = userEvent.setup();
      render(
        <UrlInput label="Recipe Links" value={[]} onChange={() => {}} />
      );

      await user.type(screen.getByRole('textbox'), 'https://example.com');

      expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled();
    });
  });
});

describe('isValidUrl', () => {
  it('returns true for http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('returns true for https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('returns false for non-URL strings', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  it('returns false for other protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('file:///path/to/file')).toBe(false);
  });
});

describe('getDomain', () => {
  it('extracts domain from URL', () => {
    expect(getDomain('https://instagram.com/post/123')).toBe('instagram.com');
  });

  it('removes www prefix', () => {
    expect(getDomain('https://www.instagram.com/post/123')).toBe('instagram.com');
  });

  it('returns empty string for invalid URLs', () => {
    expect(getDomain('not-a-url')).toBe('');
  });
});

describe('getRecipeSource', () => {
  it('detects Instagram', () => {
    expect(getRecipeSource('https://instagram.com/post/123')).toBe('instagram');
    expect(getRecipeSource('https://www.instagram.com/reel/abc')).toBe('instagram');
  });

  it('detects YouTube', () => {
    expect(getRecipeSource('https://youtube.com/watch?v=abc')).toBe('youtube');
    expect(getRecipeSource('https://www.youtube.com/watch?v=abc')).toBe('youtube');
    expect(getRecipeSource('https://youtu.be/abc')).toBe('youtube');
  });

  it('detects TikTok', () => {
    expect(getRecipeSource('https://tiktok.com/@user/video/123')).toBe('tiktok');
    expect(getRecipeSource('https://www.tiktok.com/@user/video/123')).toBe('tiktok');
  });

  it('detects Pinterest', () => {
    expect(getRecipeSource('https://pinterest.com/pin/123')).toBe('pinterest');
    expect(getRecipeSource('https://www.pinterest.com/pin/123')).toBe('pinterest');
  });

  it('returns other for unknown domains', () => {
    expect(getRecipeSource('https://example.com/recipe')).toBe('other');
    expect(getRecipeSource('https://foodblog.com/recipe')).toBe('other');
  });
});

