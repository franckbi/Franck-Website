'use client';

import {
  TextureLoader,
  Texture,
  LinearFilter,
  LinearMipmapLinearFilter,
} from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import type { WebGLRenderer } from 'three';

export interface TextureAsset {
  url: string;
  ktx2Url?: string;
  webpUrl?: string;
  size: number;
  ktx2Size?: number;
  webpSize?: number;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
  type: 'diffuse' | 'normal' | 'roughness' | 'metallic' | 'emissive' | 'ao';
}

export interface TextureLoadOptions {
  enableKTX2?: boolean;
  enableWebP?: boolean;
  generateMipmaps?: boolean;
  flipY?: boolean;
  maxTextureSize?: number;
}

export class TextureManager {
  private textureLoader: TextureLoader;
  private ktx2Loader: KTX2Loader;
  private loadedTextures = new Map<string, Texture>();
  private loadingPromises = new Map<string, Promise<Texture>>();
  private renderer?: WebGLRenderer;
  private supportsKTX2 = false;
  private supportsWebP = false;

  constructor(renderer?: WebGLRenderer, options: TextureLoadOptions = {}) {
    this.renderer = renderer;
    this.textureLoader = new TextureLoader();
    this.ktx2Loader = new KTX2Loader();

    if (renderer) {
      this.ktx2Loader.setTranscoderPath('/basis/');
      this.ktx2Loader.detectSupport(renderer);
      this.supportsKTX2 = true;
    }

    // Detect WebP support
    this.detectWebPSupport();
  }

  /**
   * Detect WebP support in the browser
   */
  private async detectWebPSupport(): Promise<void> {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supportsWebP = webP.height === 2;
        resolve();
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Load a texture with automatic format detection and optimization
   */
  async loadTexture(
    asset: TextureAsset,
    options: TextureLoadOptions = {}
  ): Promise<Texture> {
    const optimalUrl = this.getOptimalTextureUrl(asset);
    const cacheKey = optimalUrl;

    // Return cached texture if available
    if (this.loadedTextures.has(cacheKey)) {
      return this.loadedTextures.get(cacheKey)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadingPromise = this.createLoadingPromise(
      optimalUrl,
      asset,
      options
    );
    this.loadingPromises.set(cacheKey, loadingPromise);

    return loadingPromise;
  }

  /**
   * Create a loading promise for a texture
   */
  private createLoadingPromise(
    url: string,
    asset: TextureAsset,
    options: TextureLoadOptions
  ): Promise<Texture> {
    return new Promise((resolve, reject) => {
      const isKTX2 = url.endsWith('.ktx2');
      const loader = isKTX2 ? this.ktx2Loader : this.textureLoader;

      loader.load(
        url,
        texture => {
          // Optimize texture settings
          this.optimizeTexture(texture, asset, options);

          // Cache the loaded texture
          this.loadedTextures.set(url, texture);
          this.loadingPromises.delete(url);

          resolve(texture);
        },
        progress => {
          // Progress callback
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.debug(
            `Loading texture ${url}: ${percentComplete.toFixed(1)}%`
          );
        },
        error => {
          this.loadingPromises.delete(url);
          console.error(`Failed to load texture ${url}:`, error);

          // Try fallback format if KTX2 fails
          if (isKTX2 && asset.webpUrl) {
            this.createLoadingPromise(asset.webpUrl, asset, options)
              .then(resolve)
              .catch(() => {
                // Final fallback to original URL
                this.createLoadingPromise(asset.url, asset, options)
                  .then(resolve)
                  .catch(reject);
              });
          } else if (isKTX2) {
            // Fallback to original URL
            this.createLoadingPromise(asset.url, asset, options)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Get the optimal texture URL based on browser support and file sizes
   */
  private getOptimalTextureUrl(asset: TextureAsset): string {
    // Prefer KTX2 if supported and provides good compression
    if (this.supportsKTX2 && asset.ktx2Url && asset.ktx2Size) {
      const compressionRatio = asset.ktx2Size / asset.size;
      if (compressionRatio < 0.5) {
        // Use KTX2 if it reduces size by 50% or more
        return asset.ktx2Url;
      }
    }

    // Fallback to WebP if supported and available
    if (this.supportsWebP && asset.webpUrl && asset.webpSize) {
      const compressionRatio = asset.webpSize / asset.size;
      if (compressionRatio < 0.8) {
        // Use WebP if it reduces size by 20% or more
        return asset.webpUrl;
      }
    }

    // Default to original URL
    return asset.url;
  }

  /**
   * Optimize texture settings based on type and usage
   */
  private optimizeTexture(
    texture: Texture,
    asset: TextureAsset,
    options: TextureLoadOptions
  ): void {
    // Set appropriate filtering based on texture type
    switch (asset.type) {
      case 'diffuse':
      case 'emissive':
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = options.generateMipmaps !== false;
        break;

      case 'normal':
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = options.generateMipmaps !== false;
        texture.flipY = false; // Normal maps typically don't need Y-flip
        break;

      case 'roughness':
      case 'metallic':
      case 'ao':
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = options.generateMipmaps !== false;
        break;
    }

    // Apply common optimizations
    texture.flipY = options.flipY !== false;

    // Limit texture size if specified
    if (options.maxTextureSize && this.renderer) {
      const maxSize = Math.min(
        options.maxTextureSize,
        this.renderer.capabilities.maxTextureSize
      );

      if (
        texture.image &&
        (texture.image.width > maxSize || texture.image.height > maxSize)
      ) {
        console.warn(`Texture ${asset.url} exceeds maximum size ${maxSize}px`);
      }
    }

    texture.needsUpdate = true;
  }

  /**
   * Preload textures for better performance
   */
  async preloadTextures(assets: TextureAsset[]): Promise<void> {
    const highPriorityAssets = assets
      .filter(asset => asset.priority === 'high' || asset.preload)
      .slice(0, 8); // Limit concurrent texture loads

    const preloadPromises = highPriorityAssets.map(asset =>
      this.loadTexture(asset).catch(error => {
        console.warn(`Failed to preload texture ${asset.url}:`, error);
        return null;
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Create a texture atlas from multiple smaller textures
   */
  async createTextureAtlas(
    textures: {
      asset: TextureAsset;
      x: number;
      y: number;
      width: number;
      height: number;
    }[],
    atlasWidth: number,
    atlasHeight: number
  ): Promise<Texture> {
    const canvas = document.createElement('canvas');
    canvas.width = atlasWidth;
    canvas.height = atlasHeight;
    const ctx = canvas.getContext('2d')!;

    // Load all textures first
    const loadedTextures = await Promise.all(
      textures.map(({ asset }) => this.loadTexture(asset))
    );

    // Draw textures onto atlas canvas
    textures.forEach(({ x, y, width, height }, index) => {
      const texture = loadedTextures[index];
      if (texture.image) {
        ctx.drawImage(texture.image, x, y, width, height);
      }
    });

    // Create texture from canvas
    const atlasTexture = new Texture(canvas);
    atlasTexture.needsUpdate = true;
    atlasTexture.flipY = false;

    return atlasTexture;
  }

  /**
   * Clear cached textures to free memory
   */
  clearCache(): void {
    this.loadedTextures.forEach(texture => {
      texture.dispose();
    });
    this.loadedTextures.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { textureCount: number; estimatedMemoryMB: number } {
    let estimatedMemory = 0;

    this.loadedTextures.forEach(texture => {
      if (texture.image) {
        const { width, height } = texture.image;
        // Estimate 4 bytes per pixel (RGBA)
        estimatedMemory += width * height * 4;
      }
    });

    return {
      textureCount: this.loadedTextures.size,
      estimatedMemoryMB: estimatedMemory / (1024 * 1024),
    };
  }

  /**
   * Dispose of texture manager and free resources
   */
  dispose(): void {
    this.clearCache();
    this.ktx2Loader.dispose();
  }
}

// Singleton instance for global use
let globalTextureManager: TextureManager | null = null;

export function getTextureManager(renderer?: WebGLRenderer): TextureManager {
  if (!globalTextureManager) {
    globalTextureManager = new TextureManager(renderer);
  }
  return globalTextureManager;
}

export function disposeTextureManager(): void {
  if (globalTextureManager) {
    globalTextureManager.dispose();
    globalTextureManager = null;
  }
}
