/**
 * React hook for analytics integration
 * Provides easy access to analytics functions in components
 */

import { useCallback, useEffect, useRef } from 'react';
import { analytics } from '../analytics/analytics';
import { performanceTracker } from '../analytics/performance-tracker';
import { errorReporter } from '../analytics/error-reporter';

export interface UseAnalyticsOptions {
  trackPageView?: boolean;
  trackPerformance?: boolean;
  component?: string;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { trackPageView = true, trackPerformance = false, component } = options;
  const interactionStartTime = useRef<number>(0);

  useEffect(() => {
    // Track page view
    if (trackPageView) {
      analytics.trackEvent({
        name: 'pageview',
        props: {
          url: window.location.pathname,
          referrer: document.referrer || 'direct',
          timestamp: Date.now(),
        },
      });
    }

    // Start performance tracking if enabled
    if (trackPerformance) {
      performanceTracker.start();

      return () => {
        performanceTracker.stop();
      };
    }
  }, [trackPageView, trackPerformance]);

  // Track 3D interactions
  const track3DInteraction = useCallback(
    (
      type: '3d-hover' | '3d-click' | '3d-focus' | 'camera-move',
      data: {
        projectSlug?: string;
        duration?: number;
        position?: string;
      }
    ) => {
      analytics.track3DInteraction(type, data);
    },
    []
  );

  // Track project engagement
  const trackProjectEngagement = useCallback(
    (
      action: 'view' | 'demo-click' | 'github-click' | 'gallery-view',
      projectSlug: string,
      metadata?: Record<string, any>
    ) => {
      analytics.trackProjectEngagement(action, projectSlug, metadata);
    },
    []
  );

  // Track hero interactions
  const trackHeroInteraction = useCallback(
    (
      type: 'load' | 'first-interaction' | 'project-select' | 'fallback-used',
      data?: Record<string, any>
    ) => {
      analytics.trackHeroInteraction(type, data);
    },
    []
  );

  // Track custom events
  const trackEvent = useCallback(
    (name: string, props?: Record<string, any>) => {
      analytics.trackEvent({ name, props });
    },
    []
  );

  // Start interaction timing
  const startInteraction = useCallback(() => {
    interactionStartTime.current = performance.now();
  }, []);

  // End interaction timing and track latency
  const endInteraction = useCallback((interactionType: string) => {
    if (interactionStartTime.current > 0) {
      const endTime = performance.now();
      performanceTracker.trackInteractionLatency(
        interactionStartTime.current,
        endTime,
        interactionType
      );
      interactionStartTime.current = 0;
    }
  }, []);

  // Report errors with component context
  const reportError = useCallback(
    (error: Error, additionalContext?: Record<string, any>) => {
      errorReporter.reportError(
        {
          message: error.message,
          stack: error.stack,
          component,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        },
        {
          component,
          additionalData: additionalContext,
        }
      );
    },
    [component]
  );

  // Report 3D errors
  const report3DError = useCallback(
    (
      error: Error,
      context: {
        scene?: string;
        renderer?: string;
        action?: string;
        webglSupported?: boolean;
      }
    ) => {
      errorReporter.report3DError(error, context);
    },
    []
  );

  return {
    // Event tracking
    trackEvent,
    track3DInteraction,
    trackProjectEngagement,
    trackHeroInteraction,

    // Interaction timing
    startInteraction,
    endInteraction,

    // Error reporting
    reportError,
    report3DError,

    // Utility
    isEnabled: analytics.isAnalyticsEnabled(),
    enableAnalytics: analytics.enableAnalytics.bind(analytics),
    disableAnalytics: analytics.disableAnalytics.bind(analytics),
  };
}

// Hook for 3D scene analytics
export function use3DAnalytics(sceneName: string) {
  const analytics = useAnalytics({
    component: `3D-${sceneName}`,
    trackPerformance: true,
  });

  const trackSceneLoad = useCallback(
    (loadTime: number, assetCount: number) => {
      analytics.trackEvent('3d-scene-load', {
        scene: sceneName,
        loadTime: Math.round(loadTime),
        assetCount,
        timestamp: Date.now(),
      });
    },
    [analytics, sceneName]
  );

  const trackSceneInteraction = useCallback(
    (
      interactionType: 'hover' | 'click' | 'focus',
      target: string,
      duration?: number
    ) => {
      analytics.track3DInteraction(`3d-${interactionType}` as any, {
        projectSlug: target,
        duration,
        position: sceneName,
      });
    },
    [analytics, sceneName]
  );

  const trackPerformanceMetrics = useCallback((renderer: any, scene: any) => {
    performanceTracker.trackThreeJSMetrics(renderer, scene);
  }, []);

  return {
    ...analytics,
    trackSceneLoad,
    trackSceneInteraction,
    trackPerformanceMetrics,
  };
}

// Hook for project analytics
export function useProjectAnalytics(projectSlug: string) {
  const analytics = useAnalytics({ component: 'Project' });

  const trackProjectView = useCallback(
    (source: 'hero' | 'list' | 'direct') => {
      analytics.trackProjectEngagement('view', projectSlug, { source });
    },
    [analytics, projectSlug]
  );

  const trackDemoClick = useCallback(() => {
    analytics.trackProjectEngagement('demo-click', projectSlug);
  }, [analytics, projectSlug]);

  const trackGitHubClick = useCallback(() => {
    analytics.trackProjectEngagement('github-click', projectSlug);
  }, [analytics, projectSlug]);

  const trackGalleryView = useCallback(
    (imageIndex: number) => {
      analytics.trackProjectEngagement('gallery-view', projectSlug, {
        imageIndex,
      });
    },
    [analytics, projectSlug]
  );

  return {
    ...analytics,
    trackProjectView,
    trackDemoClick,
    trackGitHubClick,
    trackGalleryView,
  };
}
