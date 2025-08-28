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
            Software Engineer with ~2 years building and operating APIs and
            microservices on AWS (Lambda, API Gateway, RDS/PostgreSQL, S3,
            CloudWatch), plus full-stack features in Next.js/TypeScript. I work
            end-to-end in Agile teams—definition, design, development, testing,
            code reviews, CI/CD (Jenkins/GitHub Actions), and production
            troubleshooting—to ship reliable, user-focused features.
          </p>
          <p>
            Recent work includes internal Credit Underwriting & SAC portals at
            John Deere (Terraform infra, Okta/OIDC, Prisma/PostgreSQL,
            guard-rail UX), a GridAI web interface (real-time telemetry and ML
            results), and an Android app (MVVM, Retrofit, Room, CI). I care
            about clean contracts, observability, and performance.
          </p>
          <p>
            Currently open to full-time roles; also open to contract and
            freelance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">2</div>
          <div className="text-sm text-muted-foreground">Years Experience</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">6</div>
          <div className="text-sm text-muted-foreground">
            Projects Completed
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">10</div>
          <div className="text-sm text-muted-foreground">
            Technologies Mastered
          </div>
        </div>
      </div>
    </section>
  );
}
