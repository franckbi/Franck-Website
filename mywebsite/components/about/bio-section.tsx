/**
 * Bio section component for the about page
 * Displays personal introduction and professional summary
 */

interface BioSectionProps {
  className?: string;
}

export function BioSection({ className = '' }: BioSectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">About Me</h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">
            I&apos;m a passionate full-stack developer with a love for creating
            innovative web experiences that blend cutting-edge technology with
            thoughtful design. My journey in software development has taken me
            from traditional web applications to the exciting world of 3D web
            experiences.
          </p>
          <p>
            With expertise spanning frontend frameworks like React and Next.js,
            backend technologies including Node.js and PostgreSQL, and emerging
            3D web technologies like Three.js, I bring a comprehensive approach
            to modern web development. I&apos;m particularly passionate about
            performance optimization, accessibility, and creating inclusive
            digital experiences.
          </p>
          <p>
            When I&apos;m not coding, you&apos;ll find me exploring new
            technologies, contributing to open source projects, or experimenting
            with 3D modeling and animation. I believe in continuous learning and
            enjoy sharing knowledge with the developer community through blog
            posts and mentoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">5+</div>
          <div className="text-sm text-muted-foreground">Years Experience</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">50+</div>
          <div className="text-sm text-muted-foreground">
            Projects Completed
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">15+</div>
          <div className="text-sm text-muted-foreground">
            Technologies Mastered
          </div>
        </div>
      </div>
    </section>
  );
}
