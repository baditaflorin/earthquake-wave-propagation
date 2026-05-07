# 0012 Metrics And Observability

## Status

Accepted

## Context

Mode A has no server-side telemetry. Public science demos should be privacy
respecting by default.

## Decision

Ship with no analytics. Document this in `docs/privacy.md`.

## Consequences

There is no usage dashboard. User privacy and operational simplicity are strong.

## Alternatives Considered

Plausible or a small beacon endpoint were deferred until there is a specific
learning question that justifies collection.
