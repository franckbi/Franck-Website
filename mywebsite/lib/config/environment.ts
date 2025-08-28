/**
 * Environment configuration utilities
 * Provides type-safe access to environment variables
 */

export const env = {
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',

  // Analytics
  ANALYTICS: {
    URL: process.env.NEXT_PUBLIC_ANALYTICS_URL || '',
    SITE_ID: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID || '',
    ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  },

  // Contact
  CONTACT: {
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL: process.env.CONTACT_EMAIL || '',
    FROM_EMAIL: process.env.CONTACT_FROM_EMAIL || '',
  },

  // Security
  SECURITY: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  },

  // Performance
  PERFORMANCE: {
    MONITORING_ENABLED:
      process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
    ERROR_REPORTING_ENABLED: process.env.NEXT_PUBLIC_ERROR_REPORTING === 'true',
  },

  // Feature Flags
  FEATURES: {
    THREE_D_ENABLED: process.env.NEXT_PUBLIC_3D_ENABLED !== 'false',
    ANALYTICS_DASHBOARD: process.env.NEXT_PUBLIC_ANALYTICS_DASHBOARD === 'true',
  },

  // Assets
  ASSETS: {
    CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
    PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
  },

  // Monitoring
  MONITORING: {
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    SENTRY_ORG: process.env.SENTRY_ORG || '',
    SENTRY_PROJECT: process.env.SENTRY_PROJECT || '',
  },
} as const;

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Validates required environment variables
 */
export function validateEnvironment(): void {
  const requiredVars: Array<keyof typeof process.env> = [];

  if (isProduction) {
    requiredVars.push('RESEND_API_KEY', 'CONTACT_EMAIL', 'NEXTAUTH_SECRET');
  }

  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Gets the current deployment environment
 */
export function getDeploymentEnvironment():
  | 'development'
  | 'staging'
  | 'production' {
  if (isDevelopment) return 'development';

  const url = env.SECURITY.NEXTAUTH_URL || '';
  if (url.includes('staging')) return 'staging';

  return 'production';
}

/**
 * Feature flag utilities
 */
export const featureFlags = {
  is3DEnabled: () => env.FEATURES.THREE_D_ENABLED,
  isAnalyticsEnabled: () => env.ANALYTICS.ENABLED,
  isAnalyticsDashboardEnabled: () => env.FEATURES.ANALYTICS_DASHBOARD,
  isPerformanceMonitoringEnabled: () => env.PERFORMANCE.MONITORING_ENABLED,
  isErrorReportingEnabled: () => env.PERFORMANCE.ERROR_REPORTING_ENABLED,
} as const;
