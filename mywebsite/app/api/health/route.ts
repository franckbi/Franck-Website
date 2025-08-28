import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/environment';

/**
 * Health check endpoint for monitoring and deployment verification
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Basic health checks
    const checks = await Promise.allSettled([
      checkEnvironment(),
      checkDatabase(),
      checkExternalServices(),
      checkAssets(),
    ]);

    const results = checks.map((check, index) => ({
      name: ['environment', 'database', 'external_services', 'assets'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details:
        check.status === 'fulfilled' ? check.value : check.reason?.message,
    }));

    const allHealthy = results.every(result => result.status === 'healthy');
    const responseTime = Date.now() - startTime;

    const healthData = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      responseTime,
      checks: results,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
    };

    return NextResponse.json(healthData, {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    );
  }
}

/**
 * Check environment configuration
 */
async function checkEnvironment(): Promise<string> {
  const requiredVars = ['NODE_ENV'];
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return 'Environment variables configured';
}

/**
 * Check database connectivity (if applicable)
 */
async function checkDatabase(): Promise<string> {
  // Since this is a static portfolio, we don't have a database
  // But we can check if any external data sources are accessible
  return 'No database required';
}

/**
 * Check external services
 */
async function checkExternalServices(): Promise<string> {
  const services = [];

  // Check analytics service if enabled
  if (env.ANALYTICS.ENABLED && env.ANALYTICS.URL) {
    try {
      const response = await fetch(env.ANALYTICS.URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        services.push(`Analytics service unreachable (${response.status})`);
      }
    } catch (error) {
      services.push(
        `Analytics service error: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }

  // Check email service if configured
  if (env.CONTACT.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${env.CONTACT.RESEND_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        services.push(`Email service unreachable (${response.status})`);
      }
    } catch (error) {
      services.push(
        `Email service error: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }

  if (services.length > 0) {
    throw new Error(services.join(', '));
  }

  return 'External services accessible';
}

/**
 * Check critical assets
 */
async function checkAssets(): Promise<string> {
  const criticalAssets = ['/asset-manifest.json', '/sw-assets.json'];

  const missing = [];

  for (const asset of criticalAssets) {
    try {
      const response = await fetch(new URL(asset, request.url), {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        missing.push(asset);
      }
    } catch {
      missing.push(asset);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing critical assets: ${missing.join(', ')}`);
  }

  return 'Critical assets available';
}

/**
 * Readiness check endpoint
 */
export async function HEAD(request: NextRequest) {
  try {
    // Quick readiness check - just verify the app can respond
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
