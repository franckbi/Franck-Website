'use client';

import { useState, useEffect, useRef } from 'react';
import { Lazy3DWrapper } from './lazy-3d-wrapper';
import { CanvasWrapper } from './canvas-wrapper';
import { HeroScene } from './hero-scene';
import { ProjectTooltip } from './project-tooltip';
import { ProjectQuickPanel } from './project-quick-panel';
import {
  announceToScreenReader,
  createSemanticEquivalent,
  describe3DContent,
  KeyboardNavigationManager,
  FocusManager,
} from '@/lib/utils/accessibility';
import { useSettingsStore } from '@/lib/stores/settings-store';

import type { ProjectData } from '@/lib/validation/schemas';

type Project = ProjectData;

interface Hero3DProps {
  projects: Project[];
  className?: string;
}

export function Hero3D({ projects, className = '' }: Hero3DProps) {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [focusedProject, setFocusedProject] = useState<Project | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const keyboardNavRef = useRef<KeyboardNavigationManager | null>(null);
  const focusManagerRef = useRef<FocusManager>(new FocusManager());
  const { reducedMotion } = useSettingsStore();

  // Filter featured projects for 3D scene
  const featuredProjects = projects
    .filter(p => p.sceneRef && p.featured)
    .slice(0, 3);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Show/hide tooltip with delay
  useEffect(() => {
    if (hoveredProject) {
      const timer = setTimeout(() => setTooltipVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setTooltipVisible(false);
    }
  }, [hoveredProject]);

  const handleProjectHover = (project: Project | null) => {
    setHoveredProject(project);
  };

  const handleProjectFocus = (project: Project | null) => {
    setFocusedProject(project);
    // Announce focus change to screen readers
    if (project) {
      const announcement = `Focused on ${project.title}. ${project.tagline}. Technologies: ${project.stack.slice(0, 3).join(', ')}. Press Enter to view details.`;
      announceToScreenReader(announcement, 'polite');
    }
  };

  const handleProjectClick = (project: Project) => {
    focusManagerRef.current.saveFocus();
    setSelectedProject(project);
    setHoveredProject(null);
    setFocusedProject(null);
    setTooltipVisible(false);

    // Announce project selection
    announceToScreenReader(
      `Opened ${project.title} project panel. Use Tab to navigate options or Escape to close.`,
      'assertive'
    );
  };

  const handleClosePanel = () => {
    setSelectedProject(null);
    focusManagerRef.current.restoreFocus();
    announceToScreenReader('Project panel closed.', 'polite');
  };

  // Initialize keyboard navigation
  useEffect(() => {
    if (featuredProjects.length > 0) {
      keyboardNavRef.current = new KeyboardNavigationManager(
        (project: Project | null, index: number) => {
          handleProjectFocus(project);
        },
        (project: Project | null, index: number) => {
          if (project) {
            handleProjectClick(project);
          }
        }
      );

      const navItems = featuredProjects.map(project => ({
        id: project.slug,
        data: project,
      }));

      keyboardNavRef.current.setItems(navItems);
    }
  }, [featuredProjects]);

  // Initialize semantic equivalent for screen readers
  useEffect(() => {
    const container = containerRef.current;
    if (container && featuredProjects.length > 0) {
      const semanticElement = createSemanticEquivalent(
        container,
        featuredProjects,
        handleProjectClick
      );

      return () => {
        if (container.contains(semanticElement)) {
          container.removeChild(semanticElement);
        }
      };
    }
  }, [featuredProjects, handleProjectClick]);

  // Static fallback content
  const staticFallback = (
    <div
      data-testid="static-fallback"
      className="relative h-full bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden"
      role="region"
      aria-label="Featured projects showcase"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        <h1
          id="hero-section"
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
        >
          Featured Projects
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          Explore my latest work in web development, 3D graphics, and
          interactive experiences.
        </p>

        {/* Featured project cards in static layout */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
          role="list"
          aria-label="Featured projects"
        >
          {projects
            .filter(p => p.sceneRef)
            .slice(0, 3)
            .map(project => (
              <div
                key={project.slug}
                className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                role="listitem"
              >
                <h3 className="font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.tagline}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.stack.slice(0, 3).map(tech => (
                    <span
                      key={tech}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.links?.case_study && (
                    <a
                      href={project.links.case_study}
                      className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label={`View detailed case study for ${project.title}`}
                    >
                      View Project
                    </a>
                  )}
                  {project.links?.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label={`View live demo of ${project.title} (opens in new tab)`}
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      role="region"
      aria-label="Interactive 3D project showcase"
      aria-describedby="hero-description"
    >
      {/* Hidden description for screen readers */}
      <div id="hero-description" className="sr-only">
        {describe3DContent(featuredProjects)}
      </div>

      <Lazy3DWrapper
        fallback={staticFallback}
        className="w-full h-full"
        preload={false}
      >
        <CanvasWrapper
          fallback={staticFallback}
          className="w-full h-full"
          onPerformanceChange={performance => {
            if (performance === 'low') {
              announceToScreenReader(
                'Performance mode adjusted for optimal experience.',
                'polite'
              );
            }
          }}
        >
          <HeroScene
            projects={projects}
            onProjectHover={handleProjectHover}
            onProjectClick={handleProjectClick}
            focusedProject={focusedProject}
            onProjectFocus={handleProjectFocus}
            keyboardNavManager={keyboardNavRef.current}
          />
        </CanvasWrapper>
      </Lazy3DWrapper>

      {/* Tooltip */}
      <ProjectTooltip
        project={hoveredProject}
        position={mousePosition}
        visible={tooltipVisible}
      />

      {/* Quick panel */}
      <ProjectQuickPanel
        project={selectedProject}
        onClose={handleClosePanel}
        visible={!!selectedProject}
      />
    </div>
  );
}
