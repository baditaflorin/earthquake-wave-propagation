# 0010 GitHub Pages Publishing Strategy

## Status

Accepted

## Context

GitHub Pages must work from day one. The repository also needs `docs/adr/`, so a
plain Vite `outDir: docs` build would erase documentation.

## Decision

Configure GitHub Pages to serve `main` branch `/docs`. Vite builds into `dist/`.
`scripts/publish-pages.mjs` copies app files into `docs/` while preserving
documentation folders. The Vite base path is `/earthquake-wave-propagation/`.
`404.html` is copied from `index.html` for SPA-safe refreshes.

## Consequences

The built site is committed and Pages-ready. Documentation can coexist under the
same publish root. Build scripts must clean only known app artifacts.

## Alternatives Considered

A `gh-pages` branch was rejected because it complicates the local-only workflow.
Serving from repo root was rejected because source files would become the Pages
root.
