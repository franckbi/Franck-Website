'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types/content';

interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use the first gallery image as hero, fallback to thumbnail
  // Only use image assets for hero, not videos
  const heroImage =
    project.gallery.find(media => 'alt' in media) || project.thumbnail;

  return (
    <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-muted">
      {/* Hero Image */}
      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        className={`object-cover transition-all duration-700 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        onLoad={() => setImageLoaded(true)}
        priority
        placeholder={project.thumbnail.placeholder ? 'blur' : 'empty'}
        blurDataURL={project.thumbnail.placeholder}
        sizes="100vw"
      />

      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-12 max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Project Title and Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {project.featured && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                  Featured
                </span>
              )}
              {project.badges.map(badge => (
                <span
                  key={badge}
                  className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full"
                >
                  {badge}
                </span>
              ))}
              <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                {project.year}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {project.title}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed">
              {project.tagline}
            </p>

            <div className="flex items-center gap-4 text-white/80">
              <span className="text-sm font-medium">{project.role}</span>
              <span className="w-1 h-1 bg-white/60 rounded-full" />
              <span className="text-sm">{project.year}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
