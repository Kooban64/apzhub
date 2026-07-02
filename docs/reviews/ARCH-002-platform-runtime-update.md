# Architecture Update Report — Platform Runtime Rename

> **Update ID:** ARCH-002  
> **Date:** 2026-06-30  
> **Authority:** Owner-approved architecture refinement (pre-Sprint 002)  
> **ADR:** [ADR-0018](../adr/ADR-0018-platform-runtime-package.md)  
> **Supersedes:** [ADR-0008](../adr/ADR-0008-platform-core-package.md) (`platform-core` naming)

---

## Summary

Renamed **`packages/platform-core`** → **`packages/platform-runtime`** (`@apzhub/platform-runtime`). Documented the Platform Runtime as the execution engine for platform lifecycle, with Registry as an internal subsystem. Extended startup lifecycle and logical package naming convention across architecture documentation.

**Sprint 002 implementation has not started.**

---

## Files updated

### Package

| Action    | Path                                                     |
| --------- | -------------------------------------------------------- |
| Renamed   | `packages/platform-core/` → `packages/platform-runtime/` |
| Rewritten | `packages/platform-runtime/README.md`                    |

### ADRs

| File                                                    | Change                                   |
| ------------------------------------------------------- | ---------------------------------------- |
| `docs/adr/ADR-0018-platform-runtime-package.md`         | **Created** — canonical decision         |
| `docs/adr/ADR-0008-platform-core-package.md`            | Status → **Superseded**                  |
| `docs/adr/ADR-0014-registry-bootstrap-lifecycle.md`     | Amended — full platform startup sequence |
| `docs/adr/ADR-0010-registry-internal-typescript-api.md` | `@apzhub/platform-runtime` references    |
| `docs/adr/ADR-0011-unified-manifest-envelope.md`        | Package reference                        |
| `docs/adr/ADR-0009-registry-hybrid-persistence.md`      | Package reference                        |
| `docs/adr/ADR-0016-registry-testing-requirements.md`    | Package reference                        |
| `docs/adr/README.md`                                    | ADR-0018 index; ADR-0008 superseded      |

### Architecture

| File                                         | Change                                            |
| -------------------------------------------- | ------------------------------------------------- |
| `docs/architecture/platform-runtime.md`      | **Created** — lifecycle, layout, API, package map |
| `docs/architecture/platform-registry.md`     | Runtime package + layout references               |
| `docs/architecture/platform-registry-api.md` | `Runtime.bootstrap()` / `Runtime.registry()` API  |

### Sprint & registry

| File                                         | Change                                    |
| -------------------------------------------- | ----------------------------------------- |
| `docs/sprint/SPR-002-platform-registry.md`   | ADR-0018, platform-runtime paths          |
| `docs/sprint/SPR-002-implementation-plan.md` | Folder layout, ADR-0018, path updates     |
| `docs/sprint/SPR-002-phase-0-report.md`      | Historical note (Phase 0 used prior name) |
| `docs/README.md`                             | ADR-0018 registry entry                   |

### Other

| File                                | Change                    |
| ----------------------------------- | ------------------------- |
| `CHANGELOG.md`                      | Architecture update entry |
| `docs/developer/getting-started.md` | Platform runtime pointer  |

---

## References updated

| Pattern                                 | Replacement                                     | Approx. occurrences        |
| --------------------------------------- | ----------------------------------------------- | -------------------------- |
| `packages/platform-core`                | `packages/platform-runtime`                     | All docs                   |
| `@apzhub/platform-core`                 | `@apzhub/platform-runtime`                      | All docs                   |
| ADR-0008 (active)                       | ADR-0018 (active)                               | Sprint + architecture docs |
| `bootstrapRegistry()` / `getRegistry()` | `Runtime.bootstrap()` / `Runtime.registry()`    | API spec                   |
| `src/{manifests,discovery,registry}`    | `{manifests,discovery,registry,...}/` top-level | Implementation plan        |

---

## Conflicts discovered

| Conflict                                                                               | Resolution                                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **ADR-0008** already Accepted as `platform-core`                                       | ADR-0008 marked **Superseded**; ADR-0018 is canonical                                                                    |
| **Phase 0 report** references `platform-core`                                          | Retained as historical record; supersession noted in this report                                                         |
| **SPR-001 npm scopes** (`@apzhub/ui`, `@apzhub/auth`, …) vs logical `platform-*` names | Documented mapping in [platform-runtime.md](../architecture/platform-runtime.md); **no physical renames** in this update |
| **`platform-activity`**, **`platform-integrations`** in target layout                  | Not present as packages; documented as future / repo-path `integrations/`                                                |
| **Implementation plan Phase 5** `registry.ts` under `registry/`                        | May merge with `registry/` subsystem — clarify in Phase 1 review                                                         |
| **ADR-0014 filename**                                                                  | Still `registry-bootstrap-lifecycle`; content now covers full platform lifecycle — filename kept for link stability      |
| **Git tag `v0.1.0-foundation`**                                                        | Still not verified (no commits in repo) — unchanged                                                                      |

No production code was modified. No Sprint 001 package renames performed.

---

## Recommendations

1. **Approve ADR-0018** explicitly if not already covered by this architecture update instruction.
2. **Phase 1** should create `@apzhub/platform-runtime` with `package.json` and top-level folders per [platform-runtime.md](../architecture/platform-runtime.md).
3. **Future ADR** for physical rename of `@apzhub/ui` → `@apzhub/platform-ui` (etc.) when owner schedules package migration sprint.
4. **Commit baseline** including `v0.1.0-foundation` tag before Phase 1 implementation.
5. **Re-read Phase 0 gate** — architecture update completes pre-requisite; Phase 1 may proceed after owner approval of this report.

---

## Verification

| Check                               | Result                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| `packages/platform-runtime/` exists | ✅                                                                 |
| `packages/platform-core/` removed   | ✅                                                                 |
| Residual `platform-core` in docs    | ⚠ Historical only (ADR-0008, Phase 0 report, CHANGELOG past tense) |
| Sprint 002 code implemented         | ✅ None                                                            |

---

## Status

**Architecture update complete.**

Awaiting owner approval before **Sprint 002 Phase 1** implementation.

---

_End of report._
