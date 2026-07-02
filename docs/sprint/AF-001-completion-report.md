# AF-001 — Completion Report

> **Story:** AF-001 — Technical specifications and ADRs  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-002**

---

## Objective

Authorise Sprint 004 implementation through accepted ADRs and story-level technical specifications. No production code.

---

## Acceptance criteria

| Criterion                                                               | Status                                                           |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| ADR-0024 accepted — `@apzhub/command-framework` package                 | ✅                                                               |
| ADR-0025 accepted — `workbench.commands` and `workbench.toolbar` schema | ✅                                                               |
| ADR-0026 accepted — CommandExecutor, actor model, audit hook            | ✅                                                               |
| Technical spec template agreed                                          | ✅ [SPR-004-spec-template.md](../specs/SPR-004-spec-template.md) |
| Spec index for AF-002–AF-022                                            | ✅ [SPR-004-spec-index.md](../specs/SPR-004-spec-index.md)       |
| Owner approval for AF-002 start                                         | ⏳ Pending review of this report                                 |

---

## Deliverables produced

### ADRs

| ADR      | Path                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| ADR-0024 | [docs/adr/ADR-0024-command-framework-package.md](../adr/ADR-0024-command-framework-package.md)     |
| ADR-0025 | [docs/adr/ADR-0025-workbench-commands-manifest.md](../adr/ADR-0025-workbench-commands-manifest.md) |
| ADR-0026 | [docs/adr/ADR-0026-command-execution-model.md](../adr/ADR-0026-command-execution-model.md)         |

### Technical specifications

| Document                                                        | Stories                  |
| --------------------------------------------------------------- | ------------------------ |
| [SPR-004-spec-template.md](../specs/SPR-004-spec-template.md)   | Template for all stories |
| [SPR-004-spec-index.md](../specs/SPR-004-spec-index.md)         | Master index             |
| [SPR-004-AF-foundation.md](../specs/SPR-004-AF-foundation.md)   | AF-002 – AF-009          |
| [SPR-004-AF-palette.md](../specs/SPR-004-AF-palette.md)         | AF-010 – AF-013          |
| [SPR-004-AF-surfaces.md](../specs/SPR-004-AF-surfaces.md)       | AF-014 – AF-019          |
| [SPR-004-AF-integration.md](../specs/SPR-004-AF-integration.md) | AF-018 – AF-022          |

### Documentation updated

- [docs/adr/README.md](../adr/README.md) — ADR index
- [docs/README.md](../README.md) — ADR table, specs index, backlog status
- [docs/backlog/SPR-004-action-framework-backlog.md](../backlog/SPR-004-action-framework-backlog.md) — AF-001 marked complete
- [CHANGELOG.md](../../CHANGELOG.md) — AF-001 entry

---

## Architecture compliance

| Rule                                    | Result                                                     |
| --------------------------------------- | ---------------------------------------------------------- |
| Architecture Baseline v1.0 not modified | ✅                                                         |
| Runtime architecture not redesigned     | ✅                                                         |
| Workbench architecture not redesigned   | ✅                                                         |
| Changes only through ADRs               | ✅ ADR-0024, 0025, 0026                                    |
| No production code                      | ✅ Documentation only                                      |
| API layering preserved                  | ✅ Command Framework between Capability and Workbench APIs |

---

## Key decisions locked in ADRs

| Decision                                                               | ADR  |
| ---------------------------------------------------------------------- | ---- |
| New package `@apzhub/command-framework` (Option A)                     | 0024 |
| Core/server/react export split                                         | 0024 |
| Optional `workbench.commands` and `workbench.toolbar` blocks           | 0025 |
| Handler kinds: workbench-bridge, service (stub), event (deferred)      | 0025 |
| CommandExecutor as sole dispatch authority                             | 0026 |
| Actors: user, system (implemented); ai-agent, voice (stub)             | 0026 |
| Optional executor injection in createWorkbenchAPI — no breaking change | 0026 |
| AuditHook no-op stub — Event Bus deferred                              | 0026 |

---

## Risks

| Risk                                              | Severity | Mitigation in specs                                                                                 |
| ------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| Circular dependency workbench ↔ command-framework | Medium   | Inject interfaces; `WorkbenchActionExecutor` minimal type in workbench; bridge in command-framework |
| AF-008 scope creep into Manager redesign          | Medium   | Spec explicitly limits to create-workbench-api.ts                                                   |
| Manifest schema drift from ADR-0022               | Low      | Extend same workbench.ts schema file additively                                                     |
| Shortcut conflict with palette Ctrl+Shift+P       | Low      | Palette shortcut is shell concern; ShortcutRegistry excludes palette open                           |
| Service handlers expected to work in S004         | Medium   | NOT_IMPLEMENTED stub documented; theme toggle scaffold is manifest-only                             |
| fuzzy search library dependency                   | Low      | AF-012 spec defaults to substring match only                                                        |
| AF-020 depends on many prior stories              | Medium   | Sequential merge; integration story last                                                            |

---

## Recommendations for AF-002

1. **Start AF-002 immediately after this report is approved** — scaffold package exactly per [SPR-004-AF-foundation.md § AF-002](../specs/SPR-004-AF-foundation.md#af-002).

2. **Export `COMMAND_FRAMEWORK_STATUS = "scaffold"`** — mirror workbench-framework status pattern for diagnostics.

3. **Pre-wire package exports** in `package.json` for `.`, `./server`, `./react` even if server/react are empty stubs — avoids export churn in later stories.

4. **Add `@apzhub/command-framework` to root typecheck** via workspace package — confirm in AF-002 PR.

5. **Do not add React dependency** to core package.json in AF-002 — react subpath only in AF-010.

6. **Single PR for AF-002** — expected diff: ~6 files, zero runtime behaviour change.

---

## Quality gates

Documentation-only story — all gates run to confirm no regression:

| Gate                 | Result  |
| -------------------- | ------- |
| `pnpm lint`          | ✅ Pass |
| `pnpm typecheck`     | ✅ Pass |
| `pnpm build`         | ✅ Pass |
| `pnpm test`          | ✅ Pass |
| `pnpm test:coverage` | ✅ Pass |
| `pnpm test:e2e`      | ✅ Pass |

---

## Stop condition

AF-001 complete. **Do not begin AF-002** until this report is reviewed and approved.

Next story upon approval: **AF-002 — Command Framework package scaffold**.

---

_AF-001 Completion Report — Sprint 004 Action Framework._
