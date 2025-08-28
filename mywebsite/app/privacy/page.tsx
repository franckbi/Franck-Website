import { Metadata } from 'next';

/* eslint-disable react/no-unescaped-entities */

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy and data handling practices for this portfolio website.',
  openGraph: {
    title: 'Privacy Policy',
    description:
      'Privacy policy and data handling practices for this portfolio website.',
  },
};

export default function PrivacyPage() {
  return (
    <main>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </header>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p>
                This privacy policy describes how this portfolio website
                collects, uses, and protects your information when you visit and
                interact with our site. We are committed to protecting your
                privacy and being transparent about our data practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Information We Collect
              </h2>

              <h3 className="text-xl font-medium mb-3">Analytics Data</h3>
              <p className="mb-4">
                We use privacy-focused analytics (Plausible Analytics) to
                understand how visitors use our website. This includes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Page views and session duration</li>
                <li>Referrer information (which site you came from)</li>
                <li>General location (country/region level only)</li>
                <li>Device type and browser information</li>
                <li>User interactions with 3D elements and forms</li>
              </ul>
              <p className="mb-4">
                <strong>Important:</strong> We do not collect personal
                identifiers, IP addresses, or use tracking cookies. All
                analytics data is aggregated and anonymous.
              </p>

              <h3 className="text-xl font-medium mb-3">Contact Form Data</h3>
              <p className="mb-4">
                When you submit the contact form, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your name and email address</li>
                <li>The message content you provide</li>
                <li>Timestamp of submission</li>
              </ul>
              <p>
                This information is used solely to respond to your inquiry and
                is not shared with third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6">
                <li>
                  <strong>Analytics:</strong> To improve website performance,
                  user experience, and content relevance
                </li>
                <li>
                  <strong>Contact inquiries:</strong> To respond to your
                  messages and provide requested information
                </li>
                <li>
                  <strong>Technical optimization:</strong> To identify and fix
                  bugs, optimize 3D performance, and enhance accessibility
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Data Storage and Security
              </h2>
              <p className="mb-4">
                Your data is protected through industry-standard security
                measures:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>All data transmission is encrypted using HTTPS/TLS</li>
                <li>Contact form submissions are processed securely</li>
                <li>
                  Analytics data is stored by Plausible Analytics in EU servers
                </li>
                <li>We do not store personal data longer than necessary</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Third-Party Services
              </h2>

              <h3 className="text-xl font-medium mb-3">Plausible Analytics</h3>
              <p className="mb-4">
                We use Plausible Analytics, a privacy-focused analytics service
                that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Does not use cookies or track users across websites</li>
                <li>Does not collect personal data</li>
                <li>Is GDPR, CCPA, and PECR compliant</li>
                <li>Stores data in EU servers</li>
              </ul>
              <p>
                Learn more at{' '}
                <a
                  href="https://plausible.io/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Plausible's Privacy Policy
                </a>
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">External Links</h3>
              <p>
                This website contains links to external sites (GitHub, demo
                applications, etc.). We are not responsible for the privacy
                practices of these external sites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Your Rights and Choices
              </h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  <strong>Opt out of analytics:</strong> You can disable
                  analytics tracking using the consent banner or browser
                  settings
                </li>
                <li>
                  <strong>Request information:</strong> Ask what data we have
                  collected about you
                </li>
                <li>
                  <strong>Request deletion:</strong> Ask us to delete any
                  personal information we have collected
                </li>
                <li>
                  <strong>Data portability:</strong> Request a copy of your data
                  in a machine-readable format
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Cookies and Local Storage
              </h2>
              <p className="mb-4">
                This website uses minimal local storage for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Theme preferences (dark/light mode)</li>
                <li>Analytics consent status</li>
                <li>Performance settings (3D quality, reduced motion)</li>
              </ul>
              <p>
                We do not use tracking cookies or third-party advertising
                cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Children's Privacy
              </h2>
              <p>
                This website is not directed at children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. Any changes
                will be posted on this page with an updated "Last modified"
                date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <p className="mb-4">
                If you have questions about this privacy policy or our data
                practices, please contact us:
              </p>
              <ul className="list-disc pl-6">
                <li>
                  Through the{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    contact form
                  </a>
                </li>
                <li>
                  Via email at the address provided in the contact section
                </li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-muted rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Privacy-First Approach
              </h2>
              <p>
                This portfolio website is built with privacy in mind. We collect
                only the minimum data necessary to provide a good user
                experience and improve our services. Your privacy is important
                to us, and we are committed to protecting it.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
