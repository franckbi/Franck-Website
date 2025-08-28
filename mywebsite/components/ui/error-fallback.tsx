'use client';

import React from 'react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  showRetry = true,
  className = '',
}: ErrorFallbackProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}
    >
      <div className="text-destructive">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>

      {showRetry && (
        <div className="flex flex-col sm:flex-row gap-2">
          {resetError && (
            <button
              onClick={resetError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 p-4 bg-muted rounded-md text-left max-w-2xl w-full">
          <summary className="cursor-pointer text-sm font-medium">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
            {error.message}
            {error.stack && (
              <>
                {'\n\nStack trace:\n'}
                {error.stack}
              </>
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

interface Scene3DErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Scene3DErrorFallback({
  error,
  resetError,
  className = '',
  children,
}: Scene3DErrorFallbackProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-muted/20 rounded-lg space-y-4 ${className}`}
    >
      <div className="text-muted-foreground">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          3D Scene Unavailable
        </h3>
        <p className="text-muted-foreground max-w-md">
          The 3D scene couldn&apos;t be loaded. This might be due to WebGL
          compatibility issues or network problems.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {resetError && (
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Retry 3D Scene
          </button>
        )}
        <button
          onClick={() => {
            // Toggle to low power mode if available
            const event = new CustomEvent('toggle-low-power-mode');
            window.dispatchEvent(event);
          }}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        >
          Switch to 2D Mode
        </button>
      </div>

      {/* Render optional custom children (e.g. additional error info) */}
      {children && <div className="w-full">{children}</div>}
    </div>
  );
}
