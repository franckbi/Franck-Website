'use client';

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { WebGLRenderer } from 'three';

export interface ModelLoadOptions {
  enableDraco?: boolean;
  enableKTX2?: boolean;
  enableMeshopt?: boolean;
  dracoDecoderPath?: string;
  ktx2DecoderPath?: string;
}

export interface ModelAsset {
  url: string;
  dracoUrl?: string;
  size: number;
  dracoSize?: number;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
}

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private ktx2Loader: KTX2Loader;
  private loadedModels = new Map<string, GLTF>();
  private loadingPromises = new Map<string, Promise<GLTF>>();

  constructor(renderer?: WebGLRenderer, options: ModelLoadOptions = {}) {
    // Initialize GLTF loader
    this.gltfLoader = new GLTFLoader();

    // Initialize Draco loader
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath(options.dracoDecoderPath || '/draco/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });

    // Initialize KTX2 loader
    this.ktx2Loader = new KTX2Loader();
    if (renderer) {
      this.ktx2Loader.setTranscoderPath('/basis/');
      this.ktx2Loader.detectSupport(renderer);
    }

    // Configure loaders
    if (options.enableDraco !== false) {
      this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }

    if (options.enableKTX2 !== false && renderer) {
      this.gltfLoader.setKTX2Loader(this.ktx2Loader);
    }

    if (options.enableMeshopt !== false) {
      this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    }
  }

  /**
   * Load a 3D model with automatic Draco compression detection
   */
  async loadModel(asset: ModelAsset): Promise<GLTF> {
    const cacheKey = asset.dracoUrl || asset.url;

    // Return cached model if available
    if (this.loadedModels.has(cacheKey)) {
      return this.loadedModels.get(cacheKey)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Determine which URL to use based on compression support
    const modelUrl = this.shouldUseDraco(asset)
      ? asset.dracoUrl || asset.url
      : asset.url;

    const loadingPromise = new Promise<GLTF>((resolve, reject) => {
      this.gltfLoader.load(
        modelUrl,
        gltf => {
          // Cache the loaded model
          this.loadedModels.set(cacheKey, gltf);
          this.loadingPromises.delete(cacheKey);

          // Optimize the model after loading
          this.optimizeModel(gltf);

          resolve(gltf);
        },
        progress => {
          // Progress callback - can be used for loading indicators
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.debug(`Loading ${modelUrl}: ${percentComplete.toFixed(1)}%`);
        },
        error => {
          this.loadingPromises.delete(cacheKey);
          console.error(`Failed to load model ${modelUrl}:`, error);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Preload models for better performance
   */
  async preloadModels(assets: ModelAsset[]): Promise<void> {
    const highPriorityAssets = assets
      .filter(asset => asset.priority === 'high' || asset.preload)
      .slice(0, 3); // Limit concurrent preloads

    const preloadPromises = highPriorityAssets.map(asset =>
      this.loadModel(asset).catch(error => {
        console.warn(`Failed to preload model ${asset.url}:`, error);
        return null;
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Determine if Draco compression should be used
   */
  private shouldUseDraco(asset: ModelAsset): boolean {
    // Use Draco if available and provides significant size reduction
    if (!asset.dracoUrl || !asset.dracoSize) return false;

    const compressionRatio = asset.dracoSize / asset.size;
    return compressionRatio < 0.7; // Use Draco if it reduces size by 30% or more
  }

  /**
   * Optimize loaded model for performance
   */
  private optimizeModel(gltf: GLTF): void {
    gltf.scene.traverse(child => {
      if ((child as any).isMesh) {
        // Enable frustum culling
        child.frustumCulled = true;

        // Optimize materials
        const mesh = child as any;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material: any) =>
              this.optimizeMaterial(material)
            );
          } else {
            this.optimizeMaterial(mesh.material);
          }
        }

        // Optimize geometry
        if (mesh.geometry) {
          mesh.geometry.computeBoundingSphere();
          mesh.geometry.computeBoundingBox();
        }
      }
    });
  }

  /**
   * Optimize material properties for performance
   */
  private optimizeMaterial(material: any): void {
    // Disable unnecessary features for performance
    if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
      // Only enable features that are actually used
      material.needsUpdate = true;
    }
  }

  /**
   * Clear cached models to free memory
   */
  clearCache(): void {
    // Dispose of geometries and materials
    this.loadedModels.forEach(gltf => {
      gltf.scene.traverse(child => {
        if ((child as any).isMesh) {
          const mesh = child as any;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((material: any) => material.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    });

    this.loadedModels.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      cachedModels: this.loadedModels.size,
      loadingModels: this.loadingPromises.size,
    };
  }

  /**
   * Dispose of loaders and free resources
   */
  dispose(): void {
    this.clearCache();
    this.dracoLoader.dispose();
    this.ktx2Loader.dispose();
  }
}

// Singleton instance for global use
let globalModelLoader: ModelLoader | null = null;

export function getModelLoader(renderer?: WebGLRenderer): ModelLoader {
  if (!globalModelLoader) {
    globalModelLoader = new ModelLoader(renderer);
  }
  return globalModelLoader;
}

export function disposeModelLoader(): void {
  if (globalModelLoader) {
    globalModelLoader.dispose();
    globalModelLoader = null;
  }
}
