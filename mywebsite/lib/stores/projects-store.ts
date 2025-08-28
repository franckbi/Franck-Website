import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, ProjectFilters } from '@/lib/types/content';

interface ProjectsState {
  // Projects data
  projects: Project[];
  filteredProjects: Project[];

  // View state
  viewMode: '3d' | 'list';

  // Filter state
  filters: ProjectFilters;
  searchQuery: string;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setViewMode: (mode: '3d' | 'list') => void;
  updateFilters: (filters: Partial<ProjectFilters>) => void;
  setSearchQuery: (query: string) => void;
  setSearchQueryImmediate: (query: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: ProjectFilters = {
  technology: [],
  year: [],
  featured: null,
  search: '',
};

// Debounce helper
let searchTimeout: NodeJS.Timeout | null = null;

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      filteredProjects: [],
      viewMode: '3d',
      filters: initialFilters,
      searchQuery: '',
      isLoading: false,
      error: null,

      setProjects: (projects: Project[]) => {
        set({ projects });
        get().applyFilters();
      },

      setViewMode: (mode: '3d' | 'list') => {
        set({ viewMode: mode });
      },

      updateFilters: (newFilters: Partial<ProjectFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      setSearchQuery: (query: string) => {
        // Clear existing timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        // Update search query immediately for UI responsiveness
        set({ searchQuery: query });

        // Debounce the filtering
        searchTimeout = setTimeout(() => {
          get().applyFilters();
        }, 100);
      },

      setSearchQueryImmediate: (query: string) => {
        set({ searchQuery: query });
        get().applyFilters();
      },

      clearFilters: () => {
        // Clear any pending search timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        set({
          filters: { ...initialFilters, search: '' },
          searchQuery: '',
        });
        get().applyFilters();
      },

      applyFilters: () => {
        const { projects, filters, searchQuery } = get();

        let filtered = [...projects];

        // Apply technology filter
        if (filters.technology.length > 0) {
          filtered = filtered.filter(project =>
            filters.technology.some(tech =>
              project.stack.some(stackItem =>
                stackItem.toLowerCase().includes(tech.toLowerCase())
              )
            )
          );
        }

        // Apply year filter
        if (filters.year.length > 0) {
          filtered = filtered.filter(project =>
            filters.year.includes(project.year)
          );
        }

        // Apply featured filter
        if (filters.featured !== null) {
          filtered = filtered.filter(
            project => project.featured === filters.featured
          );
        }

        // Apply search filter (use searchQuery instead of filters.search)
        const searchTerm = searchQuery.trim() || filters.search?.trim() || '';
        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          filtered = filtered.filter(
            project =>
              project.title.toLowerCase().includes(query) ||
              project.tagline.toLowerCase().includes(query) ||
              project.description.toLowerCase().includes(query) ||
              project.stack.some(tech => tech.toLowerCase().includes(query)) ||
              project.badges.some(badge => badge.toLowerCase().includes(query))
          );
        }

        // Sort by priority and year
        filtered.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return b.year - a.year;
        });

        set({ filteredProjects: filtered });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'projects-store',
      partialize: state => ({
        viewMode: state.viewMode,
        filters: state.filters,
      }),
    }
  )
);
