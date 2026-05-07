# 0001 Deployment Mode

## Status

Accepted

## Context

The app must make seismic wave propagation public and tactile while defaulting to
GitHub Pages. The v1 workflow needs no accounts, cross-device sync, secrets,
runtime writes, private APIs, or server-side state.

## Decision

Use Mode A: Pure GitHub Pages. The frontend is a static Vite build committed
under `docs/` and served by GitHub Pages. Simulation runs in the browser with
WebGPU compute when available, a CPU fallback otherwise, Three.js rendering, and
Web Audio sonification after user interaction.

## Consequences

The public surface is static and cheap to operate. Browser capability detection
must be careful because WebGPU is not universal. There is no backend, Docker
runtime, nginx, Prometheus, or API server in v1.

## Alternatives Considered

Mode B was unnecessary because v1 has no external data pipeline. Mode C was
rejected because no runtime API, secret, auth flow, or shared persistence is
needed.
