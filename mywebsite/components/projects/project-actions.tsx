'use client';

import { ExternalLink, Github, FileText } from 'lucide-react';
import { Project } from '@/lib/types/content';

interface ProjectActionsProps {
  project: Project;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const handleLinkClick = (url: string, label: string) => {
    // Track analytics event if needed
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-lg">Project Links</h3>

      <div className="space-y-3">
        {/* Demo Link */}
        {project.links.demo && (
          <button
            onClick={() => handleLinkClick(project.links.demo!, 'Demo')}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg font-medium transition-colors"
            aria-label={`View live demo of ${project.title}`}
          >
            <ExternalLink className="w-5 h-5" />
            <span>View Live Demo</span>
          </button>
        )}

        {/* GitHub Link */}
        {project.links.github && (
          <button
            onClick={() => handleLinkClick(project.links.github!, 'GitHub')}
            className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-3 rounded-lg font-medium transition-colors"
            aria-label={`View source code for ${project.title} on GitHub`}
          >
            <Github className="w-5 h-5" />
            <span>View Source Code</span>
          </button>
        )}

        {/* Case Study Link */}
        {project.links.case_study &&
          project.links.case_study !== `/projects/${project.slug}` && (
            <button
              onClick={() =>
                handleLinkClick(project.links.case_study!, 'Case Study')
              }
              className="w-full flex items-center justify-center gap-3 border border-border hover:bg-accent hover:text-accent-foreground px-4 py-3 rounded-lg font-medium transition-colors"
              aria-label={`Read detailed case study for ${project.title}`}
            >
              <FileText className="w-5 h-5" />
              <span>Read Case Study</span>
            </button>
          )}
      </div>

      {/* Additional Info */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Interested in this project? Let&apos;s discuss how we can work
          together.
        </p>
        <button
          onClick={() => handleLinkClick('/contact', 'Contact')}
          className="w-full mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Get in touch →
        </button>
      </div>
    </div>
  );
}
