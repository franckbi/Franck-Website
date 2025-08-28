import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MemoryManager,
  trackMemoryUsage,
  cleanupUnusedAssets,
  optimizeMemoryUsage,
  getMemoryStats,
  createMemoryMonitor,
} from '@/lib/utils/memory-manager';

// Mock performance.memory
const mockMemory = {
  usedJSHeapSize: 1024 * 1024 * 10, // 10MB
  totalJSHeapSize: 1024 * 1024 * 50, // 50MB
  jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
};

Object.defineProperty(performance, 'memory', {
  value: mockMemory,
  writable: true,
});

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn(callback => {
  setTimeout(callback, 0);
  return 1;
});

global.cancelIdleCallback = vi.fn();

describe('Memory Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('MemoryManager class', () => {
    it('should initialize with default options', () => {
      const manager = new MemoryManager();

      expect(manager).toBeDefined();
      expect(manager.isMonitoring()).toBe(false);
    });

    it('should start and stop monitoring', () => {
      const manager = new MemoryManager();

      manager.startMonitoring();
      expect(manager.isMonitoring()).toBe(true);

      manager.stopMonitoring();
      expect(manager.isMonitoring()).toBe(false);
    });

    it('should track memory usage', () => {
      const manager = new MemoryManager();
      const stats = manager.getMemoryStats();

      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('limit');
      expect(stats).toHaveProperty('percentage');
    });

    it('should register cleanup functions', () => {
      const manager = new MemoryManager();
      const cleanup = vi.fn();

      manager.registerCleanup('test', cleanup);
      manager.cleanup('test');

      expect(cleanup).toHaveBeenCalledOnce();
    });

    it('should handle memory pressure', () => {
      const manager = new MemoryManager({ threshold: 0.1 }); // Very low threshold
      const cleanup = vi.fn();

      manager.registerCleanup('test', cleanup);
      manager.checkMemoryPressure();

      expect(cleanup).toHaveBeenCalled();
    });

    it('should optimize memory usage', async () => {
      const manager = new MemoryManager();
      const cleanup = vi.fn();

      manager.registerCleanup('test', cleanup);
      await manager.optimizeMemory();

      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe('trackMemoryUsage', () => {
    it('should return memory usage stats', () => {
      const stats = trackMemoryUsage();

      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('limit');
      expect(stats.used).toBe(mockMemory.usedJSHeapSize);
    });

    it('should handle missing performance.memory', () => {
      const originalMemory = performance.memory;
      // @ts-ignore
      delete performance.memory;

      const stats = trackMemoryUsage();

      expect(stats.used).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.limit).toBe(0);

      Object.defineProperty(performance, 'memory', {
        value: originalMemory,
        writable: true,
      });
    });
  });

  describe('cleanupUnusedAssets', () => {
    it('should clean up registered assets', () => {
      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      cleanupUnusedAssets([
        { id: 'asset1', cleanup: cleanup1 },
        { id: 'asset2', cleanup: cleanup2 },
      ]);

      expect(cleanup1).toHaveBeenCalledOnce();
      expect(cleanup2).toHaveBeenCalledOnce();
    });

    it('should handle cleanup errors gracefully', () => {
      const cleanup1 = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup failed');
      });
      const cleanup2 = vi.fn();

      expect(() => {
        cleanupUnusedAssets([
          { id: 'asset1', cleanup: cleanup1 },
          { id: 'asset2', cleanup: cleanup2 },
        ]);
      }).not.toThrow();

      expect(cleanup1).toHaveBeenCalledOnce();
      expect(cleanup2).toHaveBeenCalledOnce();
    });
  });

  describe('optimizeMemoryUsage', () => {
    it('should trigger garbage collection if available', async () => {
      // Mock gc function
      global.gc = vi.fn();

      await optimizeMemoryUsage();

      expect(global.gc).toHaveBeenCalledOnce();

      delete global.gc;
    });

    it('should work without gc function', async () => {
      await expect(optimizeMemoryUsage()).resolves.toBeUndefined();
    });
  });

  describe('getMemoryStats', () => {
    it('should return formatted memory statistics', () => {
      const stats = getMemoryStats();

      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('limit');
      expect(stats).toHaveProperty('percentage');
      expect(stats).toHaveProperty('formattedUsed');
      expect(stats).toHaveProperty('formattedTotal');
      expect(stats).toHaveProperty('formattedLimit');
    });

    it('should format bytes correctly', () => {
      const stats = getMemoryStats();

      expect(stats.formattedUsed).toMatch(/MB$/);
      expect(stats.formattedTotal).toMatch(/MB$/);
      expect(stats.formattedLimit).toMatch(/MB$/);
    });
  });

  describe('createMemoryMonitor', () => {
    it('should create memory monitor with callback', () => {
      const callback = vi.fn();
      const monitor = createMemoryMonitor(callback, { interval: 100 });

      expect(monitor).toHaveProperty('start');
      expect(monitor).toHaveProperty('stop');
      expect(monitor).toHaveProperty('getStats');
    });

    it('should call callback on memory updates', done => {
      const callback = vi.fn(stats => {
        expect(stats).toHaveProperty('used');
        monitor.stop();
        done();
      });

      const monitor = createMemoryMonitor(callback, { interval: 10 });
      monitor.start();
    });

    it('should stop monitoring', () => {
      const callback = vi.fn();
      const monitor = createMemoryMonitor(callback);

      monitor.start();
      monitor.stop();

      // Callback should not be called after stopping
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 100);
    });
  });
});
