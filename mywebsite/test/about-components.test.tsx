/**
 * Tests for About page components
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  BioSection,
  SkillsMatrix,
  Timeline,
  ContactLinks,
} from '@/components/about';
import type { SkillCategory, TimelineItem } from '@/lib/types/content';

describe('About Components', () => {
  describe('BioSection', () => {
    it('should render bio content', () => {
      render(<BioSection />);

      expect(screen.getByText('About Me')).toBeInTheDocument();
      expect(
        screen.getByText(/passionate full-stack developer/i)
      ).toBeInTheDocument();
      expect(screen.getByText('5+')).toBeInTheDocument();
      expect(screen.getByText('Years Experience')).toBeInTheDocument();
    });
  });

  describe('SkillsMatrix', () => {
    const mockSkillCategories: SkillCategory[] = [
      {
        name: 'Frontend Development',
        skills: [
          { name: 'React', level: 'expert', years: 5 },
          { name: 'TypeScript', level: 'advanced', years: 3 },
        ],
      },
      {
        name: 'Backend Development',
        skills: [{ name: 'Node.js', level: 'intermediate', years: 2 }],
      },
    ];

    it('should render skills matrix with categories', () => {
      render(<SkillsMatrix skillCategories={mockSkillCategories} />);

      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('Frontend Development')).toBeInTheDocument();
      expect(screen.getByText('Backend Development')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });

    it('should display skill levels and years', () => {
      render(<SkillsMatrix skillCategories={mockSkillCategories} />);

      expect(screen.getByText('expert')).toBeInTheDocument();
      expect(screen.getByText('advanced')).toBeInTheDocument();
      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('5y')).toBeInTheDocument();
      expect(screen.getByText('3y')).toBeInTheDocument();
      expect(screen.getByText('2y')).toBeInTheDocument();
    });

    it('should render progress bars with correct accessibility attributes', () => {
      render(<SkillsMatrix skillCategories={mockSkillCategories} />);

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(3);

      const reactProgressBar = screen.getByLabelText(
        'React proficiency: expert'
      );
      expect(reactProgressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Timeline', () => {
    const mockTimelineItems: TimelineItem[] = [
      {
        date: '2024-01-01',
        title: 'Senior Developer',
        company: 'Tech Corp',
        description: 'Leading frontend development',
        technologies: ['React', 'TypeScript'],
        type: 'work',
      },
      {
        date: '2023-06-01',
        title: 'Portfolio Project',
        company: 'Personal',
        description: 'Built 3D portfolio website',
        technologies: ['Three.js', 'Next.js'],
        type: 'project',
      },
    ];

    it('should render timeline items', () => {
      render(<Timeline items={mockTimelineItems} />);

      expect(screen.getByText('Professional Journey')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Project')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should display formatted dates', () => {
      render(<Timeline items={mockTimelineItems} />);

      expect(screen.getByText('December 2023')).toBeInTheDocument();
      expect(screen.getByText('May 2023')).toBeInTheDocument();
    });

    it('should show technology tags', () => {
      render(<Timeline items={mockTimelineItems} />);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Three.js')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
    });

    it('should sort items by date (most recent first)', () => {
      render(<Timeline items={mockTimelineItems} />);

      const timeElements = screen.getAllByRole('time');
      expect(timeElements[0]).toHaveAttribute('datetime', '2024-01-01');
      expect(timeElements[1]).toHaveAttribute('datetime', '2023-06-01');
    });
  });

  describe('ContactLinks', () => {
    it('should render contact links section', () => {
      render(<ContactLinks />);

      expect(screen.getByText("Let's Connect")).toBeInTheDocument();
      expect(screen.getByText('Download Resume')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should have correct link attributes', () => {
      render(<ContactLinks />);

      const resumeLink = screen.getByText('Download Resume').closest('a');
      expect(resumeLink).toHaveAttribute('href', '/resume.pdf');
      expect(resumeLink).toHaveAttribute('download');

      const githubLink = screen.getByText('GitHub').closest('a');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

      const emailLink = screen.getByText('Email').closest('a');
      expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
    });
  });
});
