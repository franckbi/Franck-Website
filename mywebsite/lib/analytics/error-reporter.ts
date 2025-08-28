/**
 * Error reporting and monitoring system
 * Captures and reports errors to analytics
 */

import { analytics, ErrorReport } from './analytics';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

class ErrorReporter {
  private sessionId: string;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize: number = 50;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', event => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
    });

    // React error boundary integration
    this.setupReactErrorHandler();
  }

  private setupReactErrorHandler() {
    // This will be called by React error boundaries
    (window as any).__reportReactError = (error: Error, errorInfo: any) => {
      this.reportError({
        message: error.message,
        stack: error.stack,
        component: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Report an error with context
   */
  reportError(error: ErrorReport, context?: ErrorContext) {
    const enrichedError: ErrorReport = {
      ...error,
      component: context?.component || error.component,
      sessionId: this.sessionId,
      ...context?.additionalData,
    };

    // Add to queue
    this.errorQueue.push(enrichedError);

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Report to analytics
    analytics.reportError(enrichedError);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', enrichedError);
    }
  }

  /**
   * Report 3D-specific errors
   */
  report3DError(
    error: Error,
    context: {
      scene?: string;
      renderer?: string;
      action?: string;
      webglSupported?: boolean;
    }
  ) {
    this.reportError(
      {
        message: error.message,
        stack: error.stack,
        component: '3D-Scene',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      {
        component: '3D-Scene',
        action: context.action,
        additionalData: {
          scene: context.scene,
          renderer: context.renderer,
          webglSupported: context.webglSupported,
        },
      }
    );
  }

  /**
   * Report performance-related errors
   */
  reportPerformanceError(
    message: string,
    metrics: {
      fps?: number;
      memory?: number;
      loadTime?: number;
    }
  ) {
    this.reportError(
      {
        message: `Performance Issue: ${message}`,
        component: 'Performance-Monitor',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      {
        component: 'Performance-Monitor',
        additionalData: metrics,
      }
    );
  }

  /**
   * Report API errors
   */
  reportAPIError(endpoint: string, status: number, message: string) {
    this.reportError(
      {
        message: `API Error: ${message}`,
        component: 'API-Client',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      {
        component: 'API-Client',
        additionalData: {
          endpoint,
          status,
          method: 'POST', // Assuming most API calls are POST
        },
      }
    );
  }

  /**
   * Report asset loading errors
   */
  reportAssetError(
    assetType: 'model' | 'texture' | 'image',
    assetUrl: string,
    error: Error
  ) {
    this.reportError(
      {
        message: `Asset Loading Error: ${error.message}`,
        stack: error.stack,
        component: 'Asset-Loader',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      {
        component: 'Asset-Loader',
        additionalData: {
          assetType,
          assetUrl: assetUrl.substring(0, 100), // Truncate for privacy
          assetSize: 'unknown',
        },
      }
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentErrors = this.errorQueue.filter(
      error => error.timestamp > oneHourAgo
    );
    const errorsByComponent = recentErrors.reduce(
      (acc, error) => {
        const component = error.component || 'unknown';
        acc[component] = (acc[component] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalErrors: this.errorQueue.length,
      recentErrors: recentErrors.length,
      errorsByComponent,
      sessionId: this.sessionId,
    };
  }

  /**
   * Clear error queue
   */
  clearErrors() {
    this.errorQueue = [];
  }

  /**
   * Get all errors (for debugging)
   */
  getAllErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }
}

// Export singleton instance
export const errorReporter = new ErrorReporter();

// Export types
export type { ErrorContext };
