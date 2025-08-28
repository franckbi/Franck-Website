/**
 * Contact links component with resume download and social media links
 * Provides easy access to professional profiles and resume
 */

interface ContactLinksProps {
  className?: string;
}

interface LinkItemProps {
  href: string;
  icon: string;
  label: string;
  description: string;
  external?: boolean;
  download?: boolean;
}

function LinkItem({
  href,
  icon,
  label,
  description,
  external = false,
  download = false,
}: LinkItemProps) {
  const linkProps = {
    href,
    className:
      'flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors group',
    ...(external && { target: '_blank', rel: 'noopener noreferrer' }),
    ...(download && { download: true }),
  };

  return (
    <a {...linkProps}>
      <div className="text-2xl" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium group-hover:text-primary transition-colors">
          {label}
        </div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        {external ? '↗' : download ? '↓' : '→'}
      </div>
    </a>
  );
}

export function ContactLinks({ className = '' }: ContactLinksProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Let&apos;s Connect</h2>
        <p className="text-muted-foreground">
          Find me on these platforms or download my resume
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LinkItem
          href="/resume.pdf"
          icon="📄"
          label="Download Resume"
          description="View my complete professional background"
          download
        />

        <LinkItem
          href="https://github.com/johndoe"
          icon="🐙"
          label="GitHub"
          description="Explore my open source contributions"
          external
        />

        <LinkItem
          href="https://linkedin.com/in/johndoe"
          icon="💼"
          label="LinkedIn"
          description="Connect with me professionally"
          external
        />

        <LinkItem
          href="mailto:john.doe@example.com"
          icon="✉️"
          label="Email"
          description="Send me a direct message"
        />

        <LinkItem
          href="https://twitter.com/johndoe"
          icon="🐦"
          label="Twitter"
          description="Follow my thoughts and updates"
          external
        />

        <LinkItem
          href="/contact"
          icon="💬"
          label="Contact Form"
          description="Use the contact form for inquiries"
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Always open to discussing new opportunities, collaborations, or just
          chatting about technology!
        </p>
      </div>
    </section>
  );
}
