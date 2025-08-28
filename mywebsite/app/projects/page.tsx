'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types/content';
import type { ProjectData } from '@/lib/validation/schemas';
import { useProjectsStore } from '@/lib/stores/projects-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { loadProjects } from '@/lib/utils/content-loader';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectsList } from '@/components/projects/projects-list';
import { ProjectsScene } from '@/components/3d/projects-scene';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui';

function ProjectsContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Store state
  const {
    projects,
    filteredProjects,
    viewMode,
    filters,
    searchQuery,
    isLoading,
    error,
    setProjects,
    setViewMode,
    updateFilters,
    setSearchQuery,
    clearFilters,
    setLoading,
    setError,
  } = useProjectsStore();

  const { lowPowerMode } = useSettingsStore();

  // URL state management
  const { updateUrl } = useUrlState({
    onFiltersChange: urlFilters => {
      updateFilters(urlFilters);
    },
    onViewModeChange: mode => {
      setViewMode(mode);
    },
    onSearchChange: search => {
      setSearchQuery(search);
    },
  });

  // Load projects data
  useEffect(() => {
    const loadProjectsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await loadProjects();

        if (result.error) {
          setError(result.error.message);
        } else {
          // Convert ProjectData to Project type
          setProjects(result.data as Project[]);
        }
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectsData();
  }, [setProjects, setLoading, setError]);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-switch to list view in low power mode
  useEffect(() => {
    if (lowPowerMode && viewMode === '3d') {
      setViewMode('list');
      updateUrl({ viewMode: 'list' });
    }
  }, [lowPowerMode, viewMode, setViewMode, updateUrl]);

  // Handle project navigation
  const handleProjectClick = (project: Project) => {
    router.push(`/projects/${project.slug}`);
  };

  // Handle filter changes with URL updates
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
    updateUrl({ filters: newFilters });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrl({ search: query });
  };

  const handleViewModeChange = (mode: '3d' | 'list') => {
    setViewMode(mode);
    updateUrl({ viewMode: mode });
  };

  const handleClearFilters = () => {
    clearFilters();
    updateUrl({
      filters: { technology: [], year: [], featured: null, search: '' },
      search: '',
    });
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Projects</h1>
          <div className="text-red-500">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore my portfolio of projects and work. Switch between 3D and
            list views, filter by technology or year, and search to find
            specific projects.
          </p>
        </div>

        {/* Filters */}
        <ProjectFilters
          projects={projects}
          filters={filters}
          searchQuery={searchQuery}
          viewMode={viewMode}
          onFiltersChange={handleFiltersChange}
          onSearchChange={handleSearchChange}
          onViewModeChange={handleViewModeChange}
          onClearFilters={handleClearFilters}
        />

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {isLoading
            ? 'Loading projects...'
            : `Showing ${filteredProjects.length} of ${projects.length} projects`}
        </div>

        {/* Projects Display */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : viewMode === '3d' && !lowPowerMode ? (
          <ErrorBoundary
            fallback={
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  3D view is not available. Switching to list view.
                </p>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Switch to List View
                </button>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-[600px]">
                  <LoadingSpinner />
                </div>
              }
            >
              <ProjectsScene
                projects={filteredProjects}
                onProjectClick={handleProjectClick}
                className="rounded-lg border bg-card"
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <ProjectsList
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
          />
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          </div>
        }
      >
        <ProjectsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
