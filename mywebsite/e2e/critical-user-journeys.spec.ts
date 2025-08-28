import { test, expect, Page } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Set up common test conditions
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Home to Project Detail Flow', () => {
    test('should navigate from hero to project detail', async ({ page }) => {
      // Wait for 3D scene to load or fallback to be visible
      await page.waitForSelector('[data-testid="hero-section"]', {
        timeout: 10000,
      });

      // Check if 3D scene loaded or fallback is shown
      const has3D = await page
        .locator('[data-testid="hero-3d-scene"]')
        .isVisible();
      const hasFallback = await page
        .locator('[data-testid="hero-fallback"]')
        .isVisible();

      expect(has3D || hasFallback).toBe(true);

      if (has3D) {
        // Test 3D interaction
        await page.locator('[data-testid="project-card-3d"]').first().hover();
        await page.waitForSelector('[data-testid="project-tooltip"]');

        await page.locator('[data-testid="project-card-3d"]').first().click();
        await page.waitForSelector('[data-testid="project-quick-panel"]');

        await page.locator('[data-testid="view-project-button"]').click();
      } else {
        // Test fallback interaction
        await page
          .locator('[data-testid="featured-project-card"]')
          .first()
          .click();
      }

      // Verify navigation to project detail
      await page.waitForURL(/\/projects\/[^\/]+$/);

      // Verify project detail page content
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="project-hero"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-info"]')).toBeVisible();

      // Check for tech stack
      await expect(page.locator('[data-testid="tech-stack"]')).toBeVisible();

      // Check for project links
      const demoLink = page.locator('[data-testid="demo-link"]');
      const githubLink = page.locator('[data-testid="github-link"]');

      if (await demoLink.isVisible()) {
        await expect(demoLink).toHaveAttribute('target', '_blank');
        await expect(demoLink).toHaveAttribute('rel', 'noopener noreferrer');
      }

      if (await githubLink.isVisible()) {
        await expect(githubLink).toHaveAttribute('target', '_blank');
        await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });

    test('should handle project detail not found', async ({ page }) => {
      await page.goto('/projects/non-existent-project');

      await expect(page.locator('h1')).toContainText('Project Not Found');
      await expect(
        page.locator('[data-testid="back-to-projects"]')
      ).toBeVisible();

      await page.locator('[data-testid="back-to-projects"]').click();
      await page.waitForURL('/projects');
    });
  });

  test.describe('Projects Browsing Flow', () => {
    test('should browse and filter projects', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Wait for projects to load
      await page.waitForSelector('[data-testid="projects-container"]');

      // Check initial project count
      const initialProjects = await page
        .locator('[data-testid="project-card"]')
        .count();
      expect(initialProjects).toBeGreaterThan(0);

      // Test technology filter
      const techFilter = page.locator('[data-testid="tech-filter"]').first();
      if (await techFilter.isVisible()) {
        await techFilter.click();

        // Wait for filter to apply
        await page.waitForTimeout(200);

        const filteredProjects = await page
          .locator('[data-testid="project-card"]')
          .count();
        expect(filteredProjects).toBeLessThanOrEqual(initialProjects);
      }

      // Test year filter
      const yearFilter = page.locator('[data-testid="year-filter"]').first();
      if (await yearFilter.isVisible()) {
        await yearFilter.click();
        await page.waitForTimeout(200);
      }

      // Test view toggle
      const viewToggle = page.locator('[data-testid="view-toggle"]');
      if (await viewToggle.isVisible()) {
        const currentView = await viewToggle.getAttribute('data-view');
        await viewToggle.click();

        await page.waitForTimeout(500);
        const newView = await viewToggle.getAttribute('data-view');
        expect(newView).not.toBe(currentView);
      }

      // Test search functionality
      const searchInput = page.locator('[data-testid="project-search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('React');
        await page.waitForTimeout(300); // Debounce delay

        const searchResults = await page
          .locator('[data-testid="project-card"]')
          .count();
        expect(searchResults).toBeGreaterThanOrEqual(0);
      }
    });

    test('should maintain filter state in URL', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Apply a filter
      const techFilter = page.locator('[data-testid="tech-filter"]').first();
      if (await techFilter.isVisible()) {
        const filterText = await techFilter.textContent();
        await techFilter.click();

        // Check URL contains filter parameter
        await page.waitForTimeout(200);
        const url = page.url();
        expect(url).toContain('tech=');

        // Refresh page and verify filter persists
        await page.reload();
        await page.waitForLoadState('networkidle');

        const activeFilter = page.locator(
          '[data-testid="tech-filter"][data-active="true"]'
        );
        await expect(activeFilter).toBeVisible();
      }
    });
  });

  test.describe('Contact Form Flow', () => {
    test('should submit contact form successfully', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Fill out the form
      await page.fill('[data-testid="contact-name"]', 'John Doe');
      await page.fill('[data-testid="contact-email"]', 'john@example.com');
      await page.fill(
        '[data-testid="contact-message"]',
        'This is a test message for the contact form.'
      );

      // Submit the form
      await page.click('[data-testid="contact-submit"]');

      // Wait for success message
      await page.waitForSelector('[data-testid="contact-success"]', {
        timeout: 10000,
      });
      await expect(
        page.locator('[data-testid="contact-success"]')
      ).toBeVisible();

      // Verify form is reset
      await expect(page.locator('[data-testid="contact-name"]')).toHaveValue(
        ''
      );
      await expect(page.locator('[data-testid="contact-email"]')).toHaveValue(
        ''
      );
      await expect(page.locator('[data-testid="contact-message"]')).toHaveValue(
        ''
      );
    });

    test('should show validation errors', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Submit empty form
      await page.click('[data-testid="contact-submit"]');

      // Check for validation errors
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="message-error"]')).toBeVisible();

      // Fill invalid email
      await page.fill('[data-testid="contact-email"]', 'invalid-email');
      await page.click('[data-testid="contact-submit"]');

      await expect(page.locator('[data-testid="email-error"]')).toContainText(
        'valid email'
      );
    });

    test('should handle form submission errors', async ({ page }) => {
      // Mock API to return error
      await page.route('/api/contact', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Server error' }),
        });
      });

      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Fill and submit form
      await page.fill('[data-testid="contact-name"]', 'John Doe');
      await page.fill('[data-testid="contact-email"]', 'john@example.com');
      await page.fill('[data-testid="contact-message"]', 'Test message');

      await page.click('[data-testid="contact-submit"]');

      // Wait for error message
      await page.waitForSelector('[data-testid="contact-error"]');
      await expect(page.locator('[data-testid="contact-error"]')).toBeVisible();
    });
  });

  test.describe('Accessibility Flow', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/');

      // Test skip links
      await page.keyboard.press('Tab');
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      await expect(skipLink).toBeFocused();

      await page.keyboard.press('Enter');
      const mainContent = page.locator('main');
      await expect(mainContent).toBeFocused();

      // Navigate through main navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip logo

      const firstNavLink = page.locator('nav a').first();
      await expect(firstNavLink).toBeFocused();

      // Test arrow key navigation in 3D scene (if present)
      const heroSection = page.locator('[data-testid="hero-section"]');
      if (await heroSection.isVisible()) {
        await heroSection.focus();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Enter');

        // Should open project panel or navigate
        const quickPanel = page.locator('[data-testid="project-quick-panel"]');
        if (await quickPanel.isVisible()) {
          await expect(quickPanel).toBeFocused();

          // Test escape key
          await page.keyboard.press('Escape');
          await expect(quickPanel).not.toBeVisible();
        }
      }
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that animations are disabled
      const heroSection = page.locator('[data-testid="hero-section"]');
      const hasReducedMotion = await heroSection.getAttribute(
        'data-reduced-motion'
      );
      expect(hasReducedMotion).toBe('true');

      // Verify 3D scene respects reduced motion
      const scene3D = page.locator('[data-testid="hero-3d-scene"]');
      if (await scene3D.isVisible()) {
        const sceneReducedMotion = await scene3D.getAttribute(
          'data-reduced-motion'
        );
        expect(sceneReducedMotion).toBe('true');
      }
    });

    test('should work with screen readers', async ({ page }) => {
      await page.goto('/');

      // Check for proper ARIA labels
      const main = page.locator('main');
      await expect(main).toHaveAttribute('aria-label');

      const navigation = page.locator('nav[aria-label="Main navigation"]');
      await expect(navigation).toBeVisible();

      // Check for live regions
      const liveRegion = page.locator('[aria-live]');
      if ((await liveRegion.count()) > 0) {
        await expect(liveRegion.first()).toHaveAttribute('aria-live');
      }

      // Test 3D content descriptions
      const scene3D = page.locator('[data-testid="hero-3d-scene"]');
      if (await scene3D.isVisible()) {
        await expect(scene3D).toHaveAttribute('aria-label');

        const projectCards = page.locator('[data-testid="project-card-3d"]');
        const cardCount = await projectCards.count();

        for (let i = 0; i < cardCount; i++) {
          const card = projectCards.nth(i);
          await expect(card).toHaveAttribute('aria-label');
          await expect(card).toHaveAttribute('role', 'button');
        }
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load within performance budgets', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 second budget

      // Check for Core Web Vitals
      const lcp = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lcpEntry = entries[entries.length - 1];
            resolve(lcpEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 3000);
        });
      });

      if (lcp > 0) {
        expect(lcp).toBeLessThan(2500); // 2.5s LCP budget
      }
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      await page.goto('/');

      // Should show loading states
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      if (await loadingSpinner.isVisible()) {
        await expect(loadingSpinner).toBeVisible();
      }

      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Content should eventually load
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    });

    test('should work offline', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Go offline
      await page.context().setOffline(true);

      // Navigate to cached page
      await page.goto('/projects');

      // Should show offline message or cached content
      const offlineMessage = page.locator('[data-testid="offline-message"]');
      const cachedContent = page.locator('[data-testid="projects-container"]');

      const hasOfflineMessage = await offlineMessage.isVisible();
      const hasCachedContent = await cachedContent.isVisible();

      expect(hasOfflineMessage || hasCachedContent).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 3D rendering errors gracefully', async ({ page }) => {
      // Mock WebGL context loss
      await page.addInitScript(() => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (contextType) {
          if (contextType === 'webgl' || contextType === 'webgl2') {
            return null; // Simulate WebGL not available
          }
          return originalGetContext.call(this, contextType);
        };
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should show fallback content
      await expect(page.locator('[data-testid="hero-fallback"]')).toBeVisible();

      // Should not show 3D scene
      const scene3D = page.locator('[data-testid="hero-3d-scene"]');
      if ((await scene3D.count()) > 0) {
        await expect(scene3D).not.toBeVisible();
      }
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API errors
      await page.route('/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Fill and submit form
      await page.fill('[data-testid="contact-name"]', 'John Doe');
      await page.fill('[data-testid="contact-email"]', 'john@example.com');
      await page.fill('[data-testid="contact-message"]', 'Test message');

      await page.click('[data-testid="contact-submit"]');

      // Should show error message
      await expect(page.locator('[data-testid="contact-error"]')).toBeVisible();

      // Form should remain filled for retry
      await expect(page.locator('[data-testid="contact-name"]')).toHaveValue(
        'John Doe'
      );
    });
  });
});
