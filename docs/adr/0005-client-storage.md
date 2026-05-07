# 0005 Client-Side Storage Strategy

## Status

Accepted

## Context

Users may tune velocity, attenuation, gain, and display settings. There is no
cross-device sync requirement.

## Decision

Use `localStorage` for a small preferences object validated with Zod. Avoid
IndexedDB and OPFS until user-created scenarios or larger local assets exist.

## Consequences

Persistence is simple, inspectable, and resilient. Stored data is non-sensitive
and can be reset by clearing site data.

## Alternatives Considered

IndexedDB and OPFS were rejected for v1 because the state is tiny.
