import {
  FeaturedProjects,
  AboutSummary,
  CallToAction,
} from '@/components/home';
import { HeroSection } from '@/components/home/hero-section';
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
        <section aria-label="Hero section with interactive 3D portfolio">
          <HeroSection projects={projects} />
        </section>

        {/* Featured Projects Section */}
        <section id="featured-projects" aria-label="Featured projects showcase">
          <FeaturedProjects projects={projects} />
        </section>

        {/* About Summary Section */}
        <section id="about" aria-label="About the developer">
          <AboutSummary />
        </section>

        {/* Call to Action Section */}
        <section aria-label="Contact call to action">
          <CallToAction />
        </section>
      </main>
    </>
  );
}
