/**
 * Comprehensive performance monitoring system
 */

import { getBundleAnalyzer, PERFORMANCE_BUDGETS } from './bundle-analyzer';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Custom metrics
  tti?: number; // Time to Interactive
  tbt?: number; // Total Blocking Time
  si?: number; // Speed Index

  // 3D specific metrics
  webglInitTime?: number;
  firstFrameTime?: number;
  averageFps?: number;
  memoryUsage?: number;

  // Bundle metrics
  bundleSize?: number;
  chunkLoadTimes?: Record<string, number>;
}

interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private startTime: number = performance.now();
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];

  // Web Vitals thresholds (in milliseconds)
  private readonly thresholds: PerformanceThresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
  };

  constructor() {
    this.initializeObservers();
    this.startFPSMonitoring();
  }

  private initializeObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformancePaintTiming;
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer failed:', error);
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.metrics.fid = (entry as any).processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID observer failed:', error);
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver(list => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS observer failed:', error);
    }

    // Paint timing
    try {
      const paintObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Paint observer failed:', error);
    }

    // Navigation timing
    try {
      const navigationObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.ttfb = entry.responseStart - entry.requestStart;
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    } catch (error) {
      console.warn('Navigation observer failed:', error);
    }
  }

  private startFPSMonitoring() {
    if (typeof window === 'undefined') return;

    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        const fps = 1000 / delta;
        this.fpsHistory.push(fps);

        // Keep only last 60 frames for average calculation
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }

        this.metrics.averageFps =
          this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      }

      this.lastFrameTime = timestamp;
      this.frameCount++;

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  public recordWebGLInit(initTime: number) {
    this.metrics.webglInitTime = initTime;
  }

  public recordFirstFrame(frameTime: number) {
    this.metrics.firstFrameTime = frameTime;
  }

  public recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
    }
  }

  public async collectBundleMetrics() {
    const analyzer = getBundleAnalyzer();
    this.metrics.bundleSize = await analyzer.getBundleSize();

    const chunks = await analyzer.analyzeChunks();
    this.metrics.chunkLoadTimes = chunks.reduce(
      (acc, chunk) => {
        acc[chunk.name] = chunk.loadTime;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getScore(): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } {
    const scores: number[] = [];

    // Score LCP
    if (this.metrics.lcp) {
      if (this.metrics.lcp <= this.thresholds.lcp.good) scores.push(100);
      else if (this.metrics.lcp <= this.thresholds.lcp.poor) scores.push(75);
      else scores.push(50);
    }

    // Score FID
    if (this.metrics.fid) {
      if (this.metrics.fid <= this.thresholds.fid.good) scores.push(100);
      else if (this.metrics.fid <= this.thresholds.fid.poor) scores.push(75);
      else scores.push(50);
    }

    // Score CLS
    if (this.metrics.cls !== undefined) {
      if (this.metrics.cls <= this.thresholds.cls.good) scores.push(100);
      else if (this.metrics.cls <= this.thresholds.cls.poor) scores.push(75);
      else scores.push(50);
    }

    // Score FPS (3D specific)
    if (this.metrics.averageFps) {
      if (this.metrics.averageFps >= 55) scores.push(100);
      else if (this.metrics.averageFps >= 30) scores.push(75);
      else scores.push(50);
    }

    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (averageScore >= 90) grade = 'A';
    else if (averageScore >= 80) grade = 'B';
    else if (averageScore >= 70) grade = 'C';
    else if (averageScore >= 60) grade = 'D';
    else grade = 'F';

    return { score: Math.round(averageScore), grade };
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getScore();
    const analyzer = getBundleAnalyzer();
    const budgetResults = analyzer.checkBudgets(PERFORMANCE_BUDGETS);

    const report = {
      timestamp: new Date().toISOString(),
      score,
      metrics,
      budgetResults,
      recommendations: this.generateRecommendations(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.metrics;

    if (metrics.lcp && metrics.lcp > this.thresholds.lcp.good) {
      recommendations.push(
        'Optimize Largest Contentful Paint - consider image optimization and critical CSS'
      );
    }

    if (metrics.fid && metrics.fid > this.thresholds.fid.good) {
      recommendations.push(
        'Reduce First Input Delay - minimize JavaScript execution time'
      );
    }

    if (metrics.cls && metrics.cls > this.thresholds.cls.good) {
      recommendations.push(
        'Improve Cumulative Layout Shift - ensure proper image dimensions and avoid dynamic content insertion'
      );
    }

    if (metrics.averageFps && metrics.averageFps < 30) {
      recommendations.push(
        'Improve 3D performance - consider reducing model complexity or disabling effects'
      );
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push(
        'High memory usage detected - implement proper cleanup for 3D scenes'
      );
    }

    return recommendations;
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

// Hook for React components
export const usePerformanceMonitor = () => {
  const monitor = getPerformanceMonitor();

  return {
    getMetrics: () => monitor.getMetrics(),
    getScore: () => monitor.getScore(),
    generateReport: () => monitor.generateReport(),
    recordWebGLInit: (time: number) => monitor.recordWebGLInit(time),
    recordFirstFrame: (time: number) => monitor.recordFirstFrame(time),
    recordMemoryUsage: () => monitor.recordMemoryUsage(),
  };
};
