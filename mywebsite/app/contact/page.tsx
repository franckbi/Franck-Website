import { ContactForm } from '@/components/contact';
import { StructuredData } from '@/components/seo/structured-data';
import { generateContactMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

export const metadata = generateContactMetadata();

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <header className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Contact</h1>
              <p className="text-muted-foreground">
                Get in touch for opportunities and collaborations
              </p>
            </header>

            <section aria-label="Contact form">
              <ContactForm />
            </section>

            <aside className="max-w-2xl mx-auto text-center">
              <div className="bg-muted/20 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">
                  Other Ways to Connect
                </h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Prefer email? You can also reach me directly at{' '}
                    <a
                      href="mailto:franckbbiy@gmail.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      franckbbiy@gmail.com
                    </a>
                  </p>
                  <p>Response time is typically within 24-48 hours.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
