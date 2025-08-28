'use client';

/* eslint-disable react/no-unescaped-entities */

import { Suspense, useState, useEffect, useRef, ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import {
  AssetManager,
  AssetBundle,
  LoadingProgress,
  getAssetManager,
} from '@/lib/assets/asset-manager';
import { LODManager, getLODManager } from '@/lib/assets/lod-system';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { WebGLErrorBoundary } from './webgl-error-boundary';
import { getNetworkMonitor } from '@/lib/utils/network-retry';

interface LazyAssetLoaderProps {
  bundle: AssetBundle;
  children: (assets: {
    models: Map<string, any>;
    textures: Map<string, any>;
  }) => ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
  enableLOD?: boolean;
  lodConfig?: any;
}

interface AssetLoadingState {
  status: 'idle' | 'loading' | 'loaded' | 'error' | 'retrying' | 'offline';
  progress: LoadingProgress | null;
  assets: { models: Map<string, any>; textures: Map<string, any> } | null;
  error: Error | null;
  retryCount: number;
  networkOnline: boolean;
}

export function LazyAssetLoader({
  bundle,
  children,
  fallback,
  loadingComponent,
  errorComponent,
  onLoadComplete,
  onLoadError,
  enableLOD = true,
  lodConfig,
}: LazyAssetLoaderProps) {
  const { gl } = useThree();
  const { lowPowerMode } = useSettingsStore();
  const [loadingState, setLoadingState] = useState<AssetLoadingState>({
    status: 'idle',
    progress: null,
    assets: null,
    error: null,
    retryCount: 0,
    networkOnline: navigator.onLine,
  });

  const assetManagerRef = useRef<AssetManager>();
  const lodManagerRef = useRef<LODManager>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const maxRetries = 3;

  // Monitor network status
  useEffect(() => {
    const networkMonitor = getNetworkMonitor();
    const unsubscribe = networkMonitor.addListener(online => {
      setLoadingState(prev => {
        const newState = {
          ...prev,
          networkOnline: online,
          status: online ? prev.status : 'offline',
        };

        // Retry loading if we come back online and were in error state
        if (online && prev.status === 'offline' && prev.error) {
          setTimeout(() => {
            setLoadingState(current => ({
              ...current,
              status: 'idle',
              error: null,
            }));
          }, 1000);
        }

        return newState;
      });
    });

    return unsubscribe;
  }, []);

  // Initialize managers
  useEffect(() => {
    if (!assetManagerRef.current) {
      assetManagerRef.current = getAssetManager(gl);
    }
    if (enableLOD && !lodManagerRef.current) {
      lodManagerRef.current = getLODManager(lodConfig);
    }
  }, [gl, enableLOD, lodConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load assets when component mounts or bundle changes
  useEffect(() => {
    if (
      !assetManagerRef.current ||
      lowPowerMode ||
      !loadingState.networkOnline
    ) {
      return;
    }

    // Don't reload if already loaded successfully
    if (loadingState.status === 'loaded') {
      return;
    }

    let cancelled = false;

    const loadAssetsWithRetry = async (attempt: number = 1): Promise<void> => {
      try {
        // Create new abort controller for this attempt
        abortControllerRef.current = new AbortController();

        setLoadingState(prev => ({
          ...prev,
          status: attempt > 1 ? 'retrying' : 'loading',
          error: null,
        }));

        // Set up progress tracking
        const unsubscribe = assetManagerRef.current!.onProgress(progress => {
          if (!cancelled && progress.bundleId === bundle.id) {
            setLoadingState(prev => ({ ...prev, progress }));
          }
        });

        // Load the bundle (asset manager accepts a single argument)
        const assets = await assetManagerRef.current!.loadBundle(bundle);

        if (!cancelled) {
          setLoadingState({
            status: 'loaded',
            progress: null,
            assets,
            error: null,
            retryCount: 0,
            networkOnline: loadingState.networkOnline,
          });
          onLoadComplete?.();
        }

        unsubscribe();
      } catch (error) {
        if (!cancelled && !abortControllerRef.current?.signal.aborted) {
          const err =
            error instanceof Error ? error : new Error('Failed to load assets');

          // Check if we should retry
          if (attempt < maxRetries && isRetryableError(err)) {
            console.warn(
              `Asset loading attempt ${attempt} failed, retrying...`,
              err
            );

            // Exponential backoff delay
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);

            setLoadingState(prev => ({
              ...prev,
              retryCount: attempt,
              error: err,
            }));

            setTimeout(() => {
              if (!cancelled) {
                loadAssetsWithRetry(attempt + 1);
              }
            }, delay);
          } else {
            // Max retries reached or non-retryable error
            setLoadingState({
              status: 'error',
              progress: null,
              assets: null,
              error: err,
              retryCount: attempt,
              networkOnline: loadingState.networkOnline,
            });
            onLoadError?.(err);
          }
        }
      }
    };

    loadAssetsWithRetry();

    return () => {
      cancelled = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    bundle,
    lowPowerMode,
    loadingState.networkOnline,
    loadingState.status,
    onLoadComplete,
    onLoadError,
  ]);

  // Helper function to determine if error is retryable
  const isRetryableError = (error: Error): boolean => {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /fetch/i,
      /HTTP 5\d\d/,
      /HTTP 429/,
      /HTTP 408/,
      /abort/i,
    ];

    return retryablePatterns.some(
      pattern => pattern.test(error.message) || pattern.test(error.name)
    );
  };

  // Update LOD system
  useFrame((state, delta) => {
    if (lodManagerRef.current && loadingState.status === 'loaded') {
      lodManagerRef.current.update(state.camera, delta);
    }
  });

  // Show offline state
  if (loadingState.status === 'offline' || !loadingState.networkOnline) {
    return (
      <WebGLErrorBoundary>
        <Suspense fallback={fallback}>
          <AssetOfflineIndicator
            onRetry={() => {
              if (navigator.onLine) {
                setLoadingState(prev => ({
                  ...prev,
                  status: 'idle',
                  networkOnline: true,
                  error: null,
                }));
              }
            }}
          />
        </Suspense>
      </WebGLErrorBoundary>
    );
  }

  // Show loading/retrying state
  if (loadingState.status === 'loading' || loadingState.status === 'retrying') {
    return (
      <WebGLErrorBoundary>
        <Suspense fallback={fallback}>
          {loadingComponent || (
            <AssetLoadingIndicator
              progress={loadingState.progress}
              isRetrying={loadingState.status === 'retrying'}
              retryCount={loadingState.retryCount}
            />
          )}
        </Suspense>
      </WebGLErrorBoundary>
    );
  }

  // Show error state
  if (loadingState.status === 'error') {
    return (
      <WebGLErrorBoundary>
        <Suspense fallback={fallback}>
          {errorComponent || (
            <AssetErrorIndicator
              error={loadingState.error!}
              retryCount={loadingState.retryCount}
              maxRetries={maxRetries}
              onRetry={() =>
                setLoadingState(prev => ({
                  ...prev,
                  status: 'idle',
                  error: null,
                  retryCount: 0,
                }))
              }
            />
          )}
        </Suspense>
      </WebGLErrorBoundary>
    );
  }

  // Show loaded content
  if (loadingState.status === 'loaded' && loadingState.assets) {
    return (
      <WebGLErrorBoundary>
        <Suspense fallback={fallback}>{children(loadingState.assets)}</Suspense>
      </WebGLErrorBoundary>
    );
  }

  // Show fallback for idle state
  return (
    <WebGLErrorBoundary>
      <Suspense fallback={fallback}>{fallback}</Suspense>
    </WebGLErrorBoundary>
  );
}

interface AssetLoadingIndicatorProps {
  progress: LoadingProgress | null;
  isRetrying?: boolean;
  retryCount?: number;
}

function AssetLoadingIndicator({
  progress,
  isRetrying = false,
  retryCount = 0,
}: AssetLoadingIndicatorProps) {
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4 p-6 bg-background/90 backdrop-blur-sm rounded-lg border">
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            {isRetrying
              ? `Retrying 3D Assets (${retryCount}/3)`
              : 'Loading 3D Assets'}
          </h3>
          {progress && (
            <>
              <div className="w-64 bg-muted rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {progress.loadedAssets} of {progress.totalAssets} assets loaded
                {progress.currentAsset && (
                  <span className="block mt-1 truncate max-w-64">
                    Loading: {progress.currentAsset.split('/').pop()}
                  </span>
                )}
                {progress.estimatedTimeRemaining &&
                  progress.estimatedTimeRemaining > 1000 && (
                    <span className="block mt-1">
                      ~{Math.ceil(progress.estimatedTimeRemaining / 1000)}s
                      remaining
                    </span>
                  )}
              </p>
            </>
          )}
        </div>
      </div>
    </Html>
  );
}

interface AssetErrorIndicatorProps {
  error: Error;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

function AssetErrorIndicator({
  error,
  retryCount,
  maxRetries,
  onRetry,
}: AssetErrorIndicatorProps) {
  const canRetry = retryCount < maxRetries;
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4 p-6 bg-background/90 backdrop-blur-sm rounded-lg border border-destructive/20">
        <div className="text-destructive">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Failed to Load Assets</h3>
          <p className="text-sm text-muted-foreground mb-2 max-w-64">
            {error.message || 'An error occurred while loading 3D assets'}
          </p>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              Retry attempts: {retryCount}/{maxRetries}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {canRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry Loading
              </button>
            )}
            <button
              onClick={() => {
                const event = new CustomEvent('force-low-power-mode');
                window.dispatchEvent(event);
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Switch to 2D Mode
            </button>
          </div>
        </div>
      </div>
    </Html>
  );
}

interface AssetOfflineIndicatorProps {
  onRetry: () => void;
}

function AssetOfflineIndicator({ onRetry }: AssetOfflineIndicatorProps) {
  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4 p-6 bg-background/90 backdrop-blur-sm rounded-lg border border-warning/20">
        <div className="text-warning">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">You're Offline</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-64">
            3D assets require an internet connection. Please check your network
            and try again.
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </Html>
  );
}

// Hook for using asset loading in components
export function useAssetLoader(bundle: AssetBundle) {
  const { gl } = useThree();
  const [loadingState, setLoadingState] = useState<AssetLoadingState>({
    status: 'idle',
    progress: null,
    assets: null,
    error: null,
    retryCount: 0,
    networkOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const assetManagerRef = useRef<AssetManager>();

  useEffect(() => {
    if (!assetManagerRef.current) {
      assetManagerRef.current = getAssetManager(gl);
    }
  }, [gl]);

  const loadAssets = async () => {
    if (!assetManagerRef.current) return;

    try {
      setLoadingState(prev => ({ ...prev, status: 'loading', error: null }));

      const unsubscribe = assetManagerRef.current.onProgress(progress => {
        if (progress.bundleId === bundle.id) {
          setLoadingState(prev => ({ ...prev, progress }));
        }
      });

      const assets = await assetManagerRef.current.loadBundle(bundle);

      setLoadingState({
        status: 'loaded',
        progress: null,
        assets,
        error: null,
        retryCount: 0,
        networkOnline:
          typeof navigator !== 'undefined' ? navigator.onLine : true,
      });

      unsubscribe();
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to load assets');
      setLoadingState({
        status: 'error',
        progress: null,
        assets: null,
        error: err,
        retryCount: 0,
        networkOnline:
          typeof navigator !== 'undefined' ? navigator.onLine : true,
      });
    }
  };

  return {
    ...loadingState,
    loadAssets,
    retry: () => setLoadingState(prev => ({ ...prev, status: 'idle' })),
  };
}

// Preloader component for critical assets
export function AssetPreloader({ bundles }: { bundles: AssetBundle[] }) {
  const { gl } = useThree();
  const { lowPowerMode } = useSettingsStore();
  const assetManagerRef = useRef<AssetManager>();

  useEffect(() => {
    if (!assetManagerRef.current) {
      assetManagerRef.current = getAssetManager(gl);
    }
  }, [gl]);

  useEffect(() => {
    if (!assetManagerRef.current || lowPowerMode) return;

    assetManagerRef.current.preloadCriticalAssets(bundles).catch(error => {
      console.warn('Failed to preload critical assets:', error);
    });
  }, [bundles, lowPowerMode]);

  return null;
}
