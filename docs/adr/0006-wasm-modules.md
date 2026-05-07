# 0006 WASM Modules

## Status

Accepted

## Context

The concept references SPECFEM3D, a Fortran seismology codebase, but v1 must run
on GitHub Pages without server processing.

## Decision

Do not ship WASM in v1. Implement a SPECFEM3D-inspired micro-subset in
TypeScript and WGSL: a simplified elastic wavefront model with material velocity
fields, P-wave and S-wave channels, attenuation, and source-time functions.

## Consequences

The app avoids COOP/COEP issues on GitHub Pages and keeps the first release
portable. It is educational rather than scientifically validated.

## Alternatives Considered

Compiling Fortran to WASM was deferred because it would increase delivery risk
and asset size for limited v1 value.
