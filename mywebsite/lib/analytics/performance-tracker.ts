/**
 * Performance tracking and monitoring system
 * Collects metrics and reports to analytics
 */

import { analytics, PerformanceMetrics } from './analytics';

export interface WebVitalsMetrics {
  CLS: number;
  FID: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

export interface ThreeJSMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryUsage: number;
}

class PerformanceTracker {
  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private startTime: number = performance.now();
  private isTracking: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Track Web Vitals
    this.trackWebVitals();

    // Track page load performance
    this.trackPageLoad();

    // Start FPS monitoring
    this.startFPSMonitoring();
  }

  private trackWebVitals() {
    // Use web-vitals library if available, otherwise implement basic tracking
    if (
      typeof window !== 'undefined' &&
      typeof PerformanceObserver !== 'undefined'
    ) {
      // Track Largest Contentful Paint
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        analytics.trackEvent({
          name: 'web-vitals',
          props: {
            metric: 'LCP',
            value: Math.round(lastEntry.startTime),
            rating:
              lastEntry.startTime < 2500
                ? 'good'
                : lastEntry.startTime < 4000
                  ? 'needs-improvement'
                  : 'poor',
          },
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay
      if (typeof PerformanceObserver !== 'undefined') {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            analytics.trackEvent({
              name: 'web-vitals',
              props: {
                metric: 'FID',
                value: Math.round(entry.processingStart - entry.startTime),
                rating:
                  entry.processingStart - entry.startTime < 100
                    ? 'good'
                    : entry.processingStart - entry.startTime < 300
                      ? 'needs-improvement'
                      : 'poor',
              },
            });
          });
        }).observe({ entryTypes: ['first-input'] });
      }

      // Track Cumulative Layout Shift
      if (typeof PerformanceObserver !== 'undefined') {
        let clsValue = 0;
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          analytics.trackEvent({
            name: 'web-vitals',
            props: {
              metric: 'CLS',
              value: Math.round(clsValue * 1000) / 1000,
              rating:
                clsValue < 0.1
                  ? 'good'
                  : clsValue < 0.25
                    ? 'needs-improvement'
                    : 'poor',
            },
          });
        }).observe({ entryTypes: ['layout-shift'] });
      }
    }
  }

  private trackPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        analytics.trackEvent({
          name: 'page-performance',
          props: {
            loadTime: Math.round(
              navigation.loadEventEnd - navigation.fetchStart
            ),
            domContentLoaded: Math.round(
              navigation.domContentLoadedEventEnd - navigation.fetchStart
            ),
            firstByte: Math.round(
              navigation.responseStart - navigation.fetchStart
            ),
            connectionType:
              (navigator as any).connection?.effectiveType || 'unknown',
          },
        });
      }, 0);
    });
  }

  private startFPSMonitoring() {
    if (typeof window === 'undefined') return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;

      if (delta > 0) {
        const fps = 1000 / delta;
        this.fpsHistory.push(fps);

        // Keep only last 60 frames (1 second at 60fps)
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }
      }

      this.frameCount++;

      // Report FPS every 5 seconds
      if (this.frameCount % 300 === 0) {
        this.reportFPSMetrics();
      }

      if (this.isTracking) {
        requestAnimationFrame(measureFPS);
      }
    };

    this.isTracking = true;
    requestAnimationFrame(measureFPS);
  }

  private reportFPSMetrics() {
    if (this.fpsHistory.length === 0) return;

    const avgFPS =
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const minFPS = Math.min(...this.fpsHistory);
    const maxFPS = Math.max(...this.fpsHistory);

    analytics.trackEvent({
      name: 'fps-metrics',
      props: {
        avgFPS: Math.round(avgFPS),
        minFPS: Math.round(minFPS),
        maxFPS: Math.round(maxFPS),
        samples: this.fpsHistory.length,
      },
    });
  }

  /**
   * Track Three.js specific performance metrics
   */
  trackThreeJSMetrics(renderer: any, scene: any) {
    if (!renderer || !scene) return;

    const info = renderer.info;
    const memoryInfo = (performance as any).memory;

    const metrics: ThreeJSMetrics = {
      fps: this.getCurrentFPS(),
      frameTime: this.getAverageFrameTime(),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize : 0,
    };

    analytics.trackEvent({
      name: '3d-performance',
      props: {
        fps: Math.round(metrics.fps),
        frameTime: Math.round(metrics.frameTime * 100) / 100,
        drawCalls: metrics.drawCalls,
        triangles: metrics.triangles,
        geometries: metrics.geometries,
        textures: metrics.textures,
        memoryMB: Math.round(metrics.memoryUsage / 1024 / 1024),
      },
    });
  }

  /**
   * Track interaction latency
   */
  trackInteractionLatency(
    startTime: number,
    endTime: number,
    interactionType: string
  ) {
    const latency = endTime - startTime;

    analytics.trackEvent({
      name: 'interaction-latency',
      props: {
        type: interactionType,
        latency: Math.round(latency),
        rating:
          latency < 100 ? 'good' : latency < 300 ? 'needs-improvement' : 'poor',
      },
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    if (typeof window === 'undefined') return;

    const memoryInfo = (performance as any).memory;
    if (!memoryInfo) return;

    analytics.trackEvent({
      name: 'memory-usage',
      props: {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024),
        utilization: Math.round(
          (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
        ),
      },
    });
  }

  private getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }

  private getAverageFrameTime(): number {
    if (this.fpsHistory.length === 0) return 0;
    const avgFPS =
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    return 1000 / avgFPS;
  }

  /**
   * Start performance tracking
   */
  start() {
    this.isTracking = true;
    this.startTime = performance.now();
  }

  /**
   * Stop performance tracking
   */
  stop() {
    this.isTracking = false;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const memoryInfo = (performance as any).memory;

    return {
      fps: this.getCurrentFPS(),
      memory: memoryInfo ? memoryInfo.usedJSHeapSize : 0,
      loadTime: performance.now() - this.startTime,
      interactionLatency: this.getAverageFrameTime(),
    };
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();
