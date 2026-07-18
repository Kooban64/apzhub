# OSS-110-03 — Provider Mapping, Orchestration & Service Gateway — Completion Report

**Milestone:** OSS-110-03  
**Date:** 2026-07-10  
**Status:** Complete  
**Package:** `@apzhub/platform-services` v0.2.0

---

## Executive summary

OSS-110-03 delivers the provider-neutral mapping, orchestration, and gateway layer required for APZHUB platform services to operate safely across one or more integrations. Platform consumers now pass and receive APZHUB global IDs only. An in-memory `EntityMappingStore`, mapping-aware service implementations, mapping-driven provider selection, reconciliation reporting, and `PlatformServiceGateway` are in place. Plane remains the first registered provider; no Plane types enter public platform APIs. The `@apzhub/integration-plane` package was not modified.

---

## Milestone scope delivered

| Deliverable                                                     | Status     |
| --------------------------------------------------------------- | ---------- |
| EntityMappingStore contract                                     | ✅         |
| InMemoryEntityMappingStore                                      | ✅         |
| Global ID strategy (ADR-0048)                                   | ✅         |
| MappingOrchestrator                                             | ✅         |
| Mapping-aware Workspace/Project/Team/User/Search services       | ✅         |
| PlatformServiceGateway                                          | ✅         |
| Provider resolution with mapping precedence                     | ✅         |
| Reconciliation contracts (in-memory report)                     | ✅         |
| Plane provider sprint ref compatibility (services package only) | ✅         |
| Extended PlatformServiceError codes                             | ✅         |
| Comprehensive unit tests                                        | ✅         |
| Documentation + ADR                                             | ✅         |
| TaskServiceImpl / Plane task CRUD                               | ⏸ Excluded |

---

## Architecture overview

```text
PlatformServiceGateway
  → Mapping-aware *ServiceImpl
    → MappingOrchestrator / EntityMappingStore
    → ProviderResolver (mapping → active → priority)
      → Capability Provider → Integration Adapter
```

---

## Global ID design

Format: `{prefix}_{32-hex}` (UUID v4 entropy, no hyphens).  
Examples: `proj_…`, `ws_…`, `sprint_…`.  
Governed by [ADR-0048](../adr/ADR-0048-apzhub-global-entity-id-strategy.md).  
Provisional `*_plane_*` IDs are stripped at the mapping boundary.

---

## Mapping-store design

- Interface: `EntityMappingStore`
- Implementation: `InMemoryEntityMappingStore` (deterministic, uniqueness-enforced, immutable copies)
- Persistence boundary: PostgreSQL can replace the in-memory store later without consumer changes
- Optimistic `revision` field for concurrency

---

## Provider-resolution precedence

1. `preferredProviderId`
2. `preferredIntegrationId`
3. Mapped provider from entity mapping
4. Active registry selection
5. Highest priority (lowest number)

---

## Gateway design

`PlatformServiceGateway` exposes `workspaces`, `projects`, `teams`, `users`, `search` as contracts. `tasks` throws `PROVIDER_CAPABILITY_UNSUPPORTED`. Context assertion helper included. Registry internals are not exposed to modules.

---

## Reconciliation behaviour

`reconcileEntityMappings` reports:

- provider entity missing mapping
- mapping missing provider entity
- duplicate provider mappings
- inactive provider with active mappings

No scheduler or automated repair.

Compensation: if provider create succeeds but mapping persistence fails → `RECONCILIATION_REQUIRED`.

---

## Files created

```text
packages/platform-services/src/mapping/
  types.ts, global-id.ts, entity-mapping-store.ts,
  in-memory-entity-mapping-store.ts, index.ts
packages/platform-services/src/orchestration/mapping-orchestrator.ts
packages/platform-services/src/reconciliation/reconcile-entity-mappings.ts
packages/platform-services/src/gateway/platform-service-gateway.ts
packages/platform-services/src/mapping-orchestration.test.ts
docs/adr/ADR-0048-apzhub-global-entity-id-strategy.md
docs/specs/APZHUB-Entity-Mapping-Specification.md
docs/specs/APZHUB-Platform-Service-Gateway.md
docs/sprint/OSS-110-03-completion-report.md
```

---

## Files modified

```text
packages/platform-service-contracts/src/common/errors.ts
packages/platform-services/package.json (v0.2.0)
packages/platform-services/src/index.ts
packages/platform-services/src/services/platform-service-impls.ts
packages/platform-services/src/services/create-platform-services.ts
packages/platform-services/src/providers/types.ts
packages/platform-services/src/providers/registry/provider-resolver.ts
packages/platform-services/src/providers/plane/plane-project-provider.ts
packages/platform-services/src/platform-service-impls.test.ts
packages/platform-services/src/plane-providers.test.ts
packages/platform-services/README.md
docs/architecture/APZHUB-Platform-Service-Implementation-Architecture.md
docs/foundation/CURRENT-*.md, AI-CONTEXT.md, ACTIVE-BACKLOG.md
docs/foundation/DECISION-REGISTER.md, ADR-CATALOGUE.md
docs/README.md
integrations/plane/docs/PLANE-ADAPTER.md
```

---

## Tests added / statistics

| Suite                                  | Focus                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `mapping-orchestration.test.ts`        | Global IDs, store, orchestrator, gateway, reconciliation, mapping-aware ops |
| Updated service / Plane provider tests | Mapping-aware behaviour, sprint refs                                        |

| Scope                                      | Result               |
| ------------------------------------------ | -------------------- |
| `@apzhub/platform-services`                | 44 passed            |
| `@apzhub/integration-plane`                | 37 passed            |
| `@apzhub/integration-sdk` (sampled suites) | green with above run |
| Combined related run                       | **146 passed**       |

---

## Coverage

Mapping/orchestration/gateway logic covered by dedicated unit tests. Full monorepo coverage thresholds remain package-scoped; platform-services mapping paths exercise create/resolve/conflict/inactive/reconciliation/gateway/error cases.

---

## Quality-gate results

| Gate                                                         | Result |
| ------------------------------------------------------------ | ------ |
| `pnpm --filter @apzhub/platform-services typecheck`          | Pass   |
| `pnpm --filter @apzhub/platform-service-contracts typecheck` | Pass   |
| ESLint (platform-services)                                   | Pass   |
| Platform services + Plane + Integration SDK tests            | Pass   |
| Plane adapter source modified                                | **No** |

---

## Backward-compatibility assessment

- `@apzhub/platform-services` public factory still exports `createPlatformServices` / `createPlatformServicesWithPlane`
- Bundle now includes `gateway`, `mapping`, `mappingStore`
- Service implementations require mapping orchestrator (breaking for direct `new WorkspaceServiceImpl(resolver)` callers — none outside this package)
- Plane adapter package unchanged; provisional IDs still emitted at adapter boundary and normalised by mapping layer

---

## Plane adapter changes

**None** in `integrations/plane/`.  
Compatibility for sprint-by-id lives in `@apzhub/platform-services` Plane providers via internal `projectNativeId::sprintNativeId` refs used only by the mapping-aware service layer.

---

## Technical debt

| Item                                     | Notes                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| In-memory mapping store only             | PostgreSQL implementation deferred                                             |
| User/search still scaffolded             | Identity directory / search framework not in scope                             |
| Milestones unsupported at Plane provider | Throws configuration error                                                     |
| Sprint ref encoding                      | Internal Plane-provider convention until first-class project-scoped sprint API |
| TaskServiceImpl                          | Deferred to later milestone                                                    |
| Permission enforcement                   | Still deferred (gateway-ready)                                                 |

---

## Risks

| Risk                                              | Mitigation                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| Mapping persistence failure after provider create | `RECONCILIATION_REQUIRED` + diagnostics                           |
| Provisional ID leakage                            | Mapping normalisation + tests assert no `_plane_` in consumer IDs |
| Multi-provider drift                              | Mapping-driven provider selection for existing entities           |

---

## Migration considerations

Existing provisional `*_plane_*` IDs must not be treated as APZHUB global IDs. On first observation through mapping-aware services, allocate a new global ID and bind the native segment. No automated migration job in this milestone.

---

## Recommendation for next milestone

**OSS-110-04** (suggested) or owner-directed next step:

1. PostgreSQL `EntityMappingStore` implementation
2. Permission enforcement middleware on the gateway
3. API route handlers delegating to `PlatformServiceGateway`
4. Then **OSS-101-06** (Plane task CRUD) + `TaskServiceImpl` with mapping

---

## Stop condition

**OSS-110-03 complete.** Do not begin OSS-101-06, OSS-110-04, or any other milestone without explicit owner approval.
