# ADR 002: Adopt Next.js App Router architecture

## Status

Accepted

## Context

Next.js 13+ introduced the App Router as a new routing system based on React Server Components. We need to decide between the traditional Pages Router and the new App Router for our portfolio website.

Considerations:

- **SEO Requirements** - Need server-side rendering for better search engine visibility
- **Performance** - Want optimal loading and rendering performance
- **Developer Experience** - Modern development patterns and tooling
- **Future-proofing** - Alignment with React and Next.js roadmap

## Decision

We will use Next.js 14 with the App Router architecture, leveraging React Server Components where appropriate.

## Consequences

### Positive

- **Server Components** - Reduced client-side JavaScript bundle
- **Streaming** - Progressive page loading with Suspense
- **Layouts** - Nested layouts with shared state
- **Route Groups** - Better organization of related routes
- **Built-in SEO** - Automatic metadata API and structured data
- **Performance** - Improved Core Web Vitals scores
- **Future-proof** - Aligned with React's future direction

### Negative

- **Learning Curve** - New mental model for server vs client components
- **Ecosystem Compatibility** - Some libraries may not work with Server Components
- **Debugging Complexity** - Server/client boundary can be confusing
- **Migration Path** - Limited migration tools from Pages Router

### Implementation Strategy

- Use Server Components for static content and data fetching
- Use Client Components for interactive 3D scenes and state management
- Implement proper loading states with Suspense boundaries
- Create clear documentation for server/client component patterns
