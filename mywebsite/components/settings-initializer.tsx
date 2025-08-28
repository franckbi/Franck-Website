'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { announceToScreenReader } from '@/lib/utils/accessibility';

export function SettingsInitializer() {
  const initializeFromSystem = useSettingsStore(
    state => state.initializeFromSystem
  );
  const setReducedMotion = useSettingsStore(state => state.setReducedMotion);

  useEffect(() => {
    // Initialize settings from system preferences
    initializeFromSystem();

    // Listen for changes in system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);

      // Announce motion preference change to screen readers
      const announcement = e.matches
        ? 'Reduced motion enabled. Animations will be minimized.'
        : 'Reduced motion disabled. Full animations restored.';
      announceToScreenReader(announcement);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, [initializeFromSystem, setReducedMotion]);

  return null;
}
