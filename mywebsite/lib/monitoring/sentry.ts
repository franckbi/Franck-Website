/**
 * Sentry configuration for error monitoring and performance tracking
 */

import * as Sentry from '@sentry/nextjs';
import { env, isProduction } from '@/lib/config/environment';

export function initSentry() {
  if (!env.MONITORING.SENTRY_DSN || !isProduction) {
    return;
  }

  Sentry.init({
    dsn: env.MONITORING.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Session replay
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException;

      if (error instanceof Error) {
        // Filter out WebGL context lost errors (handled gracefully)
        if (error.message.includes('WebGL context lost')) {
          return null;
        }

        // Filter out network errors from analytics
        if (
          error.message.includes('plausible.io') &&
          error.message.includes('fetch')
        ) {
          return null;
        }

        // Filter out 3D model loading errors (have fallbacks)
        if (
          error.message.includes('Failed to load model') ||
          error.message.includes('THREE.GLTFLoader')
        ) {
          return null;
        }
      }

      return event;
    },

    // Performance filtering
    beforeSendTransaction(event) {
      // Don't send transactions for health checks
      if (event.transaction?.includes('/api/health')) {
        return null;
      }

      return event;
    },

    // Additional configuration
    integrations: [
      new Sentry.BrowserTracing({
        // Capture interactions
        tracingOrigins: [
          'localhost',
          /^https:\/\/[^/]*\.vercel\.app/,
          /^https:\/\/your-domain\.com/,
        ],

        // Custom routing instrumentation for Next.js App Router
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),

      new Sentry.Replay({
        // Mask sensitive data
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

    // User context
    initialScope: {
      tags: {
        component: 'portfolio-website',
        deployment: process.env.VERCEL_ENV || 'development',
      },
    },
  });
}

/**
 * Custom error reporting utilities
 */
export const monitoring = {
  /**
   * Report a custom error with context
   */
  reportError(error: Error, context?: Record<string, any>) {
    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('custom', context);
      }
      Sentry.captureException(error);
    });
  },

  /**
   * Report a custom message
   */
  reportMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, any>
  ) {
    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('custom', context);
      }
      Sentry.captureMessage(message, level);
    });
  },

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; [key: string]: any }) {
    Sentry.setUser(user);
  },

  /**
   * Add breadcrumb
   */
  addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, any>
  ) {
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      data,
      level: 'info',
    });
  },

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  },

  /**
   * Report 3D performance metrics
   */
  report3DPerformance(metrics: {
    fps: number;
    drawCalls: number;
    triangles: number;
    loadTime: number;
    memoryUsage: number;
  }) {
    Sentry.withScope(scope => {
      scope.setTag('performance_type', '3d_rendering');
      scope.setContext('3d_metrics', metrics);

      if (metrics.fps < 30) {
        Sentry.captureMessage('Low 3D performance detected', 'warning');
      }
    });
  },

  /**
   * Report asset loading performance
   */
  reportAssetPerformance(
    asset: string,
    loadTime: number,
    size: number,
    success: boolean
  ) {
    Sentry.withScope(scope => {
      scope.setTag('performance_type', 'asset_loading');
      scope.setContext('asset_metrics', {
        asset,
        loadTime,
        size,
        success,
      });

      if (!success) {
        Sentry.captureMessage(`Asset loading failed: ${asset}`, 'error');
      } else if (loadTime > 5000) {
        Sentry.captureMessage(`Slow asset loading: ${asset}`, 'warning');
      }
    });
  },

  /**
   * Report user interaction
   */
  reportInteraction(interaction: string, context?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `User interaction: ${interaction}`,
      category: 'user',
      data: context,
      level: 'info',
    });
  },
};
