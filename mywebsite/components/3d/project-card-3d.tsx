'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Project } from '@/lib/types/content';
import * as THREE from 'three';

interface ProjectCard3DProps {
  project: Project;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  animationDelay?: number;
}

const AnimatedRoundedBox = animated(RoundedBox);

export function ProjectCard3D({
  project,
  position,
  rotation,
  onClick,
  onHover,
  animationDelay = 0,
}: ProjectCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Animation springs
  const { scale, positionY } = useSpring({
    scale: hovered ? 1.1 : 1,
    positionY: position[1] + (hovered ? 0.2 : 0),
    config: { tension: 300, friction: 30 },
    delay: animationDelay * 1000,
  });

  // Floating animation
  useFrame(state => {
    if (groupRef.current && !hovered) {
      groupRef.current.position.y =
        position[1] +
        Math.sin(state.clock.elapsedTime + animationDelay * 2) * 0.1;
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = () => {
    setClicked(true);
    onClick?.();
    setTimeout(() => setClicked(false), 200);
  };

  // Get primary technology for color theming
  const primaryTech = project.stack[0]?.toLowerCase() || 'default';
  const getCardColor = (tech: string) => {
    const colors: Record<string, string> = {
      react: '#61DAFB',
      'next.js': '#000000',
      typescript: '#3178C6',
      'three.js': '#000000',
      'node.js': '#339933',
      vue: '#4FC08D',
      angular: '#DD0031',
      default: '#6366F1',
    };
    return colors[tech] || colors.default;
  };

  const cardColor = getCardColor(primaryTech);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Main card geometry */}
      <AnimatedRoundedBox
        args={[2, 2.5, 0.1]}
        radius={0.05}
        smoothness={4}
        scale={scale}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={cardColor}
          metalness={0.1}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </AnimatedRoundedBox>

      {/* Card content as HTML overlay */}
      <Html
        position={[0, 0, 0.06]}
        center
        distanceFactor={8}
        transform
        sprite
        occlude={false}
      >
        <div className="pointer-events-none select-none w-48 h-60 flex flex-col items-center justify-center text-center p-4">
          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-gray-200 text-xs mb-3 line-clamp-2">
            {project.tagline}
          </p>
          <div className="flex flex-wrap gap-1 justify-center mb-2">
            {project.stack.slice(0, 3).map(tech => (
              <span
                key={tech}
                className="text-xs bg-gray-700 text-white px-2 py-1 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
              {project.year}
            </span>
            {project.featured && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                Featured
              </span>
            )}
          </div>
        </div>
      </Html>

      {/* Hover tooltip */}
      {hovered && (
        <Html
          position={[0, -1.5, 0]}
          center
          distanceFactor={10}
          occlude
          transform
          sprite
        >
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg max-w-xs">
            <h4 className="font-semibold text-sm mb-1">{project.title}</h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {project.stack.slice(0, 4).map(tech => (
                <span
                  key={tech}
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
