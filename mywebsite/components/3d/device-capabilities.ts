interface DeviceCapabilitiesData {
  isMobile: boolean;
  isLowEnd: boolean;
  maxTextureSize: number;
  webglVersion: 1 | 2;
  supportedExtensions: string[];
  memoryInfo?: {
    deviceMemory?: number;
    jsHeapSizeLimit?: number;
  };
  connectionInfo?: {
    effectiveType?: string;
    saveData?: boolean;
  };
}

export class DeviceCapabilities {
  private static cache: DeviceCapabilitiesData | null = null;

  static async detect(): Promise<DeviceCapabilitiesData> {
    // Return cached result if available
    if (this.cache) {
      return this.cache;
    }

    const capabilities = await this.performDetection();
    this.cache = capabilities;
    return capabilities;
  }

  private static async performDetection(): Promise<DeviceCapabilitiesData> {
    // Mobile detection
    const isMobile = this.detectMobile();

    // WebGL capabilities
    const webglInfo = this.detectWebGLCapabilities();

    // Memory information
    const memoryInfo = this.detectMemoryInfo();

    // Network information
    const connectionInfo = this.detectConnectionInfo();

    // Determine if device is low-end
    const isLowEnd = this.determineIfLowEnd({
      isMobile,
      memoryInfo,
      connectionInfo,
      webglInfo,
    });

    return {
      isMobile,
      isLowEnd,
      maxTextureSize: webglInfo.maxTextureSize,
      webglVersion: webglInfo.version,
      supportedExtensions: webglInfo.extensions,
      memoryInfo,
      connectionInfo,
    };
  }

  private static detectMobile(): boolean {
    // Check user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet'];
    const isMobileUA = mobileKeywords.some(keyword =>
      userAgent.includes(keyword)
    );

    // Check touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check screen size
    const isSmallScreen = window.innerWidth <= 768;

    // Check device orientation support
    const hasOrientation = 'orientation' in window;

    return isMobileUA || (hasTouch && isSmallScreen) || hasOrientation;
  }

  private static detectWebGLCapabilities() {
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let version: 1 | 2 = 1;

    // Try WebGL 2 first
    const webgl2Context = canvas.getContext('webgl2');
    if (webgl2Context && webgl2Context instanceof WebGL2RenderingContext) {
      gl = webgl2Context;
      version = 2;
    } else {
      // Fall back to WebGL 1
      const webgl1Context =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (webgl1Context && webgl1Context instanceof WebGLRenderingContext) {
        gl = webgl1Context;
        version = 1;
      }
    }

    if (!gl) {
      return {
        version: 1 as const,
        maxTextureSize: 512,
        extensions: [],
      };
    }

    // Get maximum texture size
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    // Get supported extensions
    const extensions = gl.getSupportedExtensions() || [];

    // Clean up
    canvas.remove();

    return {
      version,
      maxTextureSize,
      extensions,
    };
  }

  private static detectMemoryInfo() {
    const memoryInfo: DeviceCapabilitiesData['memoryInfo'] = {};

    // Device memory (if available)
    if ('deviceMemory' in navigator) {
      memoryInfo.deviceMemory = (navigator as any).deviceMemory;
    }

    // JavaScript heap size (Chrome only)
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory;
      memoryInfo.jsHeapSizeLimit = perfMemory.jsHeapSizeLimit;
    }

    return memoryInfo;
  }

  private static detectConnectionInfo() {
    const connectionInfo: DeviceCapabilitiesData['connectionInfo'] = {};

    // Network information (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connectionInfo.effectiveType = connection.effectiveType;
      connectionInfo.saveData = connection.saveData;
    }

    return connectionInfo;
  }

  private static determineIfLowEnd({
    isMobile,
    memoryInfo,
    connectionInfo,
    webglInfo,
  }: {
    isMobile: boolean;
    memoryInfo: DeviceCapabilitiesData['memoryInfo'];
    connectionInfo: DeviceCapabilitiesData['connectionInfo'];
    webglInfo: ReturnType<typeof DeviceCapabilities.detectWebGLCapabilities>;
  }): boolean {
    let lowEndScore = 0;

    // Mobile devices are more likely to be low-end
    if (isMobile) {
      lowEndScore += 1;
    }

    // Low device memory
    if (memoryInfo?.deviceMemory && memoryInfo.deviceMemory <= 4) {
      lowEndScore += 2;
    }

    // Small JavaScript heap
    if (
      memoryInfo?.jsHeapSizeLimit &&
      memoryInfo.jsHeapSizeLimit < 1073741824
    ) {
      // < 1GB
      lowEndScore += 1;
    }

    // Slow network connection
    if (
      connectionInfo?.effectiveType === 'slow-2g' ||
      connectionInfo?.effectiveType === '2g'
    ) {
      lowEndScore += 2;
    } else if (connectionInfo?.effectiveType === '3g') {
      lowEndScore += 1;
    }

    // Data saver mode
    if (connectionInfo?.saveData) {
      lowEndScore += 1;
    }

    // Small texture support
    if (webglInfo.maxTextureSize < 2048) {
      lowEndScore += 2;
    } else if (webglInfo.maxTextureSize < 4096) {
      lowEndScore += 1;
    }

    // WebGL 1 only
    if (webglInfo.version === 1) {
      lowEndScore += 1;
    }

    // Missing important extensions
    const importantExtensions = [
      'OES_texture_float',
      'OES_element_index_uint',
      'WEBGL_compressed_texture_s3tc',
    ];
    const missingExtensions = importantExtensions.filter(
      ext => !webglInfo.extensions.includes(ext)
    );
    lowEndScore += missingExtensions.length;

    // Threshold for low-end classification
    return lowEndScore >= 4;
  }

  // Utility methods for runtime checks
  static isLowEndDevice(): boolean {
    return this.cache?.isLowEnd ?? false;
  }

  static isMobileDevice(): boolean {
    return this.cache?.isMobile ?? false;
  }

  static getMaxTextureSize(): number {
    return this.cache?.maxTextureSize ?? 512;
  }

  static supportsWebGL2(): boolean {
    return this.cache?.webglVersion === 2;
  }

  static hasExtension(extension: string): boolean {
    return this.cache?.supportedExtensions.includes(extension) ?? false;
  }

  // Performance recommendations based on capabilities
  static getRecommendedSettings() {
    if (!this.cache) {
      return {
        pixelRatio: 1,
        antialias: false,
        shadows: false,
        postprocessing: false,
      };
    }

    const { isLowEnd, isMobile } = this.cache;

    if (isLowEnd) {
      return {
        pixelRatio: 1,
        antialias: false,
        shadows: false,
        postprocessing: false,
        maxLights: 2,
        lodBias: 2,
      };
    }

    if (isMobile) {
      return {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        antialias: true,
        shadows: true,
        postprocessing: false,
        maxLights: 4,
        lodBias: 1,
      };
    }

    // Desktop high-end
    return {
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      shadows: true,
      postprocessing: true,
      maxLights: 8,
      lodBias: 0,
    };
  }
}
