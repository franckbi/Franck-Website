'use client';

import {
  Object3D,
  Vector3,
  Camera,
  LOD,
  Mesh,
  BufferGeometry,
  Material,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LODLevel {
  distance: number;
  object: Object3D;
  triangleCount?: number;
  memoryUsage?: number;
}

export interface LODAsset {
  id: string;
  high: GLTF;
  medium?: GLTF;
  low?: GLTF;
  billboard?: string; // URL to billboard texture for extreme distances
  distances: {
    high: number;
    medium: number;
    low: number;
    billboard: number;
  };
}

export interface LODConfig {
  enableAutoLOD: boolean;
  performanceTarget: 'high' | 'medium' | 'low';
  maxTriangles: number;
  maxDrawCalls: number;
  distanceMultiplier: number;
  hysteresis: number; // Prevent LOD flickering
}

export class LODManager {
  private lodObjects = new Map<string, LOD>();
  private config: LODConfig;
  private camera?: Camera;
  private frameCount = 0;
  private lastUpdateTime = 0;
  private performanceMetrics = {
    triangles: 0,
    drawCalls: 0,
    memoryUsage: 0,
  };

  constructor(config: Partial<LODConfig> = {}) {
    this.config = {
      enableAutoLOD: true,
      performanceTarget: 'medium',
      maxTriangles: 100000,
      maxDrawCalls: 100,
      distanceMultiplier: 1.0,
      hysteresis: 0.1,
      ...config,
    };
  }

  /**
   * Create a LOD object from multiple detail levels
   */
  createLODObject(asset: LODAsset): LOD {
    const lod = new LOD();
    const levels: LODLevel[] = [];

    // Add high detail level
    if (asset.high) {
      const highDetail = asset.high.scene.clone();
      levels.push({
        distance: asset.distances.high * this.config.distanceMultiplier,
        object: highDetail,
        triangleCount: this.countTriangles(highDetail),
        memoryUsage: this.estimateMemoryUsage(highDetail),
      });
    }

    // Add medium detail level
    if (asset.medium) {
      const mediumDetail = asset.medium.scene.clone();
      levels.push({
        distance: asset.distances.medium * this.config.distanceMultiplier,
        object: mediumDetail,
        triangleCount: this.countTriangles(mediumDetail),
        memoryUsage: this.estimateMemoryUsage(mediumDetail),
      });
    }

    // Add low detail level
    if (asset.low) {
      const lowDetail = asset.low.scene.clone();
      levels.push({
        distance: asset.distances.low * this.config.distanceMultiplier,
        object: lowDetail,
        triangleCount: this.countTriangles(lowDetail),
        memoryUsage: this.estimateMemoryUsage(lowDetail),
      });
    }

    // Sort levels by distance (closest first)
    levels.sort((a, b) => a.distance - b.distance);

    // Add levels to LOD object
    levels.forEach(level => {
      lod.addLevel(level.object, level.distance);
    });

    // Store LOD object
    this.lodObjects.set(asset.id, lod);

    return lod;
  }

  /**
   * Update LOD system based on camera position and performance
   */
  update(camera: Camera, deltaTime: number): void {
    if (!this.config.enableAutoLOD) return;

    this.camera = camera;
    this.frameCount++;

    // Update LOD distances based on performance
    const now = performance.now();
    if (now - this.lastUpdateTime > 100) {
      // Update every 100ms
      this.updateLODDistances();
      this.lastUpdateTime = now;
    }

    // Update each LOD object
    this.lodObjects.forEach(lod => {
      lod.update(camera);
    });

    // Update performance metrics
    this.updatePerformanceMetrics();
  }

  /**
   * Dynamically adjust LOD distances based on performance
   */
  private updateLODDistances(): void {
    const { triangles, drawCalls } = this.performanceMetrics;
    const targetTriangles = this.getTargetTriangles();
    const targetDrawCalls = this.getTargetDrawCalls();

    let distanceMultiplier = this.config.distanceMultiplier;

    // Adjust distances based on triangle count
    if (triangles > targetTriangles) {
      distanceMultiplier *= 0.9; // Reduce distances to use lower LOD sooner
    } else if (triangles < targetTriangles * 0.7) {
      distanceMultiplier *= 1.1; // Increase distances to use higher LOD longer
    }

    // Adjust distances based on draw calls
    if (drawCalls > targetDrawCalls) {
      distanceMultiplier *= 0.95;
    }

    // Apply hysteresis to prevent flickering
    const change = Math.abs(
      distanceMultiplier - this.config.distanceMultiplier
    );
    if (change > this.config.hysteresis) {
      this.config.distanceMultiplier = Math.max(
        0.1,
        Math.min(3.0, distanceMultiplier)
      );
      this.updateAllLODDistances();
    }
  }

  /**
   * Update distances for all LOD objects
   */
  private updateAllLODDistances(): void {
    this.lodObjects.forEach(lod => {
      const levels = lod.levels;
      levels.forEach((level, index) => {
        if (level.distance) {
          level.distance *= this.config.distanceMultiplier;
        }
      });
    });
  }

  /**
   * Get target triangle count based on performance target
   */
  private getTargetTriangles(): number {
    switch (this.config.performanceTarget) {
      case 'high':
        return this.config.maxTriangles;
      case 'medium':
        return this.config.maxTriangles * 0.7;
      case 'low':
        return this.config.maxTriangles * 0.4;
      default:
        return this.config.maxTriangles;
    }
  }

  /**
   * Get target draw call count based on performance target
   */
  private getTargetDrawCalls(): number {
    switch (this.config.performanceTarget) {
      case 'high':
        return this.config.maxDrawCalls;
      case 'medium':
        return this.config.maxDrawCalls * 0.8;
      case 'low':
        return this.config.maxDrawCalls * 0.6;
      default:
        return this.config.maxDrawCalls;
    }
  }

  /**
   * Count triangles in an object hierarchy
   */
  private countTriangles(object: Object3D): number {
    let triangles = 0;

    object.traverse(child => {
      if (child instanceof Mesh && child.geometry) {
        const geometry = child.geometry as BufferGeometry;
        const positionAttribute = geometry.getAttribute('position');
        if (positionAttribute) {
          triangles += positionAttribute.count / 3;
        }
      }
    });

    return triangles;
  }

  /**
   * Estimate memory usage of an object hierarchy
   */
  private estimateMemoryUsage(object: Object3D): number {
    let memoryUsage = 0;

    object.traverse(child => {
      if (child instanceof Mesh) {
        // Estimate geometry memory
        if (child.geometry) {
          const geometry = child.geometry as BufferGeometry;
          Object.keys(geometry.attributes).forEach(key => {
            const attribute = geometry.attributes[key];
            memoryUsage += attribute.array.byteLength;
          });
        }

        // Estimate material memory (simplified)
        if (child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach(material => {
            // Rough estimate: 1KB per material + texture sizes
            memoryUsage += 1024;

            // Add texture memory estimates
            Object.values(material).forEach(value => {
              if (value && typeof value === 'object' && 'image' in value) {
                const texture = value as any;
                if (texture.image) {
                  const { width, height } = texture.image;
                  memoryUsage += width * height * 4; // RGBA
                }
              }
            });
          });
        }
      }
    });

    return memoryUsage;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    let triangles = 0;
    let drawCalls = 0;
    let memoryUsage = 0;

    this.lodObjects.forEach(lod => {
      const currentLevel = lod.getCurrentLevel();
      if (currentLevel >= 0 && lod.levels[currentLevel]) {
        const levelObject = lod.levels[currentLevel].object;
        triangles += this.countTriangles(levelObject);
        memoryUsage += this.estimateMemoryUsage(levelObject);

        // Count draw calls (simplified)
        levelObject.traverse(child => {
          if (child instanceof Mesh && child.visible) {
            drawCalls++;
          }
        });
      }
    });

    this.performanceMetrics = { triangles, drawCalls, memoryUsage };
  }

  /**
   * Force a specific LOD level for an object
   */
  forceLODLevel(objectId: string, level: number): void {
    const lod = this.lodObjects.get(objectId);
    if (lod && lod.levels[level]) {
      // Temporarily disable auto LOD for this object
      lod.autoUpdate = false;

      // Hide all levels
      lod.levels.forEach(levelData => {
        levelData.object.visible = false;
      });

      // Show only the specified level
      lod.levels[level].object.visible = true;
    }
  }

  /**
   * Re-enable auto LOD for an object
   */
  enableAutoLOD(objectId: string): void {
    const lod = this.lodObjects.get(objectId);
    if (lod) {
      lod.autoUpdate = true;

      // Update immediately if camera is available
      if (this.camera) {
        lod.update(this.camera);
      }
    }
  }

  /**
   * Get current LOD statistics
   */
  getStats() {
    const stats = {
      totalLODObjects: this.lodObjects.size,
      currentTriangles: this.performanceMetrics.triangles,
      currentDrawCalls: this.performanceMetrics.drawCalls,
      currentMemoryUsage: this.performanceMetrics.memoryUsage,
      distanceMultiplier: this.config.distanceMultiplier,
      lodLevels: new Map<string, number>(),
    };

    // Get current LOD level for each object
    this.lodObjects.forEach((lod, id) => {
      stats.lodLevels.set(id, lod.getCurrentLevel());
    });

    return stats;
  }

  /**
   * Update performance target
   */
  setPerformanceTarget(target: 'high' | 'medium' | 'low'): void {
    this.config.performanceTarget = target;
  }

  /**
   * Remove a LOD object
   */
  removeLODObject(objectId: string): void {
    const lod = this.lodObjects.get(objectId);
    if (lod) {
      // Dispose of geometries and materials
      lod.levels.forEach(level => {
        level.object.traverse(child => {
          if (child instanceof Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      });

      this.lodObjects.delete(objectId);
    }
  }

  /**
   * Dispose of LOD manager and free resources
   */
  dispose(): void {
    this.lodObjects.forEach((lod, id) => {
      this.removeLODObject(id);
    });
    this.lodObjects.clear();
  }
}

// Singleton instance for global use
let globalLODManager: LODManager | null = null;

export function getLODManager(config?: Partial<LODConfig>): LODManager {
  if (!globalLODManager) {
    globalLODManager = new LODManager(config);
  }
  return globalLODManager;
}

export function disposeLODManager(): void {
  if (globalLODManager) {
    globalLODManager.dispose();
    globalLODManager = null;
  }
}
