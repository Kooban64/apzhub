# APZHUB Integration SDK — Mapping Provider Framework

> **Milestone:** OSS-100-07  
> **Package:** `@apzhub/integration-sdk` v0.7.0  
> **Status:** Implemented  
> **Primary docs:** [packages/integration-sdk/docs/MAPPING-FRAMEWORK.md](../../packages/integration-sdk/docs/MAPPING-FRAMEWORK.md)

---

## Purpose

Architecture index for the owner-approved **Mapping Provider Framework**. Provides vendor-neutral adapter-level mapping infrastructure (providers, registry, pipeline, transformers) while preserving Plane/Zammad public mapper behaviour and leaving platform ID persistence in place.

---

## Package documentation

| Document                | Path                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Framework overview      | [MAPPING-FRAMEWORK.md](../../packages/integration-sdk/docs/MAPPING-FRAMEWORK.md)       |
| Profiles & directions   | [MAPPING-PROFILES.md](../../packages/integration-sdk/docs/MAPPING-PROFILES.md)         |
| Registry & diagnostics  | [MAPPING-REGISTRY.md](../../packages/integration-sdk/docs/MAPPING-REGISTRY.md)         |
| Transformers & helpers  | [MAPPING-TRANSFORMERS.md](../../packages/integration-sdk/docs/MAPPING-TRANSFORMERS.md) |
| Adapter migration guide | [MAPPING-MIGRATION.md](../../packages/integration-sdk/docs/MAPPING-MIGRATION.md)       |

---

## Architecture

```text
Platform Services (EntityMappingStore / MappingOrchestrator — ADR-0049)
        │  durable global IDs only — UNTOUCHED by OSS-100-07
        ▼
Capability Service
        ↓
Vendor Adapter (Plane / Zammad / …)
        ├── public mapper functions (call-site SoT)
        └── MappingRegistry (createPlaneMappingRegistry / createZammadMappingRegistry)
                ↓
        MappingProvider + MappingDefinition
                ↓
        MappingPipeline / FieldMapper / EnumMapper / IdentityMapper
                ↓
        Canonical DTOs  ↔  Provider payloads
        Provisional IDs: {prefix}_{plane|zammad}_{native}
```

**Separation of concerns**

| Layer                        | Responsibility                                               |
| ---------------------------- | ------------------------------------------------------------ |
| SDK `/mapping`               | Stateless translation rules, registry, pipeline, diagnostics |
| Platform EntityMappingStore  | Persistent entity ID bindings (SoR)                          |
| Platform MappingOrchestrator | Orchestrates store + resolution — not SDK                    |

---

## Export

```text
@apzhub/integration-sdk/mapping
@apzhub/integration-sdk          → root re-exports
```

**Version:** `@apzhub/integration-sdk` **0.7.0**  
**Adapters:** `@apzhub/integration-plane` / `@apzhub/integration-zammad` remain **0.6.0**

---

## Numbering note

Webhook & polling contracts are **OSS-100-08** — **complete** (`@apzhub/integration-sdk` v0.8.0). See [APZHUB-Integration-SDK-Webhook-Polling.md](./APZHUB-Integration-SDK-Webhook-Polling.md).

---

## Related

- [OSS-100-07 Completion Report](../sprint/OSS-100-07-completion-report.md)
- [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [HTTP Transport architecture index](./APZHUB-Integration-SDK-HTTP-Transport.md) (OSS-100-06)
- [Webhook & Polling architecture index](./APZHUB-Integration-SDK-Webhook-Polling.md) (OSS-100-08)
- [Adapter Framework Implementation](./APZHUB-Adapter-Framework-Implementation.md) (OSS-100-05)
