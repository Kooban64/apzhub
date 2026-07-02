# ADR-0011 — Unified Manifest Envelope

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

SPR-001 `component.yaml` files use a flat format. SDK documents 025–029 use kind-specific root keys (`module:`, `service:`, etc.). Multiple incompatible formats complicate discovery, validation, and registry normalisation.

## Decision

Every manifest **must** follow one **common envelope**. Specialised manifests extend this structure with a kind-specific payload section.

### Required envelope fields

| Field                   | Type            | Required |
| ----------------------- | --------------- | -------- |
| `id`                    | string          | Yes      |
| `name`                  | string          | Yes      |
| `version`               | string (semver) | Yes      |
| `kind`                  | CapabilityKind  | Yes      |
| `manifestSchemaVersion` | string          | Yes      |
| `metadata`              | object          | Yes      |
| `dependencies`          | object          | Optional |
| `health`                | object          | Optional |
| `documentation`         | object          | Optional |
| `tests`                 | object          | Optional |

### Kind-specific extension

Each `kind` adds a typed payload block (e.g. `component:`, `module:`, `theme:`) validated by kind schema.

### Example (component)

```yaml
manifestSchemaVersion: "1.0"
id: button
name: Button
version: 0.1.0
kind: component

metadata:
  category: primitive
  description: Token-driven button primitive.

dependencies:
  platform: []

health:
  enabled: false

documentation:
  storybook: packages/ui/src/components/button.stories.tsx

tests:
  unit: true
  accessibility: true

component:
  props: {}
  theme:
    supportsDarkMode: true
```

### Migration

SPR-001 flat `component.yaml` files **must be migrated** to the unified envelope in Phase 1 (SPR-002). No dual-format support in production.

## Alternatives

| Alternative                                | Why rejected                    |
| ------------------------------------------ | ------------------------------- |
| Support flat + nested indefinitely         | Owner decision: one format only |
| Separate files per format without envelope | Complicates registry pipeline   |

## Consequences

- All existing manifests updated during SPR-002 Phase 1
- Zod schemas in `@apzhub/platform-runtime` enforce envelope + kind payload
- Documents 025–029 remain authoritative for kind semantics; envelope is registry runtime standard
