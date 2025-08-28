/**
 * Timeline component for displaying career and project history
 * Shows chronological progression with structured data
 */

import type { TimelineItem } from '@/lib/types/content';

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

interface TimelineItemProps {
  item: TimelineItem;
  isLast: boolean;
}

function getTimelineTypeIcon(type: TimelineItem['type']): string {
  switch (type) {
    case 'work':
      return '💼';
    case 'education':
      return '🎓';
    case 'project':
      return '🚀';
    case 'achievement':
      return '🏆';
    default:
      return '📅';
  }
}

function getTimelineTypeColor(type: TimelineItem['type']): string {
  switch (type) {
    case 'work':
      return 'bg-blue-500';
    case 'education':
      return 'bg-green-500';
    case 'project':
      return 'bg-purple-500';
    case 'achievement':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

function TimelineItemComponent({ item, isLast }: TimelineItemProps) {
  const typeColor = getTimelineTypeColor(item.type);
  const typeIcon = getTimelineTypeIcon(item.type);

  return (
    <div className="relative flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full ${typeColor} flex items-center justify-center text-xs`}
          title={`${item.type} milestone`}
        >
          <span className="sr-only">{typeIcon}</span>
        </div>
        {!isLast && <div className="w-0.5 h-full bg-border mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <time
              className="text-sm text-muted-foreground font-medium"
              dateTime={item.date}
            >
              {formatDate(item.date)}
            </time>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {typeIcon}
            </span>
            <span className="font-medium text-primary">{item.company}</span>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          {item.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {item.technologies.map(tech => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Timeline({ items, className = '' }: TimelineProps) {
  // Sort items by date (most recent first)
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Professional Journey</h2>
        <p className="text-muted-foreground">
          Key milestones in my career and personal development
        </p>
      </div>

      <div className="space-y-0">
        {sortedItems.map((item, index) => (
          <TimelineItemComponent
            key={`${item.date}-${item.title}`}
            item={item}
            isLast={index === sortedItems.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
