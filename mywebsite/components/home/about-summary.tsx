'use client';

import Link from 'next/link';

export function AboutSummary() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About Me</h2>
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <p className="text-xl leading-relaxed mb-6">
              I&apos;m Franck Ndoutoume — a frontend engineer focusing on
              high-performance, accessible web experiences. I build interactive
              3D interfaces and full-stack products that balance visual polish
              with robust engineering and measurable outcomes.
            </p>
            <p className="text-lg leading-relaxed">
              My work spans interactive WebGL applications, realtime systems,
              and production mobile and backend services. I prioritize
              performance, accessibility (WCAG), and pragmatic engineering
              trade-offs to deliver reliable, maintainable products.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">6+</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">7</div>
            <div className="text-muted-foreground">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">15+</div>
            <div className="text-muted-foreground">Technologies & Tools</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/about"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Learn More About Me
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
          >
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
