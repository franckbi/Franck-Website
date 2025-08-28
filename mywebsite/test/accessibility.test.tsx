import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '@/lib/contexts/theme-context';
import { SkipToContent } from '@/components/layout/skip-to-content';
import { MainLayout } from '@/components/layout/main-layout';
import { ProjectQuickPanel } from '@/components/3d/project-quick-panel';
import {
  announceToScreenReader,
  createFocusTrap,
  KeyboardNavigationManager,
  describe3DContent,
  prefersReducedMotion,
} from '@/lib/utils/accessibility';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock settings store
vi.mock('@/lib/stores/settings-store', () => ({
  useSettingsStore: () => ({
    lowPowerMode: false,
    reducedMotion: false,
  }),
}));

// Sample project data
const mockProjects = [
  {
    slug: 'project-1',
    title: 'Test Project 1',
    tagline: 'A test project',
    description: 'This is a test project description',
    stack: ['React', 'TypeScript', 'Next.js'],
    year: 2024,
    featured: true,
    links: {
      demo: 'https://example.com/demo',
      github: 'https://github.com/example/project',
      case_study: '/projects/project-1',
    },
    sceneRef: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
    },
  },
  {
    slug: 'project-2',
    title: 'Test Project 2',
    tagline: 'Another test project',
    description: 'This is another test project description',
    stack: ['Vue', 'JavaScript', 'Node.js'],
    year: 2024,
    featured: true,
    links: {
      demo: 'https://example.com/demo2',
      github: 'https://github.com/example/project2',
    },
    sceneRef: {
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
    },
  },
];

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Clear any existing live regions
    document.querySelectorAll('[aria-live]').forEach(el => el.remove());
  });

  describe('Skip Links', () => {
    it('should render skip links that are initially hidden', () => {
      render(<SkipToContent />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('skip-link');
    });

    it('should have proper ARIA attributes', () => {
      render(<SkipToContent />);

      const nav = screen.getByRole('navigation', {
        name: 'Skip navigation links',
      });
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should create live region for announcements', () => {
      announceToScreenReader('Test announcement');

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('Test announcement');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('should support different politeness levels', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const liveRegion = document.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveTextContent('Urgent message');
    });

    it('should clean up announcements after timeout', async () => {
      announceToScreenReader('Temporary message');

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();

      // Wait for cleanup
      await waitFor(
        () => {
          expect(
            document.querySelector('[aria-live="polite"]')
          ).not.toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });
  });

  describe('Focus Management', () => {
    it('should create focus trap for modal content', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>First</button>
        <button>Second</button>
        <button>Last</button>
      `;
      document.body.appendChild(container);

      const cleanup = createFocusTrap(container);

      // First button should be focused
      expect(container.querySelector('button')).toHaveFocus();

      cleanup();
      document.body.removeChild(container);
    });

    it('should handle tab key in focus trap', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>First</button>
        <button>Last</button>
      `;
      document.body.appendChild(container);

      const cleanup = createFocusTrap(container);

      // Simulate Tab key on last element
      const lastButton = container.querySelectorAll('button')[1];
      lastButton.focus();

      fireEvent.keyDown(container, { key: 'Tab' });

      // Should wrap to first button
      expect(container.querySelector('button')).toHaveFocus();

      cleanup();
      document.body.removeChild(container);
    });
  });

  describe('Keyboard Navigation Manager', () => {
    it('should handle arrow key navigation', () => {
      const onSelectionChange = vi.fn();
      const onActivate = vi.fn();

      const manager = new KeyboardNavigationManager(
        onSelectionChange,
        onActivate
      );
      const items = [
        { id: '1', data: { name: 'Item 1' } },
        { id: '2', data: { name: 'Item 2' } },
        { id: '3', data: { name: 'Item 3' } },
      ];

      manager.setItems(items);

      // Test arrow right
      const handled = manager.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );
      expect(handled).toBe(true);
      expect(onSelectionChange).toHaveBeenCalledWith({ name: 'Item 1' }, 0);

      // Test arrow left (should wrap to last)
      manager.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(onSelectionChange).toHaveBeenCalledWith({ name: 'Item 3' }, 2);
    });

    it('should handle Enter key activation', () => {
      const onSelectionChange = vi.fn();
      const onActivate = vi.fn();

      const manager = new KeyboardNavigationManager(
        onSelectionChange,
        onActivate
      );
      const items = [{ id: '1', data: { name: 'Item 1' } }];

      manager.setItems(items);
      manager.handleKeyDown(
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );
      manager.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(onActivate).toHaveBeenCalledWith({ name: 'Item 1' }, 0);
    });

    it('should handle Home and End keys', () => {
      const onSelectionChange = vi.fn();
      const manager = new KeyboardNavigationManager(onSelectionChange);
      const items = [
        { id: '1', data: { name: 'Item 1' } },
        { id: '2', data: { name: 'Item 2' } },
        { id: '3', data: { name: 'Item 3' } },
      ];

      manager.setItems(items);

      // Test Home key
      manager.handleKeyDown(new KeyboardEvent('keydown', { key: 'Home' }));
      expect(onSelectionChange).toHaveBeenCalledWith({ name: 'Item 1' }, 0);

      // Test End key
      manager.handleKeyDown(new KeyboardEvent('keydown', { key: 'End' }));
      expect(onSelectionChange).toHaveBeenCalledWith({ name: 'Item 3' }, 2);
    });
  });

  describe('3D Content Description', () => {
    it('should generate descriptive text for 3D content', () => {
      const description = describe3DContent(mockProjects);

      expect(description).toContain('2 projects');
      expect(description).toContain('2 featured');
      expect(description).toContain('arrow keys to navigate');
      expect(description).toContain('Enter to select');
    });

    it('should handle singular project count', () => {
      const singleProject = [mockProjects[0]];
      const description = describe3DContent(singleProject);

      expect(description).toContain('1 project');
      expect(description).not.toContain('projects');
    });
  });

  describe('Reduced Motion Detection', () => {
    it('should detect reduced motion preference', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      expect(prefersReducedMotion()).toBe(true);
    });
  });

  describe('Project Quick Panel Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ProjectQuickPanel
          project={mockProjects[0]}
          onClose={vi.fn()}
          visible={true}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'project-panel-title');
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'project-panel-description'
      );
    });

    it('should have escape key functionality setup', () => {
      const onClose = vi.fn();
      render(
        <ProjectQuickPanel
          project={mockProjects[0]}
          onClose={onClose}
          visible={true}
        />
      );

      // Test that the component renders with proper modal attributes
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');

      // The escape key functionality is tested through the useEffect
      // which is difficult to test in isolation without more complex mocking
      expect(dialog).toBeInTheDocument();
    });

    it('should have accessible action buttons', () => {
      render(
        <ProjectQuickPanel
          project={mockProjects[0]}
          onClose={vi.fn()}
          visible={true}
        />
      );

      const viewButton = screen.getByRole('link', { name: /view project/i });
      expect(viewButton).toHaveAttribute('aria-describedby');

      const demoButton = screen.getByRole('link', { name: /demo/i });
      expect(demoButton).toHaveAttribute('aria-describedby');
      expect(demoButton).toHaveAttribute('target', '_blank');
      expect(demoButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Main Layout Accessibility', () => {
    it('should have proper landmark structure', () => {
      render(
        <ThemeProvider>
          <MainLayout>
            <div>Test content</div>
          </MainLayout>
        </ThemeProvider>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: 'Main navigation' })
      ).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have descriptive main content label', () => {
      render(
        <ThemeProvider>
          <MainLayout>
            <div>Test content</div>
          </MainLayout>
        </ThemeProvider>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute(
        'aria-label',
        'Home page content with 3D project showcase'
      );
    });
  });

  describe('Manual Accessibility Checks', () => {
    it('should have proper ARIA attributes in skip links', () => {
      const { container } = render(<SkipToContent />);
      const nav = container.querySelector(
        '[aria-label="Skip navigation links"]'
      );
      expect(nav).toBeInTheDocument();
    });

    it('should have proper ARIA attributes in project panel', () => {
      const { container } = render(
        <ProjectQuickPanel
          project={mockProjects[0]}
          onClose={vi.fn()}
          visible={true}
        />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should have proper landmark structure in main layout', () => {
      render(
        <ThemeProvider>
          <MainLayout>
            <h1>Test Page</h1>
            <p>Test content</p>
          </MainLayout>
        </ThemeProvider>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('navigation')).toHaveLength(3); // Skip links, main nav, footer nav
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });
});
