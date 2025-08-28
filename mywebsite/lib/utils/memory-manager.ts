/**
 * Memory management utilities for 3D scenes
 * Handles cleanup of Three.js objects, textures, and geometries
 */

import * as THREE from 'three';
import { useEffect } from 'react';

interface MemoryStats {
  geometries: number;
  textures: number;
  materials: number;
  programs: number;
  totalMemory?: number;
}

interface CleanupOptions {
  disposeGeometries?: boolean;
  disposeMaterials?: boolean;
  disposeTextures?: boolean;
  clearCache?: boolean;
}

class MemoryManager {
  private static instance: MemoryManager;
  private cleanupCallbacks: Array<() => void> = [];
  private memoryThreshold = 100 * 1024 * 1024; // 100MB
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMemoryMonitoring();
  }

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private startMemoryMonitoring() {
    if (typeof window === 'undefined') return;

    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  private checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize;

      if (usedMemory > this.memoryThreshold) {
        console.warn(
          'High memory usage detected:',
          usedMemory / 1024 / 1024,
          'MB'
        );
        this.performGarbageCollection();
      }
    }
  }

  public getMemoryStats(): MemoryStats {
    const renderer = this.getActiveRenderer();
    const stats: MemoryStats = {
      geometries: 0,
      textures: 0,
      materials: 0,
      programs: 0,
    };

    if (renderer) {
      const info = renderer.info;
      stats.geometries = info.memory.geometries;
      stats.textures = info.memory.textures;
      stats.programs = info.programs?.length || 0;
    }

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      stats.totalMemory = memory.usedJSHeapSize;
    }

    return stats;
  }

  private getActiveRenderer(): THREE.WebGLRenderer | null {
    // Try to find active renderer from global scope or DOM
    if (typeof window !== 'undefined' && (window as any).__THREE_RENDERER__) {
      return (window as any).__THREE_RENDERER__;
    }
    return null;
  }

  public cleanupScene(scene: THREE.Scene, options: CleanupOptions = {}): void {
    // Defensive: scene may be undefined/null if called after references cleared
    if (!scene) {
      console.warn('cleanupScene called with no scene - skipping cleanup');
      return;
    }
    const {
      disposeGeometries = true,
      disposeMaterials = true,
      disposeTextures = true,
      clearCache = true,
    } = options;

    console.log('Starting scene cleanup...');

    scene.traverse(object => {
      // Cleanup geometries
      if (
        disposeGeometries &&
        object instanceof THREE.Mesh &&
        object.geometry
      ) {
        object.geometry.dispose();
      }

      // Cleanup materials
      if (disposeMaterials && object instanceof THREE.Mesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material =>
            this.disposeMaterial(material, disposeTextures)
          );
        } else {
          this.disposeMaterial(object.material, disposeTextures);
        }
      }

      // Remove from parent
      if (object.parent) {
        object.parent.remove(object);
      }
    });

    // Clear scene
    scene.clear();

    // Clear caches if requested
    if (clearCache) {
      this.clearThreeJSCaches();
    }

    console.log('Scene cleanup completed');
  }

  private disposeMaterial(
    material: THREE.Material,
    disposeTextures: boolean = true
  ): void {
    if (disposeTextures) {
      // Dispose textures
      Object.values(material).forEach(value => {
        if (value && value instanceof THREE.Texture) {
          value.dispose();
        }
      });
    }

    material.dispose();
  }

  public cleanupRenderer(renderer: THREE.WebGLRenderer): void {
    console.log('Cleaning up renderer...');

    // Dispose render targets
    renderer.getRenderTarget()?.dispose();

    // Clear GL state
    renderer.state.reset();

    // Dispose renderer
    renderer.dispose();

    // Clear context
    const gl = renderer.getContext();
    if (gl && gl.getExtension('WEBGL_lose_context')) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }

    console.log('Renderer cleanup completed');
  }

  public cleanupTexture(texture: THREE.Texture): void {
    if (texture.image && texture.image.close) {
      texture.image.close();
    }
    texture.dispose();
  }

  public cleanupGeometry(geometry: THREE.BufferGeometry): void {
    geometry.dispose();
  }

  private clearThreeJSCaches(): void {
    // Clear Three.js internal caches
    THREE.Cache.clear();

    // Clear texture cache if available
    if ((THREE as any).TextureLoader && (THREE as any).TextureLoader.cache) {
      (THREE as any).TextureLoader.cache.clear();
    }

    // Clear geometry cache if available
    if (
      (THREE as any).BufferGeometryLoader &&
      (THREE as any).BufferGeometryLoader.cache
    ) {
      (THREE as any).BufferGeometryLoader.cache.clear();
    }
  }

  public registerCleanupCallback(callback: () => void): () => void {
    this.cleanupCallbacks.push(callback);

    // Return unregister function
    return () => {
      const index = this.cleanupCallbacks.indexOf(callback);
      if (index > -1) {
        this.cleanupCallbacks.splice(index, 1);
      }
    };
  }

  public performGarbageCollection(): void {
    console.log('Performing garbage collection...');

    // Execute all cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Cleanup callback error:', error);
      }
    });

    // Clear Three.js caches
    this.clearThreeJSCaches();

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    console.log('Garbage collection completed');
  }

  public setMemoryThreshold(threshold: number): void {
    this.memoryThreshold = threshold;
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.cleanupCallbacks = [];
  }
}

// React hook for memory management
export const useMemoryManager = () => {
  const manager = MemoryManager.getInstance();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      manager.performGarbageCollection();
    };
  }, [manager]);

  return {
    getMemoryStats: () => manager.getMemoryStats(),
    cleanupScene: (scene: THREE.Scene, options?: CleanupOptions) =>
      manager.cleanupScene(scene, options),
    cleanupRenderer: (renderer: THREE.WebGLRenderer) =>
      manager.cleanupRenderer(renderer),
    registerCleanup: (callback: () => void) =>
      manager.registerCleanupCallback(callback),
    performGC: () => manager.performGarbageCollection(),
  };
};

// Utility functions for specific cleanup scenarios

export const cleanupMesh = (mesh: THREE.Mesh): void => {
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }

  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => material.dispose());
    } else {
      mesh.material.dispose();
    }
  }

  if (mesh.parent) {
    mesh.parent.remove(mesh);
  }
};

export const cleanupGroup = (group: THREE.Group): void => {
  group.traverse(object => {
    if (object instanceof THREE.Mesh) {
      cleanupMesh(object);
    }
  });

  group.clear();
  if (group.parent) {
    group.parent.remove(group);
  }
};

export const createMemoryEfficientMaterial = (
  type: 'basic' | 'standard' | 'physical' = 'standard',
  options: any = {}
): THREE.Material => {
  let material: THREE.Material;

  switch (type) {
    case 'basic':
      material = new THREE.MeshBasicMaterial(options);
      break;
    case 'physical':
      material = new THREE.MeshPhysicalMaterial(options);
      break;
    default:
      material = new THREE.MeshStandardMaterial(options);
  }

  // Add cleanup metadata
  (material as any).__memoryManaged = true;

  return material;
};

export const createMemoryEfficientGeometry = (
  type: 'box' | 'sphere' | 'plane' | 'cylinder' = 'box',
  ...args: any[]
): THREE.BufferGeometry => {
  let geometry: THREE.BufferGeometry;

  switch (type) {
    case 'sphere':
      geometry = new THREE.SphereGeometry(...args);
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(...args);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(...args);
      break;
    default:
      geometry = new THREE.BoxGeometry(...args);
  }

  // Add cleanup metadata
  (geometry as any).__memoryManaged = true;

  return geometry;
};

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();
