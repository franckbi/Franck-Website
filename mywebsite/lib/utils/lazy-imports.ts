/**
 * Centralized lazy imports for code splitting
 * This file manages all dynamic imports to ensure consistent loading behavior
 */

import { lazy } from 'react';
import type { ComponentType } from 'react';

// 3D Components - Heavy components that should be loaded on demand
export const Hero3D = lazy(() =>
  import('@/components/3d/hero-3d').then(module => ({
    default: module.Hero3D,
  }))
);

export const ProjectsScene = lazy(() =>
  import('@/components/3d/projects-scene').then(module => ({
    default: module.ProjectsScene,
  }))
);

export const OptimizedHeroScene = lazy(() =>
  import('@/components/3d/optimized-hero-scene').then(module => ({
    default: module.OptimizedHeroScene,
  }))
);

// Advanced 3D features - Only load when needed (placeholder for future implementation)
// export const PostProcessingEffects = lazy(() =>
//   import('@/components/3d/post-processing')
//     .then(module => ({
//       default: module.PostProcessingEffects,
//     }))
//     .catch(() => ({
//       // Fallback if post-processing fails to load
//       default: () => null,
//     }))
// );

// Route-based components
export const ProjectDetailPage = lazy(() =>
  import('@/components/projects/project-detail-page').then(module => ({
    default: module.ProjectDetailPage,
  }))
);

export const ContactForm = lazy(() =>
  import('@/components/contact/contact-form').then(module => ({
    default: module.ContactForm,
  }))
);

// Analytics components - Load only when needed
export const WebVitals = lazy(() =>
  import('@/components/performance/web-vitals').then(module => ({
    default: module.WebVitals,
  }))
);

// Utility function for conditional loading
export const loadConditionally = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  condition: boolean
): Promise<{ default: T | (() => null) }> => {
  if (!condition) {
    return Promise.resolve({ default: () => null });
  }
  return importFn();
};

// Preload function for critical components
export const preloadCriticalComponents = () => {
  // Preload on user interaction or after initial load
  const preloadPromises = [
    import('@/components/3d/hero-3d'),
    import('@/components/contact/contact-form'),
  ];

  return Promise.allSettled(preloadPromises);
};

// Bundle splitting configuration
export const bundleConfig = {
  // Critical path - loaded immediately
  critical: ['layout', 'theme', 'settings', 'error-boundary'],

  // Interactive - loaded on user interaction
  interactive: ['3d-components', 'contact-form', 'project-filters'],

  // Analytics - loaded after main content
  analytics: ['web-vitals', 'performance-monitor'],
} as const;
