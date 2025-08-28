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

  // Derive summary stats from content
  const skills = skillsResult.data;
  const timeline = timelineResult.data;

  const techSet = new Set<string>();
  skills.forEach(category =>
    category.skills.forEach(skill => techSet.add(skill.name))
  );

  const technologiesCount = techSet.size;
  const projectsCount = timeline.filter(item => item.type === 'project').length;

  // Determine years of experience from earliest "work" timeline item (fallback to earliest item)
  const workItems = timeline.filter(item => item.type === 'work');
  const referenceItem = (workItems.length ? workItems : timeline)[0];
  const earliestDate = referenceItem
    ? new Date(referenceItem.date)
    : new Date();
  const yearsExperience = Math.max(
    0,
    Math.floor(
      (Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    )
  );

  return (
    <div className="space-y-16">
      <BioSection
        yearsExperience={yearsExperience}
        projectsCompleted={projectsCount}
        technologiesCount={technologiesCount}
      />
      {/* Let SkillsMatrix fetch the live JSON on the client to avoid stale server-side cache */}
      <SkillsMatrix />
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
