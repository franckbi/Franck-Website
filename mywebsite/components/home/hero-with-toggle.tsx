'use client';

import { useState } from 'react';
import { Hero3DDynamic } from '@/components/3d/hero-3d-dynamic';
import type { ProjectData } from '@/lib/validation/schemas';

interface HeroWithToggleProps {
  projects: ProjectData[];
}

export function HeroWithToggle({ projects }: HeroWithToggleProps) {
  const [showContent, setShowContent] = useState(true);

  return (
    <section
      aria-label="Interactive portfolio hero"
      className="relative min-h-screen overflow-hidden"
    >
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Hero3DDynamic projects={projects} className="w-full h-full" />
      </div>

      {/* Toggle Button - Always Visible */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={() => setShowContent(!showContent)}
          className="group bg-background/20 backdrop-blur-md border border-border/30 rounded-full p-3 hover:bg-background/40 transition-all duration-300 shadow-lg hover:shadow-xl"
          aria-label={
            showContent ? 'Hide content to view 3D scene' : 'Show content'
          }
        >
          {showContent ? (
            <svg
              className="w-6 h-6 text-foreground group-hover:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L8.464 8.464"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-foreground group-hover:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Content Overlay with Toggle Animation */}
      <div
        className={`relative z-10 min-h-screen flex items-center justify-center transition-all duration-500 ease-in-out ${
          showContent
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center px-4 py-16">
          {/* Main Title with Glass Effect */}
          <div className="backdrop-blur-md bg-background/30 rounded-2xl p-8 mb-8 border border-border/30 shadow-2xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6">
              Franck Biyogue Bi Ndoutoume
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
              Software Engineer | M.S. in Computer Science @ASU | B.S. Software
              Engineer @ISU
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experienced developer specializing in full-stack development, 3D
              web experiences, and data-driven solutions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#projects"
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
              >
                View Projects
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-medium text-lg backdrop-blur-sm"
              >
                Get In Touch
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">2+</div>
                <div className="text-sm text-muted-foreground">
                  Years Experience
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">7+</div>
                <div className="text-sm text-muted-foreground">
                  Projects Completed
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/20 backdrop-blur-sm border border-border/20">
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-sm text-muted-foreground">
                  Technologies
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Scene Instructions - Only visible when content is hidden */}
      <div
        className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none transition-all duration-500 ease-in-out ${
          !showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-center backdrop-blur-sm bg-background/20 rounded-xl p-6 border border-border/20 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Interactive 3D Portfolio
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Click and drag to explore • Scroll to zoom • Click project cards for
            details
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>3 Featured Projects Available</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce backdrop-blur-sm bg-background/60 rounded-full p-3 border border-border/30">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
