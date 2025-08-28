/**
 * Analytics configuration
 * Environment-specific settings for analytics services
 */

export const analyticsConfig = {
  // Plausible configuration
  plausible: {
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
    apiHost:
      process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io',
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  },

  // Privacy settings
  privacy: {
    respectDNT: true, // Respect Do Not Track header
    requireConsent: true, // Require explicit user consent
    anonymizeIPs: true, // Anonymize IP addresses
    cookieless: true, // Use cookieless tracking
  },

  // Performance monitoring
  performance: {
    sampleRate: parseFloat(
      process.env.NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE || '0.1'
    ), // 10% sampling
    trackWebVitals: true,
    trackThreeJS: true,
    reportingInterval: 30000, // 30 seconds
  },

  // Error reporting
  errorReporting: {
    enabled: process.env.NODE_ENV === 'production',
    maxErrors: 50,
    sampleRate: parseFloat(process.env.NEXT_PUBLIC_ERROR_SAMPLE_RATE || '1.0'), // 100% sampling
  },

  // Development settings
  development: {
    enableInDev: process.env.NEXT_PUBLIC_ANALYTICS_DEV === 'true',
    logEvents: process.env.NODE_ENV === 'development',
    mockAnalytics: process.env.NODE_ENV === 'test',
  },
};

// Validation
export function validateAnalyticsConfig() {
  const errors: string[] = [];

  if (analyticsConfig.plausible.enabled && !analyticsConfig.plausible.domain) {
    errors.push(
      'NEXT_PUBLIC_PLAUSIBLE_DOMAIN is required when analytics is enabled'
    );
  }

  if (
    analyticsConfig.performance.sampleRate < 0 ||
    analyticsConfig.performance.sampleRate > 1
  ) {
    errors.push('Performance sample rate must be between 0 and 1');
  }

  if (
    analyticsConfig.errorReporting.sampleRate < 0 ||
    analyticsConfig.errorReporting.sampleRate > 1
  ) {
    errors.push('Error reporting sample rate must be between 0 and 1');
  }

  return errors;
}

// Environment check
export function isAnalyticsEnabled(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    return analyticsConfig.development.enableInDev;
  }

  return analyticsConfig.plausible.enabled;
}
