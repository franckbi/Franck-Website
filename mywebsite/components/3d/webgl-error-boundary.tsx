'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Scene3DErrorFallback } from '@/components/ui/error-fallback';
import { getServiceWorkerManager } from '@/lib/utils/service-worker';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
  retryAttempts?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  contextLost: boolean;
  isRecovering: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  private contextLossHandler?: () => void;
  private contextRestoreHandler?: () => void;
  private canvas?: HTMLCanvasElement;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      contextLost: false,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a WebGL-related error
    const isWebGLError =
      error.message.includes('WebGL') ||
      error.message.includes('context') ||
      error.message.includes('CONTEXT_LOST') ||
      error.name === 'WebGLContextLostError';

    return {
      hasError: true,
      error,
      contextLost: isWebGLError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebGL Error Boundary caught an error:', error, errorInfo);

    // Track error for analytics
    this.trackError(error, errorInfo);

    // Call parent error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  componentDidMount() {
    this.setupWebGLContextHandlers();
  }

  componentWillUnmount() {
    this.cleanupWebGLContextHandlers();
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private setupWebGLContextHandlers = () => {
    // Find canvas element
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    this.canvas = canvas;

    // WebGL context lost handler
    this.contextLossHandler = () => {
      console.warn('WebGL context lost');
      this.setState({
        contextLost: true,
        hasError: true,
        error: new Error('WebGL context was lost'),
      });
      this.trackContextLoss();
    };

    // WebGL context restored handler
    this.contextRestoreHandler = () => {
      console.log('WebGL context restored');
      this.setState({ isRecovering: true });

      // Attempt to recover after a short delay
      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, 1000);
    };

    canvas.addEventListener('webglcontextlost', this.contextLossHandler);
    canvas.addEventListener('webglcontextrestored', this.contextRestoreHandler);
  };

  private cleanupWebGLContextHandlers = () => {
    if (this.canvas && this.contextLossHandler && this.contextRestoreHandler) {
      this.canvas.removeEventListener(
        'webglcontextlost',
        this.contextLossHandler
      );
      this.canvas.removeEventListener(
        'webglcontextrestored',
        this.contextRestoreHandler
      );
    }
  };

  private trackError = (error: Error, errorInfo: ErrorInfo) => {
    // Track error with analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_boundary: 'WebGL',
          component_stack: errorInfo.componentStack,
          retry_count: this.state.retryCount,
        },
      });
    }

    // Report to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
          webgl: {
            contextLost: this.state.contextLost,
            retryCount: this.state.retryCount,
          },
        },
      });
    }
  };

  private trackContextLoss = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'webgl_context_lost', {
        event_category: '3D',
        event_label: 'context_loss',
        value: this.state.retryCount,
      });
    }
  };

  private handleRetry = () => {
    const maxRetries = this.props.retryAttempts || 3;

    if (this.state.retryCount >= maxRetries) {
      console.error('Max retry attempts reached for WebGL recovery');
      this.setState({ isRecovering: false });
      return;
    }

    console.log(
      `Attempting WebGL recovery (attempt ${this.state.retryCount + 1}/${maxRetries})`
    );

    // Clear error state and increment retry count
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      contextLost: false,
      isRecovering: false,
      retryCount: prevState.retryCount + 1,
    }));

    // Track retry attempt
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'webgl_recovery_attempt', {
        event_category: '3D',
        event_label: 'retry',
        value: this.state.retryCount + 1,
      });
    }
  };

  private handleManualRetry = () => {
    // Reset retry count for manual retries
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      contextLost: false,
      isRecovering: false,
      retryCount: 0,
    });
  };

  private handleFallbackMode = () => {
    // Switch to low power mode
    const event = new CustomEvent('force-low-power-mode');
    window.dispatchEvent(event);

    // Track fallback usage
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'webgl_fallback_mode', {
        event_category: '3D',
        event_label: 'forced_fallback',
        value: this.state.retryCount,
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show recovery UI if context is being restored
      if (this.state.isRecovering) {
        return (
          <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-muted/20 rounded-lg space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Recovering 3D Scene
              </h3>
              <p className="text-muted-foreground">
                WebGL context is being restored...
              </p>
            </div>
          </div>
        );
      }

      // Show context-specific error messages
      const isContextLost = this.state.contextLost;
      const canRetry = this.state.retryCount < (this.props.retryAttempts || 3);

      const title = isContextLost ? 'WebGL Context Lost' : '3D Scene Error';

      const description = isContextLost
        ? 'The 3D graphics context was lost, possibly due to a graphics driver issue or system resource constraints.'
        : 'An error occurred while rendering the 3D scene.';

      return (
        <Scene3DErrorFallback
          error={this.state.error}
          resetError={canRetry ? this.handleManualRetry : undefined}
          className="min-h-[400px]"
        >
          <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
            <div className="text-destructive">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-muted-foreground max-w-md">{description}</p>
              {this.state.retryCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Retry attempts: {this.state.retryCount}/
                  {this.props.retryAttempts || 3}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {canRetry && (
                <button
                  onClick={this.handleManualRetry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {isContextLost ? 'Retry WebGL' : 'Retry 3D Scene'}
                </button>
              )}
              <button
                onClick={this.handleFallbackMode}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                Switch to 2D Mode
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-4 bg-muted rounded-md text-left max-w-2xl w-full">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\nStack trace:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                  {this.state.errorInfo && (
                    <>
                      {'\n\nComponent stack:\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </Scene3DErrorFallback>
      );
    }

    return this.props.children;
  }
}
