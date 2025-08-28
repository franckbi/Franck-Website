import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/contexts/theme-context';
import { SettingsInitializer } from '@/components/settings-initializer';
import { MainLayout } from '@/components/layout';
import { StructuredData } from '@/components/seo/structured-data';
import {
  PerformanceProvider,
  PerformanceIndicator,
} from '@/components/performance/performance-provider';
import {
  AnalyticsProvider,
  AnalyticsConsentBanner,
} from '@/components/analytics/analytics-provider';
import {
  generatePersonSchema,
  generateWebsiteSchema,
} from '@/lib/seo/structured-data';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Portfolio - Interactive 3D Developer Showcase',
    template: '%s | Portfolio',
  },
  description:
    'Explore my work through an interactive 3D portfolio featuring modern web development, Three.js experiences, and cutting-edge technologies.',
  keywords: [
    'portfolio',
    '3D',
    'Three.js',
    'React',
    'Next.js',
    'WebGL',
    'developer',
    'frontend',
    'fullstack',
    'interactive',
    'web development',
  ],
  authors: [{ name: 'Portfolio Developer' }],
  creator: 'Portfolio Developer',
  publisher: 'Portfolio Developer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'Portfolio - Interactive 3D Developer Showcase',
    description:
      'Explore my work through an interactive 3D portfolio featuring modern web development, Three.js experiences, and cutting-edge technologies.',
    siteName: 'Portfolio',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio - Interactive 3D Developer Showcase',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@portfolio_dev',
    creator: '@portfolio_dev',
    title: 'Portfolio - Interactive 3D Developer Showcase',
    description:
      'Explore my work through an interactive 3D portfolio featuring modern web development, Three.js experiences, and cutting-edge technologies.',
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const personSchema = generatePersonSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData data={[personSchema, websiteSchema]} />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
          <AnalyticsProvider enableInDevelopment={false}>
            <SettingsInitializer />
            <MainLayout>{children}</MainLayout>
            <AnalyticsConsentBanner />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
