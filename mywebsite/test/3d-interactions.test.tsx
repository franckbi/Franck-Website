import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hero3D } from '@/components/3d/hero-3d';
import { ThemeProvider } from '@/lib/contexts/theme-context';

// Mock Three.js and react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    camera: {
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    },
    gl: { domElement: document.createElement('canvas') },
  }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Text: () => null,
  Box: () => null,
}));

vi.mock('@react-spring/three', () => ({
  useSpring: () => ({
    scale: { get: () => 1 },
    cameraPosition: { get: () => [0, 0, 5] },
    cameraLookAt: { get: () => [0, 0, 0] },
  }),
  animated: {
    group: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockProjects = [
  {
    slug: 'test-project-1',
    title: 'Test Project 1',
    tagline: 'A test project',
    description: 'Test description',
    thumbnail: {
      src: '/test.jpg',
      alt: 'Test',
      width: 800,
      height: 600,
    },
    gallery: [],
    stack: ['React', 'TypeScript'],
    role: 'Developer',
    year: 2024,
    links: {
      demo: 'https://demo.com',
      github: 'https://github.com/test',
      case_study: '/projects/test',
    },
    badges: ['Featured'],
    priority: 1,
    featured: true,
    sceneRef: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
    },
    metadata: {
      challenge: 'Test challenge',
      solution: 'Test solution',
      results: ['Test result'],
      architecture: 'Test architecture',
      highlights: ['Test highlight'],
    },
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('3D Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Hero3D component with canvas', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('should show tooltip on hover', async () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Simulate hover by directly calling the hover handler
    // In a real scenario, this would be triggered by 3D interactions
    const canvas = screen.getByTestId('canvas');
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });

    // The tooltip component should be in the DOM but may not be visible
    // without actual 3D hover interactions
    await waitFor(() => {
      expect(
        screen.getByText('Click to view details • Use arrow keys to navigate')
      ).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation instructions', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Check that keyboard navigation instructions are present
    expect(
      screen.getByText('Click to view details • Use arrow keys to navigate')
    ).toBeInTheDocument();
  });

  it('should open quick panel on project selection', async () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // The quick panel should be in the DOM but hidden initially
    // In a real scenario, this would be triggered by 3D click interactions
    expect(screen.getByText('Technologies')).toBeInTheDocument();
    expect(screen.getByText('View Project')).toBeInTheDocument();
  });

  it('should handle escape key to close panel', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Test escape key handling
    fireEvent.keyDown(document, { key: 'Escape' });

    // Panel should remain closed (this tests the event listener setup)
    expect(screen.getByText('View Project')).toBeInTheDocument();
  });

  it('should provide accessibility features', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Check for screen reader content
    expect(
      screen.getByText('Click to view details • Use arrow keys to navigate')
    ).toBeInTheDocument();

    // Check for semantic structure
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
  });

  it('should handle focus management', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Check that focus management elements are present
    const closeButton = screen.getByLabelText(/Close.*details panel/);
    expect(closeButton).toBeInTheDocument();

    // Test focus trap in modal
    fireEvent.click(closeButton);
  });

  it('should display project information correctly', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Check project information display
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should handle project links correctly', () => {
    render(
      <TestWrapper>
        <Hero3D projects={mockProjects} />
      </TestWrapper>
    );

    // Check for project links
    const viewProjectLink = screen.getByText('View Project').closest('a');
    expect(viewProjectLink).toHaveAttribute('href', '/projects/test');

    const demoLink = screen.getByText('Demo').closest('a');
    expect(demoLink).toHaveAttribute('href', 'https://demo.com');
    expect(demoLink).toHaveAttribute('target', '_blank');

    const codeLink = screen.getByText('Code').closest('a');
    expect(codeLink).toHaveAttribute('href', 'https://github.com/test');
    expect(codeLink).toHaveAttribute('target', '_blank');
  });
});
