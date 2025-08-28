/**
 * Privacy-focused analytics system with Plausible integration
 * Tracks user interactions while respecting privacy preferences
 */

import { analyticsConfig, isAnalyticsEnabled } from './config';

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
}

export interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  interactionLatency: number;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  sessionId?: string;
}

class AnalyticsService {
  private isEnabled: boolean = false;
  private domain: string = '';
  private apiHost: string = 'https://plausible.io';

  constructor() {
    // NOTE: initialization is deferred to init() so importing this module
    // during server-side builds does not access window/localStorage.
  }

  // Call this from client-only code (e.g. in a useEffect) to initialize
  public init() {
    try {
      this.initialize();
    } catch (e) {
      // Safe no-op during builds or when DOM APIs are unavailable
      // eslint-disable-next-line no-console
      console.warn('Analytics initialization skipped:', e);
    }
  }

  private initialize() {
    // Ensure this runs only in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined')
      return;

    // Check if analytics should be enabled based on environment
    if (!isAnalyticsEnabled()) {
      return;
    }

    // Check for user consent and privacy preferences
    const hasConsent = this.checkUserConsent();
    const respectsDNT = analyticsConfig.privacy.respectDNT
      ? !navigator.doNotTrack || navigator.doNotTrack === '0'
      : true;

    this.isEnabled = hasConsent && respectsDNT && typeof window !== 'undefined';

    if (this.isEnabled) {
      // Only set domain/apiHost when present
      this.domain =
        analyticsConfig.plausible.domain || window.location.hostname || '';
      this.apiHost = analyticsConfig.plausible.apiHost || this.apiHost;

      if (this.domain) {
        this.loadPlausibleScript();
      }
    }
  }

  private checkUserConsent(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined')
      return false;
    // Check localStorage for user consent
    try {
      const consent = localStorage.getItem('analytics-consent');
      return consent === 'true';
    } catch (e) {
      return false;
    }
  }

  private loadPlausibleScript() {
    if (typeof document === 'undefined') return;
    if (!this.domain || !this.apiHost) return;
    if (document.querySelector('script[data-domain]')) return;

    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', this.domain);
    script.src = `${this.apiHost}/js/script.js`;
    document.head.appendChild(script);
  }

  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return;
    if (typeof window === 'undefined') return;

    try {
      // Use Plausible's custom event API
      if ((window as any).plausible) {
        (window as any).plausible(event.name, { props: event.props });
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track 3D interaction events
   */
  track3DInteraction(
    type: '3d-hover' | '3d-click' | '3d-focus' | 'camera-move',
    data: {
      projectSlug?: string;
      duration?: number;
      position?: string;
    }
  ) {
    this.trackEvent({
      name: type,
      props: {
        project: data.projectSlug || 'unknown',
        duration: data.duration || 0,
        position: data.position || 'unknown',
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Track project engagement
   */
  trackProjectEngagement(
    action: 'view' | 'demo-click' | 'github-click' | 'gallery-view',
    projectSlug: string,
    metadata?: Record<string, any>
  ) {
    this.trackEvent({
      name: 'project-engagement',
      props: {
        action,
        project: projectSlug,
        ...metadata,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics) {
    this.trackEvent({
      name: 'performance-metrics',
      props: {
        fps: Math.round(metrics.fps),
        memory: Math.round(metrics.memory / 1024 / 1024), // MB
        loadTime: Math.round(metrics.loadTime),
        interactionLatency: Math.round(metrics.interactionLatency),
      },
    });
  }

  /**
   * Report errors for monitoring
   */
  reportError(error: ErrorReport) {
    // Track error event
    this.trackEvent({
      name: 'error',
      props: {
        message: error.message.substring(0, 100), // Truncate for privacy
        component: error.component || 'unknown',
        url: error.url,
        timestamp: error.timestamp,
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', error);
    }
  }

  /**
   * Track hero interaction rates
   */
  trackHeroInteraction(
    type: 'load' | 'first-interaction' | 'project-select' | 'fallback-used',
    data?: Record<string, any>
  ) {
    this.trackEvent({
      name: 'hero-interaction',
      props: {
        type,
        ...data,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Enable analytics with user consent
   */
  enableAnalytics() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('analytics-consent', 'true');
      } catch (e) {
        // ignore
      }
    }

    this.isEnabled = true;
    this.loadPlausibleScript();
  }

  /**
   * Disable analytics and clear consent
   */
  disableAnalytics() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('analytics-consent', 'false');
      } catch (e) {
        // ignore
      }
    }

    this.isEnabled = false;

    // Remove Plausible script
    if (typeof document !== 'undefined') {
      const script = document.querySelector('script[data-domain]');
      if (script) {
        script.remove();
      }
    }
  }

  /**
   * Check if analytics is currently enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance (safe to import on server now)
export const analytics = new AnalyticsService();
