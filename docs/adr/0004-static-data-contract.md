# 0004 Static Data Contract

## Status

Accepted

## Context

Mode A has no generated public dataset. The app still needs deterministic
material and fault inputs.

## Decision

Ship small static scenario definitions as TypeScript constants. Each scenario
contains terrain dimensions, material velocities, attenuation, fault geometry,
and default source parameters. No JSON or Parquet artifacts are fetched in v1.

## Consequences

The app works offline after first load. Scenario changes are versioned with the
source code and release tags.

## Alternatives Considered

Static JSON under `docs/data/` was deferred until there are multiple curated
real-world teaching datasets.
