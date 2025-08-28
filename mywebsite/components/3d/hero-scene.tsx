'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Group, Vector3, Camera } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useTheme } from '@/lib/contexts/theme-context';
import {
  KeyboardNavigationManager,
  announceToScreenReader,
} from '@/lib/utils/accessibility';
import { use3DAnalytics } from '@/lib/hooks/use-analytics';

import type { ProjectData } from '@/lib/validation/schemas';

type Project = ProjectData;

interface HeroSceneProps {
  projects: Project[];
  onProjectHover?: (project: Project | null) => void;
  onProjectClick?: (project: Project) => void;
  focusedProject?: Project | null;
  onProjectFocus?: (project: Project | null) => void;
  keyboardNavManager?: KeyboardNavigationManager | null;
}

function ProjectCard({
  project,
  onHover,
  onClick,
  onFocus,
  focused,
  index,
  analytics,
}: {
  project: Project;
  onHover: (project: Project | null) => void;
  onClick: (project: Project) => void;
  onFocus: (project: Project | null) => void;
  focused: boolean;
  index: number;
  analytics: ReturnType<typeof use3DAnalytics>;
}) {
  const meshRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { resolvedTheme } = useTheme();
  const { reducedMotion } = useSettingsStore();
  const hoverStartTime = useRef<number>(0);

  // Enhanced hover/focus state
  const isInteractive = hovered || focused;
  const targetScale = isInteractive ? 1.15 : 1.0;

  // Smooth scale animation with react-spring
  const { scale } = useSpring({
    scale: targetScale,
    config: { tension: 300, friction: 30 },
  });

  // Animate floating motion
  useFrame(state => {
    if (meshRef.current && project.sceneRef && !reducedMotion) {
      const time = state.clock.getElapsedTime();
      const baseY = project.sceneRef.position.y;

      // Floating animation with slight offset per card
      meshRef.current.position.y =
        baseY + Math.sin(time * 0.5 + index * 0.8) * 0.1;

      // Gentle rotation
      meshRef.current.rotation.y =
        project.sceneRef.rotation.y + Math.sin(time * 0.3 + index * 0.5) * 0.05;
    }
  });

  const cardColor = resolvedTheme === 'dark' ? '#1f2937' : '#f9fafb';
  const textColor = resolvedTheme === 'dark' ? '#ffffff' : '#111827';
  const accentColor = isInteractive ? '#3b82f6' : '#6b7280';
  const borderColor = focused
    ? '#3b82f6'
    : isInteractive
      ? '#6366f1'
      : '#6b7280';

  return (
    <animated.group
      ref={meshRef}
      position={[
        project.sceneRef?.position.x || 0,
        project.sceneRef?.position.y || 0,
        project.sceneRef?.position.z || 0,
      ]}
      rotation={[
        project.sceneRef?.rotation.x || 0,
        project.sceneRef?.rotation.y || 0,
        project.sceneRef?.rotation.z || 0,
      ]}
      scale={scale}
      onPointerOver={e => {
        e.stopPropagation();
        setHovered(true);
        onHover(project);
        document.body.style.cursor = 'pointer';
        hoverStartTime.current = performance.now();
        analytics.trackSceneInteraction('hover', project.slug);
      }}
      onPointerOut={e => {
        e.stopPropagation();
        setHovered(false);
        onHover(null);
        document.body.style.cursor = 'auto';
        if (hoverStartTime.current > 0) {
          const hoverDuration = performance.now() - hoverStartTime.current;
          analytics.track3DInteraction('3d-hover', {
            projectSlug: project.slug,
            duration: hoverDuration,
            position: 'hero',
          });
          hoverStartTime.current = 0;
        }
      }}
      onClick={e => {
        e.stopPropagation();
        onClick(project);
        analytics.trackSceneInteraction('click', project.slug);
        analytics.trackHeroInteraction('project-select', {
          projectSlug: project.slug,
          method: 'click',
        });
      }}
      // Note: ARIA attributes and keyboard navigation are handled at the canvas level
    >
      {/* Main card geometry */}
      <Box args={[2, 1.2, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={cardColor}
          roughness={0.3}
          metalness={0.1}
        />
      </Box>

      {/* Card border/frame with focus indicator */}
      <Box args={[2.1, 1.3, 0.05]} position={[0, 0, -0.03]}>
        <meshStandardMaterial
          color={borderColor}
          roughness={0.4}
          metalness={0.2}
          emissive={focused ? '#1e40af' : '#000000'}
          emissiveIntensity={focused ? 0.2 : 0}
        />
      </Box>

      {/* Project title */}
      <Text
        position={[0, 0.3, 0.06]}
        fontSize={0.15}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {project.title}
      </Text>

      {/* Project tagline */}
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.08}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {project.tagline}
      </Text>

      {/* Tech stack indicators */}
      {project.stack.slice(0, 3).map((tech, index) => (
        <Text
          key={tech}
          position={[-0.7 + index * 0.7, -0.3, 0.06]}
          fontSize={0.06}
          color={accentColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.6}
        >
          {tech}
        </Text>
      ))}
    </animated.group>
  );
}

export function HeroScene({
  projects,
  onProjectHover,
  onProjectClick,
  focusedProject,
  onProjectFocus,
  keyboardNavManager,
}: HeroSceneProps) {
  const { camera, gl } = useThree();
  const { reducedMotion } = useSettingsStore();
  const { resolvedTheme } = useTheme();
  const controlsRef = useRef<any>(null);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const analytics = use3DAnalytics('hero');
  const sceneLoadTime = useRef<number>(performance.now());

  // Filter to get featured projects with sceneRef (max 3)
  const featuredProjects = projects
    .filter(p => p.sceneRef && p.featured)
    .slice(0, 3);

  // Track scene load when projects are available
  useEffect(() => {
    if (featuredProjects.length > 0) {
      const loadTime = performance.now() - sceneLoadTime.current;
      analytics.trackSceneLoad(loadTime, featuredProjects.length);
      analytics.trackHeroInteraction('load', {
        projectCount: featuredProjects.length,
        loadTime: Math.round(loadTime),
      });
    }
  }, [featuredProjects.length, analytics]);

  // Camera animation for focused project
  const getCameraTargetForProject = useCallback(
    (project: Project | null | undefined) => {
      if (!project?.sceneRef) {
        return {
          position: [0, 0, 5] as [number, number, number],
          target: [0, 0, 0] as [number, number, number],
        };
      }

      const { position } = project.sceneRef;
      // Position camera to focus on the project card
      const cameraOffset = 2.5;
      return {
        position: [
          position.x + cameraOffset * 0.7,
          position.y + cameraOffset * 0.3,
          position.z + cameraOffset,
        ] as [number, number, number],
        target: [position.x, position.y, position.z] as [
          number,
          number,
          number,
        ],
      };
    },
    []
  );

  // Smooth camera animation with react-spring
  const cameraTarget = getCameraTargetForProject(focusedProject);
  const { cameraPosition, cameraLookAt } = useSpring({
    cameraPosition: cameraTarget.position,
    cameraLookAt: cameraTarget.target,
    config: { tension: 120, friction: 40 },
  });

  // Apply camera animation
  useFrame(() => {
    if (focusedProject && !reducedMotion) {
      camera.position.set(...cameraPosition.get());
      camera.lookAt(...cameraLookAt.get());
      camera.updateProjectionMatrix();
    }
  });

  // Enhanced keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (featuredProjects.length === 0) return;

      // Use keyboard navigation manager if available
      if (keyboardNavManager) {
        const handled = keyboardNavManager.handleKeyDown(event);
        if (handled) return;
      }

      // Fallback keyboard handling
      switch (event.key) {
        case 'Tab':
          // Let default tab behavior handle focus
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          setCurrentFocusIndex(prev => {
            const newIndex = prev <= 0 ? featuredProjects.length - 1 : prev - 1;
            onProjectFocus?.(featuredProjects[newIndex]);
            announceToScreenReader(
              `Project ${newIndex + 1} of ${featuredProjects.length}: ${featuredProjects[newIndex]?.title}`,
              'polite'
            );
            analytics.track3DInteraction('3d-focus', {
              projectSlug: featuredProjects[newIndex]?.slug,
              position: 'hero',
            });
            return newIndex;
          });
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          setCurrentFocusIndex(prev => {
            const newIndex = prev >= featuredProjects.length - 1 ? 0 : prev + 1;
            onProjectFocus?.(featuredProjects[newIndex]);
            announceToScreenReader(
              `Project ${newIndex + 1} of ${featuredProjects.length}: ${featuredProjects[newIndex]?.title}`,
              'polite'
            );
            analytics.track3DInteraction('3d-focus', {
              projectSlug: featuredProjects[newIndex]?.slug,
              position: 'hero',
            });
            return newIndex;
          });
          break;
        case 'Home':
          event.preventDefault();
          setCurrentFocusIndex(0);
          onProjectFocus?.(featuredProjects[0]);
          announceToScreenReader(
            `First project: ${featuredProjects[0]?.title}`,
            'polite'
          );
          break;
        case 'End':
          event.preventDefault();
          const lastIndex = featuredProjects.length - 1;
          setCurrentFocusIndex(lastIndex);
          onProjectFocus?.(featuredProjects[lastIndex]);
          announceToScreenReader(
            `Last project: ${featuredProjects[lastIndex]?.title}`,
            'polite'
          );
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (currentFocusIndex >= 0 && featuredProjects[currentFocusIndex]) {
            onProjectClick?.(featuredProjects[currentFocusIndex]);
            analytics.trackHeroInteraction('project-select', {
              projectSlug: featuredProjects[currentFocusIndex].slug,
              method: 'keyboard',
            });
          }
          break;
        case 'Escape':
          event.preventDefault();
          setCurrentFocusIndex(-1);
          onProjectFocus?.(null);
          announceToScreenReader(
            'Selection cleared. Use arrow keys to navigate projects.',
            'polite'
          );
          break;
        case '?':
          event.preventDefault();
          announceToScreenReader(
            'Keyboard shortcuts: Arrow keys to navigate, Enter or Space to select, Escape to clear selection, Home for first project, End for last project.',
            'assertive'
          );
          break;
      }
    };

    // Add keyboard event listener to canvas
    const canvas = gl.domElement;
    canvas.addEventListener('keydown', handleKeyDown);

    // Enhanced canvas accessibility attributes
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'application');
    canvas.setAttribute(
      'aria-label',
      '3D project showcase. Use arrow keys to navigate, Enter to select, Escape to reset view. Press question mark for help.'
    );
    canvas.setAttribute('aria-describedby', 'canvas-instructions');

    // Add hidden instructions
    const instructions = document.createElement('div');
    instructions.id = 'canvas-instructions';
    instructions.className = 'sr-only';
    instructions.textContent = `Interactive 3D scene with ${featuredProjects.length} featured projects. Use arrow keys to navigate between projects, Enter or Space to select a project, Escape to clear selection. Press question mark for keyboard shortcuts.`;
    document.body.appendChild(instructions);

    return () => {
      canvas.removeEventListener('keydown', handleKeyDown);
      const existingInstructions = document.getElementById(
        'canvas-instructions'
      );
      if (existingInstructions) {
        document.body.removeChild(existingInstructions);
      }
    };
  }, [
    featuredProjects,
    currentFocusIndex,
    onProjectClick,
    onProjectFocus,
    keyboardNavManager,
    gl.domElement,
  ]);

  // Camera drift animation (disabled in reduced motion and when focused)
  useFrame((state, delta) => {
    if (!reducedMotion && !focusedProject && controlsRef.current) {
      const time = state.clock.getElapsedTime();
      const radius = 0.2;
      const speed = 0.1;

      // Subtle camera drift
      camera.position.x += Math.sin(time * speed) * radius * 0.01;
      camera.position.y += Math.cos(time * speed * 0.7) * radius * 0.01;

      controlsRef.current.update();
    }

    // Track performance metrics periodically
    if (Math.floor(state.clock.getElapsedTime()) % 10 === 0 && delta > 0) {
      analytics.trackPerformanceMetrics(state.gl, state.scene);
    }
  });

  const backgroundColor = resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc';
  const fogColor = resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <>
      {/* Scene background */}
      <color attach="background" args={[backgroundColor]} />

      {/* Fog for depth */}
      <fog attach="fog" color={fogColor} near={5} far={15} />

      {/* Lighting system */}
      <ambientLight intensity={resolvedTheme === 'dark' ? 0.3 : 0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={resolvedTheme === 'dark' ? 0.8 : 1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight
        position={[-3, 2, -5]}
        intensity={resolvedTheme === 'dark' ? 0.4 : 0.3}
        color={resolvedTheme === 'dark' ? '#3b82f6' : '#6366f1'}
      />

      {/* Orbit controls with constraints */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
      />

      {/* Project cards */}
      {featuredProjects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          index={index}
          onHover={onProjectHover || (() => {})}
          onClick={onProjectClick || (() => {})}
          onFocus={onProjectFocus || (() => {})}
          focused={focusedProject?.slug === project.slug}
          analytics={analytics}
        />
      ))}

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9'}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}
