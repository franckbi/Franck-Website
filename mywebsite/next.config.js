/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: config => {
    // Optimize for 3D assets
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });

    return config;
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // Content Security Policy
    const cspHeader = `
      default-src 'self';
      script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : "'unsafe-eval'"} https://plausible.io;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' https: https://plausible.io https://api.resend.com https://raw.githack.com;
      worker-src 'self' blob:;
      child-src 'self' blob:;
      media-src 'self' blob: data:;
      ${isDev ? '' : 'upgrade-insecure-requests;'}
    `
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Add any necessary redirects here
      // Example: redirect old URLs to new ones
    ];
  },
  trailingSlash: false,
  poweredByHeader: false,
  output: 'standalone',

  // Optimize for production
  swcMinify: true,
  compress: true,

  // Enable experimental features for better performance
  experimental: {
    // Disable built-in CSS optimization that depends on the `critters` package
    // during build. This avoids requiring critters to be installed in the
    // build environment.
    optimizeCss: false,
    optimizePackageImports: ['lucide-react', '@react-three/drei'],
    // Ensure compatibility with Vercel
    serverComponentsExternalPackages: ['three', 'three-stdlib'],
  },
};

module.exports = nextConfig;
