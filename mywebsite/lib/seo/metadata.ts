import type { Metadata } from 'next';
import type { Project } from '@/lib/types';

export interface SEOConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
}

const DEFAULT_CONFIG = {
  siteName: 'Portfolio - Interactive 3D Developer Showcase',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.example.com',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@portfolio_dev',
  author: 'Portfolio Developer',
  locale: 'en_US',
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    url = DEFAULT_CONFIG.siteUrl,
    image = DEFAULT_CONFIG.defaultImage,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = DEFAULT_CONFIG.author,
    keywords = [],
  } = config;

  const fullTitle = title.includes('Portfolio')
    ? title
    : `${title} | Portfolio`;
  const canonicalUrl = url.startsWith('http')
    ? url
    : `${DEFAULT_CONFIG.siteUrl}${url}`;
  const imageUrl = image.startsWith('http')
    ? image
    : `${DEFAULT_CONFIG.siteUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      'portfolio',
      '3D',
      'Three.js',
      'React',
      'Next.js',
      'WebGL',
    ],
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type,
      locale: DEFAULT_CONFIG.locale,
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName: DEFAULT_CONFIG.siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_CONFIG.twitterHandle,
      creator: DEFAULT_CONFIG.twitterHandle,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateProjectMetadata(project: Project): Metadata {
  const projectUrl = `/projects/${project.slug}`;
  const image =
    project.gallery?.[0]?.src ||
    project.thumbnail?.src ||
    DEFAULT_CONFIG.defaultImage;

  return generateMetadata({
    title: project.title,
    description: project.description,
    url: projectUrl,
    image,
    type: 'article',
    publishedTime: new Date(project.year, 0, 1).toISOString(),
    modifiedTime: new Date().toISOString(),
    keywords: [...project.stack, ...project.badges],
  });
}

export function generateHomeMetadata(): Metadata {
  return generateMetadata({
    title: 'Portfolio - Interactive 3D Developer Showcase',
    description:
      'Explore my work through an interactive 3D portfolio featuring modern web development, Three.js experiences, and cutting-edge technologies.',
    url: '/',
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
    ],
  });
}

export function generateProjectsMetadata(): Metadata {
  return generateMetadata({
    title: 'Projects - Interactive 3D Portfolio',
    description:
      'Browse my projects in an interactive 3D environment. Filter by technology, view detailed case studies, and explore live demos.',
    url: '/projects',
    keywords: [
      'projects',
      'portfolio',
      '3D',
      'case studies',
      'web development',
    ],
  });
}

export function generateAboutMetadata(): Metadata {
  return generateMetadata({
    title: 'About - Portfolio Developer',
    description:
      'Learn about my background, skills, and experience in modern web development, 3D graphics, and interactive experiences.',
    url: '/about',
    keywords: ['about', 'developer', 'skills', 'experience', 'biography'],
  });
}

export function generateContactMetadata(): Metadata {
  return generateMetadata({
    title: 'Contact - Get In Touch',
    description:
      'Ready to collaborate? Get in touch to discuss your next project or opportunity.',
    url: '/contact',
    keywords: ['contact', 'hire', 'collaborate', 'freelance', 'consultation'],
  });
}
