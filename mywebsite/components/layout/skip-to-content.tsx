'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function SkipToContent() {
  const pathname = usePathname();

  // Define skip links based on current page
  const getSkipLinks = () => {
    const baseLinks = [
      { href: '#main-content', label: 'Skip to main content' },
      { href: '#navigation', label: 'Skip to navigation' },
    ];

    // Add page-specific skip links
    if (pathname === '/') {
      baseLinks.push(
        { href: '#hero-section', label: 'Skip to hero section' },
        { href: '#featured-projects', label: 'Skip to featured projects' }
      );
    } else if (pathname === '/projects') {
      baseLinks.push(
        { href: '#project-filters', label: 'Skip to project filters' },
        { href: '#projects-grid', label: 'Skip to projects grid' }
      );
    } else if (pathname === '/contact') {
      baseLinks.push({ href: '#contact-form', label: 'Skip to contact form' });
    } else if (pathname === '/about') {
      baseLinks.push(
        { href: '#bio-section', label: 'Skip to bio' },
        { href: '#skills-section', label: 'Skip to skills' },
        { href: '#timeline-section', label: 'Skip to timeline' }
      );
    }

    return baseLinks;
  };

  const skipLinks = getSkipLinks();

  return (
    <nav
      aria-label="Skip navigation links"
      className="sr-only focus-within:not-sr-only"
    >
      <ul className="fixed top-4 left-4 z-[100] space-y-2">
        {skipLinks.map((link, index) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="skip-link bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary block"
              tabIndex={index === 0 ? 0 : -1}
              onFocus={e => {
                // Make all skip links focusable when one is focused
                const links =
                  e.currentTarget.parentElement?.parentElement?.querySelectorAll(
                    'a'
                  );
                links?.forEach(link => link.setAttribute('tabindex', '0'));
              }}
              onBlur={e => {
                // Reset tabindex when focus leaves skip links area
                const relatedTarget = e.relatedTarget as HTMLElement;
                const isSkipLink = relatedTarget?.closest(
                  '[aria-label="Skip navigation links"]'
                );
                if (!isSkipLink) {
                  const links =
                    e.currentTarget.parentElement?.parentElement?.querySelectorAll(
                      'a'
                    );
                  links?.forEach((link, idx) => {
                    link.setAttribute('tabindex', idx === 0 ? '0' : '-1');
                  });
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
