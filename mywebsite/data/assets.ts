import type { AssetBundle, ModelAsset, TextureAsset } from '@/lib/assets';

// Sample project models with Draco compression
export const projectModels: ModelAsset[] = [
  {
    url: '/models/project-card.glb',
    dracoUrl: '/models/project-card.draco.glb',
    size: 150000, // 150KB original
    dracoSize: 45000, // 45KB compressed
    priority: 'high',
    preload: true,
  },
  {
    url: '/models/laptop.glb',
    dracoUrl: '/models/laptop.draco.glb',
    size: 800000, // 800KB original
    dracoSize: 240000, // 240KB compressed
    priority: 'medium',
  },
  {
    url: '/models/desk-scene.glb',
    dracoUrl: '/models/desk-scene.draco.glb',
    size: 1200000, // 1.2MB original
    dracoSize: 360000, // 360KB compressed
    priority: 'low',
  },
];

// Sample textures with KTX2 and WebP variants
export const projectTextures: TextureAsset[] = [
  {
    url: '/textures/project-thumbnail-1.jpg',
    ktx2Url: '/textures/project-thumbnail-1.ktx2',
    webpUrl: '/textures/project-thumbnail-1.webp',
    size: 200000, // 200KB original
    ktx2Size: 80000, // 80KB KTX2
    webpSize: 120000, // 120KB WebP
    priority: 'high',
    preload: true,
    type: 'diffuse',
  },
  {
    url: '/textures/project-thumbnail-2.jpg',
    ktx2Url: '/textures/project-thumbnail-2.ktx2',
    webpUrl: '/textures/project-thumbnail-2.webp',
    size: 180000,
    ktx2Size: 72000,
    webpSize: 108000,
    priority: 'high',
    preload: true,
    type: 'diffuse',
  },
  {
    url: '/textures/project-thumbnail-3.jpg',
    ktx2Url: '/textures/project-thumbnail-3.ktx2',
    webpUrl: '/textures/project-thumbnail-3.webp',
    size: 220000,
    ktx2Size: 88000,
    webpSize: 132000,
    priority: 'high',
    preload: true,
    type: 'diffuse',
  },
  {
    url: '/textures/desk-wood.jpg',
    ktx2Url: '/textures/desk-wood.ktx2',
    webpUrl: '/textures/desk-wood.webp',
    size: 500000,
    ktx2Size: 150000,
    webpSize: 300000,
    priority: 'medium',
    type: 'diffuse',
  },
  {
    url: '/textures/desk-wood-normal.jpg',
    ktx2Url: '/textures/desk-wood-normal.ktx2',
    webpUrl: '/textures/desk-wood-normal.webp',
    size: 400000,
    ktx2Size: 120000,
    webpSize: 240000,
    priority: 'medium',
    type: 'normal',
  },
];

// Asset bundles for different scenes
export const assetBundles: AssetBundle[] = [
  {
    id: 'hero-scene',
    name: 'Hero Scene Assets',
    models: projectModels.filter(m => m.priority === 'high'),
    textures: projectTextures.filter(t => t.priority === 'high'),
    priority: 'critical',
    preload: true,
  },
  {
    id: 'projects-scene',
    name: 'Projects Browser Assets',
    models: projectModels.filter(m => m.priority === 'medium'),
    textures: projectTextures.filter(t => t.priority === 'medium'),
    priority: 'high',
  },
  {
    id: 'environment',
    name: 'Environment Assets',
    models: projectModels.filter(m => m.priority === 'low'),
    textures: projectTextures.filter(t => t.priority === 'low'),
    priority: 'medium',
  },
];

// LOD configurations for different performance targets
export const lodConfigs = {
  high: {
    enableAutoLOD: true,
    performanceTarget: 'high' as const,
    maxTriangles: 100000,
    maxDrawCalls: 100,
    distanceMultiplier: 1.0,
    hysteresis: 0.1,
  },
  medium: {
    enableAutoLOD: true,
    performanceTarget: 'medium' as const,
    maxTriangles: 70000,
    maxDrawCalls: 80,
    distanceMultiplier: 0.8,
    hysteresis: 0.15,
  },
  low: {
    enableAutoLOD: true,
    performanceTarget: 'low' as const,
    maxTriangles: 40000,
    maxDrawCalls: 60,
    distanceMultiplier: 0.6,
    hysteresis: 0.2,
  },
};

// Sample LOD assets with multiple detail levels
export const lodAssets = [
  {
    id: 'project-card-lod',
    high: null as any, // Would be loaded from projectModels
    medium: null as any,
    low: null as any,
    distances: {
      high: 0,
      medium: 5,
      low: 15,
      billboard: 50,
    },
  },
];

export default {
  models: projectModels,
  textures: projectTextures,
  bundles: assetBundles,
  lodConfigs,
  lodAssets,
};
