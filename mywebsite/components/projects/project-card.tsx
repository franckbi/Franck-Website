'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Eye } from 'lucide-react';
import { Project } from '@/lib/types/content';
import { useProjectAnalytics } from '@/lib/hooks/use-analytics';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  animationDelay?: number;
  className?: string;
}

export function ProjectCard({
  project,
  onClick,
  animationDelay = 0,
  className = '',
}: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const analytics = useProjectAnalytics(project.slug);

  // Canonical details route for all projects
  const detailsUrl = `/projects/${project.slug}`;

  const handleCardClick = () => {
    analytics.trackProjectView('list');

    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to canonical project detail page
      window.location.href = detailsUrl;
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();

    // Track analytics based on URL type
    if (url === project.links.demo) {
      analytics.trackDemoClick();
    } else if (url === project.links.github) {
      analytics.trackGitHubClick();
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className={`group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleCardClick}
      style={{
        animationDelay: `${animationDelay}s`,
      }}
    >
      {/* Project Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <Image
          src={project.thumbnail.src}
          alt={project.thumbnail.alt}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          placeholder={project.thumbnail.placeholder ? 'blur' : 'empty'}
          blurDataURL={project.thumbnail.placeholder}
        />

        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          {project.featured && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Featured
            </span>
          )}
          {project.badges.map(badge => (
            <span
              key={badge}
              className="bg-black/70 text-white text-xs px-2 py-1 rounded-full"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Year badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            {project.year}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.links.demo && (
            <button
              onClick={e => handleLinkClick(e, project.links.demo!)}
              className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-colors"
              title="View Demo"
              aria-label={`View demo for ${project.title}`}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {project.links.github && (
            <button
              onClick={e => handleLinkClick(e, project.links.github!)}
              className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-colors"
              title="View Code"
              aria-label={`View code for ${project.title}`}
            >
              <Github className="w-4 h-4" />
            </button>
          )}
          <Link
            href={detailsUrl}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full shadow-lg transition-colors inline-flex items-center justify-center"
            title="View Details"
            aria-label={`View details for ${project.title}`}
            onClick={e => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-6 space-y-4">
        {/* Title and Role */}
        <div className="space-y-1">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">{project.role}</p>
        </div>

        {/* Tagline */}
        <p className="text-muted-foreground text-sm leading-relaxed">
          {project.tagline}
        </p>

        {/* Tech Stack */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-1">
            {project.stack.slice(0, 6).map(tech => (
              <span
                key={tech}
                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md"
              >
                {tech}
              </span>
            ))}
            {project.stack.length > 6 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{project.stack.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 pt-2">
          {project.links.demo && (
            <button
              onClick={e => handleLinkClick(e, project.links.demo!)}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Demo
            </button>
          )}
          {project.links.github && (
            <button
              onClick={e => handleLinkClick(e, project.links.github!)}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              Code
            </button>
          )}
          <Link
            href={detailsUrl}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            onClick={e => e.stopPropagation()}
          >
            <Eye className="w-3 h-3" />
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
