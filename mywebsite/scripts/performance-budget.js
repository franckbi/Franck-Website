#!/usr/bin/env node

/**
 * Performance budget checker
 * Validates bundle sizes and performance metrics against defined budgets
 */

const fs = require('fs');
const path = require('path');

// Performance budgets configuration
const BUDGETS = {
  // Bundle size budgets (in bytes)
  bundles: {
    main: 180 * 1024, // 180KB
    framework: 120 * 1024, // 120KB
    '3d-components': 300 * 1024, // 300KB
    pages: 50 * 1024, // 50KB per page
    total: 1200 * 1024, // 1.2MB total
  },

  // Performance timing budgets (in milliseconds)
  timing: {
    'first-contentful-paint': 1800,
    'largest-contentful-paint': 2500,
    'time-to-interactive': 3500,
    'total-blocking-time': 300,
    'cumulative-layout-shift': 0.1,
  },

  // Resource count budgets
  resources: {
    requests: 50,
    images: 20,
    scripts: 10,
    stylesheets: 5,
  },
};

class PerformanceBudgetChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
  }

  async checkBundleSizes() {
    console.log('🔍 Checking bundle sizes...');

    const buildDir = path.join(process.cwd(), '.next');
    const buildManifest = path.join(buildDir, 'build-manifest.json');

    if (!fs.existsSync(buildManifest)) {
      this.violations.push(
        'Build manifest not found. Run `npm run build` first.'
      );
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    const staticDir = path.join(buildDir, 'static');

    let totalSize = 0;
    const chunkSizes = {};

    // Analyze JavaScript chunks
    if (fs.existsSync(path.join(staticDir, 'chunks'))) {
      const chunksDir = path.join(staticDir, 'chunks');
      const chunkFiles = fs.readdirSync(chunksDir);

      chunkFiles.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(chunksDir, file);
          const stats = fs.statSync(filePath);
          const size = stats.size;
          totalSize += size;

          // Categorize chunks
          let category = 'other';
          if (file.includes('framework')) category = 'framework';
          else if (file.includes('main')) category = 'main';
          else if (file.includes('pages')) category = 'pages';
          else if (file.includes('3d') || file.includes('three'))
            category = '3d-components';

          chunkSizes[category] = (chunkSizes[category] || 0) + size;
        }
      });
    }

    // Check individual bundle budgets
    Object.entries(BUDGETS.bundles).forEach(([category, budget]) => {
      if (category === 'total') return;

      const actualSize = chunkSizes[category] || 0;
      const budgetMB = (budget / 1024 / 1024).toFixed(2);
      const actualMB = (actualSize / 1024 / 1024).toFixed(2);

      if (actualSize > budget) {
        this.violations.push(
          `Bundle size violation: ${category} is ${actualMB}MB (budget: ${budgetMB}MB)`
        );
      } else {
        console.log(`✅ ${category}: ${actualMB}MB (budget: ${budgetMB}MB)`);
      }
    });

    // Check total bundle size
    const totalBudget = BUDGETS.bundles.total;
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);
    const budgetMB = (totalBudget / 1024 / 1024).toFixed(2);

    if (totalSize > totalBudget) {
      this.violations.push(
        `Total bundle size violation: ${totalMB}MB (budget: ${budgetMB}MB)`
      );
    } else {
      console.log(`✅ Total bundle size: ${totalMB}MB (budget: ${budgetMB}MB)`);
    }
  }

  async checkLighthouseResults() {
    console.log('🔍 Checking Lighthouse results...');

    const lhciDir = path.join(process.cwd(), '.lighthouseci');
    if (!fs.existsSync(lhciDir)) {
      this.warnings.push(
        'Lighthouse results not found. Run Lighthouse CI first.'
      );
      return;
    }

    // Find the latest results
    const resultsFiles = fs
      .readdirSync(lhciDir)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse();

    if (resultsFiles.length === 0) {
      this.warnings.push('No Lighthouse results found.');
      return;
    }

    const latestResults = JSON.parse(
      fs.readFileSync(path.join(lhciDir, resultsFiles[0]), 'utf8')
    );

    // Check performance metrics
    const audits = latestResults.audits;

    Object.entries(BUDGETS.timing).forEach(([metric, budget]) => {
      let auditKey = metric;

      // Map metric names to Lighthouse audit keys
      const metricMap = {
        'first-contentful-paint': 'first-contentful-paint',
        'largest-contentful-paint': 'largest-contentful-paint',
        'time-to-interactive': 'interactive',
        'total-blocking-time': 'total-blocking-time',
        'cumulative-layout-shift': 'cumulative-layout-shift',
      };

      auditKey = metricMap[metric] || metric;

      if (audits[auditKey]) {
        const actualValue = audits[auditKey].numericValue;
        const displayValue = audits[auditKey].displayValue;

        if (actualValue > budget) {
          this.violations.push(
            `Performance violation: ${metric} is ${displayValue} (budget: ${budget}${metric.includes('shift') ? '' : 'ms'})`
          );
        } else {
          console.log(
            `✅ ${metric}: ${displayValue} (budget: ${budget}${metric.includes('shift') ? '' : 'ms'})`
          );
        }
      }
    });
  }

  generateReport() {
    console.log('\n📊 Performance Budget Report');
    console.log('================================');

    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All performance budgets passed!');
      return true;
    }

    if (this.violations.length > 0) {
      console.log('\n❌ Budget Violations:');
      this.violations.forEach(violation => {
        console.log(`  • ${violation}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    console.log('\n💡 Recommendations:');
    if (this.violations.some(v => v.includes('bundle size'))) {
      console.log(
        '  • Consider code splitting or removing unused dependencies'
      );
      console.log('  • Use dynamic imports for non-critical components');
      console.log('  • Enable tree shaking and minification');
    }

    if (this.violations.some(v => v.includes('contentful-paint'))) {
      console.log('  • Optimize critical rendering path');
      console.log('  • Preload key resources');
      console.log('  • Optimize images and fonts');
    }

    return this.violations.length === 0;
  }

  async run() {
    try {
      await this.checkBundleSizes();
      await this.checkLighthouseResults();

      const passed = this.generateReport();

      if (!passed) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Performance budget check failed:', error);
      process.exit(1);
    }
  }
}

// Run the checker
if (require.main === module) {
  const checker = new PerformanceBudgetChecker();
  checker.run();
}

module.exports = PerformanceBudgetChecker;
