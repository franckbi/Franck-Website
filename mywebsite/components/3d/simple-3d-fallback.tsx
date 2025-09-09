'use client';

import { ProjectData } from '@/lib/validation/schemas';

interface Simple3DFallbackProps {
  projects: ProjectData[];
  className?: string;
}

export function Simple3DFallback({
  projects,
  className,
}: Simple3DFallbackProps) {
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);

  return (
    <div
      className={`relative bg-gradient-to-br from-background via-muted/20 to-background ${className}`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Featured Projects
            </h2>
            <p className="text-muted-foreground">
              Interactive 3D experience loading... Here&apos;s a preview of my
              work:
            </p>
          </div>

          {/* Project Cards in Floating Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredProjects.map((project, index) => (
              <div
                key={project.slug}
                className="bg-card/80 backdrop-blur-sm border rounded-xl p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards',
                }}
              >
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2 text-primary">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {project.stack.slice(0, 3).map(tech => (
                      <span
                        key={tech}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.links?.case_study && (
                    <a
                      href={project.links.case_study}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Loading 3D experience...</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bg-grid-pattern {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}
