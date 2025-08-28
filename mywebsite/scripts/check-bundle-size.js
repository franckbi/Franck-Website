#!/usr/bin/env node

/**
 * Bundle size analyzer and reporter
 * Analyzes Next.js build output and generates detailed bundle reports
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.staticDir = path.join(this.buildDir, 'static');
    this.results = {
      chunks: [],
      pages: [],
      totalSize: 0,
      gzippedSize: 0,
    };
  }

  analyzeChunks() {
    console.log('📦 Analyzing JavaScript chunks...');

    const chunksDir = path.join(this.staticDir, 'chunks');
    if (!fs.existsSync(chunksDir)) {
      console.warn('Chunks directory not found');
      return;
    }

    const chunkFiles = fs.readdirSync(chunksDir);

    chunkFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const content = fs.readFileSync(filePath);
        const size = content.length;
        const gzippedSize = gzipSync(content).length;

        this.results.chunks.push({
          name: file,
          size,
          gzippedSize,
          category: this.categorizeChunk(file),
        });

        this.results.totalSize += size;
        this.results.gzippedSize += gzippedSize;
      }
    });
  }

  analyzePages() {
    console.log('📄 Analyzing page bundles...');

    const pagesDir = path.join(this.staticDir, 'chunks', 'pages');
    if (!fs.existsSync(pagesDir)) {
      console.warn('Pages directory not found');
      return;
    }

    const pageFiles = fs.readdirSync(pagesDir);

    pageFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(pagesDir, file);
        const content = fs.readFileSync(filePath);
        const size = content.length;
        const gzippedSize = gzipSync(content).length;

        this.results.pages.push({
          name: file,
          size,
          gzippedSize,
          route: this.getRouteFromFilename(file),
        });
      }
    });
  }

  categorizeChunk(filename) {
    if (filename.includes('framework')) return 'framework';
    if (filename.includes('main')) return 'main';
    if (filename.includes('webpack')) return 'webpack';
    if (filename.includes('three') || filename.includes('3d')) return '3d';
    if (filename.includes('vendor')) return 'vendor';
    return 'other';
  }

  getRouteFromFilename(filename) {
    // Convert filename to route
    return filename
      .replace(/\.js$/, '')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/^index$/, '/');
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    console.log('\n📊 Bundle Analysis Report');
    console.log('=========================');

    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`  Total Size: ${this.formatSize(this.results.totalSize)}`);
    console.log(`  Gzipped Size: ${this.formatSize(this.results.gzippedSize)}`);
    console.log(
      `  Compression Ratio: ${((1 - this.results.gzippedSize / this.results.totalSize) * 100).toFixed(1)}%`
    );

    // Chunks by category
    const chunksByCategory = this.results.chunks.reduce((acc, chunk) => {
      if (!acc[chunk.category]) {
        acc[chunk.category] = { size: 0, gzippedSize: 0, count: 0 };
      }
      acc[chunk.category].size += chunk.size;
      acc[chunk.category].gzippedSize += chunk.gzippedSize;
      acc[chunk.category].count += 1;
      return acc;
    }, {});

    console.log(`\n📦 Chunks by Category:`);
    Object.entries(chunksByCategory)
      .sort(([, a], [, b]) => b.gzippedSize - a.gzippedSize)
      .forEach(([category, stats]) => {
        console.log(
          `  ${category}: ${this.formatSize(stats.gzippedSize)} (${stats.count} files)`
        );
      });

    // Largest chunks
    console.log(`\n🔍 Largest Chunks:`);
    this.results.chunks
      .sort((a, b) => b.gzippedSize - a.gzippedSize)
      .slice(0, 10)
      .forEach(chunk => {
        console.log(`  ${chunk.name}: ${this.formatSize(chunk.gzippedSize)}`);
      });

    // Page bundles
    if (this.results.pages.length > 0) {
      console.log(`\n📄 Page Bundles:`);
      this.results.pages
        .sort((a, b) => b.gzippedSize - a.gzippedSize)
        .forEach(page => {
          console.log(`  ${page.route}: ${this.formatSize(page.gzippedSize)}`);
        });
    }

    // Recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log(`\n💡 Recommendations:`);

    const largeChunks = this.results.chunks.filter(
      chunk => chunk.gzippedSize > 100 * 1024
    );
    if (largeChunks.length > 0) {
      console.log(
        `  • Consider splitting large chunks (${largeChunks.length} chunks > 100KB)`
      );
    }

    const totalGzipped = this.results.gzippedSize;
    if (totalGzipped > 500 * 1024) {
      console.log(
        `  • Total bundle size is large (${this.formatSize(totalGzipped)})`
      );
      console.log(`    - Use dynamic imports for non-critical code`);
      console.log(`    - Remove unused dependencies`);
      console.log(`    - Enable tree shaking`);
    }

    const compressionRatio = (1 - totalGzipped / this.results.totalSize) * 100;
    if (compressionRatio < 60) {
      console.log(
        `  • Low compression ratio (${compressionRatio.toFixed(1)}%)`
      );
      console.log(`    - Minify JavaScript more aggressively`);
      console.log(`    - Remove comments and whitespace`);
    }

    const frameworkChunk = this.results.chunks.find(
      c => c.category === 'framework'
    );
    if (frameworkChunk && frameworkChunk.gzippedSize > 150 * 1024) {
      console.log(
        `  • Framework bundle is large (${this.formatSize(frameworkChunk.gzippedSize)})`
      );
      console.log(
        `    - Consider using a lighter framework or removing unused features`
      );
    }
  }

  saveReport() {
    const reportPath = path.join(process.cwd(), 'bundle-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }

  async run() {
    try {
      if (!fs.existsSync(this.buildDir)) {
        console.error('Build directory not found. Run `npm run build` first.');
        process.exit(1);
      }

      this.analyzeChunks();
      this.analyzePages();
      this.generateReport();
      this.saveReport();
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      process.exit(1);
    }
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.run();
}

module.exports = BundleAnalyzer;
