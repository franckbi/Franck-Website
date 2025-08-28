'use client';

/**
 * Analytics Provider Component
 * Initializes analytics and provides context to the app
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { analytics } from '../../lib/analytics/analytics';
import { performanceTracker } from '../../lib/analytics/performance-tracker';
import { errorReporter } from '../../lib/analytics/error-reporter';

interface AnalyticsContextType {
  isEnabled: boolean;
  enableAnalytics: () => void;
  disableAnalytics: () => void;
  trackEvent: (name: string, props?: Record<string, any>) => void;
  trackHeroInteraction: (type: string, data?: Record<string, any>) => void;
  trackProjectEngagement: (
    action: string,
    projectSlug: string,
    metadata?: Record<string, any>
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  domain?: string;
  enableInDevelopment?: boolean;
}

export function AnalyticsProvider({
  children,
  domain,
  enableInDevelopment = false,
}: AnalyticsProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Initialize analytics
    const shouldEnable =
      enableInDevelopment || process.env.NODE_ENV === 'production';

    if (shouldEnable) {
      setIsEnabled(analytics.isAnalyticsEnabled());
    }

    // Track initial page load
    if (analytics.isAnalyticsEnabled()) {
      analytics.trackEvent({
        name: 'app-load',
        props: {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          colorScheme: window.matchMedia?.('(prefers-color-scheme: dark)')
            ?.matches
            ? 'dark'
            : 'light',
          reducedMotion:
            window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ||
            false,
        },
      });
    }

    // Set up performance monitoring
    performanceTracker.start();

    return () => {
      performanceTracker.stop();
    };
  }, [enableInDevelopment]);

  const handleEnableAnalytics = () => {
    analytics.enableAnalytics();
    setIsEnabled(true);

    // Track analytics enablement
    analytics.trackEvent({
      name: 'analytics-enabled',
      props: { timestamp: Date.now() },
    });
  };

  const handleDisableAnalytics = () => {
    // Track analytics disablement before disabling
    analytics.trackEvent({
      name: 'analytics-disabled',
      props: { timestamp: Date.now() },
    });

    analytics.disableAnalytics();
    setIsEnabled(false);
  };

  const trackEvent = (name: string, props?: Record<string, any>) => {
    analytics.trackEvent({ name, props });
  };

  const trackHeroInteraction = (type: string, data?: Record<string, any>) => {
    analytics.trackHeroInteraction(type as any, data);
  };

  const trackProjectEngagement = (
    action: string,
    projectSlug: string,
    metadata?: Record<string, any>
  ) => {
    analytics.trackProjectEngagement(action as any, projectSlug, metadata);
  };

  const contextValue: AnalyticsContextType = {
    isEnabled,
    enableAnalytics: handleEnableAnalytics,
    disableAnalytics: handleDisableAnalytics,
    trackEvent,
    trackHeroInteraction,
    trackProjectEngagement,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error(
      'useAnalyticsContext must be used within an AnalyticsProvider'
    );
  }
  return context;
}

// Privacy consent banner component
export function AnalyticsConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const { isEnabled, enableAnalytics, disableAnalytics } =
    useAnalyticsContext();

  useEffect(() => {
    // Show banner if user hasn't made a choice yet
    const consent = localStorage.getItem('analytics-consent');
    if (consent === null) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    enableAnalytics();
    setShowBanner(false);
  };

  const handleDecline = () => {
    disableAnalytics();
    setShowBanner(false);
  };

  if (!showBanner || isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            This site uses privacy-focused analytics to improve your experience.
            No personal data is collected or shared with third parties.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
