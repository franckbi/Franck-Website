/**
 * Skills matrix component with proficiency indicators
 * Displays skills organized by category with visual proficiency levels
 */

'use client';

import { useEffect, useState } from 'react';
import type { SkillCategory, SkillLevel } from '@/lib/types/content';

interface SkillsMatrixProps {
  skillCategories?: SkillCategory[];
  className?: string;
}

interface SkillItemProps {
  name: string;
  level: SkillLevel;
  years: number;
}

function getSkillLevelColor(level: SkillLevel): string {
  switch (level) {
    case 'expert':
      return 'bg-green-500';
    case 'advanced':
      return 'bg-blue-500';
    case 'intermediate':
      return 'bg-yellow-500';
    case 'beginner':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

function getSkillLevelWidth(level: SkillLevel): string {
  switch (level) {
    case 'expert':
      return 'w-full';
    case 'advanced':
      return 'w-3/4';
    case 'intermediate':
      return 'w-1/2';
    case 'beginner':
      return 'w-1/4';
    default:
      return 'w-1/4';
  }
}

function SkillItem({ name, level, years }: SkillItemProps) {
  // Normalize incoming level (handles 'Advanced', 'advanced', etc.)
  const normalizedLevel = (
    (level as string) || 'beginner'
  ).toLowerCase() as SkillLevel;

  const levelColor = getSkillLevelColor(normalizedLevel);
  const levelWidth = getSkillLevelWidth(normalizedLevel);

  // Ensure years is a number
  const safeYears = Number.isFinite(years) ? years : 0;

  // Capitalize label for display
  const displayLabel =
    normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{displayLabel}</span>
          <span>•</span>
          <span>{safeYears}y</span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${levelColor} ${levelWidth}`}
          role="progressbar"
          aria-valuenow={
            normalizedLevel === 'expert'
              ? 100
              : normalizedLevel === 'advanced'
                ? 75
                : normalizedLevel === 'intermediate'
                  ? 50
                  : 25
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} proficiency: ${normalizedLevel}`}
        />
      </div>
    </div>
  );
}

export function SkillsMatrix({
  skillCategories,
  className = '',
}: SkillsMatrixProps) {
  const [localCategories, setLocalCategories] = useState<
    SkillCategory[] | null
  >(skillCategories ?? null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If parent provided categories, no need to fetch
    if (skillCategories && skillCategories.length > 0) return;
    // If already loaded, skip
    if (localCategories !== null) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const TIMEOUT_MS = 8000;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      setLoading(true);
      try {
        timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch('/data/skills.json', { signal });
        if (!res.ok) throw new Error(`Failed to load skills: ${res.status}`);

        const data: SkillCategory[] = await res.json();
        setLocalCategories(data);
        setError(null);
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          console.error('skills.json fetch aborted/timed out');
          setError('Request timed out while loading skills.');
        } else {
          console.error('Failed to fetch skills.json', err);
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    };

    load();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
  }, [skillCategories, localCategories]);

  const categories = skillCategories ?? localCategories ?? [];

  return (
    <section className={`space-y-8 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Skills & Expertise</h2>
        <p className="text-muted-foreground">
          A comprehensive overview of my technical skills and proficiency levels
        </p>
      </div>

      {loading && !categories.length ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading skills…
        </div>
      ) : error && !categories.length ? (
        <div className="py-8 text-center text-sm text-destructive">
          Failed to load skills: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories.map(category => (
            <div
              key={category.name}
              className="space-y-4 p-6 rounded-lg border bg-card"
            >
              <h3 className="text-lg font-semibold text-primary">
                {category.name}
              </h3>
              <div className="space-y-4">
                {category.skills.map(skill => (
                  <SkillItem
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    years={skill.years}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Proficiency levels: Beginner (0-1 years) • Intermediate (1-3 years) •
          Advanced (3-5 years) • Expert (5+ years)
        </p>
      </div>
    </section>
  );
}
