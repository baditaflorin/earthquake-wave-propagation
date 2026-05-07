# 0017 Dependency Policy

## Status

Accepted

## Context

The app combines graphics, audio, and browser capability fallbacks. Custom
foundational libraries would increase risk.

## Decision

Use production-ready dependencies: Vite, React, Three.js, Zod, TanStack Query,
Vitest, Playwright, ESLint, and Prettier. Keep simulation-specific math local
because it is the product behavior.

## Consequences

The project benefits from maintained tooling while keeping domain logic
inspectable. Dependency updates should be tested with `make smoke`.

## Alternatives Considered

Custom rendering or a custom test runner were rejected as unnecessary.
