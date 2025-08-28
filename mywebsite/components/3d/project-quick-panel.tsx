'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Github, Eye } from 'lucide-react';
import {
  createFocusTrap,
  announceToScreenReader,
} from '@/lib/utils/accessibility';

import type { ProjectData } from '@/lib/validation/schemas';

type Project = ProjectData;

interface ProjectQuickPanelProps {
  project: Project | null;
  onClose: () => void;
  visible: boolean;
}

export function ProjectQuickPanel({
  project,
  onClose,
  visible,
}: ProjectQuickPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusTrapCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Enhanced focus management and keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible && panelRef.current) {
      document.addEventListener('keydown', handleKeyDown);

      // Create focus trap
      focusTrapCleanupRef.current = createFocusTrap(panelRef.current);

      // Announce panel opening
      if (project) {
        announceToScreenReader(
          `${project.title} project panel opened. Use Tab to navigate options, Escape to close.`,
          'assertive'
        );
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (focusTrapCleanupRef.current) {
          focusTrapCleanupRef.current();
          focusTrapCleanupRef.current = null;
        }
      };
    }
  }, [visible, onClose, project]);

  if (!project || !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        data-project-panel
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 
          bg-background border rounded-lg shadow-xl p-6 w-full max-w-md mx-4
          transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-panel-title"
        aria-describedby="project-panel-description"
        aria-live="polite"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 id="project-panel-title" className="text-xl font-semibold mb-1">
              {project.title}
            </h2>
            <p
              id="project-panel-description"
              className="text-sm text-muted-foreground"
            >
              {project.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={`Close ${project.title} details panel`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tech stack */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Technologies</h3>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label={`Technologies used in ${project.title}`}
          >
            {project.stack.map(tech => (
              <span
                key={tech}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                role="listitem"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {project.links?.case_study && (
            <a
              href={project.links.case_study}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground 
                px-4 py-2 rounded-md hover:bg-primary/90 transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              aria-describedby="view-project-desc"
            >
              <Eye className="w-4 h-4" />
              View Project
              <span id="view-project-desc" className="sr-only">
                Opens detailed project case study
              </span>
            </a>
          )}

          <div className="flex gap-2">
            {project.links?.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border 
                  px-4 py-2 rounded-md hover:bg-muted transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                aria-describedby="demo-desc"
              >
                <ExternalLink className="w-4 h-4" />
                Demo
                <span id="demo-desc" className="sr-only">
                  Opens live demo in new tab
                </span>
              </a>
            )}

            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border 
                  px-4 py-2 rounded-md hover:bg-muted transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                aria-describedby="github-desc"
              >
                <Github className="w-4 h-4" />
                Code
                <span id="github-desc" className="sr-only">
                  Opens source code repository in new tab
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
