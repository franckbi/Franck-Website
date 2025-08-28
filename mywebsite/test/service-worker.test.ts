import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
  getServiceWorkerStatus,
  ServiceWorkerManager,
} from '@/lib/utils/service-worker';

// Mock service worker registration
const mockRegistration = {
  installing: null,
  waiting: null,
  active: null,
  scope: 'http://localhost:3000/',
  update: vi.fn().mockResolvedValue(undefined),
  unregister: vi.fn().mockResolvedValue(true),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockServiceWorker = {
  scriptURL: 'http://localhost:3000/sw.js',
  state: 'activated',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
};

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue(mockRegistration),
    getRegistration: vi.fn().mockResolvedValue(mockRegistration),
    getRegistrations: vi.fn().mockResolvedValue([mockRegistration]),
    ready: Promise.resolve(mockRegistration),
    controller: mockServiceWorker,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

describe('Service Worker Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerServiceWorker', () => {
    it('should register service worker successfully', async () => {
      const result = await registerServiceWorker('/sw.js');

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
      expect(result).toBe(mockRegistration);
    });

    it('should handle registration failure', async () => {
      const error = new Error('Registration failed');
      vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(error);

      await expect(registerServiceWorker('/sw.js')).rejects.toThrow(
        'Registration failed'
      );
    });

    it('should register with custom options', async () => {
      const options = { scope: '/app/' };
      await registerServiceWorker('/sw.js', options);

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
        '/sw.js',
        options
      );
    });

    it('should handle unsupported browsers', async () => {
      const originalServiceWorker = navigator.serviceWorker;
      // @ts-ignore
      delete navigator.serviceWorker;

      await expect(registerServiceWorker('/sw.js')).rejects.toThrow(
        'Service workers are not supported'
      );

      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
      });
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should unregister service worker successfully', async () => {
      const result = await unregisterServiceWorker();

      expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled();
      expect(mockRegistration.unregister).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle no registration found', async () => {
      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(
        undefined
      );

      const result = await unregisterServiceWorker();
      expect(result).toBe(false);
    });

    it('should handle unregistration failure', async () => {
      vi.mocked(mockRegistration.unregister).mockResolvedValueOnce(false);

      const result = await unregisterServiceWorker();
      expect(result).toBe(false);
    });
  });

  describe('updateServiceWorker', () => {
    it('should update service worker successfully', async () => {
      await updateServiceWorker();

      expect(navigator.serviceWorker.getRegistration).toHaveBeenCalled();
      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('should handle no registration found', async () => {
      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(
        undefined
      );

      await expect(updateServiceWorker()).rejects.toThrow(
        'No service worker registration found'
      );
    });

    it('should handle update failure', async () => {
      const error = new Error('Update failed');
      vi.mocked(mockRegistration.update).mockRejectedValueOnce(error);

      await expect(updateServiceWorker()).rejects.toThrow('Update failed');
    });
  });

  describe('getServiceWorkerStatus', () => {
    it('should return service worker status', async () => {
      const status = await getServiceWorkerStatus();

      expect(status).toEqual({
        supported: true,
        registered: true,
        controller: mockServiceWorker,
        registration: mockRegistration,
      });
    });

    it('should handle unsupported browsers', async () => {
      const originalServiceWorker = navigator.serviceWorker;
      // @ts-ignore
      delete navigator.serviceWorker;

      const status = await getServiceWorkerStatus();

      expect(status).toEqual({
        supported: false,
        registered: false,
        controller: null,
        registration: null,
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
      });
    });

    it('should handle no registration', async () => {
      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(
        undefined
      );

      const status = await getServiceWorkerStatus();

      expect(status.registered).toBe(false);
      expect(status.registration).toBe(null);
    });
  });

  describe('ServiceWorkerManager', () => {
    it('should initialize manager', () => {
      const manager = new ServiceWorkerManager();

      expect(manager).toBeDefined();
      expect(manager.isRegistered()).toBe(false);
    });

    it('should register service worker', async () => {
      const manager = new ServiceWorkerManager();

      await manager.register('/sw.js');

      expect(manager.isRegistered()).toBe(true);
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
      });
    });

    it('should handle registration events', async () => {
      const manager = new ServiceWorkerManager();
      const onUpdate = vi.fn();
      const onInstall = vi.fn();

      manager.on('update', onUpdate);
      manager.on('install', onInstall);

      await manager.register('/sw.js');

      expect(manager.getEventListeners('update')).toContain(onUpdate);
      expect(manager.getEventListeners('install')).toContain(onInstall);
    });

    it('should unregister service worker', async () => {
      const manager = new ServiceWorkerManager();

      await manager.register('/sw.js');
      expect(manager.isRegistered()).toBe(true);

      await manager.unregister();
      expect(manager.isRegistered()).toBe(false);
    });

    it('should update service worker', async () => {
      const manager = new ServiceWorkerManager();

      await manager.register('/sw.js');
      await manager.update();

      expect(mockRegistration.update).toHaveBeenCalled();
    });

    it('should get registration status', async () => {
      const manager = new ServiceWorkerManager();

      await manager.register('/sw.js');
      const status = await manager.getStatus();

      expect(status.supported).toBe(true);
      expect(status.registered).toBe(true);
    });

    it('should handle message posting', async () => {
      const manager = new ServiceWorkerManager();

      await manager.register('/sw.js');
      manager.postMessage({ type: 'CACHE_UPDATE' });

      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_UPDATE',
      });
    });

    it('should remove event listeners', () => {
      const manager = new ServiceWorkerManager();
      const onUpdate = vi.fn();

      manager.on('update', onUpdate);
      expect(manager.getEventListeners('update')).toContain(onUpdate);

      manager.off('update', onUpdate);
      expect(manager.getEventListeners('update')).not.toContain(onUpdate);
    });
  });
});
