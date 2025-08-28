'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useServiceWorker } from '@/lib/utils/service-worker';
import { usePerformanceMonitor } from '@/lib/performance/performance-monitor';
import { preloadCriticalAssets } from '@/lib/utils/service-worker';

interface PerformanceContextType {
  // Service Worker
  isServiceWorkerRegistered: boolean;
  isUpdateAvailable: boolean;
  networkStatus: 'online' | 'offline';
  updateServiceWorker: () => void;
  clearCache: () => Promise<void>;

  // Performance Monitoring
  performanceScore: { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' };
  memoryUsage?: number;
  averageFps?: number;

  // Actions
  generatePerformanceReport: () => string;
  preloadAssets: (urls: string[]) => Promise<void>;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<{
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  }>({
    score: 0,
    grade: 'F',
  });
  const [memoryUsage, setMemoryUsage] = useState<number>();
  const [averageFps, setAverageFps] = useState<number>();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Service Worker integration
  const {
    isRegistered: isServiceWorkerRegistered,
    isUpdateAvailable,
    networkStatus,
    updateServiceWorker,
    clearCache,
  } = useServiceWorker({
    onUpdate: registration => {
      console.log('Service Worker update available');
      // Could show a toast notification here
    },
    onSuccess: registration => {
      console.log('Service Worker registered successfully');
    },
    onError: error => {
      console.error('Service Worker registration failed:', error);
    },
  });

  // Performance monitoring integration
  const { getMetrics, getScore, generateReport, recordMemoryUsage } =
    usePerformanceMonitor();

  // Update performance metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const metrics = getMetrics();
      const score = getScore();

      setPerformanceScore(score);
      setMemoryUsage(metrics.memoryUsage);
      setAverageFps(metrics.averageFps);

      // Record current memory usage
      recordMemoryUsage();
    };

    // Initial update
    updateMetrics();

    // Update every 30 seconds
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, [getMetrics, getScore, recordMemoryUsage]);

  // Preload critical assets on mount
  useEffect(() => {
    const criticalAssets = [
      '/_next/static/css/app.css',
      '/_next/static/chunks/framework.js',
      '/_next/static/chunks/main.js',
    ];

    preloadCriticalAssets(criticalAssets).catch(error => {
      console.warn('Failed to preload critical assets:', error);
    });
  }, []);

  const preloadAssets = async (urls: string[]) => {
    try {
      await preloadCriticalAssets(urls);
    } catch (error) {
      console.error('Failed to preload assets:', error);
    }
  };

  const generatePerformanceReport = () => {
    return generateReport();
  };

  const contextValue: PerformanceContextType = {
    // Service Worker
    isServiceWorkerRegistered,
    isUpdateAvailable,
    networkStatus,
    updateServiceWorker,
    clearCache,

    // Performance Monitoring
    performanceScore,
    memoryUsage,
    averageFps,

    // Actions
    generatePerformanceReport,
    preloadAssets,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Performance status indicator component
export function PerformanceIndicator() {
  const { performanceScore, networkStatus, isUpdateAvailable } =
    usePerformance();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg p-3 text-xs">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            performanceScore.grade === 'A'
              ? 'bg-green-500'
              : performanceScore.grade === 'B'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        />
        <span>
          Performance: {performanceScore.grade} ({performanceScore.score})
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <div
          className={`w-2 h-2 rounded-full ${
            networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span>Network: {networkStatus}</span>
      </div>

      {isUpdateAvailable && (
        <div className="text-blue-500 mt-1">Update available</div>
      )}
    </div>
  );
}
