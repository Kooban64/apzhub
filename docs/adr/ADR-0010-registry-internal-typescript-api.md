# ADR-0010 — Registry Internal TypeScript API

> **Status:** Accepted  
> **Date:** 2026-06-30  
> **Sprint:** SPR-002  
> **Decided by:** Project owner (Sprint 002 implementation approval)

## Problem

SPR-002 planning proposed a diagnostic REST endpoint (`GET /api/platform/registry`). Exposing registry data over HTTP prematurely increases attack surface and couples infrastructure to HTTP before the administration sprint.

## Decision

The Registry API is **internal only** in Sprint 002.

Expose a **strongly typed TypeScript API** from `@apzhub/platform-runtime`:

```typescript
registry.getModules();
registry.getServices();
registry.getIntegrations();
registry.getThemes();
registry.getCommands();
registry.getWidgets();
registry.getEvents();
registry.getReports();
// … per platform-registry-api.md
```

### Access pattern

| Consumer                           | Pattern                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| Server components / route handlers | `import { getRegistry } from "@apzhub/platform-runtime/server"` |
| Other packages                     | `@apzhub/platform-runtime` typed exports                        |
| Client bundles                     | **Must not** import full registry                               |

### Explicitly excluded from SPR-002

- `GET /api/platform/registry` or any public REST registry API
- GraphQL registry endpoint

REST endpoints may be introduced in a **later administration sprint** with authentication and RBAC.

## Alternatives

| Alternative                       | Why rejected                          |
| --------------------------------- | ------------------------------------- |
| Public diagnostic REST in SPR-002 | Owner decision; defer to admin sprint |
| GraphQL registry                  | Premature; no consumer                |

## Consequences

- Remove REST diagnostic route from SPR-002 implementation plan Phase 6
- Health endpoint may include minimal registry summary (`status`, counts) — not full manifest dump
- `@apzhub/platform-runtime/server` export for bootstrap + `getRegistry()`
