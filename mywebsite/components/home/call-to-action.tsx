'use client';

import Link from 'next/link';

export function CallToAction() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            I&apos;m always interested in new opportunities and exciting
            projects. Whether you&apos;re looking for a software developer,
            consultant, or collaborator, let&apos;s discuss how we can bring
            your ideas to life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
            >
              Start a Conversation
            </Link>
            <a
              href="mailto:hello@example.com"
              className="inline-flex items-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium text-lg"
            >
              Send Email
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Available for new Opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Remote & on-site work</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Quick response time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
