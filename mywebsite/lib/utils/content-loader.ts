/**
 * Content loading utilities with validation and error handling
 * Provides type-safe loading of JSON content with Zod validation
 */

import { z } from 'zod';
import type { ContentResult } from '../types/content';
import {
  ProjectsSchema,
  SkillCategoriesSchema,
  TimelineSchema,
  type ProjectData,
  type SkillCategoryData,
  type TimelineItemData,
} from '../validation/schemas';

/**
 * Simple in-memory cache for loaded content to avoid repeated fetches in tests/runtime
 */
const contentCache = new Map<string, unknown>();

async function loadContent<T>(
  pathStr: string,
  schema: z.ZodSchema<T>
): Promise<ContentResult<T>> {
  try {
    // Return from cache if present
    if (contentCache.has(pathStr)) {
      return {
        data: contentCache.get(pathStr) as T,
        error: null,
      };
    }

    // If running on the server and the path points to a local public asset, read from disk first.
    if (typeof window === 'undefined' && pathStr.startsWith('/')) {
      try {
        const { readFile } = await import('fs/promises');
        const pathMod = await import('path');
        const relativePath = pathStr.startsWith('/')
          ? pathStr.slice(1)
          : pathStr;
        const filePath = pathMod.join(process.cwd(), 'public', relativePath);
        const fileContents = await readFile(filePath, 'utf-8');
        const rawData = JSON.parse(fileContents);
        const validatedData = schema.parse(rawData);

        // Store in cache
        contentCache.set(pathStr, validatedData as unknown);

        return {
          data: validatedData,
          error: null,
        };
      } catch (err) {
        // If file read or parse fails, we'll fall back to trying a network fetch below.
        // Keep going to the fetch logic so non-file-backed paths still work.
      }
    }

    // Build fetch path. When on the server and a leading-slash path is used, prefer NEXT_PUBLIC_SITE_URL
    let fetchPath = pathStr;

    if (typeof window === 'undefined' && pathStr.startsWith('/')) {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      try {
        fetchPath = new URL(pathStr, base).toString();
      } catch {
        fetchPath = base + pathStr;
      }
    }

    const response = await fetch(fetchPath);

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: `Failed to load content: ${response.status} ${response.statusText}`,
          code: response.status === 404 ? 'NOT_FOUND' : 'NETWORK_ERROR',
        },
      };
    }

    const rawData = await response.json();

    // Validate the data against the schema
    const validatedData = schema.parse(rawData);

    // Store in cache
    contentCache.set(pathStr, validatedData as unknown);

    return {
      data: validatedData,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: {
          message: `Validation error: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (error instanceof SyntaxError) {
      return {
        data: null,
        error: {
          message: 'Invalid JSON format',
          code: 'PARSE_ERROR',
        },
      };
    }

    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

/**
 * Load and validate projects data
 */
export async function loadProjects(): Promise<ContentResult<ProjectData[]>> {
  return loadContent('/data/projects.json', ProjectsSchema);
}

/**
 * Load and validate skills data
 */
export async function loadSkills(): Promise<
  ContentResult<SkillCategoryData[]>
> {
  return loadContent('/data/skills.json', SkillCategoriesSchema);
}

/**
 * Load and validate timeline data
 */
export async function loadTimeline(): Promise<
  ContentResult<TimelineItemData[]>
> {
  return loadContent('/data/timeline.json', TimelineSchema);
}

/**
 * Load a single project by slug
 */
export async function loadProject(
  slug: string
): Promise<ContentResult<ProjectData | null>> {
  const projectsResult = await loadProjects();

  if (projectsResult.error) {
    return projectsResult as ContentResult<ProjectData | null>;
  }

  const project = projectsResult.data.find(p => p.slug === slug);

  if (!project) {
    return {
      data: null,
      error: {
        message: `Project with slug "${slug}" not found`,
        code: 'NOT_FOUND',
      },
    };
  }

  return {
    data: project,
    error: null,
  };
}

/**
 * Get featured projects
 */
export async function loadFeaturedProjects(): Promise<
  ContentResult<ProjectData[]>
> {
  const projectsResult = await loadProjects();

  if (projectsResult.error) {
    return projectsResult;
  }

  const featuredProjects = projectsResult.data
    .filter(project => project.featured)
    .sort((a, b) => a.priority - b.priority);

  return {
    data: featuredProjects,
    error: null,
  };
}

/**
 * Filter projects based on criteria
 */
export function filterProjects(
  projects: ProjectData[],
  filters: {
    technology?: string[];
    year?: number[];
    featured?: boolean | null;
    search?: string;
  }
): ProjectData[] {
  return projects.filter(project => {
    // Technology filter
    if (filters.technology && filters.technology.length > 0) {
      const hasMatchingTech = filters.technology.some(tech =>
        project.stack.some(stackItem =>
          stackItem.toLowerCase().includes(tech.toLowerCase())
        )
      );
      if (!hasMatchingTech) return false;
    }

    // Year filter
    if (filters.year && filters.year.length > 0) {
      if (!filters.year.includes(project.year)) return false;
    }

    // Featured filter
    if (filters.featured !== null && filters.featured !== undefined) {
      if (project.featured !== filters.featured) return false;
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        project.title,
        project.tagline,
        project.description,
        project.role,
        ...project.stack,
        ...project.badges,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(searchTerm)) return false;
    }

    return true;
  });
}

/**
 * Get unique technologies from all projects
 */
export function getUniqueTechnologies(projects: ProjectData[]): string[] {
  const technologies = new Set<string>();

  projects.forEach(project => {
    project.stack.forEach(tech => technologies.add(tech));
  });

  return Array.from(technologies).sort();
}

/**
 * Get unique years from all projects
 */
export function getUniqueYears(projects: ProjectData[]): number[] {
  const years = new Set<number>();

  projects.forEach(project => {
    years.add(project.year);
  });

  return Array.from(years).sort((a, b) => b - a); // Most recent first
}

/**
 * Sort timeline items by date (most recent first)
 */
export function sortTimelineByDate(
  timeline: TimelineItemData[]
): TimelineItemData[] {
  return [...timeline].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
