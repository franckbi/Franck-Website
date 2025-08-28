/**
 * Network retry utilities with exponential backoff and circuit breaker pattern
 */

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
  signal?: AbortSignal;
}

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      ...options,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout!;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold!) {
      this.state = 'OPEN';
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

// Global circuit breakers for different types of requests
const circuitBreakers = new Map<string, CircuitBreaker>();

function getCircuitBreaker(
  key: string,
  options?: CircuitBreakerOptions
): CircuitBreaker {
  if (!circuitBreakers.has(key)) {
    circuitBreakers.set(key, new CircuitBreaker(options));
  }
  return circuitBreakers.get(key)!;
}

/**
 * Retry a network request with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = (error: Error) => isRetryableError(error),
    onRetry,
    signal,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Check if operation was aborted
      if (signal?.aborted) {
        throw new Error('Operation aborted');
      }

      const result = await operation();
      return result;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Don't retry if error is not retryable
      if (!retryCondition(lastError)) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      const jitteredDelay = delay + Math.random() * 1000; // Add up to 1s jitter

      // Call retry callback
      onRetry?.(attempt, lastError);

      // Wait before retrying
      await sleep(jitteredDelay, signal);
    }
  }

  throw lastError!;
}

/**
 * Fetch with retry and circuit breaker
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & RetryOptions = {}
): Promise<Response> {
  const {
    maxAttempts,
    baseDelay,
    maxDelay,
    backoffFactor,
    retryCondition,
    onRetry,
    signal,
    ...fetchOptions
  } = options;

  const retryOptions: RetryOptions = {
    maxAttempts,
    baseDelay,
    maxDelay,
    backoffFactor,
    retryCondition,
    onRetry,
    signal,
  };

  // Use circuit breaker for this URL
  const circuitBreaker = getCircuitBreaker(new URL(url).origin);

  return circuitBreaker.execute(async () => {
    return retryWithBackoff(async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    }, retryOptions);
  });
}

/**
 * Load 3D asset with retry logic
 */
export async function load3DAssetWithRetry(
  url: string,
  options: RetryOptions = {}
): Promise<ArrayBuffer> {
  const response = await fetchWithRetry(url, {
    ...options,
    retryCondition: error => {
      // Retry on network errors and 5xx server errors
      return (
        error.message.includes('fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('HTTP 5')
      );
    },
  });

  return response.arrayBuffer();
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /connection/i,
    /fetch/i,
    /HTTP 5\d\d/,
    /HTTP 429/, // Rate limited
    /HTTP 408/, // Request timeout
  ];

  return retryablePatterns.some(
    pattern => pattern.test(error.message) || pattern.test(error.name)
  );
}

/**
 * Sleep utility with abort signal support
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Operation aborted'));
    });
  });
}

/**
 * Network status monitoring
 */
export class NetworkMonitor {
  private listeners: Set<(online: boolean) => void> = new Set();
  private _isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this._isOnline = true;
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    this._isOnline = false;
    this.notifyListeners(false);
  };

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  addListener(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners.clear();
  }
}

// Global network monitor instance
let networkMonitor: NetworkMonitor | null = null;

export function getNetworkMonitor(): NetworkMonitor {
  if (!networkMonitor) {
    networkMonitor = new NetworkMonitor();
  }
  return networkMonitor;
}

/**
 * React hook for network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const monitor = getNetworkMonitor();
    const unsubscribe = monitor.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

/**
 * Preload critical assets with retry
 */
export async function preloadCriticalAssets(
  urls: string[],
  options: RetryOptions = {}
): Promise<void> {
  const promises = urls.map(url =>
    fetchWithRetry(url, {
      ...options,
      maxAttempts: 2, // Fewer retries for preloading
      baseDelay: 500,
    }).catch(error => {
      console.warn(`Failed to preload asset: ${url}`, error);
      return null;
    })
  );

  await Promise.allSettled(promises);
}

/**
 * Batch load assets with concurrency control
 */
export async function batchLoadAssets(
  urls: string[],
  options: {
    concurrency?: number;
    retryOptions?: RetryOptions;
  } = {}
): Promise<(Response | null)[]> {
  const { concurrency = 3, retryOptions = {} } = options;
  const results: (Response | null)[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchPromises = batch.map(url =>
      fetchWithRetry(url, retryOptions).catch(error => {
        console.warn(`Failed to load asset: ${url}`, error);
        return null;
      })
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

// Import React for the hook
import React from 'react';
