'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  onPerformanceChange?: (performance: 'high' | 'medium' | 'low') => void;
  deviceCapabilities: {
    isMobile: boolean;
    isLowEnd: boolean;
    maxTextureSize: number;
  };
  reducedMotion: boolean;
}

export function PerformanceMonitor({
  onPerformanceChange,
  deviceCapabilities,
  reducedMotion,
}: PerformanceMonitorProps) {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const [currentPerformance, setCurrentPerformance] = useState<
    'high' | 'medium' | 'low'
  >('high');

  // Performance thresholds
  const PERFORMANCE_THRESHOLDS = {
    HIGH_FPS: deviceCapabilities.isMobile ? 45 : 55,
    MEDIUM_FPS: deviceCapabilities.isMobile ? 25 : 35,
    SAMPLE_SIZE: 60, // frames to average
    CHECK_INTERVAL: 120, // frames between performance checks
  };

  useFrame(() => {
    if (reducedMotion) return;

    frameCount.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;

    // Calculate FPS every frame
    if (deltaTime > 0) {
      const fps = 1000 / deltaTime;
      fpsHistory.current.push(fps);

      // Keep only recent samples
      if (fpsHistory.current.length > PERFORMANCE_THRESHOLDS.SAMPLE_SIZE) {
        fpsHistory.current.shift();
      }
    }

    lastTime.current = currentTime;

    // Check performance periodically
    if (frameCount.current % PERFORMANCE_THRESHOLDS.CHECK_INTERVAL === 0) {
      checkPerformance();
    }
  });

  const checkPerformance = () => {
    if (fpsHistory.current.length < 30) return; // Need enough samples

    // Calculate average FPS
    const avgFps =
      fpsHistory.current.reduce((sum, fps) => sum + fps, 0) /
      fpsHistory.current.length;

    // Calculate frame time consistency (lower is better)
    const frameTimes = fpsHistory.current.map(fps => 1000 / fps);
    const avgFrameTime =
      frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
    const frameTimeVariance =
      frameTimes.reduce(
        (sum, time) => sum + Math.pow(time - avgFrameTime, 2),
        0
      ) / frameTimes.length;
    const frameTimeStdDev = Math.sqrt(frameTimeVariance);

    // Memory usage check
    const memoryInfo = (performance as any).memory;
    const memoryPressure = memoryInfo
      ? memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit
      : 0;

    // Determine performance level
    let newPerformance: 'high' | 'medium' | 'low';

    if (
      avgFps >= PERFORMANCE_THRESHOLDS.HIGH_FPS &&
      frameTimeStdDev < 5 &&
      memoryPressure < 0.7
    ) {
      newPerformance = 'high';
    } else if (
      avgFps >= PERFORMANCE_THRESHOLDS.MEDIUM_FPS &&
      memoryPressure < 0.85
    ) {
      newPerformance = 'medium';
    } else {
      newPerformance = 'low';
    }

    // Only update if performance level changed
    if (newPerformance !== currentPerformance) {
      setCurrentPerformance(newPerformance);
      onPerformanceChange?.(newPerformance);

      // Apply performance optimizations
      applyPerformanceOptimizations(newPerformance);

      console.log(`Performance level changed to: ${newPerformance}`, {
        avgFps: avgFps.toFixed(1),
        frameTimeStdDev: frameTimeStdDev.toFixed(2),
        memoryPressure: (memoryPressure * 100).toFixed(1) + '%',
      });
    }
  };

  const applyPerformanceOptimizations = (
    performance: 'high' | 'medium' | 'low'
  ) => {
    switch (performance) {
      case 'low':
        // Reduce pixel ratio
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        // Disable shadows if possible (would need to be handled by parent components)
        break;
      case 'medium':
        // Moderate pixel ratio
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        break;
      case 'high':
        // Full quality
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        break;
    }
  };

  // Monitor WebGL context loss
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      onPerformanceChange?.('low');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      // Reset performance monitoring
      fpsHistory.current = [];
      frameCount.current = 0;
      setCurrentPerformance('high');
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, onPerformanceChange]);

  // This component doesn't render anything visible
  return null;
}

// Utility hook for accessing performance data
export function usePerformanceData() {
  const [performanceData, setPerformanceData] = useState({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    performance: 'high' as 'high' | 'medium' | 'low',
  });

  useFrame(() => {
    const memoryInfo = (performance as any).memory;
    setPerformanceData(prev => ({
      ...prev,
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0, // MB
    }));
  });

  return performanceData;
}
