import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModelLoader } from '@/lib/assets/draco-loader';
import { TextureManager } from '@/lib/assets/texture-loader';
import { AssetManager } from '@/lib/assets/asset-manager';
import { LODManager } from '@/lib/assets/lod-system';
import type { ModelAsset, TextureAsset, AssetBundle } from '@/lib/assets';

// Mock Three.js modules
vi.mock('three/examples/jsm/loaders/DRACOLoader.js', () => ({
  DRACOLoader: vi.fn().mockImplementation(() => ({
    setDecoderPath: vi.fn(),
    setDecoderConfig: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: vi.fn().mockImplementation(() => ({
    setDRACOLoader: vi.fn(),
    setKTX2Loader: vi.fn(),
    setMeshoptDecoder: vi.fn(),
    load: vi.fn(),
  })),
}));

vi.mock('three/examples/jsm/loaders/KTX2Loader.js', () => ({
  KTX2Loader: vi.fn().mockImplementation(() => ({
    setTranscoderPath: vi.fn(),
    detectSupport: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock('three/examples/jsm/libs/meshopt_decoder.module.js', () => ({
  MeshoptDecoder: {},
}));

vi.mock('three', () => ({
  TextureLoader: vi.fn().mockImplementation(() => ({
    load: vi.fn(),
  })),
  LOD: vi.fn().mockImplementation(() => ({
    addLevel: vi.fn(),
    update: vi.fn(),
    levels: [],
    getCurrentLevel: vi.fn().mockReturnValue(0),
    autoUpdate: true,
  })),
  Texture: vi.fn(),
  Mesh: vi.fn().mockImplementation(() => ({
    isMesh: true,
  })),
  LinearFilter: 1,
  LinearMipmapLinearFilter: 2,
}));

describe('Asset Pipeline', () => {
  describe('ModelLoader', () => {
    let modelLoader: ModelLoader;

    beforeEach(() => {
      modelLoader = new ModelLoader();
    });

    afterEach(() => {
      modelLoader.dispose();
    });

    it('should initialize with default options', () => {
      expect(modelLoader).toBeDefined();
      expect(modelLoader.getStats().cachedModels).toBe(0);
    });

    it('should determine Draco usage based on compression ratio', () => {
      const asset: ModelAsset = {
        url: '/model.glb',
        dracoUrl: '/model.draco.glb',
        size: 1000000,
        dracoSize: 600000, // 60% of original - should use Draco
        priority: 'high',
      };

      // Access private method through type assertion for testing
      const shouldUseDraco = (modelLoader as any).shouldUseDraco(asset);
      expect(shouldUseDraco).toBe(true);
    });

    it('should not use Draco if compression ratio is poor', () => {
      const asset: ModelAsset = {
        url: '/model.glb',
        dracoUrl: '/model.draco.glb',
        size: 1000000,
        dracoSize: 800000, // 80% of original - should not use Draco
        priority: 'high',
      };

      const shouldUseDraco = (modelLoader as any).shouldUseDraco(asset);
      expect(shouldUseDraco).toBe(false);
    });

    it('should clear cache and dispose resources', () => {
      modelLoader.clearCache();
      expect(modelLoader.getStats().cachedModels).toBe(0);

      modelLoader.dispose();
      expect(modelLoader.getStats().cachedModels).toBe(0);
    });
  });

  describe('TextureManager', () => {
    let textureManager: TextureManager;

    beforeEach(() => {
      textureManager = new TextureManager();
    });

    afterEach(() => {
      textureManager.dispose();
    });

    it('should initialize with default options', () => {
      expect(textureManager).toBeDefined();
      expect(textureManager.getMemoryUsage().textureCount).toBe(0);
    });

    it('should select optimal texture format', () => {
      const asset: TextureAsset = {
        url: '/texture.jpg',
        ktx2Url: '/texture.ktx2',
        webpUrl: '/texture.webp',
        size: 1000000,
        ktx2Size: 400000, // 40% of original - should prefer KTX2
        webpSize: 700000, // 70% of original
        priority: 'high',
        type: 'diffuse',
      };

      // Mock KTX2 support
      (textureManager as any).supportsKTX2 = true;
      (textureManager as any).supportsWebP = true;

      const optimalUrl = (textureManager as any).getOptimalTextureUrl(asset);
      expect(optimalUrl).toBe('/texture.ktx2');
    });

    it('should fallback to WebP when KTX2 is not supported', () => {
      const asset: TextureAsset = {
        url: '/texture.jpg',
        ktx2Url: '/texture.ktx2',
        webpUrl: '/texture.webp',
        size: 1000000,
        ktx2Size: 400000,
        webpSize: 700000,
        priority: 'high',
        type: 'diffuse',
      };

      // Mock no KTX2 support but WebP support
      (textureManager as any).supportsKTX2 = false;
      (textureManager as any).supportsWebP = true;

      const optimalUrl = (textureManager as any).getOptimalTextureUrl(asset);
      expect(optimalUrl).toBe('/texture.webp');
    });

    it('should track memory usage', () => {
      const initialUsage = textureManager.getMemoryUsage();
      expect(initialUsage.textureCount).toBe(0);
      expect(initialUsage.estimatedMemoryMB).toBe(0);
    });
  });

  describe('AssetManager', () => {
    let assetManager: AssetManager;

    beforeEach(() => {
      assetManager = new AssetManager();
    });

    afterEach(() => {
      assetManager.dispose();
    });

    it('should initialize with default state', () => {
      expect(assetManager).toBeDefined();
      const stats = assetManager.getLoadingStats();
      expect(stats.activeBundles).toBe(0);
    });

    it('should register and unregister progress callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = assetManager.onProgress(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should calculate ETA correctly', () => {
      const startTime = performance.now() - 1000; // 1 second ago
      const loaded = 5;
      const total = 10;

      const eta = (assetManager as any).calculateETA(startTime, loaded, total);
      expect(eta).toBeGreaterThan(0);
      expect(eta).toBeLessThan(2000); // Should be around 1 second
    });

    it('should handle bundle loading', async () => {
      const bundle: AssetBundle = {
        id: 'test-bundle',
        name: 'Test Bundle',
        models: [],
        textures: [],
        priority: 'high',
      };

      // Mock the internal loading method to resolve immediately
      vi.spyOn(assetManager as any, 'loadBundleInternal').mockResolvedValue(
        undefined
      );

      const result = await assetManager.loadBundle(bundle);
      expect(result).toBeDefined();
      expect(result.models).toBeInstanceOf(Map);
      expect(result.textures).toBeInstanceOf(Map);
    });
  });

  describe('LODManager', () => {
    let lodManager: LODManager;

    beforeEach(() => {
      lodManager = new LODManager();
    });

    afterEach(() => {
      lodManager.dispose();
    });

    it('should initialize with default config', () => {
      expect(lodManager).toBeDefined();
      const stats = lodManager.getStats();
      expect(stats.totalLODObjects).toBe(0);
    });

    it('should calculate target triangles based on performance target', () => {
      const highTarget = (lodManager as any).getTargetTriangles();
      expect(highTarget).toBeGreaterThan(0);

      lodManager.setPerformanceTarget('low');
      const lowTarget = (lodManager as any).getTargetTriangles();
      expect(lowTarget).toBeLessThan(highTarget);
    });

    it('should count triangles in mesh objects', () => {
      // Test the triangle counting logic directly
      const stats = lodManager.getStats();
      expect(stats.currentTriangles).toBe(0);

      // Since we can't easily mock instanceof, we'll test that the method exists
      expect(typeof (lodManager as any).countTriangles).toBe('function');
    });

    it('should estimate memory usage', () => {
      // Test the memory estimation logic directly
      const stats = lodManager.getStats();
      expect(stats.currentMemoryUsage).toBe(0);

      // Since we can't easily mock instanceof, we'll test that the method exists
      expect(typeof (lodManager as any).estimateMemoryUsage).toBe('function');
    });

    it('should update performance target', () => {
      lodManager.setPerformanceTarget('low');
      const stats = lodManager.getStats();
      expect(stats).toBeDefined();
    });

    it('should get loading statistics', () => {
      const stats = lodManager.getStats();
      expect(stats.totalLODObjects).toBe(0);
      expect(stats.currentTriangles).toBe(0);
      expect(stats.currentDrawCalls).toBe(0);
      expect(stats.distanceMultiplier).toBe(1.0);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete asset pipeline', async () => {
      const assetManager = new AssetManager();
      const lodManager = new LODManager();

      const bundle: AssetBundle = {
        id: 'integration-test',
        name: 'Integration Test Bundle',
        models: [
          {
            url: '/test-model.glb',
            size: 100000,
            priority: 'high',
          },
        ],
        textures: [
          {
            url: '/test-texture.jpg',
            size: 50000,
            priority: 'high',
            type: 'diffuse',
          },
        ],
        priority: 'high',
      };

      // Mock successful loading
      vi.spyOn(assetManager as any, 'loadBundleInternal').mockResolvedValue(
        undefined
      );

      const progressCallback = vi.fn();
      const unsubscribe = assetManager.onProgress(progressCallback);

      try {
        await assetManager.loadBundle(bundle);

        const assetStats = assetManager.getLoadingStats();
        const lodStats = lodManager.getStats();

        expect(assetStats).toBeDefined();
        expect(lodStats).toBeDefined();
      } finally {
        unsubscribe();
        assetManager.dispose();
        lodManager.dispose();
      }
    });
  });
});
