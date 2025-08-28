'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState, ReactNode, useRef } from 'react';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { WebGLErrorBoundary } from './webgl-error-boundary';
import { PerformanceMonitor } from './performance-monitor';
import { DeviceCapabilities } from './device-capabilities';
import { useMemoryManager } from '@/lib/utils/memory-manager';
import {
  announceLoadingState,
  prefersReducedMotion,
} from '@/lib/utils/accessibility';
import type { WebGLRenderer, Scene } from 'three';

/**
 * Props for the CanvasWrapper component
 */
interface CanvasWrapperProps {
  /** React children to render inside the 3D canvas */
  children: ReactNode;
  /** Fallback content to show when 3D is not available */
  fallback?: ReactNode;
  /** Additional CSS classes to apply to the wrapper */
  className?: string;
  /** Callback fired when performance level changes */
  onPerformanceChange?: (performance: 'high' | 'medium' | 'low') => void;
}

/**
 * CanvasWrapper - A comprehensive wrapper for react-three-fiber Canvas
 *
 * This component provides:
 * - WebGL capability detection and fallback handling
 * - Device performance assessment and adaptive rendering
 * - Accessibility features including screen reader support
 * - Memory management and cleanup
 * - Error boundaries for graceful degradation
 * - Performance monitoring and optimization
 *
 * The wrapper implements progressive enhancement:
 * 1. Base: Static fallback content
 * 2. Enhanced: 3D content with adaptive quality
 * 3. Optimized: Full 3D experience on capable devices
 *
 * @param props - Component props
 * @returns JSX element with 3D canvas or fallback content
 */
export function CanvasWrapper({
  children,
  fallback,
  className = '',
  onPerformanceChange,
}: CanvasWrapperProps) {
  // Get user preferences from global settings store
  const { lowPowerMode, reducedMotion } = useSettingsStore();

  // WebGL support detection state (null = detecting, boolean = result)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  // Device capabilities assessment result
  const [deviceCapabilities, setDeviceCapabilities] = useState<{
    isMobile: boolean;
    isLowEnd: boolean;
    maxTextureSize: number;
  } | null>(null);

  // References for Three.js objects that need manual cleanup
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  // Memory management utilities for preventing memory leaks
  const { cleanupScene, cleanupRenderer, registerCleanup } = useMemoryManager();

  /**
   * WebGL capability detection
   *
   * Performs comprehensive WebGL support testing including:
   * - Basic WebGL context creation
   * - Required extension availability
   * - Error handling for edge cases
   *
   * This runs once on component mount to determine if 3D rendering
   * is possible on the current device/browser combination.
   */
  useEffect(() => {
    const detectWebGL = () => {
      try {
        // Create a temporary canvas for testing WebGL support
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        // Check if WebGL context was successfully created
        if (!gl || !(gl instanceof WebGLRenderingContext)) {
          setWebglSupported(false);
          return;
        }

        // Test for extensions required by our 3D scenes
        const requiredExtensions = [
          'OES_texture_float', // Floating point textures for advanced effects
          'OES_element_index_uint', // 32-bit indices for complex geometry
        ];

        const missingExtensions = requiredExtensions.filter(
          ext => !gl.getExtension(ext)
        );

        // Log warnings for missing extensions but don't fail completely
        if (missingExtensions.length > 0) {
          console.warn('Missing WebGL extensions:', missingExtensions);
          // Could implement fallback rendering modes here
        }

        setWebglSupported(true);
      } catch (error) {
        console.error('WebGL detection failed:', error);
        setWebglSupported(false);
      }
    };

    detectWebGL();
  }, []);

  // Device capabilities detection
  useEffect(() => {
    const detectCapabilities = async () => {
      const capabilities = await DeviceCapabilities.detect();
      setDeviceCapabilities(capabilities);
    };

    detectCapabilities();
  }, []);

  // Memory cleanup on unmount
  useEffect(() => {
    const cleanup = registerCleanup(() => {
      if (sceneRef.current) {
        cleanupScene(sceneRef.current);
      }
      if (rendererRef.current) {
        cleanupRenderer(rendererRef.current);
      }
    });

    return cleanup;
  }, [registerCleanup, cleanupScene, cleanupRenderer]);

  // Show loading while detecting capabilities
  if (webglSupported === null || deviceCapabilities === null) {
    // Announce loading state
    useEffect(() => {
      announceLoadingState('loading', '3D scene');
    }, []);

    return (
      <div
        className={`flex items-center justify-center ${className}`}
        role="status"
        aria-label="Loading 3D scene"
      >
        <LoadingSpinner />
        <span className="sr-only">Loading 3D scene, please wait...</span>
      </div>
    );
  }

  // Show fallback if WebGL not supported or low power mode enabled
  if (!webglSupported || lowPowerMode) {
    // Announce fallback mode
    useEffect(() => {
      const reason = lowPowerMode
        ? 'Low power mode is active'
        : 'WebGL is not supported';
      announceLoadingState('loaded', `Static content (${reason})`);
    }, [lowPowerMode, webglSupported]);

    return (
      <div className={className}>
        {fallback || (
          <div
            className="flex items-center justify-center h-full bg-muted rounded-lg"
            role="img"
            aria-label={
              lowPowerMode
                ? 'Static project showcase (low power mode)'
                : 'Static project showcase (3D not supported)'
            }
          >
            <div className="text-center p-8">
              <h3 className="text-lg font-semibold mb-2">
                {lowPowerMode ? 'Low Power Mode Active' : '3D Not Supported'}
              </h3>
              <p className="text-muted-foreground">
                {lowPowerMode
                  ? 'Disable low power mode to view 3D content'
                  : 'Your browser does not support WebGL'}
              </p>
              {lowPowerMode && (
                <button
                  onClick={() =>
                    useSettingsStore.getState().setLowPowerMode(false)
                  }
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Enable 3D content by disabling low power mode"
                >
                  Enable 3D Content
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const canvasSettings = {
    antialias: !deviceCapabilities.isLowEnd,
    alpha: true,
    powerPreference: deviceCapabilities.isLowEnd
      ? 'low-power'
      : 'high-performance',
    stencil: false,
    depth: true,
  } as const;

  // Announce successful 3D loading
  useEffect(() => {
    if (webglSupported && !lowPowerMode) {
      announceLoadingState('loaded', '3D scene');
    }
  }, [webglSupported, lowPowerMode]);

  return (
    <div className={className}>
      <WebGLErrorBoundary
        retryAttempts={3}
        onError={(error, errorInfo) => {
          console.error('WebGL Error in canvas wrapper:', error, errorInfo);

          // Track WebGL errors
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
              description: error.message,
              fatal: false,
              custom_map: {
                component: 'CanvasWrapper',
                webgl_supported: webglSupported,
                device_low_end: deviceCapabilities?.isLowEnd,
              },
            });
          }
        }}
      >
        <ErrorBoundary
          fallback={
            <div
              className="flex items-center justify-center h-full bg-muted rounded-lg"
              role="alert"
              aria-label="3D scene error"
            >
              <div className="text-center p-8">
                <h3 className="text-lg font-semibold mb-2">3D Scene Error</h3>
                <p className="text-muted-foreground mb-4">
                  Failed to load 3D content. Please refresh the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Refresh page to retry loading 3D content"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          }
        >
          <Canvas
            gl={canvasSettings}
            camera={{
              position: [0, 0, 5],
              fov: 75,
              near: 0.1,
              far: 1000,
            }}
            onCreated={({ gl, scene }) => {
              // Store references for cleanup
              rendererRef.current = gl;
              sceneRef.current = scene;

              // Configure renderer for optimal performance
              gl.setClearColor('#000000', 0);

              // Optimize for mobile
              if (deviceCapabilities.isLowEnd) {
                gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
              }

              // Store renderer globally for memory manager
              (window as any).__THREE_RENDERER__ = gl;

              // Add accessibility attributes to canvas
              const canvas = gl.domElement;
              canvas.setAttribute('role', 'img');
              canvas.setAttribute(
                'aria-label',
                '3D interactive project showcase'
              );

              // Handle reduced motion
              if (prefersReducedMotion()) {
                canvas.setAttribute(
                  'aria-describedby',
                  'reduced-motion-notice'
                );
                const notice = document.createElement('div');
                notice.id = 'reduced-motion-notice';
                notice.className = 'sr-only';
                notice.textContent =
                  'Animations are reduced based on your system preferences.';
                document.body.appendChild(notice);
              }
            }}
          >
            <Suspense
              fallback={
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshBasicMaterial color="#666" wireframe />
                </mesh>
              }
            >
              <PerformanceMonitor
                onPerformanceChange={onPerformanceChange}
                deviceCapabilities={deviceCapabilities}
                reducedMotion={reducedMotion}
              />
              {children}
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </WebGLErrorBoundary>
    </div>
  );
}
