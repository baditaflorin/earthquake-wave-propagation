# 0013 Testing Strategy

## Status

Accepted

## Context

The risky parts are deterministic wave math, browser capability fallbacks, and
the end-to-end click-to-wave interaction.

## Decision

Use Vitest for simulation logic tests and Playwright for a smoke test that
builds, previews, loads the page, triggers a fault strike, and verifies a canvas
renders without console errors.

## Consequences

Checks are fast enough for local hooks. WebGPU-specific behavior is capability
gated because headless browsers may not expose WebGPU.

## Alternatives Considered

Full visual regression testing was deferred until the scene design stabilizes.
