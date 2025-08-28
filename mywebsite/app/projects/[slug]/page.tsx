import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetailPage } from '@/components/projects/project-detail-page';
import { StructuredData } from '@/components/seo/structured-data';
import { loadProjects } from '@/lib/utils/content-loader';
import { generateProjectMetadata } from '@/lib/seo/metadata';
import {
  generateProjectSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structured-data';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const result = await loadProjects();

  if (result.error) {
    return [];
  }

  return result.data.map(project => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const result = await loadProjects();

  if (result.error) {
    return {
      title: 'Project Not Found',
      robots: { index: false, follow: false },
    };
  }

  const project = result.data.find(p => p.slug === params.slug);

  if (!project) {
    return {
      title: 'Project Not Found',
      robots: { index: false, follow: false },
    };
  }

  return generateProjectMetadata(project);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const result = await loadProjects();

  if (result.error) {
    notFound();
  }

  const project = result.data.find(p => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  // Generate structured data
  const projectSchema = generateProjectSchema(project);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Projects', url: '/projects' },
    { name: project.title, url: `/projects/${project.slug}` },
  ]);

  return (
    <>
      <StructuredData data={[projectSchema, breadcrumbSchema]} />
      <main>
        <article itemScope itemType="https://schema.org/CreativeWork">
          <ProjectDetailPage project={project} />
        </article>
      </main>
    </>
  );
}
