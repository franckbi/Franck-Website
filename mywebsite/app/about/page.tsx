import { Suspense } from 'react';
import { loadSkills, loadTimeline } from '@/lib/utils/content-loader';
import {
  BioSection,
  SkillsMatrix,
  Timeline,
  ContactLinks,
} from '@/components/about';
import { StructuredData } from '@/components/seo/structured-data';
import { ContentLoading } from '@/components/ui';
import { generateAboutMetadata } from '@/lib/seo/metadata';
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structured-data';

export const metadata = generateAboutMetadata();

async function AboutContent() {
  const [skillsResult, timelineResult] = await Promise.all([
    loadSkills(),
    loadTimeline(),
  ]);

  if (skillsResult.error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">
          Failed to load skills data: {skillsResult.error.message}
        </p>
      </div>
    );
  }

  if (timelineResult.error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">
          Failed to load timeline data: {timelineResult.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <BioSection />
      <SkillsMatrix skillCategories={skillsResult.data} />
      <Timeline items={timelineResult.data} />
      <ContactLinks />
    </div>
  );
}

export default function AboutPage() {
  const personSchema = generatePersonSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  return (
    <>
      <StructuredData data={[personSchema, breadcrumbSchema]} />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="text-center space-y-2">
              <h1 className="text-4xl font-bold">About Me</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Passionate full-stack developer creating innovative web
                experiences with modern technologies and thoughtful design
              </p>
            </header>

            <section
              className="max-w-6xl mx-auto"
              itemScope
              itemType="https://schema.org/Person"
            >
              <Suspense
                fallback={
                  <div className="space-y-8">
                    <ContentLoading lines={8} showAvatar={true} />
                    <ContentLoading lines={12} />
                    <ContentLoading lines={10} />
                  </div>
                }
              >
                <AboutContent />
              </Suspense>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
