/**
 * Sentry configuration for error monitoring and performance tracking
 */

import { env, isProduction } from '@/lib/config/environment';

// Dynamically load Sentry if available to avoid build-time failures when the
// optional package is not installed in environments where monitoring isn't
// required (e.g. CI or local dev without Sentry). We store the loaded module
// in this variable and guard all usages.
let Sentry: any | null = null;

export async function initSentry() {
  if (!env.MONITORING.SENTRY_DSN || !isProduction) {
    return;
  }

  try {
    Sentry = await import('@sentry/nextjs');
  } catch (e) {
    // Sentry not installed — skip initialization silently
    // This keeps builds working in minimal environments.
    // eslint-disable-next-line no-console
    console.warn('Sentry not available, skipping initialization.');
    return;
  }

  Sentry.init({
    dsn: env.MONITORING.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || env.NODE_ENV,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event: any, hint: any) {
      const error = hint?.originalException;
      if (error instanceof Error) {
        if (error.message.includes('WebGL context lost')) return null;
        if (
          error.message.includes('plausible.io') &&
          error.message.includes('fetch')
        )
          return null;
        if (
          error.message.includes('Failed to load model') ||
          error.message.includes('THREE.GLTFLoader')
        )
          return null;
      }
      return event;
    },
    beforeSendTransaction(event: any) {
      if (event.transaction?.includes('/api/health')) return null;
      return event;
    },
    integrations: [
      ...(Sentry.BrowserTracing
        ? [
            new Sentry.BrowserTracing({
              tracingOrigins: [
                'localhost',
                /^https:\/\/[^/]*\.vercel\.app/,
                /^https:\/\/your-domain\.com/,
              ],
              routingInstrumentation: Sentry.nextRouterInstrumentation,
            }),
          ]
        : []),
      ...(Sentry.Replay
        ? [
            new Sentry.Replay({
              maskAllText: false,
              maskAllInputs: true,
              blockAllMedia: false,
            }),
          ]
        : []),
    ],
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    initialScope: {
      tags: {
        component: 'portfolio-website',
        deployment: process.env.VERCEL_ENV || 'development',
      },
    },
  });
}

// Monitoring utilities below will check Sentry presence before calling into it
/**
 * Custom error reporting utilities
 */
export const monitoring = {
  /**
   * Report a custom error with context
   */
  reportError(error: Error, context?: Record<string, any>) {
    if (!Sentry) return;

    Sentry.withScope((scope: any) => {
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
    if (!Sentry) return;

    Sentry.withScope((scope: any) => {
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
    if (!Sentry) return;
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
    if (!Sentry) return;

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
    if (!Sentry) return null;
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
    if (!Sentry) return;

    Sentry.withScope((scope: any) => {
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
    if (!Sentry) return;

    Sentry.withScope((scope: any) => {
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
    if (!Sentry) return;

    Sentry.addBreadcrumb({
      message: `User interaction: ${interaction}`,
      category: 'user',
      data: context,
      level: 'info',
    });
  },
};
