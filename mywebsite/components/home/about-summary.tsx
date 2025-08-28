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
              I&apos;m a passionate full-stack developer with expertise in
              modern web technologies, 3D graphics, and interactive experiences.
              I love creating digital solutions that combine technical
              excellence with engaging user experiences.
            </p>
            <p className="text-lg leading-relaxed">
              With a focus on performance, accessibility, and cutting-edge
              technologies like Three.js and WebGL, I build applications that
              push the boundaries of what&apos;s possible on the web while
              maintaining broad compatibility and usability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">5+</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">15+</div>
            <div className="text-muted-foreground">Technologies Mastered</div>
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
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
