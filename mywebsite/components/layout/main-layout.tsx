'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { SkipToContent } from './skip-to-content';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: MainLayoutProps) {
  const pathname = usePathname();

  // Generate page-specific aria-label for main content
  const getMainContentLabel = () => {
    switch (pathname) {
      case '/':
        return 'Home page content with 3D project showcase';
      case '/projects':
        return 'Projects page with filterable project grid';
      case '/about':
        return 'About page with bio, skills, and timeline';
      case '/contact':
        return 'Contact page with contact form';
      default:
        if (pathname.startsWith('/projects/')) {
          return 'Project detail page';
        }
        return 'Page content';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      <Header />

      <ErrorBoundary>
        <main
          id="main-content"
          className={`flex-1 pt-16 ${className}`}
          role="main"
          aria-label={getMainContentLabel()}
        >
          {children}
        </main>
      </ErrorBoundary>

      <Footer />
    </div>
  );
}
