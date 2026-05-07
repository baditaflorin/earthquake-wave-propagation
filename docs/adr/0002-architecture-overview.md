# 0002 Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The project needs a serious-feeling scientific demo without turning v1 into a
full seismology platform.

## Decision

Use a browser-only architecture with these boundaries:

- `features/seismic/` owns the interactive app surface.
- `simulation/` owns deterministic wave math and WebGPU/CPU kernels.
- `audio/` owns Web Audio synthesis and user-gesture gating.
- `rendering/` owns Three.js terrain, picking, camera, and animation.
- `generated/` owns build metadata surfaced in the UI.

## Consequences

The simulation code remains testable outside React and Three.js. Rendering can
fall back independently from WebGPU compute support.

## Alternatives Considered

A monolithic React component was rejected because it would make the simulation
hard to test and evolve.
