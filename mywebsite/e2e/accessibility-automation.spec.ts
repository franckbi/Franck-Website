import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Automation', () => {
  test.describe('Axe Core Accessibility Tests', () => {
    test('should pass accessibility audit on home page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit on projects page', async ({
      page,
    }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit on project detail page', async ({
      page,
    }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Get first project link
      const firstProject = page
        .locator('[data-testid="project-card"] a')
        .first();
      if (await firstProject.isVisible()) {
        await firstProject.click();
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('should pass accessibility audit on about page', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit on contact page', async ({
      page,
    }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit with 3D content', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="hero-section"]');

      // Wait for 3D scene to load
      await page.waitForTimeout(3000);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude('[data-testid="hero-3d-scene"] canvas') // Exclude canvas from some checks
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass accessibility audit in dark mode', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Switch to dark mode
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation Tests', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test skip links
      await page.keyboard.press('Tab');
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      await expect(skipLink).toBeFocused();

      // Activate skip link
      await page.keyboard.press('Enter');
      const main = page.locator('main');
      await expect(main).toBeFocused();

      // Continue tabbing through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip logo

      const navLinks = page.locator('nav a');
      const navCount = await navLinks.count();

      for (let i = 0; i < navCount; i++) {
        const currentLink = navLinks.nth(i);
        await expect(currentLink).toBeFocused();

        if (i < navCount - 1) {
          await page.keyboard.press('Tab');
        }
      }
    });

    test('should support arrow key navigation in 3D scene', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="hero-section"]');

      const heroSection = page.locator('[data-testid="hero-section"]');
      if (await heroSection.isVisible()) {
        await heroSection.focus();

        // Test arrow key navigation
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        // Should announce selection change
        const announcement = page.locator('[aria-live]');
        if ((await announcement.count()) > 0) {
          const announcementText = await announcement.first().textContent();
          expect(announcementText).toBeTruthy();
        }

        // Test Enter key activation
        await page.keyboard.press('Enter');

        const quickPanel = page.locator('[data-testid="project-quick-panel"]');
        if (await quickPanel.isVisible()) {
          await expect(quickPanel).toBeFocused();

          // Test Escape key
          await page.keyboard.press('Escape');
          await expect(quickPanel).not.toBeVisible();
        }
      }
    });

    test('should trap focus in modals', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="hero-section"]');

      // Try to open project quick panel
      const projectCard = page
        .locator('[data-testid="project-card-3d"]')
        .first();
      if (await projectCard.isVisible()) {
        await projectCard.click();
        await page.waitForSelector('[data-testid="project-quick-panel"]');

        const quickPanel = page.locator('[data-testid="project-quick-panel"]');
        const focusableElements = quickPanel.locator(
          'button, a, [tabindex="0"]'
        );
        const count = await focusableElements.count();

        if (count > 1) {
          // Tab through all focusable elements
          for (let i = 0; i < count; i++) {
            await page.keyboard.press('Tab');
          }

          // Should wrap back to first element
          await page.keyboard.press('Tab');
          const firstElement = focusableElements.first();
          await expect(firstElement).toBeFocused();
        }
      }
    });

    test('should support keyboard navigation in forms', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Tab through form fields
      await page.keyboard.press('Tab'); // Skip to first form field

      const nameField = page.locator('[data-testid="contact-name"]');
      await expect(nameField).toBeFocused();

      await page.keyboard.press('Tab');
      const emailField = page.locator('[data-testid="contact-email"]');
      await expect(emailField).toBeFocused();

      await page.keyboard.press('Tab');
      const messageField = page.locator('[data-testid="contact-message"]');
      await expect(messageField).toBeFocused();

      await page.keyboard.press('Tab');
      const submitButton = page.locator('[data-testid="contact-submit"]');
      await expect(submitButton).toBeFocused();
    });
  });

  test.describe('Screen Reader Tests', () => {
    test('should provide proper ARIA labels and descriptions', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check main landmarks
      const main = page.locator('main');
      await expect(main).toHaveAttribute('aria-label');

      const navigation = page.locator('nav[aria-label="Main navigation"]');
      await expect(navigation).toBeVisible();

      // Check 3D scene accessibility
      const scene3D = page.locator('[data-testid="hero-3d-scene"]');
      if (await scene3D.isVisible()) {
        await expect(scene3D).toHaveAttribute('aria-label');
        await expect(scene3D).toHaveAttribute('role');

        const projectCards = page.locator('[data-testid="project-card-3d"]');
        const cardCount = await projectCards.count();

        for (let i = 0; i < cardCount; i++) {
          const card = projectCards.nth(i);
          await expect(card).toHaveAttribute('aria-label');
          await expect(card).toHaveAttribute('role', 'button');
        }
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      // Apply a filter
      const techFilter = page.locator('[data-testid="tech-filter"]').first();
      if (await techFilter.isVisible()) {
        await techFilter.click();

        // Should announce filter change
        await page.waitForTimeout(200);
        const liveRegion = page.locator('[aria-live]');
        if ((await liveRegion.count()) > 0) {
          const announcement = await liveRegion.first().textContent();
          expect(announcement).toContain('filtered');
        }
      }
    });

    test('should provide alternative text for images', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');

        // Should have alt text, aria-label, or be decorative
        expect(
          alt !== null || ariaLabel !== null || role === 'presentation'
        ).toBe(true);
      }
    });

    test('should provide form field labels and descriptions', async ({
      page,
    }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      const nameField = page.locator('[data-testid="contact-name"]');
      const nameLabel = page.locator('label[for="name"]');
      await expect(nameLabel).toBeVisible();
      await expect(nameField).toHaveAttribute('aria-describedby');

      const emailField = page.locator('[data-testid="contact-email"]');
      const emailLabel = page.locator('label[for="email"]');
      await expect(emailLabel).toBeVisible();
      await expect(emailField).toHaveAttribute('aria-describedby');

      const messageField = page.locator('[data-testid="contact-message"]');
      const messageLabel = page.locator('label[for="message"]');
      await expect(messageLabel).toBeVisible();
      await expect(messageField).toHaveAttribute('aria-describedby');
    });
  });

  test.describe('Color Contrast Tests', () => {
    test('should meet color contrast requirements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should meet color contrast requirements in dark mode', async ({
      page,
    }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Switch to dark mode
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe('Motion and Animation Tests', () => {
    test('should respect reduced motion preferences', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that reduced motion is applied
      const heroSection = page.locator('[data-testid="hero-section"]');
      const reducedMotion = await heroSection.getAttribute(
        'data-reduced-motion'
      );
      expect(reducedMotion).toBe('true');

      // Check 3D scene respects reduced motion
      const scene3D = page.locator('[data-testid="hero-3d-scene"]');
      if (await scene3D.isVisible()) {
        const sceneReducedMotion = await scene3D.getAttribute(
          'data-reduced-motion'
        );
        expect(sceneReducedMotion).toBe('true');
      }
    });

    test('should provide animation controls', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for animation pause/play controls
      const animationControls = page.locator(
        '[data-testid="animation-controls"]'
      );
      if (await animationControls.isVisible()) {
        await expect(animationControls).toHaveAttribute('aria-label');

        const pauseButton = animationControls.locator(
          '[data-testid="pause-animations"]'
        );
        if (await pauseButton.isVisible()) {
          await expect(pauseButton).toHaveAttribute('aria-label');
        }
      }
    });
  });

  test.describe('Focus Management Tests', () => {
    test('should maintain logical focus order', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const focusableElements = page.locator(
        'a, button, input, textarea, select, [tabindex="0"]'
      );
      const count = await focusableElements.count();

      // Tab through all focusable elements
      for (let i = 0; i < Math.min(count, 20); i++) {
        // Limit to first 20 for performance
        await page.keyboard.press('Tab');

        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();

        // Check that focus is visible
        const focusedElement = await focused.first();
        const boundingBox = await focusedElement.boundingBox();
        expect(boundingBox).toBeTruthy();
      }
    });

    test('should restore focus after modal closes', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="hero-section"]');

      // Focus on a project card
      const projectCard = page
        .locator('[data-testid="project-card-3d"]')
        .first();
      if (await projectCard.isVisible()) {
        await projectCard.focus();
        await projectCard.click();

        const quickPanel = page.locator('[data-testid="project-quick-panel"]');
        if (await quickPanel.isVisible()) {
          // Close modal
          await page.keyboard.press('Escape');

          // Focus should return to the project card
          await expect(projectCard).toBeFocused();
        }
      }
    });

    test('should skip to main content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // First tab should focus skip link
      await page.keyboard.press('Tab');
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      await expect(skipLink).toBeFocused();

      // Activate skip link
      await page.keyboard.press('Enter');

      // Should focus main content
      const main = page.locator('main');
      await expect(main).toBeFocused();
    });
  });
});
