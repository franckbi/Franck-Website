'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Grid3X3, List } from 'lucide-react';
import { Project, type ProjectFilters } from '@/lib/types/content';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

interface ProjectFiltersProps {
  projects: Project[];
  filters: ProjectFilters;
  searchQuery: string;
  viewMode: '3d' | 'list';
  onFiltersChange: (filters: Partial<ProjectFilters>) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: '3d' | 'list') => void;
  onClearFilters: () => void;
  className?: string;
}

export function ProjectFilters({
  projects,
  filters,
  searchQuery,
  viewMode,
  onFiltersChange,
  onSearchChange,
  onViewModeChange,
  onClearFilters,
  className = '',
}: ProjectFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search query as per requirements (100ms delay)
  const debouncedSearchQuery = useDebouncedValue(localSearchQuery, 100);

  // Update parent when debounced value changes
  React.useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  // Extract available filter options from projects
  const filterOptions = useMemo(() => {
    const technologies = new Set<string>();
    const years = new Set<number>();

    projects.forEach(project => {
      project.stack.forEach(tech => technologies.add(tech));
      years.add(project.year);
    });

    return {
      technologies: Array.from(technologies).sort(),
      years: Array.from(years).sort((a, b) => b - a),
    };
  }, [projects]);

  const hasActiveFilters =
    filters.technology.length > 0 ||
    filters.year.length > 0 ||
    filters.featured !== null ||
    searchQuery.trim().length > 0;

  const handleTechnologyToggle = (tech: string) => {
    const newTech = filters.technology.includes(tech)
      ? filters.technology.filter(t => t !== tech)
      : [...filters.technology, tech];
    onFiltersChange({ technology: newTech });
  };

  const handleYearToggle = (year: number) => {
    const newYears = filters.year.includes(year)
      ? filters.year.filter(y => y !== year)
      : [...filters.year, year];
    onFiltersChange({ year: newYears });
  };

  const handleFeaturedToggle = () => {
    const newFeatured = filters.featured === true ? null : true;
    onFiltersChange({ featured: newFeatured });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and View Toggle Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={localSearchQuery}
            onChange={e => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            aria-label="Search projects"
          />
          {localSearchQuery && (
            <button
              onClick={() => {
                setLocalSearchQuery('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle and Filter Button */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md p-1 bg-muted">
            <button
              onClick={() => onViewModeChange('3d')}
              className={`p-2 rounded transition-colors ${
                viewMode === '3d'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="3D Grid View"
              title="3D Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="List View"
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-md transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground hover:bg-muted'
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-background/20 text-xs px-1.5 py-0.5 rounded-full">
                {filters.technology.length +
                  filters.year.length +
                  (filters.featured ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filter Projects</h3>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Technology Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Technology</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.technologies.map(tech => (
                <button
                  key={tech}
                  onClick={() => handleTechnologyToggle(tech)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.technology.includes(tech)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-muted'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.years.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearToggle(year)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.year.includes(year)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-input hover:bg-muted'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Special</label>
            <div className="flex gap-2">
              <button
                onClick={handleFeaturedToggle}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filters.featured === true
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-muted'
                }`}
              >
                Featured Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
