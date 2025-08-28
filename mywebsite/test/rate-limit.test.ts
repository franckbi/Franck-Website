/**
 * Rate limiting utility tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  rateLimit,
  getRateLimitHeaders,
  clearRateLimitStore,
} from '@/lib/utils/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    // Clear the rate limit store before each test
    clearRateLimitStore();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  it('allows first request within limit', () => {
    const result = rateLimit('test-ip', {
      windowMs: 60000, // 1 minute
      maxRequests: 5,
    });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetTime).toBeGreaterThan(Date.now());
  });

  it('tracks multiple requests from same identifier', () => {
    const config = {
      windowMs: 60000, // 1 minute
      maxRequests: 3,
    };

    // First request
    const result1 = rateLimit('test-ip', config);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    // Second request
    const result2 = rateLimit('test-ip', config);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);

    // Third request
    const result3 = rateLimit('test-ip', config);
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);

    // Fourth request should be blocked
    const result4 = rateLimit('test-ip', config);
    expect(result4.success).toBe(false);
    expect(result4.remaining).toBe(0);
  });

  it('allows requests from different identifiers', () => {
    const config = {
      windowMs: 60000,
      maxRequests: 1,
    };

    const result1 = rateLimit('ip-1', config);
    expect(result1.success).toBe(true);

    const result2 = rateLimit('ip-2', config);
    expect(result2.success).toBe(true);

    // Both should be blocked on second attempt
    const result3 = rateLimit('ip-1', config);
    expect(result3.success).toBe(false);

    const result4 = rateLimit('ip-2', config);
    expect(result4.success).toBe(false);
  });

  it('resets window after expiration', () => {
    const config = {
      windowMs: 60000, // 1 minute
      maxRequests: 1,
    };

    // First request
    const result1 = rateLimit('test-ip', config);
    expect(result1.success).toBe(true);

    // Second request should be blocked
    const result2 = rateLimit('test-ip', config);
    expect(result2.success).toBe(false);

    // Advance time past window
    vi.advanceTimersByTime(61000);

    // Should allow request again
    const result3 = rateLimit('test-ip', config);
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('uses default configuration when none provided', () => {
    const result = rateLimit('test-ip');

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4); // Default is 5 requests
    expect(result.resetTime).toBeGreaterThan(Date.now());
  });

  it('handles edge case of zero max requests', () => {
    const result = rateLimit('test-ip', {
      windowMs: 60000,
      maxRequests: 0,
    });

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe('getRateLimitHeaders', () => {
  it('returns correct headers format', () => {
    const remaining = 3;
    const resetTime = Date.now() + 60000;

    const headers = getRateLimitHeaders(remaining, resetTime);

    expect(headers).toEqual({
      'X-RateLimit-Remaining': '3',
      'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    });
  });

  it('handles zero remaining requests', () => {
    const headers = getRateLimitHeaders(0, Date.now() + 60000);

    expect(headers['X-RateLimit-Remaining']).toBe('0');
  });

  it('rounds up reset time to nearest second', () => {
    const resetTime = Date.now() + 30500; // 30.5 seconds
    const headers = getRateLimitHeaders(1, resetTime);

    const expectedReset = Math.ceil(resetTime / 1000);
    expect(headers['X-RateLimit-Reset']).toBe(expectedReset.toString());
  });
});
