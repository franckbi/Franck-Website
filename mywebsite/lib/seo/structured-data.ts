import type { Project } from '@/lib/types';

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  url: string;
  image?: string;
  jobTitle: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  alumniOf?: {
    '@type': 'EducationalOrganization';
    name: string;
  }[];
  knowsAbout: string[];
  sameAs: string[];
  address?: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
}

export interface ProjectSchema {
  '@context': 'https://schema.org';
  '@type': 'CreativeWork';
  name: string;
  description: string;
  url: string;
  image: string[];
  creator: {
    '@type': 'Person';
    name: string;
  };
  dateCreated: string;
  dateModified: string;
  keywords: string[];
  genre: string[];
  programmingLanguage?: string[];
  codeRepository?: string;
  demo?: string;
}

export interface WebsiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  potentialAction: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

const SITE_CONFIG = {
  name: 'Portfolio Developer',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.example.com',
  jobTitle: 'Full-Stack Developer & 3D Designer',
  image: '/images/profile.jpg',
  location: {
    locality: 'San Francisco',
    region: 'CA',
    country: 'US',
  },
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Three.js',
    'WebGL',
    'Node.js',
    'Python',
    '3D Graphics',
    'Web Development',
    'Frontend Development',
    'Backend Development',
  ],
  socialLinks: [
    'https://github.com/username',
    'https://linkedin.com/in/username',
    'https://twitter.com/username',
  ],
};

export function generatePersonSchema(): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.image}`,
    jobTitle: SITE_CONFIG.jobTitle,
    knowsAbout: SITE_CONFIG.skills,
    sameAs: SITE_CONFIG.socialLinks,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_CONFIG.location.locality,
      addressRegion: SITE_CONFIG.location.region,
      addressCountry: SITE_CONFIG.location.country,
    },
  };
}

export function generateProjectSchema(project: Project): ProjectSchema {
  const projectUrl = `${SITE_CONFIG.url}/projects/${project.slug}`;
  const images =
    project.gallery?.map(img => `${SITE_CONFIG.url}${img.src}`) ||
    (project.thumbnail ? [`${SITE_CONFIG.url}${project.thumbnail.src}`] : []);

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: projectUrl,
    image: images,
    creator: {
      '@type': 'Person',
      name: SITE_CONFIG.name,
    },
    dateCreated: new Date(project.year, 0, 1).toISOString(),
    dateModified: new Date().toISOString(),
    keywords: [...project.stack, ...project.badges],
    genre: project.badges,
    programmingLanguage: project.stack,
    ...(project.links?.github && { codeRepository: project.links.github }),
    ...(project.links?.demo && { demo: project.links.demo }),
  };
}

export function generateWebsiteSchema(): WebsiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Portfolio - Interactive 3D Developer Showcase',
    url: SITE_CONFIG.url,
    description:
      'Interactive 3D portfolio showcasing modern web development projects and Three.js experiences.',
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/projects?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http')
        ? item.url
        : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function injectStructuredData(schema: object): string {
  return JSON.stringify(schema, null, 0);
}
