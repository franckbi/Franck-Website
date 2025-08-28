import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  lazyImport,
  preloadComponent,
  createLazyComponent,
  LazyComponentLoader,
} from '@/lib/utils/lazy-imports';

// Mock React.lazy
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: vi.fn(factory => {
      const LazyComponent = (props: any) => {
        const Component = factory();
        return Component.default ? Component.default(props) : Component(props);
      };
      LazyComponent.displayName = 'LazyComponent';
      return LazyComponent;
    }),
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('Lazy Imports Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lazyImport', () => {
    it('should create lazy import with proper error handling', async () => {
      const mockImport = vi.fn().mockResolvedValue({
        default: () => 'Test Component',
      });

      const LazyComponent = lazyImport(mockImport, 'TestComponent');

      expect(LazyComponent).toBeDefined();
      expect(LazyComponent.displayName).toBe('LazyComponent');
    });

    it('should handle import failures gracefully', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Import failed'));

      const LazyComponent = lazyImport(mockImport, 'TestComponent');

      expect(LazyComponent).toBeDefined();
    });
  });

  describe('preloadComponent', () => {
    it('should preload component module', async () => {
      const mockImport = vi.fn().mockResolvedValue({
        default: () => 'Test Component',
      });

      await preloadComponent(mockImport);

      expect(mockImport).toHaveBeenCalledOnce();
    });

    it('should handle preload failures silently', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Preload failed'));

      await expect(preloadComponent(mockImport)).resolves.toBeUndefined();
      expect(mockImport).toHaveBeenCalledOnce();
    });
  });

  describe('createLazyComponent', () => {
    it('should create lazy component with fallback', () => {
      const mockImport = vi.fn().mockResolvedValue({
        default: () => 'Test Component',
      });

      const LazyComponent = createLazyComponent(
        mockImport,
        'TestComponent',
        () => 'Loading...'
      );

      expect(LazyComponent).toBeDefined();
    });

    it('should use default fallback when none provided', () => {
      const mockImport = vi.fn().mockResolvedValue({
        default: () => 'Test Component',
      });

      const LazyComponent = createLazyComponent(mockImport, 'TestComponent');

      expect(LazyComponent).toBeDefined();
    });
  });

  describe('LazyComponentLoader', () => {
    it('should manage component loading state', () => {
      const loader = new LazyComponentLoader();

      expect(loader.isLoading('TestComponent')).toBe(false);
      expect(loader.hasError('TestComponent')).toBe(false);
    });

    it('should track loading state', async () => {
      const loader = new LazyComponentLoader();
      const mockImport = vi.fn().mockResolvedValue({
        default: () => 'Test Component',
      });

      const promise = loader.loadComponent('TestComponent', mockImport);

      expect(loader.isLoading('TestComponent')).toBe(true);

      await promise;

      expect(loader.isLoading('TestComponent')).toBe(false);
      expect(mockImport).toHaveBeenCalledOnce();
    });

    it('should track error state', async () => {
      const loader = new LazyComponentLoader();
      const mockImport = vi.fn().mockRejectedValue(new Error('Load failed'));

      await loader.loadComponent('TestComponent', mockImport);

      expect(loader.hasError('TestComponent')).toBe(true);
      expect(loader.isLoading('TestComponent')).toBe(false);
    });

    it('should clear component state', async () => {
      const loader = new LazyComponentLoader();
      const mockImport = vi.fn().mockRejectedValue(new Error('Load failed'));

      await loader.loadComponent('TestComponent', mockImport);
      expect(loader.hasError('TestComponent')).toBe(true);

      loader.clearComponent('TestComponent');
      expect(loader.hasError('TestComponent')).toBe(false);
    });

    it('should get loading stats', async () => {
      const loader = new LazyComponentLoader();
      const mockImport1 = vi
        .fn()
        .mockResolvedValue({ default: () => 'Component1' });
      const mockImport2 = vi.fn().mockRejectedValue(new Error('Failed'));

      await loader.loadComponent('Component1', mockImport1);
      await loader.loadComponent('Component2', mockImport2);

      const stats = loader.getStats();
      expect(stats.total).toBe(2);
      expect(stats.loaded).toBe(1);
      expect(stats.errors).toBe(1);
      expect(stats.loading).toBe(0);
    });
  });
});
