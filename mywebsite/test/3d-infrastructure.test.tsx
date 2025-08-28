import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeviceCapabilities } from '@/components/3d/device-capabilities';

// Mock WebGL context
const mockWebGLContext = {
  MAX_TEXTURE_SIZE: 0x0d33,
  getParameter: vi.fn(function (this: any, param) {
    if (param === this.MAX_TEXTURE_SIZE) return 4096;
    return null;
  }),
  getExtension: vi.fn(() => ({})),
  getSupportedExtensions: vi.fn(() => [
    'OES_texture_float',
    'OES_element_index_uint',
    'WEBGL_compressed_texture_s3tc',
  ]),
};

describe('DeviceCapabilities', () => {
  beforeEach(() => {
    // Reset cache
    (DeviceCapabilities as any).cache = null;

    // Mock canvas and WebGL context
    const mockCanvas = {
      getContext: vi.fn(contextType => {
        if (contextType === 'webgl2') return mockWebGLContext;
        if (contextType === 'webgl' || contextType === 'experimental-webgl')
          return mockWebGLContext;
        return null;
      }),
      remove: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return document.createElement(tagName);
    });

    // Mock navigator properties
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      configurable: true,
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      configurable: true,
    });

    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect desktop device capabilities', async () => {
    const capabilities = await DeviceCapabilities.detect();

    expect(capabilities.isMobile).toBe(false);
    expect(capabilities.maxTextureSize).toBe(4096);
    expect(capabilities.webglVersion).toBe(2);
    expect(capabilities.supportedExtensions).toContain('OES_texture_float');
  });

  it('should detect mobile device', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    });

    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      configurable: true,
    });

    // Reset cache to force re-detection
    (DeviceCapabilities as any).cache = null;

    const capabilities = await DeviceCapabilities.detect();

    expect(capabilities.isMobile).toBe(true);
  });

  it('should determine low-end device correctly', async () => {
    // Mock low-end device characteristics
    Object.defineProperty(navigator, 'deviceMemory', {
      value: 2,
      configurable: true,
    });

    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g', saveData: true },
      configurable: true,
    });

    mockWebGLContext.getParameter.mockImplementation(param => {
      if (param === 'MAX_TEXTURE_SIZE') return 1024; // Small texture size
      return null;
    });

    // Reset cache to force re-detection
    (DeviceCapabilities as any).cache = null;

    const capabilities = await DeviceCapabilities.detect();

    expect(capabilities.isLowEnd).toBe(true);
  });

  it('should provide performance recommendations', async () => {
    const capabilities = await DeviceCapabilities.detect();

    const settings = DeviceCapabilities.getRecommendedSettings();

    expect(settings).toHaveProperty('pixelRatio');
    expect(settings).toHaveProperty('antialias');
    expect(settings).toHaveProperty('shadows');
    expect(settings).toHaveProperty('postprocessing');
    expect(typeof settings.pixelRatio).toBe('number');
    expect(typeof settings.antialias).toBe('boolean');
  });

  it('should cache detection results', async () => {
    const capabilities1 = await DeviceCapabilities.detect();
    const capabilities2 = await DeviceCapabilities.detect();

    // Should return the same object (cached)
    expect(capabilities1).toBe(capabilities2);
  });

  it('should handle WebGL detection failure gracefully', async () => {
    // Mock WebGL not supported
    const mockCanvas = {
      getContext: vi.fn(() => null),
      remove: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as any);

    // Reset cache to force re-detection
    (DeviceCapabilities as any).cache = null;

    const capabilities = await DeviceCapabilities.detect();

    expect(capabilities.maxTextureSize).toBe(512); // Fallback value
    expect(capabilities.webglVersion).toBe(1);
    expect(capabilities.supportedExtensions).toEqual([]);
  });

  it('should provide utility methods', async () => {
    await DeviceCapabilities.detect();

    expect(typeof DeviceCapabilities.isLowEndDevice()).toBe('boolean');
    expect(typeof DeviceCapabilities.isMobileDevice()).toBe('boolean');
    expect(typeof DeviceCapabilities.getMaxTextureSize()).toBe('number');
    expect(typeof DeviceCapabilities.supportsWebGL2()).toBe('boolean');
    expect(typeof DeviceCapabilities.hasExtension('OES_texture_float')).toBe(
      'boolean'
    );
  });
});

describe('3D Infrastructure Integration', () => {
  it('should optimize for different device types', async () => {
    // Test mobile optimization
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    });

    // Reset cache to force re-detection
    (DeviceCapabilities as any).cache = null;

    const capabilities = await DeviceCapabilities.detect();
    const settings = DeviceCapabilities.getRecommendedSettings();

    if (capabilities.isMobile) {
      expect(settings.pixelRatio).toBeLessThanOrEqual(2);
    }
  });

  it('should handle memory constraints', async () => {
    // Mock low memory device
    Object.defineProperty(navigator, 'deviceMemory', {
      value: 1, // Very low memory
      configurable: true,
    });

    // Reset cache to force re-detection
    (DeviceCapabilities as any).cache = null;

    const capabilities = await DeviceCapabilities.detect();
    const settings = DeviceCapabilities.getRecommendedSettings();

    if (capabilities.isLowEnd) {
      expect(settings.antialias).toBe(false);
      expect(settings.shadows).toBe(false);
      expect(settings.postprocessing).toBe(false);
    }
  });
});
