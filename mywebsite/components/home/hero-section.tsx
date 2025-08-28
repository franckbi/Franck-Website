'use client';

import { Hero3D } from '@/components/3d/hero-3d';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { ProjectData } from '@/lib/validation/schemas';
import Link from 'next/link';

interface HeroSectionProps {
  projects: ProjectData[];
}

export function HeroSection({ projects }: HeroSectionProps) {
  const lowPowerMode = useSettingsStore(state => state.lowPowerMode);

  // Static fallback for low-power mode
  if (lowPowerMode) {
    return (
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Franck Biyogue Bi Ndoutoume- Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Building immersive web experiences with{' '}
              <span className="text-primary font-medium">Three.js</span>,{' '}
              <span className="text-primary font-medium">React</span>, and{' '}
              <span className="text-primary font-medium">
                modern technologies
              </span>
            </p>
          </div>

          {/* Static hero content for low-power mode */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="h-[500px] md:h-[600px] w-full rounded-xl border shadow-2xl bg-gradient-to-br from-background to-muted relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Featured Projects
                  </h2>
                  <p className="text-muted-foreground">
                    Low-power mode enabled for optimal performance
                  </p>
                </div>

                {/* Featured project cards in static layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  {projects
                    .filter(p => p.featured && p.sceneRef)
                    .slice(0, 3)
                    .map(project => (
                      <div
                        key={project.slug}
                        className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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
                          <Link
                            href={`/projects/${project.slug}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View Project
                          </Link>
                          {project.links?.demo && (
                            <a
                              href={project.links.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-primary"
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
            <p className="text-sm text-muted-foreground mt-6 text-center">
              3D scene disabled in low-power mode. Enable 3D mode in settings to
              view the interactive experience.
            </p>
          </div>

          {/* Quick navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a
              href="#featured-projects"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Explore Projects
            </a>
            <a
              href="#about"
              className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Full 3D experience
  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Franck Biyogue Bi Ndoutoume- Portfolio
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Building immersive web experiences with{' '}
            <span className="text-primary font-medium">Three.js</span>,{' '}
            <span className="text-primary font-medium">React</span>, and{' '}
            <span className="text-primary font-medium">
              modern technologies
            </span>
          </p>
        </div>

        {/* 3D Hero Scene */}
        <div className="w-full max-w-6xl mx-auto">
          <Hero3D
            projects={projects}
            className="h-[500px] md:h-[600px] w-full rounded-xl border shadow-2xl"
          />
          <p className="text-sm text-muted-foreground mt-6 text-center">
            Interactive 3D scene with floating project cards. Hover and click to
            explore!
          </p>
        </div>

        {/* Quick navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <a
            href="#featured-projects"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Explore Projects
          </a>
          <a
            href="#about"
            className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
