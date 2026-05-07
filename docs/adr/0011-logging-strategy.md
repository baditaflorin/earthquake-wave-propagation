# 0011 Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console noise should stay low in production.

## Decision

Do not emit routine production logs. Only user-visible errors and recoverable
capability warnings are surfaced in the UI.

## Consequences

The smoke test can treat console errors as failures. Debugging relies on local
development tools.

## Alternatives Considered

Verbose browser logging was rejected because it creates noise for public users.
