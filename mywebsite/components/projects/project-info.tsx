'use client';

import { Project } from '@/lib/types/content';

interface ProjectInfoProps {
  project: Project;
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      {/* Project Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Project Details</h3>

        <div className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Role
            </dt>
            <dd className="text-sm">{project.role}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-muted-foreground mb-1">
              Year
            </dt>
            <dd className="text-sm">{project.year}</dd>
          </div>

          {project.metadata.architecture && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Architecture
              </dt>
              <dd className="text-sm">{project.metadata.architecture}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {project.stack.map(tech => (
            <span
              key={tech}
              className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-md font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Key Highlights */}
      {project.metadata.highlights &&
        project.metadata.highlights.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Key Highlights</h3>
            <ul className="space-y-2">
              {project.metadata.highlights.map((highlight, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Results */}
      {project.metadata.results && project.metadata.results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Results</h3>
          <ul className="space-y-2">
            {project.metadata.results.map((result, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>{result}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
