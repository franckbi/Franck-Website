# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the 3D Portfolio Website project. ADRs document important architectural decisions made during the development process, including the context, decision, and consequences.

## ADR Format

Each ADR follows this structure:

- **Title** - Short noun phrase describing the decision
- **Status** - Proposed, Accepted, Deprecated, or Superseded
- **Context** - The situation that led to the decision
- **Decision** - The change being proposed or made
- **Consequences** - The positive and negative outcomes

## Index

| ADR                                            | Title                                             | Status   |
| ---------------------------------------------- | ------------------------------------------------- | -------- |
| [001](001-use-react-three-fiber.md)            | Use react-three-fiber for 3D rendering            | Accepted |
| [002](002-nextjs-app-router.md)                | Adopt Next.js App Router architecture             | Accepted |
| [003](003-progressive-enhancement-strategy.md) | Implement progressive enhancement for 3D features | Accepted |
| [004](004-zustand-state-management.md)         | Use Zustand for global state management           | Accepted |
| [005](005-draco-compression.md)                | Use Draco compression for 3D models               | Accepted |
| [006](006-accessibility-first-approach.md)     | Adopt accessibility-first development approach    | Accepted |
| [007](007-performance-budgets.md)              | Implement strict performance budgets              | Accepted |
| [008](008-testing-strategy.md)                 | Multi-layered testing strategy                    | Accepted |

## Creating New ADRs

When making significant architectural decisions:

1. Create a new ADR file: `NNN-short-title.md`
2. Use the next sequential number
3. Follow the standard format
4. Update this index
5. Get team review before marking as "Accepted"

## ADR Lifecycle

- **Proposed** - Decision is being considered
- **Accepted** - Decision has been approved and implemented
- **Deprecated** - Decision is no longer recommended
- **Superseded** - Decision has been replaced by a newer ADR
