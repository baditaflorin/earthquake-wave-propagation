# 0003 Frontend Framework And Build Tooling

## Status

Accepted

## Context

The UI needs stateful controls, a lazy 3D scene, TypeScript strictness, and a
static Pages build.

## Decision

Use React, TypeScript, Vite, Vitest, ESLint, and Prettier. Three.js is lazy
loaded for the scene. TanStack Query is included for static metadata/data fetch
patterns, although v1 has no remote dataset.

## Consequences

Local iteration is fast, and the static output is easy to publish. The Three.js
chunk must remain lazy so initial loading stays light.

## Alternatives Considered

Vanilla TypeScript was viable but would make complex UI controls less ergonomic.
Next.js was rejected because the app does not need SSR or routing complexity.
