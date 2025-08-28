import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero3D } from '@/components/3d/hero-3d';
import { ThemeProvider } from '@/lib/contexts/theme-context';

// Mock the entire CanvasWrapper to avoid WebGL issues in tests
vi.mock('@/components/3d/canvas-wrapper', () => ({
  CanvasWrapper: ({ children, fallback }: any) => (
    <div data-testid="canvas-wrapper-mock">{fallback || children}</div>
  ),
}));

// Mock settings store
vi.mock('@/lib/stores/settings-store', () => ({
  useSettingsStore: () => ({
    lowPowerMode: false,
    reducedMotion: false,
    performanceMode: 'high',
  }),
}));

const mockProjects = [
  {
    slug: 'test-project-1',
    title: 'Test Project 1',
    tagline: 'A test project',
    stack: ['React', 'TypeScript', 'Three.js'],
    sceneRef: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
    },
    links: {
      demo: 'https://demo.example.com',
      github: 'https://github.com/test/project',
      case_study: '/projects/test-project-1',
    },
  },
  {
    slug: 'test-project-2',
    title: 'Test Project 2',
    tagline: 'Another test project',
    stack: ['Next.js', 'Tailwind'],
    sceneRef: {
      position: { x: -2, y: 1, z: 1 },
      rotation: { x: 0, y: 0.2, z: 0 },
      scale: 0.8,
    },
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Hero3D', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas-wrapper-mock')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <TestWrapper>
        <Hero3D projects={mockProjects} className="test-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('test-class');
  });

  it('filters projects with sceneRef', () => {
    const projectsWithoutSceneRef = [
      {
        slug: 'no-scene-ref',
        title: 'No Scene Ref',
        tagline: 'Project without scene ref',
        stack: ['React'],
      },
    ];

    render(
      <TestWrapper>
        <Hero3D projects={projectsWithoutSceneRef} />
      </TestWrapper>
    );

    // Should still render the canvas wrapper
    expect(screen.getByTestId('canvas-wrapper-mock')).toBeInTheDocument();
  });
});
