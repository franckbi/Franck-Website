'use client';

import type { ProjectData } from '@/lib/validation/schemas';

type Project = ProjectData;

interface ProjectTooltipProps {
  project: Project | null;
  position: { x: number; y: number };
  visible: boolean;
}

export function ProjectTooltip({
  project,
  position,
  visible,
}: ProjectTooltipProps) {
  if (!project || !visible) return null;

  // Adjust position to keep tooltip on screen
  const adjustedPosition = {
    x: Math.min(position.x + 10, window.innerWidth - 320),
    y: Math.max(position.y - 10, 10),
  };

  return (
    <div
      data-testid="project-tooltip"
      className="fixed z-50 pointer-events-none transition-all duration-300 ease-out"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateY(0) scale(1)'
          : 'translateY(-10px) scale(0.95)',
      }}
    >
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-4 max-w-xs animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm leading-tight">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.tagline}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {project.stack.slice(0, 4).map(tech => (
            <span
              key={tech}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
            >
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span className="text-xs text-muted-foreground font-medium">
              +{project.stack.length - 4} more
            </span>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Click to view details • Use arrow keys to navigate
        </div>
      </div>
    </div>
  );
}
