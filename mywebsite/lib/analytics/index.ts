/**
 * Analytics module exports
 * Centralized exports for all analytics functionality
 */

// Core analytics
export { analytics } from './analytics';
export type {
  AnalyticsEvent,
  PerformanceMetrics,
  ErrorReport,
} from './analytics';

// Performance tracking
export { performanceTracker } from './performance-tracker';
export type { WebVitalsMetrics, ThreeJSMetrics } from './performance-tracker';

// Error reporting
export { errorReporter } from './error-reporter';
export type { ErrorContext } from './error-reporter';

// React hooks
export {
  useAnalytics,
  use3DAnalytics,
  useProjectAnalytics,
} from '../hooks/use-analytics';

// Components
export {
  AnalyticsProvider,
  useAnalyticsContext,
  AnalyticsConsentBanner,
} from '../../components/analytics/analytics-provider';
export { AnalyticsDashboard } from '../../components/analytics/analytics-dashboard';
