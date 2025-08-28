'use client';

/**
 * Analytics Dashboard Component
 * Displays key metrics and performance data
 */

import { useState, useEffect } from 'react';
import { analytics } from '../../lib/analytics/analytics';
import { performanceTracker } from '../../lib/analytics/performance-tracker';
import { errorReporter } from '../../lib/analytics/error-reporter';

interface DashboardMetrics {
  pageViews: number;
  heroInteractions: number;
  projectEngagements: number;
  averageFPS: number;
  errorCount: number;
  performanceScore: 'good' | 'needs-improvement' | 'poor';
}

interface AnalyticsDashboardProps {
  className?: string;
  showDetails?: boolean;
}

export function AnalyticsDashboard({
  className = '',
  showDetails = false,
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsEnabled(analytics.isAnalyticsEnabled());

    if (analytics.isAnalyticsEnabled()) {
      loadMetrics();
    } else {
      setLoading(false);
    }
  }, []);

  const loadMetrics = async () => {
    try {
      // Get performance metrics
      const performanceMetrics = performanceTracker.getMetrics();
      const errorStats = errorReporter.getErrorStats();

      // Simulate dashboard metrics (in a real app, these would come from your analytics API)
      const dashboardMetrics: DashboardMetrics = {
        pageViews: 0, // Would be fetched from Plausible API
        heroInteractions: 0, // Would be fetched from Plausible API
        projectEngagements: 0, // Would be fetched from Plausible API
        averageFPS: Math.round(performanceMetrics.fps),
        errorCount: errorStats.recentErrors,
        performanceScore:
          performanceMetrics.fps > 50
            ? 'good'
            : performanceMetrics.fps > 30
              ? 'needs-improvement'
              : 'poor',
      };

      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Failed to load analytics metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableAnalytics = () => {
    analytics.enableAnalytics();
    setIsEnabled(true);
    loadMetrics();
  };

  const handleDisableAnalytics = () => {
    analytics.disableAnalytics();
    setIsEnabled(false);
    setMetrics(null);
  };

  if (loading) {
    return (
      <div
        className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div
        className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
      >
        <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Analytics is currently disabled. Enable analytics to view performance
          metrics and usage data.
        </p>
        <button
          onClick={handleEnableAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Enable Analytics
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <button
          onClick={handleDisableAnalytics}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Disable
        </button>
      </div>

      {metrics && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              title="Page Views"
              value={metrics.pageViews.toString()}
              subtitle="Total visits"
              color="blue"
            />
            <MetricCard
              title="Hero Interactions"
              value={metrics.heroInteractions.toString()}
              subtitle="3D engagements"
              color="green"
            />
            <MetricCard
              title="Project Views"
              value={metrics.projectEngagements.toString()}
              subtitle="Project clicks"
              color="purple"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <h4 className="font-medium mb-2">Performance</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Average FPS
                </span>
                <span
                  className={`font-semibold ${
                    metrics.averageFPS > 50
                      ? 'text-green-600'
                      : metrics.averageFPS > 30
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {metrics.averageFPS}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Score
                </span>
                <span
                  className={`text-sm font-medium ${
                    metrics.performanceScore === 'good'
                      ? 'text-green-600'
                      : metrics.performanceScore === 'needs-improvement'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {metrics.performanceScore}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <h4 className="font-medium mb-2">Reliability</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Recent Errors
                </span>
                <span
                  className={`font-semibold ${
                    metrics.errorCount === 0
                      ? 'text-green-600'
                      : metrics.errorCount < 5
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {metrics.errorCount}
                </span>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <h4 className="font-medium mb-2">Additional Details</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Session ID: {errorReporter.getErrorStats().sessionId}</p>
                <p>Analytics Provider: Plausible (Privacy-focused)</p>
                <p>Data Retention: Respects user preferences</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

function MetricCard({ title, value, subtitle, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  };

  return (
    <div className={`p-3 rounded ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs opacity-75">{subtitle}</div>
    </div>
  );
}
