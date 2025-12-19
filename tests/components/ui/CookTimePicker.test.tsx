/**
 * CookTimePicker Component Tests
 *
 * Tests for the CookTimePicker UI component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookTimePicker, formatCookTime } from '@/components/ui/CookTimePicker';

describe('CookTimePicker', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      render(
        <CookTimePicker label="Cook Time" value={undefined} onChange={() => {}} />
      );

      expect(screen.getByText('Cook Time')).toBeInTheDocument();
    });

    it('renders hours and minutes selects', () => {
      render(
        <CookTimePicker label="Cook Time" value={undefined} onChange={() => {}} />
      );

      expect(screen.getByLabelText('Hours')).toBeInTheDocument();
      expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    });

    it('shows 0 hours and 0 min when value is undefined', () => {
      render(
        <CookTimePicker label="Cook Time" value={undefined} onChange={() => {}} />
      );

      expect(screen.getByLabelText('Hours')).toHaveValue('0');
      expect(screen.getByLabelText('Minutes')).toHaveValue('0');
    });

    it('converts minutes to hours and minutes display', () => {
      render(
        <CookTimePicker label="Cook Time" value={90} onChange={() => {}} />
      );

      expect(screen.getByLabelText('Hours')).toHaveValue('1');
      expect(screen.getByLabelText('Minutes')).toHaveValue('30');
    });

    it('handles hours-only values', () => {
      render(
        <CookTimePicker label="Cook Time" value={120} onChange={() => {}} />
      );

      expect(screen.getByLabelText('Hours')).toHaveValue('2');
      expect(screen.getByLabelText('Minutes')).toHaveValue('0');
    });

    it('handles minutes-only values', () => {
      render(
        <CookTimePicker label="Cook Time" value={45} onChange={() => {}} />
      );

      expect(screen.getByLabelText('Hours')).toHaveValue('0');
      expect(screen.getByLabelText('Minutes')).toHaveValue('45');
    });
  });

  describe('interaction', () => {
    it('calls onChange with total minutes when hours changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CookTimePicker label="Cook Time" value={30} onChange={onChange} />
      );

      await user.selectOptions(screen.getByLabelText('Hours'), '2');

      expect(onChange).toHaveBeenCalledWith(150); // 2h + 30m = 150 min
    });

    it('calls onChange with total minutes when minutes changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CookTimePicker label="Cook Time" value={60} onChange={onChange} />
      );

      await user.selectOptions(screen.getByLabelText('Minutes'), '15');

      expect(onChange).toHaveBeenCalledWith(75); // 1h + 15m = 75 min
    });

    it('calls onChange with undefined when both are set to 0', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CookTimePicker label="Cook Time" value={60} onChange={onChange} />
      );

      await user.selectOptions(screen.getByLabelText('Hours'), '0');

      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('disables selects when disabled prop is true', () => {
      render(
        <CookTimePicker label="Cook Time" value={30} onChange={() => {}} disabled />
      );

      expect(screen.getByLabelText('Hours')).toBeDisabled();
      expect(screen.getByLabelText('Minutes')).toBeDisabled();
    });
  });

  describe('options', () => {
    it('has hours options from 0 to 4', () => {
      render(
        <CookTimePicker label="Cook Time" value={undefined} onChange={() => {}} />
      );

      const hoursSelect = screen.getByLabelText('Hours');
      expect(hoursSelect).toContainHTML('0 hours');
      expect(hoursSelect).toContainHTML('1 hour');
      expect(hoursSelect).toContainHTML('2 hours');
      expect(hoursSelect).toContainHTML('3 hours');
      expect(hoursSelect).toContainHTML('4 hours');
    });

    it('has minute options in 5-minute increments', () => {
      render(
        <CookTimePicker label="Cook Time" value={undefined} onChange={() => {}} />
      );

      const minutesSelect = screen.getByLabelText('Minutes');
      expect(minutesSelect).toContainHTML('0 min');
      expect(minutesSelect).toContainHTML('5 min');
      expect(minutesSelect).toContainHTML('30 min');
      expect(minutesSelect).toContainHTML('55 min');
    });
  });
});

describe('formatCookTime', () => {
  it('returns empty string for undefined', () => {
    expect(formatCookTime(undefined)).toBe('');
  });

  it('returns empty string for 0', () => {
    expect(formatCookTime(0)).toBe('');
  });

  it('formats minutes only', () => {
    expect(formatCookTime(30)).toBe('30m');
  });

  it('formats hours only', () => {
    expect(formatCookTime(60)).toBe('1h');
    expect(formatCookTime(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatCookTime(90)).toBe('1h 30m');
    expect(formatCookTime(135)).toBe('2h 15m');
  });
});

