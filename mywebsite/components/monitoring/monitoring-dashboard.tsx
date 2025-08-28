'use client';

import { useEffect, useState } from 'react';
import { env } from '@/lib/config/environment';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  responseTime: number;
  checks: Array<{
    name: string;
    status: 'healthy' | 'unhealthy';
    details: string;
  }>;
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      used: number;
      total: number;
    };
  };
}

interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
  loadTime: number;
}

export function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!env.FEATURES.ANALYTICS_DASHBOARD) {
      return;
    }

    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch health status'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updatePerformanceMetrics = (metrics: PerformanceMetrics) => {
    setPerformanceMetrics(metrics);
  };

  if (!env.FEATURES.ANALYTICS_DASHBOARD) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-lg p-4 border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-700 dark:text-red-300">
            Monitoring Error
          </span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
      {/* Health Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            System Health
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                healthStatus?.status === 'healthy'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                healthStatus?.status === 'healthy'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {healthStatus?.status?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Uptime:</span>
            <br />
            {healthStatus ? formatUptime(healthStatus.uptime) : 'N/A'}
          </div>
          <div>
            <span className="font-medium">Response:</span>
            <br />
            {healthStatus?.responseTime}ms
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
          System Info
        </h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>Version: {healthStatus?.version}</div>
          <div>Environment: {healthStatus?.environment}</div>
          <div>
            Memory: {healthStatus?.system.memory.used}MB /{' '}
            {healthStatus?.system.memory.total}MB
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
            3D Performance
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">FPS:</span>
              <br />
              <span
                className={
                  performanceMetrics.fps >= 60
                    ? 'text-green-600 dark:text-green-400'
                    : performanceMetrics.fps >= 30
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                }
              >
                {performanceMetrics.fps.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="font-medium">Draw Calls:</span>
              <br />
              {performanceMetrics.drawCalls}
            </div>
            <div>
              <span className="font-medium">Triangles:</span>
              <br />
              {formatNumber(performanceMetrics.triangles)}
            </div>
            <div>
              <span className="font-medium">Memory:</span>
              <br />
              {formatBytes(performanceMetrics.memoryUsage)}
            </div>
          </div>
        </div>
      )}

      {/* Health Checks */}
      <div className="p-4">
        <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
          Health Checks
        </h4>
        <div className="space-y-1">
          {healthStatus?.checks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {check.name.replace('_', ' ')}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  check.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated:{' '}
          {healthStatus ? formatTime(healthStatus.timestamp) : 'Never'}
        </p>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
