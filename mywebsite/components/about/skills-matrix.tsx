/**
 * Skills matrix component with proficiency indicators
 * Displays skills organized by category with visual proficiency levels
 */

import type { SkillCategory, SkillLevel } from '@/lib/types/content';

interface SkillsMatrixProps {
  skillCategories: SkillCategory[];
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
  const levelColor = getSkillLevelColor(level);
  const levelWidth = getSkillLevelWidth(level);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{level}</span>
          <span>•</span>
          <span>{years}y</span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${levelColor} ${levelWidth}`}
          role="progressbar"
          aria-valuenow={
            level === 'expert'
              ? 100
              : level === 'advanced'
                ? 75
                : level === 'intermediate'
                  ? 50
                  : 25
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} proficiency: ${level}`}
        />
      </div>
    </div>
  );
}

export function SkillsMatrix({
  skillCategories,
  className = '',
}: SkillsMatrixProps) {
  return (
    <section className={`space-y-8 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Skills & Expertise</h2>
        <p className="text-muted-foreground">
          A comprehensive overview of my technical skills and proficiency levels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {skillCategories.map(category => (
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

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Proficiency levels: Beginner (0-1 years) • Intermediate (1-3 years) •
          Advanced (3-5 years) • Expert (5+ years)
        </p>
      </div>
    </section>
  );
}
