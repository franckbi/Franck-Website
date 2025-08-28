import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  FeaturedProjects,
  AboutSummary,
  CallToAction,
} from '@/components/home';
import { ThemeProvider } from '@/lib/contexts/theme-context';

const mockProjects = [
  {
    slug: 'test-project',
    title: 'Test Project',
    tagline: 'A test project for testing',
    description: 'This is a test project description',
    thumbnail: {
      src: '/test-image.jpg',
      alt: 'Test image',
      width: 800,
      height: 600,
    },
    gallery: [],
    stack: ['React', 'TypeScript', 'Next.js'],
    role: 'Developer',
    year: 2024,
    links: {
      demo: 'https://demo.example.com',
      github: 'https://github.com/test/project',
      case_study: '/projects/test-project',
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
      results: ['Result 1', 'Result 2'],
      architecture: 'Test architecture',
      highlights: ['Highlight 1', 'Highlight 2'],
    },
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light" storageKey="test-theme">
    {children}
  </ThemeProvider>
);

describe('Home Components', () => {
  describe('FeaturedProjects', () => {
    it('should render featured projects section', () => {
      render(
        <TestWrapper>
          <FeaturedProjects projects={mockProjects} />
        </TestWrapper>
      );

      expect(screen.getByText('Featured Projects')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(
        screen.getByText('A test project for testing')
      ).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
    });

    it('should render project links correctly', () => {
      render(
        <TestWrapper>
          <FeaturedProjects projects={mockProjects} />
        </TestWrapper>
      );

      const viewProjectLink = screen.getByText('View Project →').closest('a');
      expect(viewProjectLink).toHaveAttribute('href', '/projects/test-project');

      const demoLink = screen.getByText('Demo').closest('a');
      expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
      expect(demoLink).toHaveAttribute('target', '_blank');

      const codeLink = screen.getByText('Code').closest('a');
      expect(codeLink).toHaveAttribute(
        'href',
        'https://github.com/test/project'
      );
      expect(codeLink).toHaveAttribute('target', '_blank');
    });

    it('should show "View All Projects" link', () => {
      render(
        <TestWrapper>
          <FeaturedProjects projects={mockProjects} />
        </TestWrapper>
      );

      const viewAllLink = screen.getByText('View All Projects').closest('a');
      expect(viewAllLink).toHaveAttribute('href', '/projects');
    });

    it('should limit stack display to 3 items', () => {
      const projectWithManyTechs = {
        ...mockProjects[0],
        stack: [
          'React',
          'TypeScript',
          'Next.js',
          'Tailwind',
          'Three.js',
          'Node.js',
        ],
      };

      render(
        <TestWrapper>
          <FeaturedProjects projects={[projectWithManyTechs]} />
        </TestWrapper>
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('+3 more')).toBeInTheDocument();
    });
  });

  describe('AboutSummary', () => {
    it('should render about section with stats', () => {
      render(
        <TestWrapper>
          <AboutSummary />
        </TestWrapper>
      );

      expect(screen.getByText('About Me')).toBeInTheDocument();
      expect(screen.getByText('5+')).toBeInTheDocument();
      expect(screen.getByText('Years Experience')).toBeInTheDocument();
      expect(screen.getByText('50+')).toBeInTheDocument();
      expect(screen.getByText('Projects Completed')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('Technologies Mastered')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <TestWrapper>
          <AboutSummary />
        </TestWrapper>
      );

      const learnMoreLink = screen
        .getByText('Learn More About Me')
        .closest('a');
      expect(learnMoreLink).toHaveAttribute('href', '/about');

      const contactLink = screen.getByText('Get In Touch').closest('a');
      expect(contactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('CallToAction', () => {
    it('should render CTA section', () => {
      render(
        <TestWrapper>
          <CallToAction />
        </TestWrapper>
      );

      expect(screen.getByText('Ready to Work Together?')).toBeInTheDocument();
      expect(
        screen.getByText(/I'm always interested in new opportunities/)
      ).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <TestWrapper>
          <CallToAction />
        </TestWrapper>
      );

      const conversationLink = screen
        .getByText('Start a Conversation')
        .closest('a');
      expect(conversationLink).toHaveAttribute('href', '/contact');

      const emailLink = screen.getByText('Send Email').closest('a');
      expect(emailLink).toHaveAttribute('href', 'mailto:hello@example.com');
    });

    it('should show availability indicators', () => {
      render(
        <TestWrapper>
          <CallToAction />
        </TestWrapper>
      );

      expect(
        screen.getByText('Available for new projects')
      ).toBeInTheDocument();
      expect(screen.getByText('Remote & on-site work')).toBeInTheDocument();
      expect(screen.getByText('Quick response time')).toBeInTheDocument();
    });
  });
});
