# SPR-002 — Phase 1 Report

> **Phase:** 1 — Manifest schemas & validation  
> **Sprint:** SPR-002 — Platform Registry & Discovery Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **awaiting owner review before Phase 2**

---

## Objective

Define typed manifest schemas for each capability kind, implement the **Manifest Engine** and **Version Manager** subsystems, migrate SPR-001 `component.yaml` files to the unified envelope (ADR-0011), and validate without altering SDK documents 025–029.

---

## Completed tasks

| #    | Task                          | Status                                                                                                                                |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Base manifest envelope schema | ✅ `manifest-engine/schemas/envelope.ts`                                                                                              |
| 1.2  | Component schema              | ✅ Aligns with migrated `component.yaml` files                                                                                        |
| 1.3  | Module schema                 | ✅ Document 025 validation subset                                                                                                     |
| 1.4  | Service schema                | ✅ Document 027 shape                                                                                                                 |
| 1.5  | Integration schema            | ✅ Document 026 shape                                                                                                                 |
| 1.6  | Event schema                  | ✅ Document 029 shape                                                                                                                 |
| 1.7  | Extension schemas             | ✅ theme, command, search-provider, worker, dashboard, widget, report, ai-provider, feature-flag                                      |
| 1.8  | Validation engine             | ✅ `validateCapabilityManifest()`, `parseCapabilityManifestYaml()`                                                                    |
| 1.9  | Schema version field          | ✅ `manifestSchemaVersion: "1.0"` on all parsed manifests                                                                             |
| 1.10 | Version Manager               | ✅ Semver validation and platform version constraints                                                                                 |
| 1.11 | Component manifest migration  | ✅ 7 SPR-001 UI components                                                                                                            |
| 1.12 | SDK re-exports                | ✅ `@apzhub/sdk` re-exports manifest types and validators                                                                             |
| 1.13 | Subsystem placeholders        | ✅ Bootstrap Engine, Discovery Engine, Capability Registry, Dependency Graph, Lifecycle Manager, Health Manager, Configuration Engine |

---

## Terminology adoption (ARCH-002)

| Context                           | Term                                                                                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Internal architecture, code, APIs | **Capability Registry** (not "Registry")                                                                                                                             |
| Runtime subsystem layout          | Bootstrap Engine, Manifest Engine, Discovery Engine, Capability Registry, Dependency Graph, Lifecycle Manager, Health Manager, Configuration Engine, Version Manager |
| External user interfaces          | "Module Registry" permitted where appropriate                                                                                                                        |

---

## Exit criteria

| Criterion                                          | Result                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| 100% of existing `component.yaml` files validate   | ✅ 7/7                                                                      |
| Invalid fixtures rejected with actionable messages | ✅ Structured `ManifestValidationError[]`                                   |
| Unit tests pass                                    | ✅ 35 tests                                                                 |
| Coverage on manifest validation ≥ 80%              | ✅ Manifest Engine 83.96% stmts; schemas 100%; Version Manager 87.87%       |
| Quality gates green                                | ✅ See below                                                                |
| No Phase 2+ implementation                         | ✅ Discovery Engine, Capability Registry runtime, bootstrap not implemented |

---

## Quality gates

| Gate                 | Result  | Notes                                     |
| -------------------- | ------- | ----------------------------------------- |
| `pnpm lint`          | ✅ Pass |                                           |
| `pnpm typecheck`     | ✅ Pass | 13 workspace packages + apps/web          |
| `pnpm test`          | ✅ Pass | 35 tests (16 new in platform-runtime)     |
| `pnpm test:coverage` | ✅ Pass | Global 96.57% lines; all thresholds ≥ 80% |
| `pnpm build`         | ✅ Pass | Next.js production build                  |

---

## Files created

| Path                                                             |
| ---------------------------------------------------------------- |
| `packages/platform-runtime/package.json`                         |
| `packages/platform-runtime/tsconfig.json`                        |
| `packages/platform-runtime/src/index.ts`                         |
| `packages/platform-runtime/src/manifest-engine/**`               |
| `packages/platform-runtime/src/version-manager/**`               |
| `packages/platform-runtime/src/bootstrap-engine/index.ts`        |
| `packages/platform-runtime/src/discovery-engine/index.ts`        |
| `packages/platform-runtime/src/capability-registry/index.ts`     |
| `packages/platform-runtime/src/dependency-graph/index.ts`        |
| `packages/platform-runtime/src/lifecycle-manager/index.ts`       |
| `packages/platform-runtime/src/health-manager/index.ts`          |
| `packages/platform-runtime/src/configuration-engine/index.ts`    |
| `packages/platform-runtime/src/manifest-engine/validate.test.ts` |
| `packages/platform-runtime/src/version-manager/semver.test.ts`   |
| `testing/fixtures/registry/valid-service.yaml`                   |
| `testing/fixtures/registry/valid-theme.yaml`                     |
| `testing/fixtures/registry/invalid-component-id.yaml`            |
| `docs/sprint/SPR-002-phase-1-report.md`                          |

## Files modified

| Path                                          | Change                                                   |
| --------------------------------------------- | -------------------------------------------------------- |
| `packages/ui/src/components/*/component.yaml` | Migrated to ADR-0011 unified envelope (7 files)          |
| `packages/sdk/package.json`                   | Added `@apzhub/platform-runtime` dependency              |
| `packages/sdk/src/index.ts`                   | Re-export manifest types and validators                  |
| `tsconfig.base.json`                          | Path aliases for `@apzhub/platform-runtime`              |
| `vitest.config.ts`                            | Aliases, coverage includes/excludes for platform-runtime |
| `docs/architecture/platform-runtime.md`       | Capability Registry terminology; subsystem layout        |
| `packages/platform-runtime/README.md`         | Subsystem layout and terminology                         |
| `docs/sprint/SPR-002-implementation-plan.md`  | Phase 1 exit criteria marked complete                    |
| `docs/README.md`                              | Sprint registry updated                                  |
| `CHANGELOG.md`                                | Phase 1 entry                                            |

---

## Deviations from approved architecture

| #   | Planned                        | Actual                                                                       | Severity          | Rationale                                                                                                      |
| --- | ------------------------------ | ---------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| D1  | Directory `manifests/`         | `manifest-engine/`                                                           | Low               | Aligns with approved runtime subsystem naming (Manifest Engine)                                                |
| D2  | Directory `registry/`          | `capability-registry/`                                                       | Low               | ARCH-002 Capability Registry terminology                                                                       |
| D3  | `validateManifest(path, kind)` | `validateCapabilityManifest(input, kind?)` + `parseCapabilityManifestYaml()` | Low               | Separates YAML I/O from validation; capability-first naming                                                    |
| D4  | Phase 1 only schemas           | Placeholder `*_STATUS` exports for pending subsystems                        | Low               | Documents subsystem boundaries without implementing Phase 2+ behaviour                                         |
| D5  | ADR-0012 `theme.yaml` required | No `theme.yaml` created yet                                                  | Medium — deferred | Theme manifest schema validated via fixtures; physical `theme.yaml` deferred to Phase 2+ discovery integration |
| D6  | ADR-0008 package boundary      | ADR-0018 supersedes ADR-0008                                                 | None              | Owner-approved ARCH-002 update                                                                                 |

No deviations affect Document 000 compliance or the phased review gate (ADR-0017).

---

## Test coverage summary

| Area                                          | Tests           | Coverage                         |
| --------------------------------------------- | --------------- | -------------------------------- |
| Manifest validation (all 14 capability kinds) | 12              | Schemas 100%; validate.ts 80.89% |
| Version Manager semver                        | 4               | 87.87%                           |
| SPR-001 component manifests                   | 7 (integration) | All pass                         |
| Registry fixtures                             | 3 YAML files    | valid/invalid paths covered      |

---

## Out of scope (confirmed not implemented)

- Discovery Engine filesystem scan (Phase 2)
- Capability Registry runtime store and indices (Phase 3)
- Dependency Graph resolution (Phase 4)
- Bootstrap Engine / `Runtime.bootstrap()` (Phase 6)
- PostgreSQL persistence adapter (Phase 5)
- `apps/web` integration
- REST API surface
- Business module registration
- Desktop Shell changes

---

## Recommendation

**Proceed to Phase 2 (Discovery Engine)** upon owner approval.

Phase 2 should:

1. Implement filesystem discovery using `manifest-engine` validators
2. Add `theme.yaml` for `@apzhub/theme` per ADR-0012
3. Retain Capability Registry terminology in all new code

---

_Phase 1 complete — awaiting review gate per ADR-0017._
