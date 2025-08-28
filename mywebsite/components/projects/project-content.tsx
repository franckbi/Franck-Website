'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Project } from '@/lib/types/content';

interface ProjectContentProps {
  project: Project;
}

export function ProjectContent({ project }: ProjectContentProps) {
  return (
    <div className="space-y-8">
      {/* Project Description */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Overview</h2>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
            }}
          >
            {project.description}
          </ReactMarkdown>
        </div>
      </section>

      {/* Challenge Section */}
      {project.metadata.challenge && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Challenge</h2>
          <p className="text-muted-foreground leading-relaxed">
            {project.metadata.challenge}
          </p>
        </section>
      )}

      {/* Solution Section */}
      {project.metadata.solution && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Solution</h2>
          <p className="text-muted-foreground leading-relaxed">
            {project.metadata.solution}
          </p>
        </section>
      )}
    </div>
  );
}
