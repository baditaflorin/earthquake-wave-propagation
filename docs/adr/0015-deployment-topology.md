# 0015 Deployment Topology

## Status

Accepted

## Context

Mode C deployment topology does not apply.

## Decision

Deploy only through GitHub Pages at
`https://baditaflorin.github.io/earthquake-wave-propagation/`.

## Consequences

There is no Docker Compose, nginx, TLS certificate, or server runbook in v1.
Rollback is a git revert of the publishing commit.

## Alternatives Considered

A Docker backend was rejected in ADR 0001.
