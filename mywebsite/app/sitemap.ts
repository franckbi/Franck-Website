import { MetadataRoute } from 'next';
import { loadProjects } from '@/lib/utils/content-loader';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Load projects for dynamic routes
  const projectsResult = await loadProjects();
  const projects = projectsResult.data || [];

  // Static routes
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Dynamic project routes
  const projectRoutes = projects.map(project => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: new Date(project.year, 11, 31), // End of project year
    changeFrequency: 'monthly' as const,
    priority: project.featured ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
