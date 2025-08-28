'use client';

import React from 'react';
import {
  AlertTriangle,
  Wifi,
  RefreshCw,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface ErrorMessageProps {
  type: 'network' | 'webgl' | 'asset' | 'generic';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onFallback?: () => void;
  showDetails?: boolean;
  details?: string;
  className?: string;
}

const ERROR_CONFIGS = {
  network: {
    icon: Wifi,
    title: 'Connection Problem',
    message:
      'Unable to connect to the internet. Please check your network connection.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-200',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Disable any VPN or proxy',
    ],
  },
  webgl: {
    icon: Settings,
    title: '3D Graphics Issue',
    message:
      'Your browser or device may not support the required 3D graphics features.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    suggestions: [
      'Try updating your browser',
      'Enable hardware acceleration',
      'Switch to 2D mode for better compatibility',
    ],
  },
  asset: {
    icon: RefreshCw,
    title: 'Loading Problem',
    message: 'Some content failed to load. This might be a temporary issue.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 border-purple-200',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Clear your browser cache',
    ],
  },
  generic: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the problem persists',
    ],
  },
};

export function UserFriendlyError({
  type,
  title,
  message,
  onRetry,
  onFallback,
  showDetails = false,
  details,
  className = '',
}: ErrorMessageProps) {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);

  return (
    <div className={`rounded-lg border p-6 ${config.bgColor} ${className}`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${config.color}`}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title || config.title}
          </h3>

          <p className="text-gray-700 mb-4">{message || config.message}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            )}

            {onFallback && (
              <button
                onClick={onFallback}
                className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                <Settings className="w-4 h-4 mr-2" />
                {type === 'webgl' ? 'Switch to 2D Mode' : 'Alternative View'}
              </button>
            )}

            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90 transition-colors focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {showSuggestions ? 'Hide' : 'Show'} Help
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="bg-white/50 rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Try these solutions:
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {config.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical details */}
          {showDetails && details && (
            <div className="mt-4">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
              >
                {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
              </button>

              {showTechnicalDetails && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {details}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Specialized error components for common scenarios

export function NetworkError({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <UserFriendlyError type="network" onRetry={onRetry} className={className} />
  );
}

export function WebGLError({
  onRetry,
  onFallback,
  className,
}: {
  onRetry?: () => void;
  onFallback?: () => void;
  className?: string;
}) {
  return (
    <UserFriendlyError
      type="webgl"
      onRetry={onRetry}
      onFallback={onFallback}
      className={className}
    />
  );
}

export function AssetLoadError({
  onRetry,
  details,
  className,
}: {
  onRetry?: () => void;
  details?: string;
  className?: string;
}) {
  return (
    <UserFriendlyError
      type="asset"
      onRetry={onRetry}
      showDetails={!!details}
      details={details}
      className={className}
    />
  );
}

// Hook for error reporting and analytics
export function useErrorReporting() {
  const reportError = React.useCallback(
    (error: Error, context?: Record<string, any>) => {
      // Track error with analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          custom_map: {
            error_context: JSON.stringify(context || {}),
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Report to error tracking service
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            additional: context || {},
          },
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reported:', error, context);
      }
    },
    []
  );

  return { reportError };
}

// Error boundary hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  const { reportError } = useErrorReporting();

  const handleError = React.useCallback(
    (error: Error, context?: Record<string, any>) => {
      setError(error);
      reportError(error, context);
    },
    [reportError]
  );

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error,
  };
}
