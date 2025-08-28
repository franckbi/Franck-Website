'use client';

import { Project } from '@/lib/types/content';
import { ProjectCard } from './project-card';

interface ProjectsListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  className?: string;
}

export function ProjectsList({
  projects,
  onProjectClick,
  className = '',
}: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="space-y-3">
          <div className="text-muted-foreground text-lg">No projects found</div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try adjusting your filters or search terms to find more projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          onClick={() => onProjectClick?.(project)}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
}
