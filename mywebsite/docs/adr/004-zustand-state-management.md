# ADR 004: Use Zustand for global state management

## Status

Accepted

## Context

The application needs global state management for:

- User preferences (theme, low-power mode)
- 3D scene state (active project, camera position)
- Project filtering and view modes
- Analytics and performance tracking

Options considered:

1. **React Context** - Built-in React state management
2. **Redux Toolkit** - Traditional Redux with modern tooling
3. **Zustand** - Lightweight state management library
4. **Jotai** - Atomic state management
5. **Valtio** - Proxy-based state management

## Decision

We will use Zustand for global state management, with React Context for theme and settings that need to be available during SSR.

## Consequences

### Positive

- **Minimal Boilerplate** - Simple store creation and usage
- **TypeScript Support** - Excellent TypeScript integration
- **Performance** - No unnecessary re-renders with selector pattern
- **Bundle Size** - Very small footprint (~2KB)
- **Flexibility** - Works with both client and server components
- **DevTools** - Redux DevTools integration available
- **Persistence** - Built-in localStorage persistence middleware

### Negative

- **Learning Curve** - Team needs to learn Zustand patterns
- **Ecosystem** - Smaller ecosystem compared to Redux
- **SSR Complexity** - Need careful handling of hydration
- **Debugging** - Less mature debugging tools compared to Redux

### Implementation Strategy

- Use Zustand for client-side state (3D scenes, filters, analytics)
- Use React Context for SSR-compatible state (theme, settings)
- Implement proper TypeScript interfaces for all stores
- Add persistence middleware for user preferences
- Create custom hooks for common state operations
