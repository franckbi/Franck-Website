import { test, expect, Page } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('3D Scene Rendering', () => {
    test('should render hero 3D scene consistently', async ({ page }) => {
      await page.goto('/');

      // Wait for 3D scene to load or fallback
      await page.waitForSelector('[data-testid="hero-section"]', {
        timeout: 10000,
      });

      // Wait for any animations to settle
      await page.waitForTimeout(2000);

      // Hide dynamic elements that might cause flakiness
      await page.addStyleTag({
        content: `
          [data-testid="fps-counter"] { display: none !important; }
          [data-testid="loading-spinner"] { display: none !important; }
          .cursor-pointer { cursor: default !important; }
        `,
      });

      // Take screenshot of hero section
      await expect(
        page.locator('[data-testid="hero-section"]')
      ).toHaveScreenshot('hero-3d-scene.png', {
        threshold: 0.3, // Allow for minor rendering differences
        maxDiffPixels: 1000,
      });
    });

    test('should render projects 3D grid consistently', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Wait for 3D scene to load
      await page.waitForSelector('[data-testid="projects-container"]', {
        timeout: 10000,
      });
      await page.waitForTimeout(2000);

      // Hide dynamic elements
      await page.addStyleTag({
        content: `
          [data-testid="fps-counter"] { display: none !important; }
          [data-testid="performance-stats"] { display: none !important; }
        `,
      });

      const projectsContainer = page.locator(
        '[data-testid="projects-container"]'
      );
      await expect(projectsContainer).toHaveScreenshot('projects-3d-grid.png', {
        threshold: 0.3,
        maxDiffPixels: 1500,
      });
    });

    test('should render 3D scene fallback consistently', async ({ page }) => {
      // Disable WebGL to force fallback
      await page.addInitScript(() => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (contextType) {
          if (contextType === 'webgl' || contextType === 'webgl2') {
            return null;
          }
          return originalGetContext.call(this, contextType);
        };
      });

      await page.goto('/');
      await page.waitForSelector('[data-testid="hero-fallback"]', {
        timeout: 5000,
      });

      await expect(
        page.locator('[data-testid="hero-fallback"]')
      ).toHaveScreenshot('hero-fallback.png');
    });
  });

  test.describe('UI Components', () => {
    test('should render header consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const header = page.locator('header');
      await expect(header).toHaveScreenshot('header-desktop.png');
    });

    test('should render footer consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer');
      await expect(footer).toHaveScreenshot('footer-desktop.png');
    });

    test('should render project cards consistently', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Switch to list view for consistent rendering
      const viewToggle = page.locator('[data-testid="view-toggle"]');
      if (await viewToggle.isVisible()) {
        await viewToggle.click();
        await page.waitForTimeout(500);
      }

      const projectCard = page.locator('[data-testid="project-card"]').first();
      await expect(projectCard).toHaveScreenshot('project-card.png');
    });

    test('should render contact form consistently', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const contactForm = page.locator('[data-testid="contact-form"]');
      await expect(contactForm).toHaveScreenshot('contact-form.png');
    });

    test('should render project quick panel consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="hero-section"]');

      // Try to trigger quick panel
      const projectCard = page
        .locator('[data-testid="project-card-3d"]')
        .first();
      if (await projectCard.isVisible()) {
        await projectCard.click();
        await page.waitForSelector('[data-testid="project-quick-panel"]');

        const quickPanel = page.locator('[data-testid="project-quick-panel"]');
        await expect(quickPanel).toHaveScreenshot('project-quick-panel.png');
      }
    });
  });

  test.describe('Theme Variations', () => {
    test('should render dark theme consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Switch to dark theme
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }

      await expect(page.locator('body')).toHaveScreenshot(
        'dark-theme-home.png',
        {
          fullPage: true,
        }
      );
    });

    test('should render light theme consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Ensure light theme is active
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      });

      await page.waitForTimeout(500);

      await expect(page.locator('body')).toHaveScreenshot(
        'light-theme-home.png',
        {
          fullPage: true,
        }
      );
    });
  });

  test.describe('Responsive Design', () => {
    test('should render mobile layout consistently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toHaveScreenshot('mobile-home.png', {
        fullPage: true,
      });
    });

    test('should render tablet layout consistently', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toHaveScreenshot('tablet-home.png', {
        fullPage: true,
      });
    });

    test('should render mobile navigation consistently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open mobile menu
      const menuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await page.waitForTimeout(300);

        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        await expect(mobileMenu).toHaveScreenshot('mobile-navigation.png');
      }
    });
  });

  test.describe('Interactive States', () => {
    test('should render hover states consistently', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Switch to list view
      const viewToggle = page.locator('[data-testid="view-toggle"]');
      if (await viewToggle.isVisible()) {
        await viewToggle.click();
        await page.waitForTimeout(500);
      }

      const projectCard = page.locator('[data-testid="project-card"]').first();
      await projectCard.hover();

      await expect(projectCard).toHaveScreenshot('project-card-hover.png');
    });

    test('should render focus states consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Focus on first navigation link
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip skip-link

      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveScreenshot('navigation-focus.png');
    });

    test('should render form validation states consistently', async ({
      page,
    }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Trigger validation errors
      await page.click('[data-testid="contact-submit"]');
      await page.waitForSelector('[data-testid="name-error"]');

      const contactForm = page.locator('[data-testid="contact-form"]');
      await expect(contactForm).toHaveScreenshot('contact-form-errors.png');
    });
  });

  test.describe('Loading States', () => {
    test('should render loading skeleton consistently', async ({ page }) => {
      // Intercept requests to delay loading
      await page.route('/api/**', route => {
        setTimeout(() => route.continue(), 2000);
      });

      await page.goto('/projects');

      // Should show loading skeleton
      const loadingSkeleton = page.locator('[data-testid="loading-skeleton"]');
      if (await loadingSkeleton.isVisible()) {
        await expect(loadingSkeleton).toHaveScreenshot('loading-skeleton.png');
      }
    });

    test('should render 3D loading state consistently', async ({ page }) => {
      // Delay 3D asset loading
      await page.route('**/*.{glb,gltf,ktx2}', route => {
        setTimeout(() => route.continue(), 2000);
      });

      await page.goto('/');

      const loadingState = page.locator('[data-testid="3d-loading"]');
      if (await loadingState.isVisible()) {
        await expect(loadingState).toHaveScreenshot('3d-loading-state.png');
      }
    });
  });

  test.describe('Error States', () => {
    test('should render 404 page consistently', async ({ page }) => {
      await page.goto('/non-existent-page');

      await expect(page.locator('body')).toHaveScreenshot('404-page.png', {
        fullPage: true,
      });
    });

    test('should render project not found consistently', async ({ page }) => {
      await page.goto('/projects/non-existent-project');

      const notFoundContent = page.locator('[data-testid="project-not-found"]');
      await expect(notFoundContent).toHaveScreenshot('project-not-found.png');
    });

    test('should render 3D error fallback consistently', async ({ page }) => {
      // Mock 3D loading error
      await page.addInitScript(() => {
        window.addEventListener('error', e => {
          if (e.message.includes('WebGL')) {
            // Trigger 3D error fallback
            const event = new CustomEvent('3d-error', {
              detail: { message: 'WebGL context lost' },
            });
            window.dispatchEvent(event);
          }
        });
      });

      await page.goto('/');

      const errorFallback = page.locator('[data-testid="3d-error-fallback"]');
      if (await errorFallback.isVisible()) {
        await expect(errorFallback).toHaveScreenshot('3d-error-fallback.png');
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('should render high contrast mode consistently', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toHaveScreenshot(
        'high-contrast-mode.png',
        {
          fullPage: true,
        }
      );
    });

    test('should render reduced motion state consistently', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should show static version
      const heroSection = page.locator('[data-testid="hero-section"]');
      await expect(heroSection).toHaveScreenshot('reduced-motion-hero.png');
    });

    test('should render focus indicators consistently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through focusable elements
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // First nav item

      const focusedNav = page.locator('nav a:focus');
      await expect(focusedNav).toHaveScreenshot('focus-indicator.png');
    });
  });
});
