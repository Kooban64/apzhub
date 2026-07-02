# ADR-0005 — Integration SDK Strategy

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

APZHUB connects to self-hosted OSS engines (Plane, Kimai, Zammad, etc.) without exposing engines to users. Document 004 references `/adapters`; BUILD-001 and Document 026 use `integrations/`. Contributors need a single canonical path and manifest contract.

## Decision

- Canonical repository path: **`integrations/`**
- Manifest file: **`integration.yaml`** per Document 026
- Each integration is an isolated adapter implementing Integration SDK contracts
- OSS Community Edition first; no direct engine coupling in presentation or application layers
- Legacy `/adapters` references in Document 004 are understood as the same architectural layer (see `docs/decisions/ADR-001`)

SPR-001 creates `integrations/README.md` only — no live integrations.

## Alternatives

| Alternative                                | Why rejected                                   |
| ------------------------------------------ | ---------------------------------------------- |
| Rename to `adapters/`                      | Churn after BUILD-001 and ADR-001 alignment    |
| Inline engine clients in Platform Services | Violates adapter isolation (Document 008)      |
| SaaS-only integrations                     | Conflicts with self-hosted OSS-first principle |

## Consequences

- New integration code lives under `integrations/<engine>/`.
- Platform Services orchestrate; adapters translate and enforce health/retry policies.
- First integration sprint authors `integration.yaml` before implementation.
