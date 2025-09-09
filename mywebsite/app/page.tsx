import { WebVitals } from '@/components/performance/web-vitals';
import { StructuredData } from '@/components/seo/structured-data';
import { loadProjects } from '@/lib/utils/content-loader';
import { generateHomeMetadata } from '@/lib/seo/metadata';
import { generateProjectSchema } from '@/lib/seo/structured-data';
import { Hero3DDynamic } from '@/components/3d/hero-3d-dynamic';
import { AboutSummary } from '@/components/home/about-summary';
import { CallToAction } from '@/components/home/call-to-action';
import { HeroWithToggle } from '@/components/home/hero-with-toggle';

export const metadata = generateHomeMetadata();

export default async function Home() {
  const projectsResult = await loadProjects();
  const projects = projectsResult.data || [];

  // Generate structured data for featured projects
  const featuredProjects = projects.filter(project => project.featured);
  const projectSchemas = featuredProjects.map(project =>
    generateProjectSchema(project)
  );

  return (
    <>
      <StructuredData data={projectSchemas} />
      <WebVitals />

      <main className="min-h-screen">
        {/* Hero Section with Toggle */}
        <HeroWithToggle projects={projects} />

        {/* Featured Projects Grid */}
        <section
          id="projects"
          aria-label="Featured projects showcase"
          className="py-20 px-4 bg-gradient-to-b from-background to-muted/20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A selection of my recent work showcasing full-stack development,
                3D experiences, and innovative solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects
                .filter(p => p.featured)
                .slice(0, 6)
                .map(project => (
                  <div
                    key={project.slug}
                    className="group bg-card border rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {project.year}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.tagline}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.stack.slice(0, 3).map(tech => (
                        <span
                          key={tech}
                          className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.stack.length > 3 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{project.stack.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {project.links?.case_study && (
                        <a
                          href={project.links.case_study}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          View Details →
                        </a>
                      )}
                      {project.links?.demo && (
                        <a
                          href={project.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Live Demo ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-center mt-12">
              <a
                href="/projects"
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                View All Projects
              </a>
            </div>
          </div>
        </section>

        {/* About Summary Section */}
        <AboutSummary />

        {/* Call to Action Section */}
        <CallToAction />
      </main>
    </>
  );
}
