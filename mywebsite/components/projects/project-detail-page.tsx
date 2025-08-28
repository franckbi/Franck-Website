'use client';

import { Project } from '@/lib/types/content';
import { ProjectHero } from './project-hero';
import { ProjectInfo } from './project-info';
import { ProjectContent } from './project-content';
import { ProjectGallery } from './project-gallery';
import { ProjectActions } from './project-actions';

interface ProjectDetailPageProps {
  project: Project;
}

export function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <ProjectHero project={project} />

      {/* Content Container */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <ProjectContent project={project} />
            <ProjectGallery project={project} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <ProjectInfo project={project} />
            <ProjectActions project={project} />
          </div>
        </div>
      </div>
    </main>
  );
}
