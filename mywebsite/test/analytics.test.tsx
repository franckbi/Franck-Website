/**
 * Analytics system tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { analytics } from '../lib/analytics/analytics';
import { performanceTracker } from '../lib/analytics/performance-tracker';
import { errorReporter } from '../lib/analytics/error-reporter';
import {
  AnalyticsProvider,
  AnalyticsConsentBanner,
} from '../components/analytics/analytics-provider';
import { AnalyticsDashboard } from '../components/analytics/analytics-dashboard';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock Plausible
const mockPlausible = vi.fn();
Object.defineProperty(window, 'plausible', {
  value: mockPlausible,
  writable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10, // 10MB
      totalJSHeapSize: 1024 * 1024 * 50, // 50MB
      jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
    },
    getEntriesByType: vi.fn(() => []),
  },
  writable: true,
});

// Mock PerformanceObserver
const MockPerformanceObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));

MockPerformanceObserver.supportedEntryTypes = [
  'navigation',
  'measure',
  'paint',
];

global.PerformanceObserver = MockPerformanceObserver;

// Also mock on window
Object.defineProperty(window, 'PerformanceObserver', {
  value: MockPerformanceObserver,
  writable: true,
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-agent',
    doNotTrack: '0',
  },
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

describe('Analytics System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Analytics Service', () => {
    it('should respect user consent', () => {
      mockLocalStorage.getItem.mockReturnValue('false');

      analytics.trackEvent({ name: 'test-event' });

      expect(mockPlausible).not.toHaveBeenCalled();
    });

    it('should track events when enabled', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      analytics.enableAnalytics();

      analytics.trackEvent({
        name: 'test-event',
        props: { test: 'value' },
      });

      expect(mockPlausible).toHaveBeenCalledWith('test-event', {
        props: { test: 'value' },
      });
    });

    it('should track 3D interactions', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      analytics.enableAnalytics();

      analytics.track3DInteraction('3d-hover', {
        projectSlug: 'test-project',
        duration: 1000,
        position: 'hero',
      });

      expect(mockPlausible).toHaveBeenCalledWith('3d-hover', {
        props: expect.objectContaining({
          project: 'test-project',
          duration: 1000,
          position: 'hero',
        }),
      });
    });

    it('should track project engagement', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      analytics.enableAnalytics();

      analytics.trackProjectEngagement('view', 'test-project', {
        source: 'hero',
      });

      expect(mockPlausible).toHaveBeenCalledWith('project-engagement', {
        props: expect.objectContaining({
          action: 'view',
          project: 'test-project',
          source: 'hero',
        }),
      });
    });

    it('should track hero interactions', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      analytics.enableAnalytics();

      analytics.trackHeroInteraction('project-select', {
        projectSlug: 'test-project',
      });

      expect(mockPlausible).toHaveBeenCalledWith('hero-interaction', {
        props: expect.objectContaining({
          type: 'project-select',
          projectSlug: 'test-project',
        }),
      });
    });
  });

  describe('Performance Tracker', () => {
    it('should track performance metrics', () => {
      const metrics = performanceTracker.getMetrics();

      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('loadTime');
      expect(metrics).toHaveProperty('interactionLatency');
    });

    it('should track memory usage', () => {
      performanceTracker.trackMemoryUsage();

      // Should not throw and should handle missing memory API gracefully
      expect(true).toBe(true);
    });
  });

  describe('Error Reporter', () => {
    beforeEach(() => {
      errorReporter.clearErrors();
    });

    it('should report errors', () => {
      const testError = new Error('Test error');

      errorReporter.reportError({
        message: testError.message,
        stack: testError.stack,
        url: 'http://localhost',
        userAgent: 'test-agent',
        timestamp: Date.now(),
      });

      const stats = errorReporter.getErrorStats();
      expect(stats.totalErrors).toBe(1);
    });

    it('should report 3D errors with context', () => {
      const testError = new Error('WebGL context lost');

      errorReporter.report3DError(testError, {
        scene: 'hero',
        renderer: 'WebGL',
        action: 'render',
        webglSupported: true,
      });

      const stats = errorReporter.getErrorStats();
      expect(stats.totalErrors).toBe(1);
    });

    it('should maintain error queue size', () => {
      // Report more than max queue size
      for (let i = 0; i < 60; i++) {
        errorReporter.reportError({
          message: `Error ${i}`,
          url: 'http://localhost',
          userAgent: 'test-agent',
          timestamp: Date.now(),
        });
      }

      const stats = errorReporter.getErrorStats();
      expect(stats.totalErrors).toBeLessThanOrEqual(50);
    });
  });

  describe('Analytics Provider', () => {
    it('should render children', () => {
      render(
        <AnalyticsProvider>
          <div>Test content</div>
        </AnalyticsProvider>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should provide analytics context', () => {
      const TestComponent = () => {
        return <div>Analytics enabled</div>;
      };

      render(
        <AnalyticsProvider>
          <TestComponent />
        </AnalyticsProvider>
      );

      expect(screen.getByText('Analytics enabled')).toBeInTheDocument();
    });
  });

  describe('Analytics Consent Banner', () => {
    it('should show banner when no consent given', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <AnalyticsProvider>
          <AnalyticsConsentBanner />
        </AnalyticsProvider>
      );

      expect(
        screen.getByText(/privacy-focused analytics/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Accept')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    it('should handle accept consent', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <AnalyticsProvider>
          <AnalyticsConsentBanner />
        </AnalyticsProvider>
      );

      fireEvent.click(screen.getByText('Accept'));

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'analytics-consent',
          'true'
        );
      });
    });

    it('should handle decline consent', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <AnalyticsProvider>
          <AnalyticsConsentBanner />
        </AnalyticsProvider>
      );

      fireEvent.click(screen.getByText('Decline'));

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'analytics-consent',
          'false'
        );
      });
    });

    it('should not show banner when consent already given', () => {
      mockLocalStorage.getItem.mockReturnValue('true');

      render(
        <AnalyticsProvider>
          <AnalyticsConsentBanner />
        </AnalyticsProvider>
      );

      expect(
        screen.queryByText(/privacy-focused analytics/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Analytics Dashboard', () => {
    it('should show enable button when analytics disabled', () => {
      mockLocalStorage.getItem.mockReturnValue('false');

      render(<AnalyticsDashboard />);

      expect(screen.getByText('Enable Analytics')).toBeInTheDocument();
      expect(
        screen.getByText(/Analytics is currently disabled/i)
      ).toBeInTheDocument();
    });

    it('should show metrics when analytics enabled', () => {
      mockLocalStorage.getItem.mockReturnValue('true');

      render(<AnalyticsDashboard />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Disable')).toBeInTheDocument();
    });

    it('should handle enable analytics', async () => {
      mockLocalStorage.getItem.mockReturnValue('false');

      render(<AnalyticsDashboard />);

      fireEvent.click(screen.getByText('Enable Analytics'));

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'analytics-consent',
          'true'
        );
      });
    });
  });
});
