import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import {
  ErrorFallback,
  Scene3DErrorFallback,
} from '@/components/ui/error-fallback';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('Error Handling Components', () => {
  describe('ErrorBoundary', () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeEach(() => {
      console.error = vi.fn();
    });

    afterEach(() => {
      console.error = originalError;
    });

    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders error UI when there is an error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We encountered an unexpected error/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /refresh page/i })
      ).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('calls onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('ErrorFallback', () => {
    it('renders with default props', () => {
      render(<ErrorFallback />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We encountered an unexpected error/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /refresh page/i })
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <ErrorFallback
          title="Custom Error Title"
          description="Custom error description"
        />
      );

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error description')).toBeInTheDocument();
    });

    it('renders try again button when resetError is provided', () => {
      const resetError = vi.fn();

      render(<ErrorFallback resetError={resetError} />);

      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
    });

    it('hides retry buttons when showRetry is false', () => {
      render(<ErrorFallback showRetry={false} />);

      expect(
        screen.queryByRole('button', { name: /try again/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /refresh page/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Scene3DErrorFallback', () => {
    it('renders 3D-specific error message', () => {
      render(<Scene3DErrorFallback />);

      expect(screen.getByText('3D Scene Unavailable')).toBeInTheDocument();
      expect(
        screen.getByText(/The 3D scene couldn't be loaded/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /switch to 2d mode/i })
      ).toBeInTheDocument();
    });

    it('renders retry button when resetError is provided', () => {
      const resetError = vi.fn();

      render(<Scene3DErrorFallback resetError={resetError} />);

      expect(
        screen.getByRole('button', { name: /retry 3d scene/i })
      ).toBeInTheDocument();
    });

    it('has proper 3D-specific styling', () => {
      render(<Scene3DErrorFallback />);

      const container = screen
        .getByText('3D Scene Unavailable')
        .closest('div')?.parentElement;
      expect(container).toHaveClass('min-h-[400px]');
    });
  });
});
