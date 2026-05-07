# 0016 Local Git Hooks

## Status

Accepted

## Context

The project explicitly avoids GitHub Actions and relies on local checks.

## Decision

Use a plain `.githooks/` directory wired with `make install-hooks`. Hooks run
ESLint, Prettier checks, TypeScript checks, gitleaks, unit tests, build, and the
smoke test.

## Consequences

The workflow works without installing lefthook. Contributors must run
`make install-hooks` once per clone.

## Alternatives Considered

Lefthook was rejected because it is not installed in the current environment.
