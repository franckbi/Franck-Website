'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProjectData } from '@/lib/validation/schemas';

interface FeaturedProjectsProps {
  projects: ProjectData[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const featuredProjects = projects.filter(p => p.featured).slice(0, 6);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of my recent work showcasing modern web development, 3D
            graphics, and interactive experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map(project => (
            <article
              key={project.slug}
              className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail.src}
                    alt={project.thumbnail.alt}
                    width={project.thumbnail.width}
                    height={project.thumbnail.height}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl text-primary/30">
                      {project.title.charAt(0)}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {project.year}
                  </span>
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {project.tagline}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.stack.slice(0, 3).map(tech => (
                    <span
                      key={tech}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.stack.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{project.stack.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Project →
                  </Link>
                  <div className="flex gap-2">
                    {project.links?.demo && (
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`View ${project.title} demo`}
                      >
                        Demo
                      </a>
                    )}
                    {project.links?.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`View ${project.title} source code`}
                      >
                        Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
