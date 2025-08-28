/**
 * Unit tests for content loading utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  filterProjects,
  getUniqueTechnologies,
  getUniqueYears,
  sortTimelineByDate,
} from '../lib/utils/content-loader';
import type { ProjectData, TimelineItemData } from '../lib/validation/schemas';

// Mock data for testing
const mockProjects: ProjectData[] = [
  {
    slug: 'react-app',
    title: 'React Application',
    tagline: 'Modern React app',
    description: 'A modern React application with TypeScript',
    thumbnail: {
      src: 'https://example.com/react.jpg',
      alt: 'React app',
      width: 800,
      height: 600,
    },
    gallery: [
      {
        src: 'https://example.com/react-gallery.jpg',
        alt: 'React gallery',
        width: 1920,
        height: 1080,
      },
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
    role: 'Frontend Developer',
    year: 2024,
    links: {},
    badges: ['Frontend'],
    priority: 1,
    featured: true,
    metadata: {},
  },
  {
    slug: 'node-api',
    title: 'Node.js API',
    tagline: 'RESTful API service',
    description: 'A RESTful API built with Node.js and Express',
    thumbnail: {
      src: 'https://example.com/node.jpg',
      alt: 'Node API',
      width: 800,
      height: 600,
    },
    gallery: [
      {
        src: 'https://example.com/node-gallery.jpg',
        alt: 'Node gallery',
        width: 1920,
        height: 1080,
      },
    ],
    stack: ['Node.js', 'Express', 'PostgreSQL'],
    role: 'Backend Developer',
    year: 2023,
    links: {},
    badges: ['Backend', 'API'],
    priority: 2,
    featured: false,
    metadata: {},
  },
  {
    slug: 'fullstack-app',
    title: 'Full-Stack Application',
    tagline: 'Complete web application',
    description: 'A full-stack web application with React and Node.js',
    thumbnail: {
      src: 'https://example.com/fullstack.jpg',
      alt: 'Full-stack app',
      width: 800,
      height: 600,
    },
    gallery: [
      {
        src: 'https://example.com/fullstack-gallery.jpg',
        alt: 'Full-stack gallery',
        width: 1920,
        height: 1080,
      },
    ],
    stack: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    role: 'Full-Stack Developer',
    year: 2023,
    links: {},
    badges: ['Full-Stack'],
    priority: 3,
    featured: true,
    metadata: {},
  },
];

const mockTimeline: TimelineItemData[] = [
  {
    date: '2024-01-01T00:00:00.000Z',
    title: 'Senior Developer',
    company: 'Tech Corp',
    description: 'Senior development role',
    technologies: ['React', 'TypeScript'],
    type: 'work',
  },
  {
    date: '2023-06-01T00:00:00.000Z',
    title: 'Project Launch',
    company: 'Personal',
    description: 'Launched personal project',
    technologies: ['Node.js'],
    type: 'project',
  },
  {
    date: '2023-01-01T00:00:00.000Z',
    title: 'Junior Developer',
    company: 'StartupXYZ',
    description: 'Junior development role',
    technologies: ['JavaScript'],
    type: 'work',
  },
];

describe('Content Loader Utilities', () => {
  describe('filterProjects', () => {
    it('should return all projects when no filters applied', () => {
      const result = filterProjects(mockProjects, {});
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockProjects);
    });

    it('should filter projects by technology', () => {
      const result = filterProjects(mockProjects, {
        technology: ['React'],
      });

      expect(result).toHaveLength(2);
      expect(result.every(p => p.stack.includes('React'))).toBe(true);
    });

    it('should filter projects by multiple technologies', () => {
      const result = filterProjects(mockProjects, {
        technology: ['React', 'Node.js'],
      });

      // Should return projects that have either React OR Node.js
      expect(result).toHaveLength(3);
    });

    it('should filter projects by year', () => {
      const result = filterProjects(mockProjects, {
        year: [2024],
      });

      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(2024);
    });

    it('should filter projects by featured status', () => {
      const featuredResult = filterProjects(mockProjects, {
        featured: true,
      });

      const nonFeaturedResult = filterProjects(mockProjects, {
        featured: false,
      });

      expect(featuredResult).toHaveLength(2);
      expect(featuredResult.every(p => p.featured)).toBe(true);

      expect(nonFeaturedResult).toHaveLength(1);
      expect(nonFeaturedResult.every(p => !p.featured)).toBe(true);
    });

    it('should filter projects by search term', () => {
      const result = filterProjects(mockProjects, {
        search: 'React',
      });

      expect(result).toHaveLength(2);
      expect(
        result.every(
          p =>
            p.title.toLowerCase().includes('react') ||
            p.description.toLowerCase().includes('react') ||
            p.stack.some(tech => tech.toLowerCase().includes('react'))
        )
      ).toBe(true);
    });

    it('should apply multiple filters simultaneously', () => {
      const result = filterProjects(mockProjects, {
        technology: ['React'],
        year: [2024],
        featured: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('react-app');
    });

    it('should handle case-insensitive search', () => {
      const result = filterProjects(mockProjects, {
        search: 'REACT',
      });

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no projects match filters', () => {
      const result = filterProjects(mockProjects, {
        technology: ['Python'], // No projects use Python
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('getUniqueTechnologies', () => {
    it('should return unique technologies from all projects', () => {
      const result = getUniqueTechnologies(mockProjects);

      const expected = [
        'Express',
        'MongoDB',
        'Node.js',
        'PostgreSQL',
        'React',
        'Tailwind CSS',
        'TypeScript',
      ];

      expect(result).toEqual(expected);
    });

    it('should return empty array for empty projects array', () => {
      const result = getUniqueTechnologies([]);
      expect(result).toEqual([]);
    });

    it('should handle projects with no stack', () => {
      const projectsWithEmptyStack = [
        {
          ...mockProjects[0],
          stack: [],
        },
      ];

      const result = getUniqueTechnologies(projectsWithEmptyStack);
      expect(result).toEqual([]);
    });
  });

  describe('getUniqueYears', () => {
    it('should return unique years from all projects in descending order', () => {
      const result = getUniqueYears(mockProjects);

      expect(result).toEqual([2024, 2023]);
    });

    it('should return empty array for empty projects array', () => {
      const result = getUniqueYears([]);
      expect(result).toEqual([]);
    });

    it('should handle duplicate years', () => {
      const projectsWithDuplicateYears = [
        { ...mockProjects[0], year: 2023 },
        { ...mockProjects[1], year: 2023 },
        { ...mockProjects[2], year: 2024 },
      ];

      const result = getUniqueYears(projectsWithDuplicateYears);
      expect(result).toEqual([2024, 2023]);
    });
  });

  describe('sortTimelineByDate', () => {
    it('should sort timeline items by date in descending order', () => {
      const result = sortTimelineByDate(mockTimeline);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-01-01T00:00:00.000Z');
      expect(result[1].date).toBe('2023-06-01T00:00:00.000Z');
      expect(result[2].date).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should not mutate the original array', () => {
      const originalOrder = [...mockTimeline];
      const result = sortTimelineByDate(mockTimeline);

      expect(mockTimeline).toEqual(originalOrder);
      expect(result).not.toBe(mockTimeline);
    });

    it('should handle empty timeline array', () => {
      const result = sortTimelineByDate([]);
      expect(result).toEqual([]);
    });

    it('should handle single item timeline', () => {
      const singleItem = [mockTimeline[0]];
      const result = sortTimelineByDate(singleItem);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTimeline[0]);
    });
  });
});
