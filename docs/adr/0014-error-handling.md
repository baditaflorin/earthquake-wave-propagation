# 0014 Error Handling Conventions

## Status

Accepted

## Context

Browser APIs such as WebGPU and Web Audio can fail or be unavailable.

## Decision

Use explicit capability detection and UI status messages. WebGPU failures fall
back to CPU simulation. Web Audio failures disable sound without blocking visual
simulation.

## Consequences

The app remains usable in more browsers. Errors should be actionable and avoid
stack traces in the public UI.

## Alternatives Considered

Failing hard when WebGPU is missing was rejected because accessibility matters
more than strict stack purity.
