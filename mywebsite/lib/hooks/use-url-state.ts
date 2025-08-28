import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { ProjectFilters } from '@/lib/types/content';

interface UseUrlStateOptions {
  onFiltersChange?: (filters: Partial<ProjectFilters>) => void;
  onViewModeChange?: (mode: '3d' | 'list') => void;
  onSearchChange?: (search: string) => void;
}

export function useUrlState(options: UseUrlStateOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters into state
  const parseUrlState = useCallback(() => {
    const technology =
      searchParams.get('tech')?.split(',').filter(Boolean) || [];
    const year =
      searchParams.get('year')?.split(',').map(Number).filter(Boolean) || [];
    const featured =
      searchParams.get('featured') === 'true'
        ? true
        : searchParams.get('featured') === 'false'
          ? false
          : null;
    const search = searchParams.get('search') || '';
    const viewMode = (searchParams.get('view') as '3d' | 'list') || '3d';

    return {
      filters: { technology, year, featured, search },
      viewMode,
      search,
    };
  }, [searchParams]);

  // Update URL with current state
  const updateUrl = useCallback(
    (updates: {
      filters?: Partial<ProjectFilters>;
      viewMode?: '3d' | 'list';
      search?: string;
    }) => {
      const current = parseUrlState();
      const params = new URLSearchParams();

      // Merge current state with updates
      const newFilters = { ...current.filters, ...updates.filters };
      const newViewMode = updates.viewMode || current.viewMode;
      const newSearch =
        updates.search !== undefined ? updates.search : current.search;

      // Set URL parameters
      if (newFilters.technology.length > 0) {
        params.set('tech', newFilters.technology.join(','));
      }

      if (newFilters.year.length > 0) {
        params.set('year', newFilters.year.join(','));
      }

      if (newFilters.featured !== null) {
        params.set('featured', String(newFilters.featured));
      }

      if (newSearch.trim()) {
        params.set('search', newSearch);
      }

      if (newViewMode !== '3d') {
        params.set('view', newViewMode);
      }

      // Update URL without page reload
      const newUrl = params.toString() ? `?${params.toString()}` : '/projects';
      router.replace(newUrl, { scroll: false });
    },
    [router, parseUrlState]
  );

  // Initialize state from URL on mount
  useEffect(() => {
    const urlState = parseUrlState();

    if (options.onFiltersChange) {
      options.onFiltersChange(urlState.filters);
    }

    if (options.onViewModeChange) {
      options.onViewModeChange(urlState.viewMode);
    }

    if (options.onSearchChange) {
      options.onSearchChange(urlState.search);
    }
  }, [parseUrlState, options]);

  return {
    updateUrl,
    parseUrlState,
  };
}
