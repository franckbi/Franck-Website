# Asset Pipeline and Optimization System

This directory contains a comprehensive asset pipeline and optimization system for 3D web applications. The system provides automatic compression, lazy loading, Level of Detail (LOD) management, and performance optimization for 3D models and textures.

## Features

### 🗜️ Draco Compression

- Automatic detection and loading of Draco-compressed 3D models
- Intelligent fallback to uncompressed models when needed
- Compression ratio analysis for optimal format selection

### 🖼️ Texture Optimization

- KTX2 texture format support with Basis Universal compression
- WebP fallback for better browser compatibility
- Automatic format selection based on browser support and file sizes

### 📦 Asset Management

- Bundle-based asset loading with progress tracking
- Preloading of critical assets for better performance
- Memory usage monitoring and cleanup

### 🎯 Level of Detail (LOD)

- Automatic LOD switching based on camera distance
- Performance-based LOD adjustment
- Triangle count and draw call optimization

### ⚡ Lazy Loading

- React Suspense integration for smooth loading states
- Progressive asset loading with visual feedback
- Error handling and retry mechanisms

## Quick Start

### Basic Usage

```typescript
import {
  getAssetManager,
  LazyAssetLoader,
  type AssetBundle
} from '@/lib/assets';

// Define your asset bundle
const heroBundle: AssetBundle = {
  id: 'hero-scene',
  name: 'Hero Scene Assets',
  models: [
    {
      url: '/models/project-card.glb',
      dracoUrl: '/models/project-card.draco.glb',
      size: 150000,
      dracoSize: 45000,
      priority: 'high',
      preload: true,
    }
  ],
  textures: [
    {
      url: '/textures/project-thumbnail.jpg',
      ktx2Url: '/textures/project-thumbnail.ktx2',
      webpUrl: '/textures/project-thumbnail.webp',
      size: 200000,
      ktx2Size: 80000,
      webpSize: 120000,
      priority: 'high',
      type: 'diffuse',
    }
  ],
  priority: 'critical',
  preload: true,
};

// Use in React component
function MyScene() {
  return (
    <LazyAssetLoader
      bundle={heroBundle}
      onLoadComplete={() => console.log('Assets loaded!')}
    >
      {({ models, textures }) => (
        <MySceneContent models={models} textures={textures} />
      )}
    </LazyAssetLoader>
  );
}
```

### Advanced Usage with LOD

```typescript
import { getLODManager, type LODAsset } from '@/lib/assets';

// Configure LOD system
const lodManager = getLODManager({
  performanceTarget: 'medium',
  maxTriangles: 70000,
  maxDrawCalls: 80,
});

// Create LOD asset
const lodAsset: LODAsset = {
  id: 'project-card-lod',
  high: highDetailModel,
  medium: mediumDetailModel,
  low: lowDetailModel,
  distances: {
    high: 0,
    medium: 5,
    low: 15,
    billboard: 50,
  },
};

const lodObject = lodManager.createLODObject(lodAsset);
scene.add(lodObject);

// Update in render loop
function animate() {
  lodManager.update(camera, deltaTime);
  renderer.render(scene, camera);
}
```

## API Reference

### ModelLoader

Handles loading and optimization of 3D models with Draco compression support.

```typescript
const modelLoader = getModelLoader(renderer);

// Load a model
const gltf = await modelLoader.loadModel({
  url: '/model.glb',
  dracoUrl: '/model.draco.glb',
  size: 1000000,
  dracoSize: 300000,
  priority: 'high',
});

// Preload multiple models
await modelLoader.preloadModels(modelAssets);

// Get statistics
const stats = modelLoader.getStats();
console.log(`Cached models: ${stats.cachedModels}`);
```

### TextureManager

Manages texture loading with KTX2 and WebP optimization.

```typescript
const textureManager = getTextureManager(renderer);

// Load a texture
const texture = await textureManager.loadTexture({
  url: '/texture.jpg',
  ktx2Url: '/texture.ktx2',
  webpUrl: '/texture.webp',
  size: 500000,
  ktx2Size: 150000,
  webpSize: 300000,
  priority: 'high',
  type: 'diffuse',
});

// Get memory usage
const usage = textureManager.getMemoryUsage();
console.log(`Memory usage: ${usage.estimatedMemoryMB}MB`);
```

### AssetManager

Coordinates loading of asset bundles with progress tracking.

```typescript
const assetManager = getAssetManager(renderer);

// Track loading progress
const unsubscribe = assetManager.onProgress(progress => {
  console.log(`Loading: ${progress.progress}%`);
});

// Load a bundle
const { models, textures } = await assetManager.loadBundle(bundle);

// Preload critical assets
await assetManager.preloadCriticalAssets(bundles);
```

### LODManager

Provides Level of Detail management for performance optimization.

```typescript
const lodManager = getLODManager({
  performanceTarget: 'medium',
  maxTriangles: 70000,
});

// Create LOD object
const lodObject = lodManager.createLODObject(lodAsset);

// Update in render loop
lodManager.update(camera, deltaTime);

// Get performance statistics
const stats = lodManager.getStats();
console.log(`Current triangles: ${stats.currentTriangles}`);
```

## Asset Preparation

### Model Optimization

1. **Export from Blender/Maya:**
   - Keep triangle count under 50k per model
   - Use power-of-2 texture dimensions
   - Combine materials where possible

2. **Draco Compression:**

   ```bash
   # Install gltf-pipeline
   npm install -g gltf-pipeline

   # Compress model
   gltf-pipeline -i model.glb -o model.draco.glb --draco.compressionLevel=7
   ```

3. **Directory Structure:**
   ```
   public/
   ├── models/
   │   ├── project-card.glb
   │   ├── project-card.draco.glb
   │   └── ...
   └── textures/
       ├── thumbnail.jpg
       ├── thumbnail.ktx2
       ├── thumbnail.webp
       └── ...
   ```

### Texture Optimization

1. **KTX2 Conversion:**

   ```bash
   # Install basis_universal
   # Convert to KTX2
   basisu -ktx2 -uastc texture.jpg -output_file texture.ktx2
   ```

2. **WebP Conversion:**
   ```bash
   # Convert to WebP
   cwebp -q 80 texture.jpg -o texture.webp
   ```

## Performance Guidelines

### Bundle Size Recommendations

- **Critical Bundle:** < 500KB (hero scene assets)
- **High Priority:** < 1MB (main content assets)
- **Medium Priority:** < 2MB (secondary content)
- **Low Priority:** < 5MB (background/environment)

### LOD Distance Guidelines

- **High Detail:** 0-5 units from camera
- **Medium Detail:** 5-15 units from camera
- **Low Detail:** 15-50 units from camera
- **Billboard:** 50+ units from camera

### Memory Management

```typescript
// Clean up when component unmounts
useEffect(() => {
  return () => {
    assetManager.clearCache();
    lodManager.dispose();
  };
}, []);
```

## Browser Support

- **Draco:** Chrome 76+, Firefox 68+, Safari 14+
- **KTX2:** Chrome 83+, Firefox 87+, Safari 15+
- **WebP:** Chrome 23+, Firefox 65+, Safari 14+

The system automatically falls back to supported formats based on browser capabilities.

## Troubleshooting

### Common Issues

1. **Large Bundle Sizes:**
   - Check compression ratios in asset definitions
   - Reduce texture dimensions
   - Use texture atlases for small textures

2. **Poor Performance:**
   - Lower LOD distance thresholds
   - Reduce maximum triangle counts
   - Enable more aggressive compression

3. **Loading Failures:**
   - Verify asset URLs are correct
   - Check network connectivity
   - Ensure fallback assets are available

### Debug Information

```typescript
// Enable debug logging
console.log('Asset Manager Stats:', assetManager.getLoadingStats());
console.log('LOD Manager Stats:', lodManager.getStats());
console.log('Texture Memory:', textureManager.getMemoryUsage());
```

## Contributing

When adding new features to the asset pipeline:

1. Update type definitions
2. Add comprehensive tests
3. Update documentation
4. Consider backward compatibility
5. Test across different browsers and devices

## License

This asset pipeline system is part of the 3D Portfolio Website project and follows the same license terms.
