'use client';

import React from 'react';
import { LoadingSpinner } from './loading-spinner';
import { LoadingSkeleton } from './loading-skeleton';

// Re-export for convenience
export { LoadingSpinner, LoadingSkeleton };

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Loading page...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

interface ContentLoadingProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ContentLoading({
  lines = 3,
  showAvatar = false,
  className = '',
}: ContentLoadingProps) {
  return (
    <div className={`space-y-4 ${className}`} aria-label="Loading content">
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <LoadingSkeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton variant="text" width="30%" />
            <LoadingSkeleton variant="text" width="20%" />
          </div>
        </div>
      )}
      <LoadingSkeleton variant="text" lines={lines} />
    </div>
  );
}

interface CardLoadingProps {
  count?: number;
  className?: string;
}

export function CardLoading({ count = 3, className = '' }: CardLoadingProps) {
  return (
    <div className={`grid gap-4 ${className}`} aria-label="Loading cards">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 p-4 border border-border rounded-lg"
        >
          <LoadingSkeleton variant="rectangular" height={200} />
          <LoadingSkeleton variant="text" width="75%" />
          <LoadingSkeleton variant="text" lines={2} />
        </div>
      ))}
    </div>
  );
}

interface Scene3DLoadingProps {
  message?: string;
}

export function Scene3DLoading({
  message = 'Loading 3D scene...',
}: Scene3DLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-muted/20 rounded-lg space-y-4">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary opacity-20" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {message}
        </p>
        <p className="text-xs text-muted-foreground">
          This may take a moment on slower connections
        </p>
      </div>
    </div>
  );
}
