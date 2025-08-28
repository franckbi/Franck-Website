import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Low power mode settings
  lowPowerMode: boolean;

  // Motion preferences
  reducedMotion: boolean;

  // Performance settings
  performanceMode: 'high' | 'medium' | 'low';

  // Actions
  toggleLowPowerMode: () => void;
  setLowPowerMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;

  // Initialize from system preferences
  initializeFromSystem: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      lowPowerMode: false,
      reducedMotion: false,
      performanceMode: 'high',

      toggleLowPowerMode: () => {
        set(state => ({ lowPowerMode: !state.lowPowerMode }));
      },

      setLowPowerMode: (enabled: boolean) => {
        set({ lowPowerMode: enabled });
      },

      setReducedMotion: (enabled: boolean) => {
        set({ reducedMotion: enabled });
      },

      setPerformanceMode: (mode: 'high' | 'medium' | 'low') => {
        set({ performanceMode: mode });
      },

      initializeFromSystem: () => {
        // Check for reduced motion preference
        if (typeof window !== 'undefined') {
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;

          // Check for low power mode indicators
          const connection = (navigator as any).connection;
          const isLowPower =
            connection?.saveData ||
            connection?.effectiveType === 'slow-2g' ||
            connection?.effectiveType === '2g';

          set({
            reducedMotion: prefersReducedMotion,
            lowPowerMode: isLowPower || false,
            performanceMode: isLowPower ? 'low' : 'high',
          });
        }
      },
    }),
    {
      name: 'portfolio-settings',
      partialize: state => ({
        lowPowerMode: state.lowPowerMode,
        performanceMode: state.performanceMode,
      }),
    }
  )
);

// Hook to initialize settings on app start
export const useInitializeSettings = () => {
  const initializeFromSystem = useSettingsStore(
    state => state.initializeFromSystem
  );

  React.useEffect(() => {
    initializeFromSystem();

    // Listen for changes in system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      useSettingsStore.getState().setReducedMotion(e.matches);

      // Announce motion preference change to screen readers
      const announcement = e.matches
        ? 'Reduced motion enabled. Animations will be minimized.'
        : 'Reduced motion disabled. Full animations restored.';
      announceToScreenReader(announcement);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, [initializeFromSystem]);
};

// Utility function to announce changes to screen readers
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};
