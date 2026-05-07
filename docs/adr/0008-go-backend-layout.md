# 0008 Go Backend Layout

## Status

Accepted

## Context

The bootstrap asks for Go backend layout only for Mode B or Mode C.

## Decision

Skip Go backend files in Mode A. There is no `cmd/`, `internal/`, API server, or
data-generator binary in v1.

## Consequences

The repository remains focused on the static app. Backend conventions can be
introduced later if the project moves to Mode B or C.

## Alternatives Considered

Adding empty Go folders was rejected because it would imply unused runtime or
pipeline responsibilities.
