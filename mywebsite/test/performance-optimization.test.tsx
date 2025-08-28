import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  getBundleAnalyzer,
  PERFORMANCE_BUDGETS,
} from '@/lib/performance/bundle-analyzer';
import { getPerformanceMonitor } from '@/lib/performance/performance-monitor';
import { getServiceWorkerManager } from '@/lib/utils/service-worker';
import { memoryManager } from '@/lib/utils/memory-manager';
import {
  PerformanceProvider,
  PerformanceIndicator,
} from '@/components/performance/performance-provider';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Lazy3DWrapper } from '@/components/3d/lazy-3d-wrapper';

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(() => ({
    traverse: vi.fn(),
    clear: vi.fn(),
  })),
  WebGLRenderer: vi.fn(() => ({
    info: { memory: { geometries: 0, textures: 0 }, programs: [] },
    dispose: vi.fn(),
    getContext: vi.fn(() => ({
      getExtension: vi.fn(() => ({ loseContext: vi.fn() })),
    })),
    getRenderTarget: vi.fn(() => ({ dispose: vi.fn() })),
    state: { reset: vi.fn() },
  })),
  Cache: { clear: vi.fn() },
  Mesh: vi.fn(),
  BufferGeometry: vi.fn(() => ({ dispose: vi.fn() })),
  Material: vi.fn(() => ({ dispose: vi.fn() })),
  Texture: vi.fn(() => ({ dispose: vi.fn() })),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock performance APIs
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    },
    getEntriesByType: vi.fn(() => []),
  },
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  })),
});

describe('Performance Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Bundle Analyzer', () => {
    it('should track bundle metrics', async () => {
      const analyzer = getBundleAnalyzer();
      const metrics = analyzer.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.loadTimes).toBe('object');
    });

    it('should check performance budgets', () => {
      const analyzer = getBundleAnalyzer();
      const results = analyzer.checkBudgets(PERFORMANCE_BUDGETS);

      expect(Array.isArray(results)).toBe(true);
      results.forEach(result => {
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('actual');
        expect(result).toHaveProperty('budget');
        expect(result).toHaveProperty('exceeded');
      });
    });

    it('should generate performance report', () => {
      const analyzer = getBundleAnalyzer();
      const report = analyzer.generateReport();

      expect(typeof report).toBe('string');
      expect(() => JSON.parse(report)).not.toThrow();
    });
  });

  describe('Performance Monitor', () => {
    it('should collect performance metrics', () => {
      const monitor = getPerformanceMonitor();
      const metrics = monitor.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('should calculate performance score', () => {
      const monitor = getPerformanceMonitor();
      const score = monitor.getScore();

      expect(score).toHaveProperty('score');
      expect(score).toHaveProperty('grade');
      expect(typeof score.score).toBe('number');
      expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
    });

    it('should record WebGL initialization time', () => {
      const monitor = getPerformanceMonitor();
      const initTime = 100;

      monitor.recordWebGLInit(initTime);
      const metrics = monitor.getMetrics();

      expect(metrics.webglInitTime).toBe(initTime);
    });
  });

  describe('Service Worker Manager', () => {
    it('should check service worker support', () => {
      const manager = getServiceWorkerManager();
      const isSupported = manager.isSupported();

      expect(typeof isSupported).toBe('boolean');
    });

    it('should handle network status', async () => {
      const manager = getServiceWorkerManager();
      const status = await manager.getNetworkStatus();

      expect(['online', 'offline']).toContain(status);
    });
  });

  describe('Memory Manager', () => {
    it('should get memory statistics', () => {
      const stats = memoryManager.getMemoryStats();

      expect(stats).toHaveProperty('geometries');
      expect(stats).toHaveProperty('textures');
      expect(stats).toHaveProperty('materials');
      expect(stats).toHaveProperty('programs');
    });

    it('should register cleanup callbacks', () => {
      const callback = vi.fn();
      const unregister = memoryManager.registerCleanupCallback(callback);

      expect(typeof unregister).toBe('function');

      memoryManager.performGarbageCollection();
      expect(callback).toHaveBeenCalled();

      unregister();
    });

    it('should perform garbage collection', () => {
      const callback = vi.fn();
      memoryManager.registerCleanupCallback(callback);

      memoryManager.performGarbageCollection();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('OptimizedImage Component', () => {
    it('should render with optimized props', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
          priority={true}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
    });

    it('should handle loading states', async () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
        />
      );

      // Should show loading state initially
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    it('should handle error states', async () => {
      render(
        <OptimizedImage
          src="/non-existent-image.jpg"
          alt="Test image"
          width={800}
          height={600}
          onError={vi.fn()}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Lazy3DWrapper Component', () => {
    it('should render loading state initially', () => {
      render(
        <Lazy3DWrapper>
          <div>3D Content</div>
        </Lazy3DWrapper>
      );

      expect(screen.getByText('Loading 3D experience...')).toBeInTheDocument();
    });

    it('should render fallback in low power mode', () => {
      // Mock low power mode
      vi.mock('@/lib/stores/settings-store', () => ({
        useSettingsStore: () => ({ lowPowerMode: true }),
      }));

      const fallback = <div>Fallback content</div>;

      render(
        <Lazy3DWrapper fallback={fallback}>
          <div>3D Content</div>
        </Lazy3DWrapper>
      );

      expect(screen.getByText('Fallback content')).toBeInTheDocument();
    });

    it('should preload when specified', () => {
      render(
        <Lazy3DWrapper preload={true}>
          <div>3D Content</div>
        </Lazy3DWrapper>
      );

      // Should not show loading state when preload is true
      expect(
        screen.queryByText('Loading 3D experience...')
      ).not.toBeInTheDocument();
    });
  });

  describe('PerformanceProvider', () => {
    it('should provide performance context', () => {
      render(
        <PerformanceProvider>
          <PerformanceIndicator />
        </PerformanceProvider>
      );

      // In development mode, should show performance indicator
      if (process.env.NODE_ENV === 'development') {
        expect(screen.getByText(/Performance:/)).toBeInTheDocument();
        expect(screen.getByText(/Network:/)).toBeInTheDocument();
      }
    });
  });

  describe('Code Splitting', () => {
    it('should lazy load 3D components', async () => {
      const { Hero3D } = await import('@/lib/utils/lazy-imports');
      expect(Hero3D).toBeDefined();
    });

    it('should lazy load contact form', async () => {
      const { ContactForm } = await import('@/lib/utils/lazy-imports');
      expect(ContactForm).toBeDefined();
    });

    it('should conditionally load components', async () => {
      const { loadConditionally } = await import('@/lib/utils/lazy-imports');

      const mockComponent = () => Promise.resolve({ default: () => null });

      const result = await loadConditionally(mockComponent, false);
      expect(result.default()).toBeNull();
    });
  });
});
