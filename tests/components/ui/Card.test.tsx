/**
 * Card Component Tests
 *
 * Tests for the Card UI primitive component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as a div when not interactive', () => {
      render(<Card>Content</Card>);

      // Should not be a button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders as a button when onClick is provided', () => {
      render(<Card onClick={() => {}}>Clickable</Card>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('padding', () => {
    it('applies medium padding by default', () => {
      render(<Card><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('p-4');
    });

    it('applies no padding when padding="none"', () => {
      render(<Card padding="none"><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('p-0');
    });

    it('applies small padding when padding="sm"', () => {
      render(<Card padding="sm"><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('p-3');
    });

    it('applies large padding when padding="lg"', () => {
      render(<Card padding="lg"><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('p-6');
    });
  });

  describe('elevation', () => {
    it('has subtle shadow by default', () => {
      render(<Card><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('shadow-sm');
    });

    it('has stronger shadow when elevated', () => {
      render(<Card elevated><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('shadow-md');
    });
  });

  describe('interactive mode', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Click me</Card>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has cursor-pointer when interactive', () => {
      render(<Card onClick={() => {}}>Clickable</Card>);

      expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
    });

    it('has minimum 44px height for touch target when interactive', () => {
      render(<Card onClick={() => {}}>Clickable</Card>);

      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]');
    });

    it('does not have touch target styles when not interactive', () => {
      render(<Card>Static</Card>);

      const card = screen.getByText('Static').parentElement || screen.getByText('Static');
      expect(card).not.toHaveClass('min-h-[44px]');
    });

    it('can be activated with keyboard', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Press Enter</Card>);

      await user.tab();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can receive focus', async () => {
      const user = userEvent.setup();

      render(<Card onClick={() => {}}>Focusable</Card>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });

  describe('custom className', () => {
    it('merges custom className with default styles', () => {
      render(<Card className="custom-class"><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-white'); // Still has default styles
    });
  });

  describe('styling', () => {
    it('has rounded corners', () => {
      render(<Card><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('rounded-xl');
    });

    it('has white background', () => {
      render(<Card><span>Content</span></Card>);

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('bg-white');
    });
  });
});

