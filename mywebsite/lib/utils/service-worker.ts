/**
 * Service Worker registration and management utilities
 */

import { useState, useEffect } from 'react';

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config;
  }

  public async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration = registration;

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              this.config.onUpdate?.(registration);
            }
          });
        }
      });

      // Handle successful registration
      if (registration.active) {
        this.config.onSuccess?.(registration);
      }

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.config.onError?.(error as Error);
      return null;
    }
  }

  public async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      this.registration = null;
      console.log('Service Worker unregistered');
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  public async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  public skipWaiting(): void {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  public async clearCache(): Promise<void> {
    if (this.registration?.active) {
      this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }

  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  public async getNetworkStatus(): Promise<'online' | 'offline'> {
    return navigator.onLine ? 'online' : 'offline';
  }

  public onNetworkChange(
    callback: (status: 'online' | 'offline') => void
  ): () => void {
    const handleOnline = () => callback('online');
    const handleOffline = () => callback('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Singleton instance
let serviceWorkerManager: ServiceWorkerManager | null = null;

export const getServiceWorkerManager = (
  config?: ServiceWorkerConfig
): ServiceWorkerManager => {
  if (!serviceWorkerManager) {
    serviceWorkerManager = new ServiceWorkerManager(config);
  }
  return serviceWorkerManager;
};

// React hook for service worker
export const useServiceWorker = (config: ServiceWorkerConfig = {}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    'online'
  );

  useEffect(() => {
    const manager = getServiceWorkerManager({
      ...config,
      onSuccess: registration => {
        setIsRegistered(true);
        config.onSuccess?.(registration);
      },
      onUpdate: registration => {
        setIsUpdateAvailable(true);
        config.onUpdate?.(registration);
      },
      onError: config.onError,
    });

    // Register service worker
    manager.register();

    // Monitor network status
    const unsubscribe = manager.onNetworkChange(setNetworkStatus);

    return unsubscribe;
  }, [config]);

  const updateServiceWorker = () => {
    const manager = getServiceWorkerManager();
    manager.skipWaiting();
    setIsUpdateAvailable(false);
    // Reload page to use new service worker
    window.location.reload();
  };

  const clearCache = async () => {
    const manager = getServiceWorkerManager();
    await manager.clearCache();
  };

  return {
    isRegistered,
    isUpdateAvailable,
    networkStatus,
    updateServiceWorker,
    clearCache,
  };
};

// Utility functions for cache management
export const cacheAsset = async (
  url: string,
  cacheName: string = 'dynamic-v1'
): Promise<boolean> => {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cache = await caches.open(cacheName);
    await cache.add(url);
    return true;
  } catch (error) {
    console.error('Failed to cache asset:', url, error);
    return false;
  }
};

export const getCachedAsset = async (url: string): Promise<Response | null> => {
  if (!('caches' in window)) {
    return null;
  }

  try {
    const response = await caches.match(url);
    return response || null;
  } catch (error) {
    console.error('Failed to get cached asset:', url, error);
    return null;
  }
};

export const preloadCriticalAssets = async (urls: string[]): Promise<void> => {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('static-v1');
    await cache.addAll(urls);
    console.log('Critical assets preloaded:', urls.length);
  } catch (error) {
    console.error('Failed to preload critical assets:', error);
  }
};

// Performance monitoring integration
export const trackCachePerformance = () => {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  const observer = new PerformanceObserver(list => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.name.includes('sw.js')) {
        console.log('Service Worker performance:', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
        });
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.warn('Performance observer not supported:', error);
  }
};
