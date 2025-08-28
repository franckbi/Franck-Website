import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  LoadingSkeleton,
  PageLoading,
  ContentLoading,
  CardLoading,
  Scene3DLoading,
} from '@/components/ui/loading-states';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('renders with custom aria-label', () => {
      render(<LoadingSpinner aria-label="Custom loading message" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');

      rerender(<LoadingSpinner size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
    });
  });

  describe('LoadingSkeleton', () => {
    it('renders single skeleton by default', () => {
      render(<LoadingSkeleton />);

      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders multiple text lines when specified', () => {
      render(<LoadingSkeleton variant="text" lines={3} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(<LoadingSkeleton variant="circular" />);
      expect(document.querySelector('.rounded-full')).toBeInTheDocument();

      rerender(<LoadingSkeleton variant="text" />);
      expect(document.querySelector('.h-4')).toBeInTheDocument();
    });
  });

  describe('PageLoading', () => {
    it('renders with default message', () => {
      render(<PageLoading />);

      expect(screen.getByText('Loading page...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<PageLoading message="Custom loading message" />);

      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<PageLoading />);

      const message = screen.getByText('Loading page...');
      expect(message).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('ContentLoading', () => {
    it('renders content skeleton', () => {
      render(<ContentLoading />);

      const container = screen.getByLabelText('Loading content');
      expect(container).toBeInTheDocument();
    });

    it('renders with avatar when specified', () => {
      render(<ContentLoading showAvatar={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(3); // Avatar + text lines
    });

    it('renders specified number of lines', () => {
      render(<ContentLoading lines={5} />);

      // Should have skeleton elements for the specified lines
      const container = screen.getByLabelText('Loading content');
      expect(container).toBeInTheDocument();
    });
  });

  describe('CardLoading', () => {
    it('renders default number of cards', () => {
      render(<CardLoading />);

      const container = screen.getByLabelText('Loading cards');
      expect(container).toBeInTheDocument();

      const cards = container.querySelectorAll('.border');
      expect(cards).toHaveLength(3); // Default count
    });

    it('renders specified number of cards', () => {
      render(<CardLoading count={5} />);

      const container = screen.getByLabelText('Loading cards');
      const cards = container.querySelectorAll('.border');
      expect(cards).toHaveLength(5);
    });
  });

  describe('Scene3DLoading', () => {
    it('renders with default message', () => {
      render(<Scene3DLoading />);

      expect(screen.getByText('Loading 3D scene...')).toBeInTheDocument();
      expect(
        screen.getByText('This may take a moment on slower connections')
      ).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<Scene3DLoading message="Loading custom 3D content..." />);

      expect(
        screen.getByText('Loading custom 3D content...')
      ).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<Scene3DLoading />);

      const message = screen.getByText('Loading 3D scene...');
      expect(message).toHaveAttribute('aria-live', 'polite');
    });
  });
});
