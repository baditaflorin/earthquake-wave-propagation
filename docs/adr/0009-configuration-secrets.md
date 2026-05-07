# 0009 Configuration And Secrets Management

## Status

Accepted

## Context

The frontend must never contain secrets. Mode A should need none.

## Decision

Use build-time public constants only: Pages base path, repository URL, PayPal
URL, version, and commit. Keep `.env*` ignored except `.env.example`. Use
gitleaks in the pre-commit hook.

## Consequences

No operational secret rotation is needed. Any future secret requirement forces a
new ADR and likely Mode B or Mode C.

## Alternatives Considered

Encrypted or obfuscated frontend secrets were rejected as insecure.
