# APZHUB Platform Service Implementation Architecture

**Milestone:** OSS-110-02 + OSS-110-03 + OSS-110-04 + OSS-110-05 + OSS-110-08 + **OSS-110-10**  
**Status:** Canonical — mapping-aware platform service layer with Projects + Support domains  
**Package:** `@apzhub/platform-services` v0.7.0  
**Authority:** [009 — Platform Service Layer](../009-platform-service-layer-integration-framework.md) · [ADR-0048](../adr/ADR-0048-apzhub-global-entity-id-strategy.md) · [ADR-0049](../adr/ADR-0049-persistent-entity-mapping-store.md) · [Entity Mapping Specification](../specs/APZHUB-Entity-Mapping-Specification.md) · [Platform Execution Layer](./APZHUB-Platform-Execution-Layer.md) · [Support Platform Service Architecture](./APZHUB-Support-Platform-Service-Architecture.md)

---

## Purpose

Define how APZHUB implements vendor-neutral platform services with stable global IDs, entity mapping, provider resolution, a controlled gateway entry point, and a reusable request execution pipeline.

---

## Layer diagram

```text
Modules / future API handlers
        ↓
PlatformServiceGateway
        ↓
RequestPipeline (middleware · policies · authz · log/metrics)
        ↓
Mapping-aware *ServiceImpl
        ↓
MappingOrchestrator + EntityMappingStore
        ↓
ProviderResolver → ProviderRegistry
        ↓
Capability Provider (Plane* | Zammad* | Mock*)
        ↓
Integration Adapter (@apzhub/integration-plane | @apzhub/integration-zammad)
        ↓
OSS Engine (Plane CE | Zammad CE)
```

**Invariant:** Platform services may depend on adapters. Adapters never depend on platform services. Adapters never write the mapping store. Modules never bypass the gateway/pipeline for application flows.

---

## Components

| Component                               | Responsibility                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `PlatformServiceGateway`                | Single application entry point; contracts only                                       |
| `RequestPipeline`                       | Validation, enrichment, middleware, policies, authz hooks, observability             |
| `AuthorizationProvider`                 | Pluggable authorization; allow-all default (OSS-110-04)                              |
| `Policy` / `ServiceMiddleware`          | Extensibility frameworks (no production policies yet)                                |
| `*ServiceImpl`                          | Mapping-aware delegation; context enforcement                                        |
| `MappingOrchestrator`                   | ID resolution, post-create mapping, compensation errors                              |
| `EntityMappingStore`                    | Platform↔provider ID persistence boundary                                            |
| `InMemoryEntityMappingStore`            | Dev/test implementation                                                              |
| `PostgresEntityMappingStore`            | Production-capable PostgreSQL implementation (OSS-110-05)                            |
| `createEntityMappingStore`              | Bootstrap selection (memory/postgres; no silent prod fallback)                       |
| `ProviderRegistry` / `ProviderResolver` | Multi-provider registration and selection                                            |
| Plane providers                         | Accept native IDs; return canonical DTOs (provisional IDs stripped by mapping layer) |
| Zammad providers                        | Support domain (OSS-110-10); provisional `*_zammad_*` stripped by mapping layer      |
| `reconcileEntityMappings`               | Lightweight inconsistency detection                                                  |

---

## Provider-selection precedence

1. Explicit `preferredProviderId`
2. Explicit `preferredIntegrationId`
3. Mapped provider from existing entity mapping
4. Active provider on registry
5. Highest priority (lowest priority number)

---

## Global IDs

Format `{prefix}_{32-hex}` per [ADR-0048](../adr/ADR-0048-apzhub-global-entity-id-strategy.md). Provisional `*_plane_*` IDs never leave the mapping boundary.

---

## Plane compatibility (OSS-110-03)

Minimal change inside `@apzhub/platform-services` Plane providers only:

- Sprint-by-id operations accept an internal `projectNativeId::sprintNativeId` ref supplied by the mapping-aware service
- No changes to `@apzhub/integration-plane` package source
- No Plane types in public platform APIs

OSS-110-04 added no Plane-specific behaviour.

---

## Related

- [Platform Execution Layer](./APZHUB-Platform-Execution-Layer.md)
- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
- [OSS-110-05 Completion Report](../sprint/OSS-110-05-completion-report.md)
