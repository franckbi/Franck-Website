'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Html } from '@react-three/drei';
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
const AnimatedText = animated(Text);

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

      {/* Project title */}
      <AnimatedText
        position={[0, 0.8, 0.06]}
        fontSize={0.15}
        maxWidth={1.8}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        font="/fonts/inter-bold.woff"
        anchorX="center"
        anchorY="middle"
        scale={scale}
      >
        {project.title}
        <meshStandardMaterial color="#ffffff" />
      </AnimatedText>

      {/* Project tagline */}
      <AnimatedText
        position={[0, 0.4, 0.06]}
        fontSize={0.08}
        maxWidth={1.6}
        lineHeight={1.2}
        letterSpacing={0.01}
        textAlign="center"
        font="/fonts/inter-regular.woff"
        anchorX="center"
        anchorY="middle"
        scale={scale}
      >
        {project.tagline}
        <meshStandardMaterial color="#e5e5e5" />
      </AnimatedText>

      {/* Tech stack chips */}
      <group position={[0, -0.2, 0.06]}>
        {project.stack.slice(0, 3).map((tech, index) => (
          <group key={tech} position={[(index - 1) * 0.5, 0, 0]}>
            <RoundedBox args={[0.4, 0.15, 0.02]} radius={0.02}>
              <meshStandardMaterial color="#374151" />
            </RoundedBox>
            <Text
              position={[0, 0, 0.02]}
              fontSize={0.05}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              font="/fonts/inter-medium.woff"
            >
              {tech}
            </Text>
          </group>
        ))}
      </group>

      {/* Year badge */}
      <group position={[0.8, 0.9, 0.06]}>
        <RoundedBox args={[0.3, 0.15, 0.02]} radius={0.02}>
          <meshStandardMaterial color="#059669" />
        </RoundedBox>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {project.year}
        </Text>
      </group>

      {/* Featured badge */}
      {project.featured && (
        <group position={[-0.8, 0.9, 0.06]}>
          <RoundedBox args={[0.4, 0.15, 0.02]} radius={0.02}>
            <meshStandardMaterial color="#DC2626" />
          </RoundedBox>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.05}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            Featured
          </Text>
        </group>
      )}

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
