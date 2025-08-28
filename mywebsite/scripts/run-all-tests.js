#!/usr/bin/env node

/**
 * Comprehensive test runner script
 * Runs all test suites and generates reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, duration: 0, coverage: null },
      integration: { passed: false, duration: 0 },
      e2e: { passed: false, duration: 0 },
      visual: { passed: false, duration: 0 },
      accessibility: { passed: false, duration: 0 },
      lighthouse: { passed: false, duration: 0 },
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        running: '🏃',
      }[type] || '📋';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, description, testType) {
    this.log(`Running ${description}...`, 'running');
    const startTime = Date.now();

    try {
      const output = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 300000, // 5 minutes timeout
      });

      const duration = Date.now() - startTime;
      this.results[testType].passed = true;
      this.results[testType].duration = duration;

      this.log(
        `${description} completed successfully (${duration}ms)`,
        'success'
      );
      return { success: true, output, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results[testType].passed = false;
      this.results[testType].duration = duration;

      this.log(`${description} failed (${duration}ms)`, 'error');
      this.log(`Error: ${error.message}`, 'error');
      return { success: false, error: error.message, duration };
    }
  }

  async runUnitTests() {
    const result = await this.runCommand(
      'npm run test:run',
      'Unit Tests',
      'unit'
    );

    // Try to extract coverage information
    try {
      const coveragePath = path.join(
        process.cwd(),
        'coverage',
        'coverage-summary.json'
      );
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        this.results.unit.coverage = coverage.total;
        this.log(
          `Coverage: ${coverage.total.lines.pct}% lines, ${coverage.total.branches.pct}% branches`,
          'info'
        );
      }
    } catch (error) {
      this.log('Could not read coverage report', 'warning');
    }

    return result;
  }

  async runE2ETests() {
    return await this.runCommand('npm run test:e2e', 'End-to-End Tests', 'e2e');
  }

  async runVisualTests() {
    return await this.runCommand(
      'npm run test:visual',
      'Visual Regression Tests',
      'visual'
    );
  }

  async runAccessibilityTests() {
    return await this.runCommand(
      'npm run test:accessibility',
      'Accessibility Tests',
      'accessibility'
    );
  }

  async runLighthouseTests() {
    // First build the project
    this.log('Building project for Lighthouse tests...', 'running');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.log('Build completed successfully', 'success');
    } catch (error) {
      this.log('Build failed, skipping Lighthouse tests', 'error');
      return { success: false, error: 'Build failed' };
    }

    return await this.runCommand(
      'npm run lighthouse',
      'Lighthouse Performance Tests',
      'lighthouse'
    );
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = Object.values(this.results).filter(
      r => r.passed
    ).length;
    const totalTests = Object.keys(this.results).length;

    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST SUITE SUMMARY');
    console.log('='.repeat(80));

    Object.entries(this.results).forEach(([testType, result]) => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      const duration = `${result.duration}ms`;
      console.log(
        `${testType.toUpperCase().padEnd(15)} ${status.padEnd(10)} ${duration}`
      );

      if (testType === 'unit' && result.coverage) {
        console.log(
          `${''.padEnd(15)} Coverage: ${result.coverage.lines.pct}% lines, ${result.coverage.branches.pct}% branches`
        );
      }
    });

    console.log('='.repeat(80));
    console.log(`📊 OVERALL: ${passedTests}/${totalTests} test suites passed`);
    console.log(`⏱️  TOTAL TIME: ${totalDuration}ms`);
    console.log('='.repeat(80));

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration,
      passedTests,
      totalTests,
      success: passedTests === totalTests,
      results: this.results,
    };

    const reportPath = path.join(
      process.cwd(),
      'test-results',
      'test-summary.json'
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Test report saved to ${reportPath}`, 'info');

    return report.success;
  }

  async run() {
    this.log('Starting comprehensive test suite...', 'running');

    // Run tests in sequence to avoid resource conflicts
    await this.runUnitTests();
    await this.runE2ETests();
    await this.runVisualTests();
    await this.runAccessibilityTests();
    await this.runLighthouseTests();

    const success = this.generateReport();

    if (!success) {
      process.exit(1);
    }

    this.log('All tests completed successfully! 🎉', 'success');
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
