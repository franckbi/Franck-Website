/**
 * Zod validation schemas for content data models
 * Ensures data integrity and type safety for JSON content
 */

import { z } from 'zod';

// Base schemas for reusable types
const Vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

const ImageAssetSchema = z.object({
  src: z
    .string()
    .min(1, 'Image source is required')
    .refine(val => {
      // Allow relative paths (starting with /) or valid URLs
      return val.startsWith('/') || z.string().url().safeParse(val).success;
    }, 'Invalid image URL or path'),
  alt: z.string().min(1, 'Alt text is required'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  placeholder: z.string().optional(),
});

const VideoAssetSchema = z.object({
  src: z
    .string()
    .min(1, 'Video source is required')
    .refine(val => {
      // Allow relative paths (starting with /) or valid URLs
      return val.startsWith('/') || z.string().url().safeParse(val).success;
    }, 'Invalid video URL or path'),
  poster: z
    .string()
    .optional()
    .refine(val => {
      // Allow empty, relative paths, or valid URLs
      return (
        !val || val.startsWith('/') || z.string().url().safeParse(val).success
      );
    }, 'Invalid poster URL or path'),
  duration: z.number().positive().optional(),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
});

const MediaAssetSchema = z.union([ImageAssetSchema, VideoAssetSchema]);

const SceneReferenceSchema = z.object({
  model: z.string().optional(),
  position: Vector3Schema,
  rotation: Vector3Schema,
  scale: z.number().positive('Scale must be positive'),
  animation: z.string().optional(),
});

// Project schema
export const ProjectSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  tagline: z
    .string()
    .min(1, 'Tagline is required')
    .max(200, 'Tagline too long'),
  description: z.string().min(1, 'Description is required'),
  thumbnail: ImageAssetSchema,
  gallery: z
    .array(MediaAssetSchema)
    .min(1, 'At least one gallery item required'),
  stack: z.array(z.string().min(1)).min(1, 'At least one technology required'),
  role: z.string().min(1, 'Role is required'),
  year: z
    .number()
    .int('Year must be an integer')
    .min(2000, 'Year too early')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  links: z.object({
    demo: z.string().url('Invalid demo URL').optional(),
    github: z.string().url('Invalid GitHub URL').optional(),
    case_study: z
      .string()
      .optional()
      .refine(val => {
        // Allow empty, relative paths, or valid URLs
        return (
          !val || val.startsWith('/') || z.string().url().safeParse(val).success
        );
      }, 'Invalid case study URL or path'),
  }),
  badges: z.array(z.string()),
  priority: z.number().int().min(1, 'Priority must be at least 1'),
  featured: z.boolean(),
  sceneRef: SceneReferenceSchema.optional(),
  metadata: z.object({
    challenge: z.string().optional(),
    solution: z.string().optional(),
    results: z.array(z.string()).optional(),
    architecture: z.string().optional(),
    highlights: z.array(z.string()).optional(),
  }),
});

// Skill schemas
const SkillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: SkillLevelSchema,
  years: z
    .number()
    .int()
    .min(0, 'Years cannot be negative')
    .max(50, 'Years too high'),
});

export const SkillCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  skills: z.array(SkillSchema).min(1, 'At least one skill required'),
});

// Timeline schema
const TimelineTypeSchema = z.enum([
  'work',
  'education',
  'project',
  'achievement',
]);

export const TimelineItemSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string().min(1)),
  type: TimelineTypeSchema,
});

// Array schemas for collections
export const ProjectsSchema = z.array(ProjectSchema);
export const SkillCategoriesSchema = z.array(SkillCategorySchema);
export const TimelineSchema = z.array(TimelineItemSchema);

// Filter schemas
export const ProjectFiltersSchema = z.object({
  technology: z.array(z.string()).default([]),
  year: z.array(z.number().int()).default([]),
  featured: z.boolean().nullable().default(null),
  search: z.string().optional(),
});

// Contact form schema
export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .refine(val => val.length > 0, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  // Honeypot field for spam protection
  website: z.string().max(0, 'Spam detected').optional(),
});

// Export types inferred from schemas
export type ProjectData = z.infer<typeof ProjectSchema>;
export type SkillCategoryData = z.infer<typeof SkillCategorySchema>;
export type TimelineItemData = z.infer<typeof TimelineItemSchema>;
export type ProjectFiltersData = z.infer<typeof ProjectFiltersSchema>;
export type ContactFormData = z.infer<typeof ContactFormSchema>;
