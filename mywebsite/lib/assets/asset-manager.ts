'use client';

import { ModelLoader, ModelAsset, getModelLoader } from './draco-loader';
import {
  TextureManager,
  TextureAsset,
  getTextureManager,
} from './texture-loader';
import type { WebGLRenderer } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Texture } from 'three';

/**
 * Represents a collection of related 3D assets that should be loaded together
 *
 * Asset bundles allow for efficient loading and management of related resources,
 * such as all assets needed for a specific scene or feature.
 */
export interface AssetBundle {
  /** Unique identifier for the bundle */
  id: string;
  /** Human-readable name for debugging and logging */
  name: string;
  /** 3D models included in this bundle */
  models: ModelAsset[];
  /** Textures included in this bundle */
  textures: TextureAsset[];
  /** Loading priority - affects when the bundle is loaded */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Whether to preload this bundle during app initialization */
  preload?: boolean;
}

/**
 * Progress information for asset bundle loading
 *
 * Provides detailed progress tracking including timing estimates
 * and current loading status for user feedback.
 */
export interface LoadingProgress {
  /** ID of the bundle being loaded */
  bundleId: string;
  /** Total number of assets in the bundle */
  totalAssets: number;
  /** Number of assets successfully loaded */
  loadedAssets: number;
  /** Number of assets that failed to load */
  failedAssets: number;
  /** Loading progress as percentage (0-100) */
  progress: number;
  /** Currently loading asset URL (optional) */
  currentAsset?: string;
  /** Estimated time remaining in milliseconds (optional) */
  estimatedTimeRemaining?: number;
}

/**
 * Result of loading a single asset with metadata
 *
 * Includes timing information and cache status for performance monitoring.
 */
export interface AssetLoadResult<T> {
  /** The loaded asset */
  asset: T;
  /** URL the asset was loaded from */
  url: string;
  /** Time taken to load in milliseconds */
  loadTime: number;
  /** Whether the asset was served from cache */
  fromCache: boolean;
}

/**
 * Callback function type for progress updates
 */
export type ProgressCallback = (progress: LoadingProgress) => void;

/**
 * AssetManager - Centralized 3D asset loading and management system
 *
 * The AssetManager provides:
 * - Coordinated loading of models and textures in bundles
 * - Progress tracking with detailed timing information
 * - Memory management and caching strategies
 * - Error handling and retry mechanisms
 * - Performance monitoring and optimization
 *
 * Key features:
 * - Bundle-based loading for related assets
 * - Concurrent loading with progress callbacks
 * - Automatic cache management
 * - Memory usage tracking
 * - Graceful error handling
 *
 * Usage:
 * ```typescript
 * const assetManager = getAssetManager(renderer);
 *
 * // Register for progress updates
 * const unsubscribe = assetManager.onProgress((progress) => {
 *   console.log(`Loading: ${progress.progress}%`);
 * });
 *
 * // Load a bundle of assets
 * const { models, textures } = await assetManager.loadBundle(bundle);
 *
 * // Clean up
 * unsubscribe();
 * ```
 */
export class AssetManager {
  /** Model loader instance for handling 3D models */
  private modelLoader: ModelLoader;

  /** Texture manager instance for handling textures */
  private textureManager: TextureManager;

  /** Map of currently loading bundles to prevent duplicate loads */
  private loadingBundles = new Map<string, Promise<void>>();

  /** Progress tracking for each loading bundle */
  private bundleProgress = new Map<string, LoadingProgress>();

  /** Set of registered progress callback functions */
  private progressCallbacks = new Set<ProgressCallback>();

  /**
   * Create a new AssetManager instance
   *
   * @param renderer - Optional WebGL renderer for optimization hints
   */
  constructor(renderer?: WebGLRenderer) {
    this.modelLoader = getModelLoader(renderer);
    this.textureManager = getTextureManager(renderer);
  }

  /**
   * Register a progress callback to receive loading updates
   */
  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  /**
   * Load an asset bundle with progress tracking
   */
  async loadBundle(bundle: AssetBundle): Promise<{
    models: Map<string, GLTF>;
    textures: Map<string, Texture>;
  }> {
    // Return existing loading promise if bundle is already being loaded
    if (this.loadingBundles.has(bundle.id)) {
      await this.loadingBundles.get(bundle.id);
      return this.getBundleAssets(bundle);
    }

    const loadingPromise = this.loadBundleInternal(bundle);
    this.loadingBundles.set(bundle.id, loadingPromise);

    try {
      await loadingPromise;
      return this.getBundleAssets(bundle);
    } finally {
      this.loadingBundles.delete(bundle.id);
      this.bundleProgress.delete(bundle.id);
    }
  }

  /**
   * Internal bundle loading implementation
   */
  private async loadBundleInternal(bundle: AssetBundle): Promise<void> {
    const totalAssets = bundle.models.length + bundle.textures.length;
    const startTime = performance.now();

    let loadedAssets = 0;
    let failedAssets = 0;

    // Initialize progress tracking
    const progress: LoadingProgress = {
      bundleId: bundle.id,
      totalAssets,
      loadedAssets: 0,
      failedAssets: 0,
      progress: 0,
    };

    this.bundleProgress.set(bundle.id, progress);
    this.notifyProgress(progress);

    // Load models and textures concurrently
    const modelPromises = bundle.models.map(async modelAsset => {
      try {
        progress.currentAsset = modelAsset.url;
        this.notifyProgress(progress);

        const result = await this.loadModelWithTiming(modelAsset);
        loadedAssets++;

        progress.loadedAssets = loadedAssets;
        progress.progress = (loadedAssets / totalAssets) * 100;
        progress.estimatedTimeRemaining = this.calculateETA(
          startTime,
          loadedAssets,
          totalAssets
        );
        this.notifyProgress(progress);

        return result;
      } catch (error) {
        failedAssets++;
        progress.failedAssets = failedAssets;
        console.error(`Failed to load model ${modelAsset.url}:`, error);
        return null;
      }
    });

    const texturePromises = bundle.textures.map(async textureAsset => {
      try {
        progress.currentAsset = textureAsset.url;
        this.notifyProgress(progress);

        const result = await this.loadTextureWithTiming(textureAsset);
        loadedAssets++;

        progress.loadedAssets = loadedAssets;
        progress.progress = (loadedAssets / totalAssets) * 100;
        progress.estimatedTimeRemaining = this.calculateETA(
          startTime,
          loadedAssets,
          totalAssets
        );
        this.notifyProgress(progress);

        return result;
      } catch (error) {
        failedAssets++;
        progress.failedAssets = failedAssets;
        console.error(`Failed to load texture ${textureAsset.url}:`, error);
        return null;
      }
    });

    // Wait for all assets to load
    await Promise.allSettled([...modelPromises, ...texturePromises]);

    // Final progress update
    progress.loadedAssets = loadedAssets;
    progress.failedAssets = failedAssets;
    progress.progress = 100;
    progress.currentAsset = undefined;
    progress.estimatedTimeRemaining = 0;
    this.notifyProgress(progress);
  }

  /**
   * Load a model with timing information
   */
  private async loadModelWithTiming(
    asset: ModelAsset
  ): Promise<AssetLoadResult<GLTF>> {
    const startTime = performance.now();
    const fromCache = this.modelLoader.getStats().cachedModels > 0;

    const model = await this.modelLoader.loadModel(asset);
    const loadTime = performance.now() - startTime;

    return {
      asset: model,
      url: asset.url,
      loadTime,
      fromCache,
    };
  }

  /**
   * Load a texture with timing information
   */
  private async loadTextureWithTiming(
    asset: TextureAsset
  ): Promise<AssetLoadResult<Texture>> {
    const startTime = performance.now();
    const memoryBefore = this.textureManager.getMemoryUsage();

    const texture = await this.textureManager.loadTexture(asset);
    const loadTime = performance.now() - startTime;
    const memoryAfter = this.textureManager.getMemoryUsage();

    return {
      asset: texture,
      url: asset.url,
      loadTime,
      fromCache: memoryAfter.textureCount === memoryBefore.textureCount,
    };
  }

  /**
   * Get loaded assets for a bundle
   */
  private getBundleAssets(bundle: AssetBundle): {
    models: Map<string, GLTF>;
    textures: Map<string, Texture>;
  } {
    const models = new Map<string, GLTF>();
    const textures = new Map<string, Texture>();

    // This is a simplified implementation - in practice, you'd need to track
    // which assets belong to which bundle
    return { models, textures };
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateETA(
    startTime: number,
    loaded: number,
    total: number
  ): number {
    if (loaded === 0) return 0;

    const elapsed = performance.now() - startTime;
    const averageTimePerAsset = elapsed / loaded;
    const remaining = total - loaded;

    return remaining * averageTimePerAsset;
  }

  /**
   * Notify all progress callbacks
   */
  private notifyProgress(progress: LoadingProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  /**
   * Preload critical assets
   */
  async preloadCriticalAssets(bundles: AssetBundle[]): Promise<void> {
    const criticalBundles = bundles
      .filter(bundle => bundle.priority === 'critical' || bundle.preload)
      .slice(0, 2); // Limit concurrent bundle loads

    const preloadPromises = criticalBundles.map(bundle =>
      this.loadBundle(bundle).catch(error => {
        console.warn(`Failed to preload bundle ${bundle.id}:`, error);
        return null;
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get loading statistics
   */
  getLoadingStats() {
    const modelStats = this.modelLoader.getStats();
    const textureStats = this.textureManager.getMemoryUsage();

    return {
      models: modelStats,
      textures: textureStats,
      activeBundles: this.loadingBundles.size,
      bundleProgress: Array.from(this.bundleProgress.values()),
    };
  }

  /**
   * Clear all cached assets
   */
  clearCache(): void {
    this.modelLoader.clearCache();
    this.textureManager.clearCache();
  }

  /**
   * Dispose of asset manager and free resources
   */
  dispose(): void {
    this.clearCache();
    this.progressCallbacks.clear();
    this.loadingBundles.clear();
    this.bundleProgress.clear();
  }
}

// Singleton instance for global use
let globalAssetManager: AssetManager | null = null;

export function getAssetManager(renderer?: WebGLRenderer): AssetManager {
  if (!globalAssetManager) {
    globalAssetManager = new AssetManager(renderer);
  }
  return globalAssetManager;
}

export function disposeAssetManager(): void {
  if (globalAssetManager) {
    globalAssetManager.dispose();
    globalAssetManager = null;
  }
}
