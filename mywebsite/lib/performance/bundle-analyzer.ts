/**
 * Bundle analysis utilities for performance monitoring
 */

interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  criticalPath: string[];
  loadTimes: Record<string, number>;
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

class BundleAnalyzer {
  private metrics: Partial<BundleMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Resource timing observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        this.processResourceEntries(entries as PerformanceResourceTiming[]);
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }

      // Navigation timing observer
      const navigationObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        this.processNavigationEntries(entries as PerformanceNavigationTiming[]);
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }
    }
  }

  private processResourceEntries(entries: PerformanceResourceTiming[]) {
    const jsEntries = entries.filter(
      entry =>
        entry.name.includes('.js') || entry.name.includes('/_next/static/')
    );

    jsEntries.forEach(entry => {
      const chunkName = this.extractChunkName(entry.name);
      if (chunkName) {
        this.metrics.loadTimes = {
          ...this.metrics.loadTimes,
          [chunkName]: entry.duration,
        };
      }
    });
  }

  private processNavigationEntries(entries: PerformanceNavigationTiming[]) {
    entries.forEach(entry => {
      this.metrics.criticalPath = [
        'DNS Lookup',
        'TCP Connection',
        'Request',
        'Response',
        'DOM Processing',
      ];
    });
  }

  private extractChunkName(url: string): string | null {
    const match = url.match(/\/_next\/static\/chunks\/(.+?)\.js/);
    return match ? match[1] : null;
  }

  public getMetrics(): Partial<BundleMetrics> {
    return { ...this.metrics };
  }

  public getBundleSize(): Promise<number> {
    return new Promise(resolve => {
      if ('navigator' in window && 'connection' in navigator) {
        // Estimate based on transfer size
        const entries = performance.getEntriesByType(
          'resource'
        ) as PerformanceResourceTiming[];
        const jsEntries = entries.filter(entry => entry.name.includes('.js'));
        const totalTransferSize = jsEntries.reduce(
          (sum, entry) => sum + (entry.transferSize || 0),
          0
        );
        resolve(totalTransferSize);
      } else {
        resolve(0);
      }
    });
  }

  public async analyzeChunks(): Promise<
    Array<{ name: string; size: number; loadTime: number }>
  > {
    const entries = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
    const jsEntries = entries.filter(entry =>
      entry.name.includes('/_next/static/chunks/')
    );

    return jsEntries.map(entry => ({
      name: this.extractChunkName(entry.name) || 'unknown',
      size: entry.transferSize || 0,
      loadTime: entry.duration,
    }));
  }

  public checkBudgets(budgets: Record<string, number>): Array<{
    name: string;
    actual: number;
    budget: number;
    exceeded: boolean;
  }> {
    const results: Array<{
      name: string;
      actual: number;
      budget: number;
      exceeded: boolean;
    }> = [];

    Object.entries(budgets).forEach(([name, budget]) => {
      const actual = this.metrics.loadTimes?.[name] || 0;
      results.push({
        name,
        actual,
        budget,
        exceeded: actual > budget,
      });
    });

    return results;
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      recommendations: this.generateRecommendations(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const loadTimes = this.metrics.loadTimes || {};

    // Check for slow loading chunks
    Object.entries(loadTimes).forEach(([chunk, time]) => {
      if (time > 1000) {
        recommendations.push(
          `Consider optimizing ${chunk} - load time: ${time.toFixed(2)}ms`
        );
      }
    });

    // Check for large bundles
    if (Object.keys(loadTimes).length > 10) {
      recommendations.push(
        'Consider further code splitting - many chunks detected'
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
let bundleAnalyzer: BundleAnalyzer | null = null;

export const getBundleAnalyzer = (): BundleAnalyzer => {
  if (!bundleAnalyzer) {
    bundleAnalyzer = new BundleAnalyzer();
  }
  return bundleAnalyzer;
};

// Performance budgets configuration
export const PERFORMANCE_BUDGETS = {
  main: 500, // Main bundle should load in 500ms
  framework: 300, // Framework chunks should load in 300ms
  '3d-components': 1000, // 3D components can take up to 1s
  pages: 200, // Page chunks should be fast
} as const;

// Bundle size limits (in bytes)
export const BUNDLE_SIZE_LIMITS = {
  main: 180 * 1024, // 180KB gzipped
  framework: 120 * 1024, // 120KB gzipped
  '3d-components': 300 * 1024, // 300KB gzipped
  total: 1200 * 1024, // 1.2MB total
} as const;
