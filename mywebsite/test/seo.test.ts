import { describe, it, expect } from 'vitest';
import {
  generateMetadata,
  generateProjectMetadata,
  generateHomeMetadata,
  generateProjectsMetadata,
  generateAboutMetadata,
  generateContactMetadata,
} from '@/lib/seo/metadata';
import {
  generatePersonSchema,
  generateProjectSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl, getCurrentUrl } from '@/lib/seo/canonical';
import type { Project } from '@/lib/types';

const mockProject: Project = {
  slug: 'test-project',
  title: 'Test Project',
  tagline: 'A test project for SEO',
  description: 'This is a test project used for SEO testing purposes.',
  thumbnail: {
    src: '/images/test-thumbnail.jpg',
    alt: 'Test project thumbnail',
    width: 800,
    height: 600,
  },
  gallery: [
    {
      src: '/images/test-gallery-1.jpg',
      alt: 'Test gallery image 1',
      width: 1920,
      height: 1080,
    },
  ],
  stack: ['React', 'TypeScript', 'Next.js'],
  role: 'Full-Stack Developer',
  year: 2024,
  links: {
    demo: 'https://test-project.example.com',
    github: 'https://github.com/username/test-project',
  },
  badges: ['Featured', 'Web App'],
  priority: 1,
  featured: true,
  sceneRef: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1,
  },
  metadata: {
    challenge: 'Test challenge',
    solution: 'Test solution',
    results: ['Test result 1', 'Test result 2'],
    architecture: 'Test architecture',
    highlights: ['Test highlight 1', 'Test highlight 2'],
  },
};

describe('SEO Metadata Generation', () => {
  it('should generate basic metadata correctly', () => {
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'Test description',
      url: '/test',
    });

    expect(metadata.title).toBe('Test Page | Portfolio');
    expect(metadata.description).toBe('Test description');
    expect(metadata.alternates?.canonical).toBe(
      'https://portfolio.example.com/test'
    );
    expect(metadata.openGraph?.title).toBe('Test Page | Portfolio');
    expect(metadata.twitter?.title).toBe('Test Page | Portfolio');
  });

  it('should generate project metadata correctly', () => {
    const metadata = generateProjectMetadata(mockProject);

    expect(metadata.title).toContain('Test Project');
    expect(metadata.description).toBe(mockProject.description);
    expect(metadata.keywords).toEqual(
      expect.arrayContaining([
        'React',
        'TypeScript',
        'Next.js',
        'Featured',
        'Web App',
      ])
    );
  });

  it('should generate home metadata correctly', () => {
    const metadata = generateHomeMetadata();

    expect(metadata.title).toBe(
      'Portfolio - Interactive 3D Developer Showcase'
    );
    expect(metadata.description).toContain('interactive 3D portfolio');
    expect(metadata.keywords).toEqual(
      expect.arrayContaining([
        'portfolio',
        '3D',
        'Three.js',
        'React',
        'Next.js',
      ])
    );
  });

  it('should generate projects page metadata correctly', () => {
    const metadata = generateProjectsMetadata();

    expect(metadata.title).toBe(
      'Projects - Interactive 3D Portfolio | Portfolio'
    );
    expect(metadata.description).toContain('Browse my projects');
  });

  it('should generate about page metadata correctly', () => {
    const metadata = generateAboutMetadata();

    expect(metadata.title).toBe('About - Portfolio Developer | Portfolio');
    expect(metadata.description).toContain(
      'background, skills, and experience'
    );
  });

  it('should generate contact page metadata correctly', () => {
    const metadata = generateContactMetadata();

    expect(metadata.title).toBe('Contact - Get In Touch | Portfolio');
    expect(metadata.description).toContain('collaborate');
  });
});

describe('Structured Data Generation', () => {
  it('should generate person schema correctly', () => {
    const schema = generatePersonSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('Portfolio Developer');
    expect(schema.jobTitle).toBe('Full-Stack Developer & 3D Designer');
    expect(schema.knowsAbout).toEqual(
      expect.arrayContaining(['JavaScript', 'TypeScript', 'React', 'Three.js'])
    );
  });

  it('should generate project schema correctly', () => {
    const schema = generateProjectSchema(mockProject);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.name).toBe('Test Project');
    expect(schema.description).toBe(mockProject.description);
    expect(schema.keywords).toEqual(
      expect.arrayContaining(['React', 'TypeScript', 'Next.js'])
    );
    expect(schema.codeRepository).toBe(mockProject.links.github);
    expect(schema.demo).toBe(mockProject.links.demo);
  });

  it('should generate website schema correctly', () => {
    const schema = generateWebsiteSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('Portfolio - Interactive 3D Developer Showcase');
    expect(schema.potentialAction['@type']).toBe('SearchAction');
  });

  it('should generate breadcrumb schema correctly', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Projects', url: '/projects' },
      { name: 'Test Project', url: '/projects/test-project' },
    ];
    const schema = generateBreadcrumbSchema(items);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe('Home');
  });
});

describe('Canonical URL Generation', () => {
  it('should generate canonical URLs correctly', () => {
    expect(getCanonicalUrl('/')).toBe('https://portfolio.example.com');
    expect(getCanonicalUrl('/projects')).toBe(
      'https://portfolio.example.com/projects'
    );
    expect(getCanonicalUrl('/projects/')).toBe(
      'https://portfolio.example.com/projects'
    );
    expect(getCanonicalUrl('projects')).toBe(
      'https://portfolio.example.com/projects'
    );
  });

  it('should handle current URLs with search params', () => {
    const searchParams = new URLSearchParams('filter=react&year=2024');
    const url = getCurrentUrl('/projects', searchParams);

    expect(url).toBe(
      'https://portfolio.example.com/projects?filter=react&year=2024'
    );
  });

  it('should handle current URLs without search params', () => {
    const url = getCurrentUrl('/about');

    expect(url).toBe('https://portfolio.example.com/about');
  });
});

describe('SEO Configuration', () => {
  it('should have proper robots configuration', () => {
    const metadata = generateMetadata({
      title: 'Test',
      description: 'Test',
    });

    expect(metadata.robots?.index).toBe(true);
    expect(metadata.robots?.follow).toBe(true);
    expect(metadata.robots?.googleBot?.index).toBe(true);
    expect(metadata.robots?.googleBot?.follow).toBe(true);
  });

  it('should include proper Open Graph data', () => {
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'Test description',
      image: '/test-image.jpg',
    });

    expect(metadata.openGraph?.type).toBe('website');
    expect(metadata.openGraph?.locale).toBe('en_US');
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://portfolio.example.com/test-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Test Page',
      },
    ]);
  });

  it('should include proper Twitter Card data', () => {
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'Test description',
      image: '/test-image.jpg',
    });

    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.twitter?.site).toBe('@portfolio_dev');
    expect(metadata.twitter?.creator).toBe('@portfolio_dev');
    expect(metadata.twitter?.images).toEqual([
      'https://portfolio.example.com/test-image.jpg',
    ]);
  });
});
