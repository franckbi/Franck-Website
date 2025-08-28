import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectDetailPage } from '@/components/projects/project-detail-page';
import { Project } from '@/lib/types/content';

// Mock Next.js router
const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

const mockProject: Project = {
  slug: 'test-project',
  title: 'Test Project',
  tagline: 'A test project for unit testing',
  description:
    'This is a **test project** with markdown content.\n\n## Features\n\n- Feature 1\n- Feature 2',
  thumbnail: {
    src: '/test-thumbnail.jpg',
    alt: 'Test thumbnail',
    width: 800,
    height: 600,
  },
  gallery: [
    {
      src: '/test-hero.jpg',
      alt: 'Test hero image',
      width: 1920,
      height: 1080,
    },
    {
      src: '/test-gallery-1.jpg',
      alt: 'Test gallery image 1',
      width: 1920,
      height: 1080,
    },
  ],
  stack: ['React', 'TypeScript', 'Next.js'],
  role: 'Full-Stack Developer',
  year: 2024,
  links: {
    demo: 'https://example.com',
    github: 'https://github.com/test/project',
  },
  badges: ['Featured', 'Web'],
  priority: 1,
  featured: true,
  metadata: {
    challenge: 'Build a comprehensive test project',
    solution: 'Used modern web technologies',
    results: ['100% test coverage', 'Fast performance'],
    architecture: 'Next.js with TypeScript',
    highlights: ['Responsive design', 'Accessibility compliant'],
  },
};

describe('Project Detail Components', () => {
  it('should render project detail page with all sections', () => {
    render(<ProjectDetailPage project={mockProject} />);

    // Check hero section
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(
      screen.getByText('A test project for unit testing')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Full-Stack Developer')).toHaveLength(2); // Appears in hero and sidebar
    expect(screen.getAllByText('2024')).toHaveLength(3); // Appears in badge, hero, and sidebar

    // Check project info
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();

    // Check content section
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Challenge')).toBeInTheDocument();
    expect(screen.getByText('Solution')).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByText('View Live Demo')).toBeInTheDocument();
    expect(screen.getByText('View Source Code')).toBeInTheDocument();
  });

  it('should render project highlights and results', () => {
    render(<ProjectDetailPage project={mockProject} />);

    expect(screen.getByText('Key Highlights')).toBeInTheDocument();
    expect(screen.getByText('Responsive design')).toBeInTheDocument();
    expect(screen.getByText('Accessibility compliant')).toBeInTheDocument();

    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('100% test coverage')).toBeInTheDocument();
    expect(screen.getByText('Fast performance')).toBeInTheDocument();
  });

  it('should render gallery section when multiple images exist', () => {
    render(<ProjectDetailPage project={mockProject} />);

    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  it('should not render gallery section when only one image exists', () => {
    const projectWithOneImage = {
      ...mockProject,
      gallery: [mockProject.gallery[0]], // Only one image
    };

    render(<ProjectDetailPage project={projectWithOneImage} />);

    expect(screen.queryByText('Gallery')).not.toBeInTheDocument();
  });

  it('should handle projects without optional metadata', () => {
    const minimalProject = {
      ...mockProject,
      metadata: {
        // Only required fields
      },
    };

    render(<ProjectDetailPage project={minimalProject} />);

    // Should still render basic sections
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
  });
});
