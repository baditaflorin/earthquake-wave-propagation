# 0007 Data Generation Pipeline

## Status

Accepted

## Context

Mode B pipelines are only needed when external or large static data artifacts
must be generated.

## Decision

No data-generation pipeline exists in Mode A v1. `make data` reports that the
target is not applicable.

## Consequences

There are no generated data artifacts, cadence, checksums, or release uploads to
operate.

## Alternatives Considered

A synthetic terrain generator was considered but kept in browser code to avoid
pretending there is a separate data product.
