/**
 * Unit tests for content validation schemas and utilities
 */

import { describe, it, expect } from 'vitest';
import {
  ProjectSchema,
  SkillCategorySchema,
  TimelineItemSchema,
  ProjectsSchema,
  SkillCategoriesSchema,
  TimelineSchema,
} from '../lib/validation/schemas';
import type {
  ProjectData,
  SkillCategoryData,
  TimelineItemData,
} from '../lib/validation/schemas';

describe('Content Validation Schemas', () => {
  describe('ProjectSchema', () => {
    const validProject: ProjectData = {
      slug: 'test-project',
      title: 'Test Project',
      tagline: 'A test project for validation',
      description: 'This is a test project description',
      thumbnail: {
        src: 'https://example.com/image.jpg',
        alt: 'Test image',
        width: 800,
        height: 600,
      },
      gallery: [
        {
          src: 'https://example.com/gallery1.jpg',
          alt: 'Gallery image 1',
          width: 1920,
          height: 1080,
        },
      ],
      stack: ['React', 'TypeScript'],
      role: 'Full-Stack Developer',
      year: 2024,
      links: {
        demo: 'https://example.com/demo',
        github: 'https://github.com/user/repo',
      },
      badges: ['Featured'],
      priority: 1,
      featured: true,
      metadata: {
        challenge: 'Test challenge',
        solution: 'Test solution',
      },
    };

    it('should validate a correct project', () => {
      expect(() => ProjectSchema.parse(validProject)).not.toThrow();
    });

    it('should reject project with invalid slug', () => {
      const invalidProject = { ...validProject, slug: 'Invalid Slug!' };
      expect(() => ProjectSchema.parse(invalidProject)).toThrow();
    });

    it('should reject project with empty title', () => {
      const invalidProject = { ...validProject, title: '' };
      expect(() => ProjectSchema.parse(invalidProject)).toThrow();
    });

    it('should reject project with invalid year', () => {
      const invalidProject = { ...validProject, year: 1999 };
      expect(() => ProjectSchema.parse(invalidProject)).toThrow();
    });

    it('should reject project with invalid image URL', () => {
      const invalidProject = {
        ...validProject,
        thumbnail: { ...validProject.thumbnail, src: 'not-a-url' },
      };
      expect(() => ProjectSchema.parse(invalidProject)).toThrow();
    });

    it('should reject project with negative image dimensions', () => {
      const invalidProject = {
        ...validProject,
        thumbnail: { ...validProject.thumbnail, width: -100 },
      };
      expect(() => ProjectSchema.parse(invalidProject)).toThrow();
    });

    it('should accept project without optional fields', () => {
      const minimalProject = {
        slug: 'minimal-project',
        title: 'Minimal Project',
        tagline: 'A minimal project',
        description: 'Minimal description',
        thumbnail: {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          width: 800,
          height: 600,
        },
        gallery: [
          {
            src: 'https://example.com/gallery1.jpg',
            alt: 'Gallery image 1',
            width: 1920,
            height: 1080,
          },
        ],
        stack: ['React'],
        role: 'Developer',
        year: 2024,
        links: {},
        badges: [],
        priority: 1,
        featured: false,
        metadata: {},
      };

      expect(() => ProjectSchema.parse(minimalProject)).not.toThrow();
    });
  });

  describe('SkillCategorySchema', () => {
    const validSkillCategory: SkillCategoryData = {
      name: 'Frontend Development',
      skills: [
        {
          name: 'React',
          level: 'expert',
          years: 5,
        },
        {
          name: 'TypeScript',
          level: 'advanced',
          years: 3,
        },
      ],
    };

    it('should validate a correct skill category', () => {
      expect(() => SkillCategorySchema.parse(validSkillCategory)).not.toThrow();
    });

    it('should reject skill category with empty name', () => {
      const invalidCategory = { ...validSkillCategory, name: '' };
      expect(() => SkillCategorySchema.parse(invalidCategory)).toThrow();
    });

    it('should reject skill category with empty skills array', () => {
      const invalidCategory = { ...validSkillCategory, skills: [] };
      expect(() => SkillCategorySchema.parse(invalidCategory)).toThrow();
    });

    it('should reject skill with invalid level', () => {
      const invalidCategory = {
        ...validSkillCategory,
        skills: [
          {
            name: 'React',
            level: 'master' as any, // Invalid level
            years: 5,
          },
        ],
      };
      expect(() => SkillCategorySchema.parse(invalidCategory)).toThrow();
    });

    it('should reject skill with negative years', () => {
      const invalidCategory = {
        ...validSkillCategory,
        skills: [
          {
            name: 'React',
            level: 'expert',
            years: -1,
          },
        ],
      };
      expect(() => SkillCategorySchema.parse(invalidCategory)).toThrow();
    });
  });

  describe('TimelineItemSchema', () => {
    const validTimelineItem: TimelineItemData = {
      date: '2024-01-01',
      title: 'Senior Developer',
      company: 'Tech Corp',
      description: 'Working as a senior developer',
      technologies: ['React', 'Node.js'],
      type: 'work',
    };

    it('should validate a correct timeline item', () => {
      expect(() => TimelineItemSchema.parse(validTimelineItem)).not.toThrow();
    });

    it('should reject timeline item with invalid date', () => {
      const invalidItem = { ...validTimelineItem, date: 'invalid-date' };
      expect(() => TimelineItemSchema.parse(invalidItem)).toThrow();
    });

    it('should reject timeline item with empty title', () => {
      const invalidItem = { ...validTimelineItem, title: '' };
      expect(() => TimelineItemSchema.parse(invalidItem)).toThrow();
    });

    it('should reject timeline item with invalid type', () => {
      const invalidItem = { ...validTimelineItem, type: 'invalid' as any };
      expect(() => TimelineItemSchema.parse(invalidItem)).toThrow();
    });

    it('should accept all valid timeline types', () => {
      const types = ['work', 'education', 'project', 'achievement'];

      types.forEach(type => {
        const item = { ...validTimelineItem, type: type as any };
        expect(() => TimelineItemSchema.parse(item)).not.toThrow();
      });
    });
  });

  describe('Array Schemas', () => {
    it('should validate array of projects', () => {
      const projects = [
        {
          slug: 'project-1',
          title: 'Project 1',
          tagline: 'First project',
          description: 'Description 1',
          thumbnail: {
            src: 'https://example.com/image1.jpg',
            alt: 'Image 1',
            width: 800,
            height: 600,
          },
          gallery: [
            {
              src: 'https://example.com/gallery1.jpg',
              alt: 'Gallery 1',
              width: 1920,
              height: 1080,
            },
          ],
          stack: ['React'],
          role: 'Developer',
          year: 2024,
          links: {},
          badges: [],
          priority: 1,
          featured: true,
          metadata: {},
        },
      ];

      expect(() => ProjectsSchema.parse(projects)).not.toThrow();
    });

    it('should validate array of skill categories', () => {
      const categories = [
        {
          name: 'Frontend',
          skills: [
            {
              name: 'React',
              level: 'expert',
              years: 5,
            },
          ],
        },
      ];

      expect(() => SkillCategoriesSchema.parse(categories)).not.toThrow();
    });

    it('should validate array of timeline items', () => {
      const timeline = [
        {
          date: '2024-01-01',
          title: 'Developer',
          company: 'Tech Corp',
          description: 'Working as developer',
          technologies: ['React'],
          type: 'work',
        },
      ];

      expect(() => TimelineSchema.parse(timeline)).not.toThrow();
    });
  });
});
