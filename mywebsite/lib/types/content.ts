/**
 * Content type definitions for the 3D portfolio website
 * Based on requirements 5.2, 6.1, and 8.1
 */

// Media asset types
export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholder?: string;
}

export interface VideoAsset {
  src: string;
  poster?: string;
  duration?: number;
  width: number;
  height: number;
}

export type MediaAsset = ImageAsset | VideoAsset;

// 3D scene positioning
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SceneReference {
  model?: string;
  position: Vector3;
  rotation: Vector3;
  scale: number;
  animation?: string;
}

// Project data model
export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string; // Markdown content
  thumbnail: ImageAsset;
  gallery: MediaAsset[];
  stack: string[];
  role: string;
  year: number;
  links: {
    demo?: string;
    github?: string;
    case_study?: string;
  };
  badges: string[];
  priority: number;
  featured: boolean;
  sceneRef?: SceneReference;
  metadata: {
    challenge?: string;
    solution?: string;
    results?: string[];
    architecture?: string;
    highlights?: string[];
  };
}

// Skills data model
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  years: number;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

// Timeline data model
export interface TimelineItem {
  date: string; // ISO date string
  title: string;
  company: string;
  description: string;
  technologies: string[];
  type: 'work' | 'education' | 'project' | 'achievement';
}

// Content loading types
export interface ContentLoadResult<T> {
  data: T;
  error: null;
}

export interface ContentLoadError {
  data: null;
  error: {
    message: string;
    code: 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'NOT_FOUND';
  };
}

export type ContentResult<T> = ContentLoadResult<T> | ContentLoadError;

// Filter types for projects
export interface ProjectFilters {
  technology: string[];
  year: number[];
  featured: boolean | null;
  search?: string;
}
