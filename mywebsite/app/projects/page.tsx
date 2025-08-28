import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProjectsPageClient } from '@/components/projects/projects-page-client';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { loadProjects } from '@/lib/utils/content-loader';

export async function generateStaticParams() {
  const result = await loadProjects();

  if (result.error) {
    return [];
  }

  return result.data.map(project => ({ slug: project.slug }));
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadProjects();

  if (result.error) {
    return { title: 'Projects', robots: { index: true } };
  }

  return { title: 'Projects' };
}

export default async function ProjectsPage() {
  const result = await loadProjects();

  const projects = result.error ? [] : result.data;

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              Loading...
            </div>
          </div>
        }
      >
        {/* Pass server-loaded projects as initialProjects to client component */}
        <ProjectsPageClient initialProjects={projects} />
      </Suspense>
    </ErrorBoundary>
  );
}
