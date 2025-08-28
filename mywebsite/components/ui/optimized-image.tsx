'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const { lowPowerMode } = useSettingsStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive sizes if not provided
  const responsiveSizes =
    sizes ||
    (fill
      ? '100vw'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');

  // Adjust quality based on low power mode
  const imageQuality = lowPowerMode
    ? Math.min(quality || 75, 60)
    : quality || 85;

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const blurPlaceholder =
    blurDataURL ||
    (width && height ? generateBlurDataURL(width, height) : undefined);

  // Error fallback
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-muted-foreground">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Image failed to load</p>
        </div>
      </div>
    );
  }

  // Loading placeholder
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-muted animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurPlaceholder}
        sizes={responsiveSizes}
        quality={imageQuality}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Utility function to generate optimized image props
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    priority?: boolean;
  } = {}
) => {
  const { width, height, quality = 85, priority = false } = options;

  return {
    src,
    alt,
    width,
    height,
    quality,
    priority,
    sizes:
      width && height
        ? `(max-width: 640px) ${Math.min(width, 640)}px, (max-width: 1024px) ${Math.min(width, 1024)}px, ${width}px`
        : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
};

// Hook for responsive image sizing
export const useResponsiveImageSize = (
  baseWidth: number,
  baseHeight: number
) => {
  const [dimensions, setDimensions] = useState({
    width: baseWidth,
    height: baseHeight,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      let scale = 1;

      if (screenWidth < 640) {
        scale = Math.min(screenWidth / baseWidth, 1);
      } else if (screenWidth < 1024) {
        scale = Math.min((screenWidth * 0.5) / baseWidth, 1);
      } else {
        scale = Math.min((screenWidth * 0.33) / baseWidth, 1);
      }

      setDimensions({
        width: Math.round(baseWidth * scale),
        height: Math.round(baseHeight * scale),
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [baseWidth, baseHeight]);

  return dimensions;
};
