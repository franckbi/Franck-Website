'use client';

import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { Project } from '@/lib/types/content';
import { ProjectCard3D } from './project-card-3d';
import { LoadingSpinner } from '@/components/ui';

interface ProjectsSceneProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  onProjectHover?: (project: Project | null) => void;
  className?: string;
}

function ProjectsGrid({
  projects,
  onProjectClick,
  onProjectHover,
}: {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  onProjectHover?: (project: Project | null) => void;
}) {
  // Calculate grid positions for projects
  const projectPositions = useMemo(() => {
    const positions: Array<{
      project: Project;
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [];

    // Create a spiral/orbital arrangement
    const radius = 4;
    const heightVariation = 2;

    projects.forEach((project, index) => {
      const angle = (index / projects.length) * Math.PI * 2;
      const spiralRadius = radius + index * 0.3;

      const x = Math.cos(angle) * spiralRadius;
      const z = Math.sin(angle) * spiralRadius;
      const y = Math.sin(index * 0.5) * heightVariation;

      const rotationY = angle + Math.PI / 2;

      positions.push({
        project,
        position: [x, y, z],
        rotation: [0, rotationY, 0],
      });
    });

    return positions;
  }, [projects]);

  return (
    <>
      {projectPositions.map(({ project, position, rotation }, index) => (
        <ProjectCard3D
          key={project.slug}
          project={project}
          position={position}
          rotation={rotation}
          onClick={() => onProjectClick?.(project)}
          onHover={hovered => onProjectHover?.(hovered ? project : null)}
          animationDelay={index * 0.1}
        />
      ))}
    </>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
    </>
  );
}

export function ProjectsScene({
  projects,
  onProjectClick,
  onProjectHover,
  className = '',
}: ProjectsSceneProps) {
  return (
    <div className={`w-full h-[600px] ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 10]} />

          <SceneLighting />

          <Environment preset="studio" />

          <ProjectsGrid
            projects={projects}
            onProjectClick={onProjectClick}
            onProjectHover={onProjectHover}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Suspense fallback={<LoadingSpinner />}>
          <div />
        </Suspense>
      </div>
    </div>
  );
}
