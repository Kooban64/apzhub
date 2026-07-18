# OSS-100-07 Completion Report — Mapping Provider Framework

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-100-07 only — Mapping Provider Framework in `@apzhub/integration-sdk`; Plane/Zammad thin wrappers; **no** webhook/polling; **no** EntityMappingStore / MappingOrchestrator changes; **no** OSS-100-08+

---

## Executive summary

Delivered the vendor-neutral **Mapping Provider Framework** in `@apzhub/integration-sdk` **v0.7.0**. Export `@apzhub/integration-sdk/mapping` provides MappingProvider, MappingRegistry, MappingPipeline, profiles/definitions, FieldMapper, ValueTransformers, EnumMapper, IdentityMapper, RelationshipMapper, CollectionMapper, diagnostics, and mocks.

Plane and Zammad remain **0.6.0**. They wrap IdentityMapper/EnumMapper, register via `createPlaneMappingRegistry` / `createZammadMappingRegistry` on adapter init, and keep provisional ID format `{prefix}_{plane|zammad}_{native}`. Platform EntityMappingStore / MappingOrchestrator (**ADR-0049**) are **untouched**.

**Stop condition met:** Await owner approval before **OSS-100-08** (Webhook & polling contracts).

---

## Objective

Provide reusable mapping infrastructure in the Integration SDK so adapters share registry, pipeline, transformers, and ID/enum helpers without changing public adapter behaviour or duplicating the platform ID mapping store.

---

## Architecture overview

| Layer         | Component                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Types         | MappingProvider, MappingDefinition, MappingProfile, MappingContext, MappingResult, MappingError, MappingCapabilities |
| Registry      | `InMemoryMappingRegistry` / `createMappingRegistry`                                                                  |
| Pipeline      | `DefaultMappingPipeline` / `createMappingPipeline`                                                                   |
| Helpers       | FieldMapper, ValueTransformer, EnumMapper, IdentityMapper, RelationshipMapper, CollectionMapper                      |
| Observability | MappingDiagnostics, MappingMetrics                                                                                   |
| Testing       | `createMockMappingProvider`, fixtures                                                                                |
| Adapters      | `createPlaneMappingRegistry`, `createZammadMappingRegistry`                                                          |

```text
Adapter → MappingRegistry → MappingProvider → MappingDefinition
                │
                └── MappingPipeline → MappingResult
```

**Boundary:** SDK maps shapes/enums/provisional IDs. Platform EntityMappingStore owns durable global ID bindings.

---

## Delivered

### Package (`@apzhub/integration-sdk` v0.7.0)

| Component                         | Location                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Core types                        | `src/mapping/types.ts`                                                          |
| Errors                            | `src/mapping/errors.ts`                                                         |
| IdentityMapper                    | `src/mapping/identity-mapper.ts`                                                |
| Value transformers                | `src/mapping/value-transformers.ts`                                             |
| EnumMapper                        | `src/mapping/enum-mapper.ts`                                                    |
| Field / Relationship / Collection | `src/mapping/field-mapper.ts`, `relationship-mapper.ts`, `collection-mapper.ts` |
| Validation / metrics              | `src/mapping/validation.ts`, `metrics.ts`                                       |
| Registry / pipeline / provider    | `src/mapping/registry.ts`, `pipeline.ts`, `provider.ts`                         |
| Mock                              | `src/mapping/mock.ts`                                                           |
| Subpath export                    | `@apzhub/integration-sdk/mapping`                                               |
| Version constant                  | `INTEGRATION_SDK_VERSION = "0.7.0"`                                             |

### Adapter migration

| Adapter                      | Change                                                                    | Version               |
| ---------------------------- | ------------------------------------------------------------------------- | --------------------- |
| `@apzhub/integration-plane`  | IdentityMapper/EnumMapper wrappers; `createPlaneMappingRegistry` on init  | **0.6.0** (unchanged) |
| `@apzhub/integration-zammad` | IdentityMapper/EnumMapper wrappers; `createZammadMappingRegistry` on init | **0.6.0** (unchanged) |

Public mapper APIs and provisional ID wire format unchanged.

### Platform

| Component           | Status                   |
| ------------------- | ------------------------ |
| EntityMappingStore  | **UNTOUCHED** (ADR-0049) |
| MappingOrchestrator | **UNTOUCHED**            |

### Documentation

| Document           | Path                                                            |
| ------------------ | --------------------------------------------------------------- |
| Framework          | `packages/integration-sdk/docs/MAPPING-FRAMEWORK.md`            |
| Profiles           | `packages/integration-sdk/docs/MAPPING-PROFILES.md`             |
| Registry           | `packages/integration-sdk/docs/MAPPING-REGISTRY.md`             |
| Transformers       | `packages/integration-sdk/docs/MAPPING-TRANSFORMERS.md`         |
| Migration          | `packages/integration-sdk/docs/MAPPING-MIGRATION.md`            |
| Architecture index | `docs/architecture/APZHUB-Integration-SDK-Mapping-Framework.md` |
| Package README     | `packages/integration-sdk/README.md`                            |

---

## Tests

| Suite                                                           | Result                               |
| --------------------------------------------------------------- | ------------------------------------ |
| Mapping suite                                                   | **25** tests · **~98.7%** lines      |
| `@apzhub/integration-sdk` full                                  | **123** tests                        |
| Plane + Zammad                                                  | **211** passed                       |
| Wave1 / Wave2 / Support vertical + platform mapping regressions | **358** combined in one run — passed |
| Lint (SDK)                                                      | **PASS**                             |
| Typecheck (SDK)                                                 | **PASS**                             |

---

## Completion review

| Criterion                                                           | Result |
| ------------------------------------------------------------------- | ------ |
| MappingProvider + Registry + Pipeline                               | ✅     |
| Export `@apzhub/integration-sdk/mapping`                            | ✅     |
| Profiles, directions, definitions, context, result, error           | ✅     |
| FieldMapper, ValueTransformer, RelationshipMapper, CollectionMapper | ✅     |
| EnumMapper + IdentityMapper                                         | ✅     |
| Diagnostics + metrics                                               | ✅     |
| Mock mapping provider                                               | ✅     |
| Plane/Zammad wrappers; register on adapter init                     | ✅     |
| Provisional ID format unchanged                                     | ✅     |
| EntityMappingStore / MappingOrchestrator untouched                  | ✅     |
| Adapter versions stay 0.6.0                                         | ✅     |
| SDK version 0.7.0                                                   | ✅     |
| Lint / typecheck pass                                               | ✅     |
| No webhook/polling in this milestone                                | ✅     |
| OSS-100-08 not started                                              | ✅     |

---

## Quality gates

| Gate                                                     | Result                   |
| -------------------------------------------------------- | ------------------------ |
| Lint (SDK)                                               | Pass                     |
| Typecheck (SDK)                                          | Pass                     |
| Mapping tests                                            | Pass — 25 (~98.7% lines) |
| Full SDK tests                                           | Pass — 123               |
| Plane + Zammad                                           | Pass — 211               |
| Combined regression (wave1/2/support + platform mapping) | Pass — 358               |

---

## Technical debt

| Item                                                           | Notes                                                                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Not all Plane/Zammad entities registered as definitions        | Task/project/member (Plane) and ticket/status/priority (Zammad) registered; other mappers remain function-only until needed |
| Pipeline optional at call sites                                | Existing mapper functions remain SoT; pipeline available for discovery/tests                                                |
| Nested mapping support                                         | Infrastructure present; Plane/Zammad advertise `supportsNested: false`                                                      |
| Earlier backlog “PostgreSQL mapping tables”                    | Remains platform EntityMappingStore (OSS-110-05) — intentionally not in SDK                                                 |
| Former backlog “User/Permission/Entity MappingProvider” naming | Delivered as generic MappingProvider + profiles; platform store separate                                                    |

---

## Risks

| Risk                                          | Mitigation                                         |
| --------------------------------------------- | -------------------------------------------------- |
| Confusing SDK mapping with EntityMappingStore | Docs + ADR-0049 boundary explicit; store untouched |
| Provisional ID format drift                   | Shared IdentityMapper; regression tests            |
| Silent enum invention                         | Explicit unknownPolicy required                    |
| Accidental webhook work under old numbering   | Next milestone is OSS-100-08 only after approval   |

---

## Recommendation for OSS-100-08

**Next milestone:** **OSS-100-08 — Webhook & polling contracts** (per renumbered backlog after OSS-100-06).

| Item                    | Scope                                 |
| ----------------------- | ------------------------------------- |
| `WebhookReceiver`       | Signature verification, normalization |
| `PollingScheduler`      | Worker integration stub               |
| `NormalizedVendorEvent` | Envelope + idempotency keys           |

**Do not** start provisioning (09), test harness (10), or docs closeout (11) in OSS-100-08. Do not move EntityMappingStore into the SDK.

---

## Stop condition

OSS-100-07 complete. **Await owner approval before OSS-100-08.**

Do not begin webhook/polling contracts, provisioning, or further SDK phases without explicit approval.

---

## Related

- [MAPPING-FRAMEWORK.md](../../packages/integration-sdk/docs/MAPPING-FRAMEWORK.md)
- [APZHUB-Integration-SDK-Mapping-Framework.md](../architecture/APZHUB-Integration-SDK-Mapping-Framework.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
- [OSS-100-06 Completion Report](./OSS-100-06-completion-report.md)
