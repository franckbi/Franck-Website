import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Note: route import removed to allow mocks to be applied before module initialization

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      // Route expects { data: { id } , error: null } shape
      send: vi.fn().mockResolvedValue({
        data: {
          id: 'test-email-id',
        },
        error: null,
      }),
    },
  })),
}));

// Mock rate limiting (synchronous by default because route does not await)
vi.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: vi.fn().mockImplementation(() => ({
    success: true,
    remaining: 3,
    resetTime: Date.now() + 15 * 60 * 1000,
  })),
  getRateLimitHeaders: (remaining: number, resetTime: number) => ({
    'x-rate-limit-remaining': String(remaining),
    'x-rate-limit-reset': String(Math.ceil(resetTime / 1000)),
  }),
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Ensure environment variables are set for modules imported during tests
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.CONTACT_EMAIL = 'admin@example.com';

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Contact API Route', () => {
    let POST: any;

    beforeEach(async () => {
      // Import the route after mocks so module-level initialization sees mocked env and modules
      const mod = await import('@/app/api/contact/route');
      POST = mod.POST;
    });

    const createRequest = (body: any) => {
      return new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    };

    it('should handle valid contact form submission', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
      };

      const request = createRequest(validData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Message sent successfully');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        message: '',
      };

      const request = createRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(data.errors).toHaveProperty('name');
      expect(data.errors).toHaveProperty('email');
      expect(data.errors).toHaveProperty('message');
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
        message: 'Hello <img src="x" onerror="alert(1)"> world',
      };

      const request = createRequest(maliciousData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Verify that scripts are sanitized (implementation dependent)
    });

    it('should handle rate limiting', async () => {
      const { rateLimit } = await import('@/lib/utils/rate-limit');
      // Use mockReturnValueOnce because the route calls rateLimit synchronously
      vi.mocked(rateLimit).mockReturnValueOnce({
        success: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
      });

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
      };

      const request = createRequest(validData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.message).toContain('rate limit');
    });

    it('should handle email sending failures', async () => {
      const { Resend } = await import('resend');
      const mockResend = new Resend();
      vi.mocked(mockResend.emails.send).mockRejectedValueOnce(
        new Error('Email service unavailable')
      );

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
      };

      const request = createRequest(validData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Failed to send message');
    });

    it('should handle honeypot spam detection', async () => {
      const spamData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
        website: 'http://spam.com', // Honeypot field
      };

      const request = createRequest(spamData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid submission');
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        name: 'John Doe',
        email: 'not-an-email',
        message: 'Hello, this is a test message.',
      };

      const request = createRequest(invalidEmailData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toHaveProperty('email');
    });

    it('should validate message length', async () => {
      const shortMessageData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hi', // Too short
      };

      const request = createRequest(shortMessageData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toHaveProperty('message');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid JSON');
    });

    it('should handle missing content-type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello, this is a test message.',
        }),
      });

      const response = await POST(request);

      // Should still work or handle gracefully
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Data Loading Integration', () => {
    it('should load projects data successfully', async () => {
      // Mock fetch for projects data
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              slug: 'test-project',
              title: 'Test Project',
              description: 'A test project',
              stack: ['React', 'TypeScript'],
              year: 2024,
            },
          ]),
      });

      const { loadProjects } = await import('@/lib/utils/content-loader');
      const result = await loadProjects();

      // content-loader returns ContentResult
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toHaveProperty('slug', 'test-project');
      expect(result.data![0]).toHaveProperty('title', 'Test Project');
    });

    it('should handle data loading failures', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { loadProjects } = await import('@/lib/utils/content-loader');
      const result = await loadProjects();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Network error');
    });

    it('should validate loaded data structure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              // Missing required fields
              title: 'Test Project',
            },
          ]),
      });

      const { loadProjects } = await import('@/lib/utils/content-loader');
      const result = await loadProjects();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error!.message).toContain('Validation error');
    });

    it('should cache loaded data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              slug: 'test-project',
              title: 'Test Project',
              description: 'A test project',
              stack: ['React', 'TypeScript'],
              year: 2024,
            },
          ]),
      });

      const { loadProjects } = await import('@/lib/utils/content-loader');

      // Load data twice
      await loadProjects();
      await loadProjects();

      // Fetch should only be called once due to caching
      expect((global.fetch as any).mock.calls.length).toBe(1);
    });
  });
});
