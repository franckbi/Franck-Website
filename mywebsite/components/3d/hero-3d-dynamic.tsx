'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProjectData } from '@/lib/validation/schemas';

// Dynamically import the Hero3D component to avoid SSR issues
const Hero3D = dynamic(
  () => import('./hero-3d').then(mod => ({ default: mod.Hero3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D Scene...</p>
        </div>
      </div>
    ),
  }
);

interface Hero3DDynamicProps {
  projects: ProjectData[];
  className?: string;
}

export function Hero3DDynamic({ projects, className }: Hero3DDynamicProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-background to-muted flex items-center justify-center ${className || ''}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D Scene...</p>
        </div>
      </div>
    );
  }

  return <Hero3D projects={projects} className={className} />;
}
