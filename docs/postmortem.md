# Postmortem

## What Was Built

v0.1.0 delivers a static browser app at
https://baditaflorin.github.io/earthquake-wave-propagation/.

The app includes a Three.js terrain, clickable fault traces, a `Strike fault`
control, animated P-wave and S-wave propagation, Web Audio sonification,
WebGPU compute when available, a deterministic CPU fallback, local preferences,
project links, PayPal support link, and visible version/commit metadata.

## Was Mode A Correct?

Yes. Mode A was the correct deployment mode. The v1 product needs no backend,
auth, secrets, runtime writes, scheduled data generation, or shared persistence.
The simulation, rendering, audio, storage, and fallback behavior all fit inside
the browser.

Mode B would only become useful for curated earthquake datasets. Mode C would
only be justified by real-time APIs, accounts, private data, or server-side
collaboration.

## What Worked

The GitHub Pages-first path kept the system small and publicly available early.
Lazy loading kept the initial JavaScript payload modest while allowing Three.js
to power the main scene. The CPU fallback made Playwright smoke testing reliable
even where WebGPU is unavailable.

## What Did Not Work

GitHub Pages cannot expose custom COOP/COEP headers, which reinforced the choice
to avoid a WASM Fortran module in v1. The generated Pages artifact also means
build metadata naturally points at the source commit used to create the artifact,
not the artifact commit itself.

## Surprises

Headless browser environments should not be assumed to expose WebGPU. Treating
WebGPU as an acceleration path instead of a hard requirement made the app easier
to verify.

## Accepted Tech Debt

The SPECFEM3D subset is an educational analytic wavefront model, not a validated
scientific solver. The WebGPU and CPU kernels duplicate the same equations in
WGSL and TypeScript. The visual smoke test checks for a nonblank canvas and happy
path interaction, but it is not a full visual regression suite.

## Next Improvements

1. Add curated teaching scenarios with static JSON contracts.
2. Add a Web Worker for CPU fallback so older browsers stay smoother.
3. Add optional real event presets from public USGS GeoJSON feeds.

## Time Spent Vs Estimate

Estimated v1 scaffold and feature pass: 2 to 3 hours. Actual implementation was
about 2 hours for the static app, docs, tests, Pages setup, and release hygiene.
