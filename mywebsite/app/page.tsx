// Temporarily removed complex components to fix build
import { WebVitals } from '@/components/performance/web-vitals';
import { StructuredData } from '@/components/seo/structured-data';
import { loadProjects } from '@/lib/utils/content-loader';
import { generateHomeMetadata } from '@/lib/seo/metadata';
import { generateProjectSchema } from '@/lib/seo/structured-data';

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

      {/* Hero Section */}
      <main>
        <section
          aria-label="Hero section with interactive 3D portfolio"
          className="py-16 px-4"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6">
              Franck Biyogue Bi Ndoutoume
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Software Engineer | M.S. in Computer Science @ASU | B.S. Software
              Engineer @ISU
            </p>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section
          id="featured-projects"
          aria-label="Featured projects showcase"
          className="py-16 px-4"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter(p => p.featured)
                .slice(0, 6)
                .map(project => (
                  <div
                    key={project.slug}
                    className="bg-card border rounded-lg p-6"
                  >
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
        </section>

        {/* About Summary Section */}
        <section
          id="about"
          aria-label="About the developer"
          className="py-16 px-4 bg-muted/30"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About Me</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Experienced Software Developer with expertise in debugging
              applications and implementing data-driven solutions using Java, C,
              C#, JavaScript, TypeScript and more.
            </p>
          </div>
        </section>

        {/* Call to Action Section */}
        <section aria-label="Contact call to action" className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Work Together?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let&apos;s discuss how we can bring your ideas to life.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Start a Conversation
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
