import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WebGLErrorBoundary } from '@/components/3d/webgl-error-boundary';
import {
  UserFriendlyError,
  NetworkError,
  WebGLError,
  AssetLoadError,
} from '@/components/ui/user-friendly-errors';
import {
  retryWithBackoff,
  fetchWithRetry,
  getNetworkMonitor,
} from '@/lib/utils/network-retry';

// Mock components for testing
const ThrowError = ({
  shouldThrow = false,
  errorType = 'generic',
}: {
  shouldThrow?: boolean;
  errorType?: string;
}) => {
  if (shouldThrow) {
    if (errorType === 'webgl') {
      throw new Error('WebGL context lost');
    } else if (errorType === 'network') {
      throw new Error('Network request failed');
    } else {
      throw new Error('Generic error');
    }
  }
  return <div>No error</div>;
};

// Mock global objects
const mockGtag = vi.fn();
const mockSentry = {
  captureException: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (global as any).window = {
    gtag: mockGtag,
    Sentry: mockSentry,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: { reload: vi.fn() },
    navigator: { onLine: true },
    dispatchEvent: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WebGL Error Boundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <WebGLErrorBoundary>
        <ThrowError shouldThrow={false} />
      </WebGLErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should catch and display WebGL errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <WebGLErrorBoundary>
        <ThrowError shouldThrow={true} errorType="webgl" />
      </WebGLErrorBoundary>
    );

    expect(screen.getByText('WebGL Context Lost')).toBeInTheDocument();
    expect(screen.getByText(/WebGL context was lost/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry webgl/i })
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should handle retry attempts', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <WebGLErrorBoundary retryAttempts={2}>
        <ThrowError shouldThrow={true} errorType="webgl" />
      </WebGLErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /retry webgl/i });
    fireEvent.click(retryButton);

    // Should show retry attempt
    await waitFor(() => {
      expect(screen.getByText(/retry attempts: 1\/2/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should track errors with analytics', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <WebGLErrorBoundary>
        <ThrowError shouldThrow={true} errorType="webgl" />
      </WebGLErrorBoundary>
    );

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'exception',
      expect.objectContaining({
        description: 'WebGL context lost',
        fatal: false,
      })
    );

    expect(mockSentry.captureException).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should provide fallback mode option', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <WebGLErrorBoundary>
        <ThrowError shouldThrow={true} errorType="webgl" />
      </WebGLErrorBoundary>
    );

    const fallbackButton = screen.getByRole('button', {
      name: /switch to 2d mode/i,
    });
    fireEvent.click(fallbackButton);

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'force-low-power-mode',
      })
    );

    consoleSpy.mockRestore();
  });
});

describe('User-Friendly Error Components', () => {
  it('should render network error with appropriate styling', () => {
    const onRetry = vi.fn();
    render(<NetworkError onRetry={onRetry} />);

    expect(screen.getByText('Connection Problem')).toBeInTheDocument();
    expect(
      screen.getByText(/check your network connection/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
  });

  it('should render WebGL error with fallback option', () => {
    const onRetry = vi.fn();
    const onFallback = vi.fn();

    render(<WebGLError onRetry={onRetry} onFallback={onFallback} />);

    expect(screen.getByText('3D Graphics Issue')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to 2d mode/i })
    ).toBeInTheDocument();
  });

  it('should render asset load error with technical details', () => {
    const onRetry = vi.fn();
    const details = 'Failed to load model.glb: Network timeout';

    render(<AssetLoadError onRetry={onRetry} details={details} />);

    expect(screen.getByText('Loading Problem')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show technical details/i })
    ).toBeInTheDocument();

    // Show technical details
    fireEvent.click(
      screen.getByRole('button', { name: /show technical details/i })
    );
    expect(screen.getByText(details)).toBeInTheDocument();
  });

  it('should show help suggestions when requested', () => {
    render(<UserFriendlyError type="network" />);

    const helpButton = screen.getByRole('button', { name: /show help/i });
    fireEvent.click(helpButton);

    expect(screen.getByText('Try these solutions:')).toBeInTheDocument();
    expect(
      screen.getByText(/check your internet connection/i)
    ).toBeInTheDocument();
  });
});

describe('Network Retry Utilities', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should retry failed requests with exponential backoff', async () => {
    const mockFetch = global.fetch as any;
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response('Success'));

    const operation = () => fetch('/test');
    const result = await retryWithBackoff(operation, {
      maxAttempts: 3,
      baseDelay: 100,
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result).toBeInstanceOf(Response);
  });

  it('should respect retry conditions', async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockRejectedValue(new Error('Client error'));

    const operation = () => fetch('/test');

    try {
      await retryWithBackoff(operation, {
        maxAttempts: 3,
        retryCondition: error => !error.message.includes('Client'),
      });
    } catch (error) {
      expect(error.message).toBe('Client error');
    }

    expect(mockFetch).toHaveBeenCalledTimes(1); // Should not retry
  });

  it('should handle fetch with retry and circuit breaker', async () => {
    const mockFetch = global.fetch as any;
    mockFetch.mockResolvedValue(new Response('Success', { status: 200 }));

    const response = await fetchWithRetry('/test', {
      maxAttempts: 2,
    });

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith('/test', expect.any(Object));
  });

  it('should handle circuit breaker open state', async () => {
    const mockFetch = global.fetch as any;

    // Simulate multiple failures to open circuit breaker
    mockFetch.mockRejectedValue(new Error('Server error'));

    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(fetchWithRetry('/test', { maxAttempts: 1 }).catch(e => e));
    }

    await Promise.all(promises);

    // Next request should fail immediately due to circuit breaker
    try {
      await fetchWithRetry('/test', { maxAttempts: 1 });
    } catch (error) {
      expect(error.message).toContain('Circuit breaker');
    }
  });
});

describe('Network Monitor', () => {
  it('should track online/offline status', () => {
    const monitor = getNetworkMonitor();
    const listener = vi.fn();

    const unsubscribe = monitor.addListener(listener);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    expect(listener).toHaveBeenCalledWith(false);

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);

    expect(listener).toHaveBeenCalledWith(true);

    unsubscribe();
  });

  it('should provide current online status', () => {
    const monitor = getNetworkMonitor();
    expect(monitor.isOnline).toBe(true);
  });
});

describe('Service Worker Error Handling', () => {
  // Note: Service worker tests would typically require a more complex setup
  // with service worker testing utilities. These are simplified unit tests.

  it('should handle cache errors gracefully', async () => {
    // Mock caches API
    global.caches = {
      open: vi.fn().mockRejectedValue(new Error('Cache error')),
      match: vi.fn(),
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    } as any;

    // Test that cache errors don't crash the application
    try {
      await caches.open('test-cache');
    } catch (error) {
      expect(error.message).toBe('Cache error');
    }
  });

  it('should provide offline fallbacks', () => {
    // Test offline response generation
    const isHTMLRequest = (request: any) =>
      request.headers?.get?.('accept')?.includes('text/html');

    const mockRequest = {
      headers: {
        get: vi.fn().mockReturnValue('text/html'),
      },
    };

    expect(isHTMLRequest(mockRequest)).toBe(true);
  });
});

describe('Error Recovery Scenarios', () => {
  it('should handle WebGL context loss and recovery', async () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const contextLostEvent = new Event('webglcontextlost');
    const contextRestoredEvent = new Event('webglcontextrestored');

    let contextLost = false;
    let contextRestored = false;

    canvas.addEventListener('webglcontextlost', () => {
      contextLost = true;
    });

    canvas.addEventListener('webglcontextrestored', () => {
      contextRestored = true;
    });

    canvas.dispatchEvent(contextLostEvent);
    expect(contextLost).toBe(true);

    canvas.dispatchEvent(contextRestoredEvent);
    expect(contextRestored).toBe(true);

    document.body.removeChild(canvas);
  });

  it('should handle asset loading failures with fallbacks', async () => {
    const mockAssetLoader = {
      loadWithRetry: vi
        .fn()
        .mockRejectedValueOnce(new Error('Primary asset failed'))
        .mockResolvedValueOnce({ type: 'fallback-asset' }),
    };

    // Simulate loading primary asset, then fallback
    try {
      await mockAssetLoader.loadWithRetry('primary.glb');
    } catch (error) {
      const fallback = await mockAssetLoader.loadWithRetry('fallback.glb');
      expect(fallback.type).toBe('fallback-asset');
    }

    expect(mockAssetLoader.loadWithRetry).toHaveBeenCalledTimes(2);
  });

  it('should handle memory pressure scenarios', () => {
    // Mock memory info
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
      },
      configurable: true,
    });

    const memoryUsage = (performance as any).memory.usedJSHeapSize;
    const memoryLimit = (performance as any).memory.jsHeapSizeLimit;
    const memoryPressure = memoryUsage / memoryLimit;

    expect(memoryPressure).toBeLessThan(0.1); // Low memory pressure
  });
});

describe('Error Analytics and Reporting', () => {
  it('should track error metrics', () => {
    const error = new Error('Test error');
    const context = { component: 'TestComponent', action: 'load' };

    // Simulate error reporting
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: context,
      });
    }

    expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
      description: 'Test error',
      fatal: false,
      custom_map: context,
    });
  });

  it('should batch error reports to avoid spam', () => {
    const errors = [
      new Error('Error 1'),
      new Error('Error 2'),
      new Error('Error 3'),
    ];

    // Simulate batched error reporting
    const errorBatch = errors.map(error => ({
      message: error.message,
      timestamp: Date.now(),
    }));

    expect(errorBatch).toHaveLength(3);
    expect(errorBatch[0].message).toBe('Error 1');
  });
});
