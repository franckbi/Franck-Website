import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsStore } from '@/lib/stores/settings-store';

describe('useSettingsStore', () => {
  beforeEach(() => {
    // Reset store state
    useSettingsStore.setState({
      lowPowerMode: false,
      reducedMotion: false,
      performanceMode: 'high',
    });

    vi.clearAllMocks();
  });

  it('should have default state', () => {
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.lowPowerMode).toBe(false);
    expect(result.current.reducedMotion).toBe(false);
    expect(result.current.performanceMode).toBe('high');
  });

  it('should toggle low power mode', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.toggleLowPowerMode();
    });

    expect(result.current.lowPowerMode).toBe(true);

    act(() => {
      result.current.toggleLowPowerMode();
    });

    expect(result.current.lowPowerMode).toBe(false);
  });

  it('should set low power mode', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setLowPowerMode(true);
    });

    expect(result.current.lowPowerMode).toBe(true);

    act(() => {
      result.current.setLowPowerMode(false);
    });

    expect(result.current.lowPowerMode).toBe(false);
  });

  it('should set reduced motion', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setReducedMotion(true);
    });

    expect(result.current.reducedMotion).toBe(true);
  });

  it('should set performance mode', () => {
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.setPerformanceMode('low');
    });

    expect(result.current.performanceMode).toBe('low');

    act(() => {
      result.current.setPerformanceMode('medium');
    });

    expect(result.current.performanceMode).toBe('medium');
  });

  it('should initialize from system preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock slow connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '2g',
        saveData: false,
      },
    });

    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.initializeFromSystem();
    });

    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.lowPowerMode).toBe(true);
    expect(result.current.performanceMode).toBe('low');
  });

  it('should handle save data preference', () => {
    // Mock save data preference
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '4g',
        saveData: true,
      },
    });

    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.initializeFromSystem();
    });

    expect(result.current.lowPowerMode).toBe(true);
    expect(result.current.performanceMode).toBe('low');
  });
});
