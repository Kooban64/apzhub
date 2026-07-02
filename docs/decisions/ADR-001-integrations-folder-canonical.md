# ADR-001 — Canonical Integration Folder Path

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001

## Context

Document 004 references `/adapters` for the integration layer. BUILD-001, Document 026, and the repository bootstrap use `integrations/` with `integration.yaml` manifests.

## Decision

The canonical repository path for integration adapters is **`integrations/`**.

Manifest files use **`integration.yaml`** per Document 026.

## Consequences

- New integration code lives under `integrations/`.
- Document 004 `/adapters` references are understood as the same architectural layer.
- `integrations/README.md` documents this choice for contributors.

## Alternatives considered

- Rename to `adapters/` to match 004 — rejected to avoid churn after BUILD-001 and 026 alignment.
