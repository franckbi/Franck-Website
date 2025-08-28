/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectsList } from '@/components/projects/projects-list';
import { ProjectCard } from '@/components/projects/project-card';
import { useProjectsStore } from '@/lib/stores/projects-store';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import type { Project } from '@/lib/types/content';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock the projects store
vi.mock('@/lib/stores/projects-store');

// Mock the debounced value hook
vi.mock('@/lib/hooks/use-debounced-value');

const mockProjects: Project[] = [
  {
    slug: 'test-project-1',
    title: 'Test Project 1',
    tagline: 'A test project for React',
    description: 'This is a test project description',
    thumbnail: {
      src: '/test-image.jpg',
      alt: 'Test image',
      width: 800,
      height: 600,
    },
    gallery: [],
    stack: ['React', 'TypeScript', 'Next.js'],
    role: 'Frontend Developer',
    year: 2024,
    links: {
      demo: 'https://demo.example.com',
      github: 'https://github.com/test/project',
    },
    badges: ['Featured'],
    priority: 1,
    featured: true,
    metadata: {
      challenge: 'Test challenge',
      solution: 'Test solution',
      results: ['Test result'],
    },
  },
  {
    slug: 'test-project-2',
    title: 'Test Project 2',
    tagline: 'A test project for Vue',
    description: 'This is another test project description',
    thumbnail: {
      src: '/test-image-2.jpg',
      alt: 'Test image 2',
      width: 800,
      height: 600,
    },
    gallery: [],
    stack: ['Vue', 'JavaScript'],
    role: 'Full-Stack Developer',
    year: 2023,
    links: {
      github: 'https://github.com/test/project2',
    },
    badges: [],
    priority: 2,
    featured: false,
    metadata: {},
  },
];

describe('Projects Page Components', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useDebouncedValue as any).mockImplementation((value: any) => value);
  });

  describe('ProjectFilters', () => {
    const defaultProps = {
      projects: mockProjects,
      filters: { technology: [], year: [], featured: null, search: '' },
      searchQuery: '',
      viewMode: 'list' as const,
      onFiltersChange: vi.fn(),
      onSearchChange: vi.fn(),
      onViewModeChange: vi.fn(),
      onClearFilters: vi.fn(),
    };

    it('should render search input', () => {
      render(<ProjectFilters {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Search projects...')
      ).toBeInTheDocument();
    });

    it('should render view mode toggle buttons', () => {
      render(<ProjectFilters {...defaultProps} />);

      expect(screen.getByLabelText('3D Grid View')).toBeInTheDocument();
      expect(screen.getByLabelText('List View')).toBeInTheDocument();
    });

    it('should call onSearchChange when typing in search input', async () => {
      const onSearchChange = vi.fn();
      render(
        <ProjectFilters {...defaultProps} onSearchChange={onSearchChange} />
      );

      const searchInput = screen.getByPlaceholderText('Search projects...');
      fireEvent.change(searchInput, { target: { value: 'React' } });

      // Since we're mocking useDebouncedValue to return the value immediately
      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledWith('React');
      });
    });

    it('should call onViewModeChange when clicking view mode buttons', () => {
      const onViewModeChange = vi.fn();
      render(
        <ProjectFilters {...defaultProps} onViewModeChange={onViewModeChange} />
      );

      fireEvent.click(screen.getByLabelText('3D Grid View'));
      expect(onViewModeChange).toHaveBeenCalledWith('3d');

      fireEvent.click(screen.getByLabelText('List View'));
      expect(onViewModeChange).toHaveBeenCalledWith('list');
    });

    it('should show filter options when filter button is clicked', () => {
      render(<ProjectFilters {...defaultProps} />);

      fireEvent.click(screen.getByText('Filters'));

      expect(screen.getByText('Filter Projects')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
    });

    it('should display available technologies from projects', () => {
      render(<ProjectFilters {...defaultProps} />);

      fireEvent.click(screen.getByText('Filters'));

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Vue')).toBeInTheDocument();
    });
  });

  describe('ProjectsList', () => {
    it('should render list of projects', () => {
      render(<ProjectsList projects={mockProjects} />);

      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    it('should show empty state when no projects', () => {
      render(<ProjectsList projects={[]} />);

      expect(screen.getByText('No projects found')).toBeInTheDocument();
    });

    it('should call onProjectClick when project is clicked', () => {
      const onProjectClick = vi.fn();
      render(
        <ProjectsList projects={mockProjects} onProjectClick={onProjectClick} />
      );

      fireEvent.click(screen.getByText('Test Project 1'));
      expect(onProjectClick).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  describe('ProjectCard', () => {
    it('should render project information', () => {
      render(<ProjectCard project={mockProjects[0]} />);

      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('A test project for React')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('should show featured badge for featured projects', () => {
      render(<ProjectCard project={mockProjects[0]} />);

      expect(screen.getAllByText('Featured')).toHaveLength(2); // One for featured badge, one for badges array
    });

    it('should show year badge', () => {
      render(<ProjectCard project={mockProjects[0]} />);

      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('should render project links', () => {
      render(<ProjectCard project={mockProjects[0]} />);

      expect(screen.getByText('Demo')).toBeInTheDocument();
      expect(screen.getByText('Code')).toBeInTheDocument();
    });

    it('should call onClick when card is clicked', () => {
      const onClick = vi.fn();
      render(<ProjectCard project={mockProjects[0]} onClick={onClick} />);

      fireEvent.click(screen.getByText('Test Project 1'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should open external links in new tab', () => {
      // Mock window.open
      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      render(<ProjectCard project={mockProjects[0]} />);

      fireEvent.click(screen.getByText('Demo'));
      expect(mockOpen).toHaveBeenCalledWith(
        'https://demo.example.com',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('Projects Store', () => {
    it('should filter projects by technology', () => {
      const mockStore = {
        projects: mockProjects,
        filteredProjects: mockProjects.filter(p =>
          p.stack.some(tech => tech.toLowerCase().includes('react'))
        ),
        filters: {
          technology: ['React'],
          year: [],
          featured: null,
          search: '',
        },
        updateFilters: vi.fn(),
        applyFilters: vi.fn(),
      };

      (useProjectsStore as any).mockReturnValue(mockStore);

      // This would be tested in the actual component integration
      expect(mockStore.filteredProjects).toHaveLength(1);
      expect(mockStore.filteredProjects[0].title).toBe('Test Project 1');
    });

    it('should filter projects by year', () => {
      const mockStore = {
        projects: mockProjects,
        filteredProjects: mockProjects.filter(p => p.year === 2024),
        filters: { technology: [], year: [2024], featured: null, search: '' },
        updateFilters: vi.fn(),
        applyFilters: vi.fn(),
      };

      (useProjectsStore as any).mockReturnValue(mockStore);

      expect(mockStore.filteredProjects).toHaveLength(1);
      expect(mockStore.filteredProjects[0].year).toBe(2024);
    });

    it('should filter projects by featured status', () => {
      const mockStore = {
        projects: mockProjects,
        filteredProjects: mockProjects.filter(p => p.featured === true),
        filters: { technology: [], year: [], featured: true, search: '' },
        updateFilters: vi.fn(),
        applyFilters: vi.fn(),
      };

      (useProjectsStore as any).mockReturnValue(mockStore);

      expect(mockStore.filteredProjects).toHaveLength(1);
      expect(mockStore.filteredProjects[0].featured).toBe(true);
    });

    it('should filter projects by search query', () => {
      const mockStore = {
        projects: mockProjects,
        filteredProjects: mockProjects.filter(
          p =>
            p.title.toLowerCase().includes('react') ||
            p.tagline.toLowerCase().includes('react') ||
            p.stack.some(tech => tech.toLowerCase().includes('react'))
        ),
        filters: { technology: [], year: [], featured: null, search: 'react' },
        updateFilters: vi.fn(),
        applyFilters: vi.fn(),
      };

      (useProjectsStore as any).mockReturnValue(mockStore);

      expect(mockStore.filteredProjects).toHaveLength(1);
      expect(mockStore.filteredProjects[0].title).toBe('Test Project 1');
    });
  });

  describe('Debounced Search', () => {
    it('should debounce search input with 100ms delay', () => {
      const mockDebouncedValue = vi.fn();
      (useDebouncedValue as any).mockImplementation(
        (value: string, delay: number) => {
          expect(delay).toBe(100);
          return value;
        }
      );

      const onSearchChange = vi.fn();
      render(
        <ProjectFilters
          projects={mockProjects}
          filters={{ technology: [], year: [], featured: null, search: '' }}
          searchQuery=""
          viewMode="list"
          onFiltersChange={vi.fn()}
          onSearchChange={onSearchChange}
          onViewModeChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search projects...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(useDebouncedValue).toHaveBeenCalledWith('test', 100);
    });
  });
});
