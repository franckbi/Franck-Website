'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Hero3D } from '@/lib/utils/lazy-imports';

interface Lazy3DWrapperProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
  preload?: boolean;
}

export function Lazy3DWrapper({
  children,
  fallback,
  loadingComponent,
  className = '',
  preload = false,
}: Lazy3DWrapperProps) {
  const { lowPowerMode } = useSettingsStore();
  const [shouldLoad3D, setShouldLoad3D] = useState(preload);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load 3D components on user interaction
  useEffect(() => {
    if (lowPowerMode || hasInteracted) return;

    const handleInteraction = () => {
      setShouldLoad3D(true);
      setHasInteracted(true);
    };

    // Load on any user interaction
    const events = ['mouseenter', 'focus', 'touchstart', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, {
        once: true,
        passive: true,
      });
    });

    // Fallback: load after 2 seconds if no interaction
    const timer = setTimeout(() => {
      setShouldLoad3D(true);
    }, 2000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      clearTimeout(timer);
    };
  }, [lowPowerMode, hasInteracted]);

  // Show fallback in low power mode
  if (lowPowerMode) {
    return <div className={className}>{fallback}</div>;
  }

  // Show loading state until 3D is ready to load
  if (!shouldLoad3D) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        {loadingComponent || (
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground mt-2">
              Loading 3D experience...
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense
        fallback={
          loadingComponent || (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          )
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
