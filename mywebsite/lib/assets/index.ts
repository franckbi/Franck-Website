// Asset Pipeline and Optimization System
export {
  ModelLoader,
  getModelLoader,
  disposeModelLoader,
  type ModelAsset,
  type ModelLoadOptions,
} from './draco-loader';

export {
  TextureManager,
  getTextureManager,
  disposeTextureManager,
  type TextureAsset,
  type TextureLoadOptions,
} from './texture-loader';

export {
  AssetManager,
  getAssetManager,
  disposeAssetManager,
  type AssetBundle,
  type LoadingProgress,
  type AssetLoadResult,
  type ProgressCallback,
} from './asset-manager';

export {
  LODManager,
  getLODManager,
  disposeLODManager,
  type LODLevel,
  type LODAsset,
  type LODConfig,
} from './lod-system';

// Re-export 3D components
export {
  LazyAssetLoader,
  AssetPreloader,
  useAssetLoader,
} from '../../components/3d/lazy-asset-loader';
