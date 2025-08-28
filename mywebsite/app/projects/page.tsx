import { Metadata } from 'next';
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
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore my portfolio of projects and work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.slug} className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {project.tagline}
              </p>
              <div className="flex flex-wrap gap-1">
                {project.stack.slice(0, 3).map(tech => (
                  <span
                    key={tech}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
