#!/usr/bin/env node

/**
 * Asset optimization script for production builds
 * Compresses images, optimizes 3D models, and generates asset manifests
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const ASSET_DIRS = {
  images: 'public/images',
  models: 'public/models',
  textures: 'public/textures',
  fonts: 'public/fonts',
};

const OPTIMIZATION_CONFIG = {
  images: {
    quality: 85,
    formats: ['webp', 'avif'],
    sizes: [640, 750, 828, 1080, 1200, 1920],
  },
  models: {
    compression: 'draco',
    quantization: {
      position: 14,
      normal: 10,
      color: 8,
      uv: 12,
    },
  },
  textures: {
    format: 'ktx2',
    compression: 'basis',
    quality: 'high',
  },
};

class AssetOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      errors: 0,
      originalSize: 0,
      optimizedSize: 0,
    };
  }

  async run() {
    console.log('🚀 Starting asset optimization...');

    try {
      await this.ensureDirectories();
      await this.optimizeImages();
      await this.optimizeModels();
      await this.optimizeTextures();
      await this.generateAssetManifest();
      await this.generateServiceWorkerAssets();

      this.printStats();
      console.log('✅ Asset optimization completed successfully!');
    } catch (error) {
      console.error('❌ Asset optimization failed:', error);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    for (const dir of Object.values(ASSET_DIRS)) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  async optimizeImages() {
    console.log('🖼️  Optimizing images...');

    const imageDir = ASSET_DIRS.images;
    try {
      const files = await fs.readdir(imageDir);
      const imageFiles = files.filter(file =>
        /\.(jpg|jpeg|png|gif)$/i.test(file)
      );

      for (const file of imageFiles) {
        await this.optimizeImage(path.join(imageDir, file));
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️  Could not optimize images: ${error.message}`);
      }
    }
  }

  async optimizeImage(filePath) {
    try {
      const stats = await fs.stat(filePath);
      this.stats.originalSize += stats.size;

      // Generate WebP version
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      try {
        execSync(
          `npx @squoosh/cli --webp '{"quality":${OPTIMIZATION_CONFIG.images.quality}}' "${filePath}"`,
          {
            stdio: 'pipe',
          }
        );

        const webpStats = await fs.stat(webpPath);
        this.stats.optimizedSize += webpStats.size;
        this.stats.processed++;
      } catch (error) {
        console.warn(
          `⚠️  Could not generate WebP for ${filePath}: ${error.message}`
        );
        this.stats.optimizedSize += stats.size;
      }
    } catch (error) {
      console.error(`❌ Error optimizing ${filePath}:`, error.message);
      this.stats.errors++;
    }
  }

  async optimizeModels() {
    console.log('🎯 Optimizing 3D models...');

    const modelDir = ASSET_DIRS.models;
    try {
      const files = await fs.readdir(modelDir);
      const modelFiles = files.filter(file => /\.(glb|gltf)$/i.test(file));

      for (const file of modelFiles) {
        await this.optimizeModel(path.join(modelDir, file));
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️  Could not optimize models: ${error.message}`);
      }
    }
  }

  async optimizeModel(filePath) {
    try {
      const stats = await fs.stat(filePath);
      this.stats.originalSize += stats.size;

      // Apply Draco compression using gltf-pipeline
      const outputPath = filePath.replace(/\.(glb|gltf)$/, '.optimized.$1');
      const config = OPTIMIZATION_CONFIG.models;

      try {
        execSync(
          `npx gltf-pipeline -i "${filePath}" -o "${outputPath}" --draco.compressionLevel=10 --draco.quantizePositionBits=${config.quantization.position} --draco.quantizeNormalBits=${config.quantization.normal}`,
          {
            stdio: 'pipe',
          }
        );

        const optimizedStats = await fs.stat(outputPath);
        this.stats.optimizedSize += optimizedStats.size;

        // Replace original with optimized version
        await fs.rename(outputPath, filePath);
        this.stats.processed++;
      } catch (error) {
        console.warn(
          `⚠️  Could not optimize model ${filePath}: ${error.message}`
        );
        this.stats.optimizedSize += stats.size;
      }
    } catch (error) {
      console.error(`❌ Error optimizing ${filePath}:`, error.message);
      this.stats.errors++;
    }
  }

  async optimizeTextures() {
    console.log('🎨 Optimizing textures...');

    const textureDir = ASSET_DIRS.textures;
    try {
      const files = await fs.readdir(textureDir);
      const textureFiles = files.filter(file =>
        /\.(jpg|jpeg|png)$/i.test(file)
      );

      for (const file of textureFiles) {
        await this.optimizeTexture(path.join(textureDir, file));
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️  Could not optimize textures: ${error.message}`);
      }
    }
  }

  async optimizeTexture(filePath) {
    try {
      const stats = await fs.stat(filePath);
      this.stats.originalSize += stats.size;

      // Convert to KTX2 format with Basis Universal compression
      const ktx2Path = filePath.replace(/\.(jpg|jpeg|png)$/i, '.ktx2');

      try {
        execSync(
          `npx @gltf-transform/cli ktx "${filePath}" "${ktx2Path}" --format=ktx2 --compression=basis`,
          {
            stdio: 'pipe',
          }
        );

        const ktx2Stats = await fs.stat(ktx2Path);
        this.stats.optimizedSize += ktx2Stats.size;
        this.stats.processed++;
      } catch (error) {
        console.warn(
          `⚠️  Could not convert texture ${filePath} to KTX2: ${error.message}`
        );
        this.stats.optimizedSize += stats.size;
      }
    } catch (error) {
      console.error(`❌ Error optimizing ${filePath}:`, error.message);
      this.stats.errors++;
    }
  }

  async generateAssetManifest() {
    console.log('📋 Generating asset manifest...');

    const manifest = {
      version: Date.now(),
      assets: {},
      totalSize: 0,
    };

    for (const [type, dir] of Object.entries(ASSET_DIRS)) {
      try {
        const files = await fs.readdir(dir);
        manifest.assets[type] = [];

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);

          manifest.assets[type].push({
            name: file,
            path: `/${dir}/${file}`,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
          });

          manifest.totalSize += stats.size;
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`⚠️  Could not process ${dir}: ${error.message}`);
        }
      }
    }

    await fs.writeFile(
      'public/asset-manifest.json',
      JSON.stringify(manifest, null, 2)
    );

    console.log(
      `📋 Asset manifest generated with ${Object.values(manifest.assets).flat().length} files`
    );
  }

  async generateServiceWorkerAssets() {
    console.log('⚙️  Generating service worker asset list...');

    try {
      const manifest = JSON.parse(
        await fs.readFile('public/asset-manifest.json', 'utf8')
      );

      const criticalAssets = [];
      const cacheableAssets = [];

      // Categorize assets for service worker caching
      for (const [type, assets] of Object.entries(manifest.assets)) {
        for (const asset of assets) {
          if (type === 'fonts' || asset.name.includes('critical')) {
            criticalAssets.push(asset.path);
          } else {
            cacheableAssets.push(asset.path);
          }
        }
      }

      const swAssets = {
        version: manifest.version,
        critical: criticalAssets,
        cacheable: cacheableAssets,
        generatedAt: new Date().toISOString(),
      };

      await fs.writeFile(
        'public/sw-assets.json',
        JSON.stringify(swAssets, null, 2)
      );

      console.log(
        `⚙️  Service worker assets generated: ${criticalAssets.length} critical, ${cacheableAssets.length} cacheable`
      );
    } catch (error) {
      console.warn(
        `⚠️  Could not generate service worker assets: ${error.message}`
      );
    }
  }

  printStats() {
    const savings = this.stats.originalSize - this.stats.optimizedSize;
    const savingsPercent =
      this.stats.originalSize > 0
        ? ((savings / this.stats.originalSize) * 100).toFixed(1)
        : 0;

    console.log('\n📊 Optimization Results:');
    console.log(`   Files processed: ${this.stats.processed}`);
    console.log(`   Errors: ${this.stats.errors}`);
    console.log(
      `   Original size: ${this.formatBytes(this.stats.originalSize)}`
    );
    console.log(
      `   Optimized size: ${this.formatBytes(this.stats.optimizedSize)}`
    );
    console.log(
      `   Savings: ${this.formatBytes(savings)} (${savingsPercent}%)`
    );
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new AssetOptimizer();
  optimizer.run();
}

module.exports = AssetOptimizer;
