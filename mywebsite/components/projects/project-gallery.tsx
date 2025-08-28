'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, MediaAsset } from '@/lib/types/content';

interface ProjectGalleryProps {
  project: Project;
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Skip gallery if there are no additional images beyond the hero
  if (project.gallery.length <= 1) {
    return null;
  }

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;

    const newIndex =
      direction === 'prev'
        ? (selectedImage - 1 + project.gallery.length) % project.gallery.length
        : (selectedImage + 1) % project.gallery.length;

    setSelectedImage(newIndex);
  };

  const isVideo = (
    media: MediaAsset
  ): media is MediaAsset & { duration?: number } => {
    return 'duration' in media;
  };

  return (
    <>
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Gallery</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.gallery.map((media, index) => (
            <div
              key={index}
              className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              {isVideo(media) ? (
                <video
                  src={media.src}
                  poster={'poster' in media ? media.poster : undefined}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                    loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(index)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              )}

              {/* Loading placeholder */}
              {!loadedImages.has(index) && !isVideo(media) && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

              {/* Video indicator */}
              {isVideo(media) && (
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Video
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close gallery"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation buttons */}
          {project.gallery.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigateLightbox('prev');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigateLightbox('next');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-full max-h-full"
            onClick={e => e.stopPropagation()}
          >
            {isVideo(project.gallery[selectedImage]) ? (
              <video
                src={project.gallery[selectedImage].src}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                muted
                playsInline
              />
            ) : (
              <Image
                src={project.gallery[selectedImage].src}
                alt={project.gallery[selectedImage].alt}
                width={project.gallery[selectedImage].width}
                height={project.gallery[selectedImage].height}
                className="max-w-full max-h-full object-contain"
                priority
              />
            )}
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {selectedImage + 1} / {project.gallery.length}
          </div>
        </div>
      )}
    </>
  );
}
