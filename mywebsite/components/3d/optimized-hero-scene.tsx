'use client';

import { Suspense } from 'react';
import { LazyAssetLoader, AssetPreloader } from './lazy-asset-loader';
import { HeroScene } from './hero-scene';
import { assetBundles } from '@/data/assets';
import type { ProjectData } from '@/lib/validation/schemas';

interface OptimizedHeroSceneProps {
  projects: ProjectData[];
  onProjectHover?: (project: ProjectData | null) => void;
  onProjectClick?: (project: ProjectData) => void;
  focusedProject?: ProjectData | null;
  onProjectFocus?: (project: ProjectData | null) => void;
}

export function OptimizedHeroScene(props: OptimizedHeroSceneProps) {
  const heroBundle = assetBundles.find(bundle => bundle.id === 'hero-scene');

  if (!heroBundle) {
    // Fallback to regular hero scene if no asset bundle is defined
    return <HeroScene {...props} />;
  }

  return (
    <>
      {/* Preload critical assets */}
      <AssetPreloader
        bundles={assetBundles.filter(b => b.priority === 'critical')}
      />

      {/* Main scene with lazy loading */}
      <LazyAssetLoader
        bundle={heroBundle}
        enableLOD={true}
        lodConfig={{
          performanceTarget: 'medium',
          maxTriangles: 70000,
          maxDrawCalls: 80,
        }}
        onLoadComplete={() => {
          console.log('Hero scene assets loaded successfully');
        }}
        onLoadError={error => {
          console.error('Failed to load hero scene assets:', error);
        }}
        fallback={
          <Suspense fallback={null}>
            {/* Fallback to basic scene while loading */}
            <HeroScene {...props} />
          </Suspense>
        }
      >
        {({ models, textures }) => (
          <OptimizedHeroSceneContent
            {...props}
            models={models}
            textures={textures}
          />
        )}
      </LazyAssetLoader>
    </>
  );
}

interface OptimizedHeroSceneContentProps extends OptimizedHeroSceneProps {
  models: Map<string, any>;
  textures: Map<string, any>;
}

function OptimizedHeroSceneContent({
  models,
  textures,
  ...heroProps
}: OptimizedHeroSceneContentProps) {
  // Here you would use the loaded models and textures
  // For now, we'll just render the regular hero scene
  // In a real implementation, you'd replace the basic geometries
  // with the loaded 3D models and apply the optimized textures

  return <HeroScene {...heroProps} />;
}

// Export a hook for using the asset pipeline in other components
export function useOptimizedAssets(bundleId: string) {
  const bundle = assetBundles.find(b => b.id === bundleId);

  return {
    bundle,
    isAvailable: !!bundle,
  };
}
