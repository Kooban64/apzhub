# SPR-003 — Phase 0 ADR Report

> **Date:** 2026-06-28  
> **Sprint:** SPR-003 — Workbench Framework  
> **Phase:** 0 — ADRs & Architecture Gate  
> **Prerequisite:** [SPR-003 Architecture Refinement](./SPR-003-architecture-refinement.md) — approved  
> **Recommendation:** **READY FOR PHASE 1** (awaiting owner approval)

---

## Summary

Sprint 003 Phase 0 is **complete**. Five ADRs lock the architectural decisions required before Workbench Framework implementation. All decisions align with owner-preferred options. **No production code, React components, Desktop Shell changes, or manager implementations were made.**

Phase 1 may begin upon owner approval of this report.

---

## ADRs created

| ADR                                                          | Title                         | Status   |
| ------------------------------------------------------------ | ----------------------------- | -------- |
| [ADR-0019](../adr/ADR-0019-workbench-framework-package.md)   | Workbench Framework Package   | Accepted |
| [ADR-0020](../adr/ADR-0020-workbench-request-transport.md)   | Workbench Request Transport   | Accepted |
| [ADR-0021](../adr/ADR-0021-workbench-session-persistence.md) | Workbench Session Persistence | Accepted |
| [ADR-0022](../adr/ADR-0022-navigation-manifest-extension.md) | Navigation Manifest Extension | Accepted |
| [ADR-0023](../adr/ADR-0023-workbench-permission-adapter.md)  | Workbench Permission Adapter  | Accepted |

---

## Final decisions

| #   | Topic                             | Decision                                                                                                                                                                                                        |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Package boundary**              | Create `@apzhub/workbench-framework` at `packages/workbench-framework/`. `@apzhub/workspace` remains Desktop Shell composition only. One-directional dependency: workbench-framework → workspace (not reverse). |
| 2   | **Workbench Request transport**   | Typed in-process `WorkbenchRequestBus` with discriminated union request types. Capabilities call `publish()` only; Workbench Manager routes to sub-managers. Event Bus bridge deferred to Milestone 4+.         |
| 3   | **Session persistence**           | Sprint 003: `SessionStore` abstraction + in-memory store + `localStorage` adapter. Future hybrid with PostgreSQL at Milestone 8. Document 018 full payload deferred.                                            |
| 4   | **Navigation manifest extension** | Optional top-level `workbench` block on manifest envelope with `navigation`, `view`, and future `context` sub-blocks. Additive only — existing manifests unchanged.                                             |
| 5   | **Permission integration**        | `WorkbenchPermissionAdapter` interface in workbench-framework. `AllowAllWorkbenchPermissionAdapter` for dev/test. `AuthWorkbenchPermissionAdapter` scaffold in Phase 7; full PermissionService at Milestone 8.  |

### Owner preferences applied

All five owner-preferred decisions were adopted without override:

| Preference                                                     | Applied     |
| -------------------------------------------------------------- | ----------- |
| New package `@apzhub/workbench-framework`                      | ✅ ADR-0019 |
| Typed in-process Workbench Request Bus                         | ✅ ADR-0020 |
| Hybrid later; localStorage + typed abstraction for Sprint 003  | ✅ ADR-0021 |
| Additive manifest extensions                                   | ✅ ADR-0022 |
| Temporary permission adapter with allow-all dev implementation | ✅ ADR-0023 |

---

## Alternatives considered

### Package boundary (ADR-0019)

| Alternative                | Assessment                                                   |
| -------------------------- | ------------------------------------------------------------ |
| Extend `@apzhub/workspace` | Rejected — conflates shell visuals with orchestration logic  |
| Embed in `apps/web`        | Rejected — not reusable; blocks Storybook and future clients |
| Merge into `@apzhub/ui`    | Rejected — UI package must stay presentational               |

### Request transport (ADR-0020)

| Alternative                    | Assessment                                           |
| ------------------------------ | ---------------------------------------------------- |
| Direct Workbench Manager calls | Rejected — no single audit point                     |
| Platform Event Bus only        | Rejected — not implemented; premature for Sprint 003 |
| DOM custom events              | Rejected — untyped; SSR-incompatible                 |

### Session persistence (ADR-0021)

| Alternative            | Assessment                                        |
| ---------------------- | ------------------------------------------------- |
| In-memory only         | Rejected — poor reload UX                         |
| PostgreSQL immediately | Rejected — requires M8 preferences infrastructure |
| sessionStorage         | Rejected — lost on tab close                      |

### Manifest extension (ADR-0022)

| Alternative                           | Assessment                                              |
| ------------------------------------- | ------------------------------------------------------- |
| Separate `nav.yaml` files             | Rejected — splits discovery source of truth             |
| Required `workbench` on all manifests | Rejected — breaks additive rule                         |
| Root-level `navigation:` per kind     | Rejected — `workbench` groups cross-cutting UI metadata |

### Permission integration (ADR-0023)

| Alternative            | Assessment                                      |
| ---------------------- | ----------------------------------------------- |
| Hardcoded role checks  | Rejected — violates Document 005                |
| Wait for full IAM      | Rejected — blocks Sprint 003                    |
| Runtime-only filtering | Rejected — insufficient for client request gate |

---

## Risks

| Risk                                                        | Severity | Mitigation                                                                                                   |
| ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| Allow-all adapter used in production                        | **High** | Phase 7 enforces environment-specific adapter selection; production deny-by-default for declared permissions |
| localStorage size limits for large sessions                 | Medium   | Sprint 003 payload is subset of Document 018; schema versioning for trim                                     |
| Client bundle accidentally imports platform-runtime         | **High** | Separate `@apzhub/workbench-framework/server` export; lint rule in Phase 1                                   |
| Manifest `workbench` block proliferation without governance | Medium   | Document permission key convention; registry uniqueness checks in Phase 2                                    |
| Circular dependency workspace ↔ workbench-framework         | **High** | ADR-0019 enforces one-directional dependency                                                                 |
| Request bus API churn before Phase 7                        | Low      | Discriminated union designed upfront; extensible with new `type` values                                      |
| Session restore shows stale unauthorised tabs               | Medium   | Permission re-validation on restore mandated in ADR-0021                                                     |

---

## Impact on Sprint 003 plan

### Phase 0 exit criteria — met

- [x] ADRs approved and recorded
- [x] Package boundary decision recorded (ADR-0019)
- [x] Workbench Request types defined (ADR-0020)
- [x] Nav manifest extension schema designed (ADR-0022)
- [x] Session persistence strategy decided (ADR-0021)
- [x] Permission integration approach decided (ADR-0023)
- [x] Client/server hydration pattern documented (ADR-0019)

### Implementation plan adjustments

| Phase       | Impact                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | Scaffold `packages/workbench-framework/`; `WorkbenchManager` + `WorkbenchRequestBus` stub; Layout/Panel managers; `@apzhub/workbench-framework/server` for hydration types |
| **Phase 2** | Implement `workbenchSchema` in Manifest Engine per ADR-0022; `PlatformRegistry.getWorkbenchNavItems()`                                                                     |
| **Phase 3** | Server hydration with permission-filtered DTO per ADR-0019 + ADR-0023                                                                                                      |
| **Phase 5** | `SessionStore` + `LocalStorageSessionStore` per ADR-0021                                                                                                                   |
| **Phase 7** | Complete request types; `AuthWorkbenchPermissionAdapter`; capability `publish()` injection per ADR-0020                                                                    |

### Unchanged

- Phase dependency order remains valid
- No Runtime changes in Phase 1 (Phase 2 manifest schema only)
- Desktop Shell incremental wiring approach unchanged
- Estimated effort: 20–28 engineering days

### Deferred (not blocking Phase 1)

| Item                                 | Target       |
| ------------------------------------ | ------------ |
| PostgreSQL session store             | Milestone 8  |
| Event Bus → Workbench Request bridge | Milestone 4+ |
| Full PermissionService               | Milestone 8  |
| `workbench.context` manifest block   | Phase 6      |

---

## Recommendation for Phase 1

### **READY FOR PHASE 1** (awaiting owner approval)

Phase 0 ADRs satisfy all architecture gate requirements. Phase 1 may proceed when the owner explicitly approves this report.

### Phase 1 first tasks

1. Create `packages/workbench-framework/` package scaffold (`package.json`, tsconfig, exports)
2. Add `@apzhub/workbench-framework` path alias to `tsconfig.base.json`
3. Implement `WorkbenchRequestBus` stub and `WorkbenchManager` scaffold (ADR-0020)
4. Register `AllowAllWorkbenchPermissionAdapter` default (ADR-0023)
5. Implement Layout Manager and Panel Manager composing `@apzhub/ui` ShellLayout (ADR-0019)
6. Add `@apzhub/workbench-framework/server` export with `WorkbenchRegistryDTO` types only
7. Unit tests for bus routing and panel/layout state

### Phase 1 must not

- Modify `@apzhub/workspace` beyond minimal prop interfaces (defer wiring to Phase 1 exit if possible)
- Add manifest schema changes (Phase 2)
- Implement Navigation Manager or Activity Bar (Phase 2–3)

### Stop condition

**Stop after Phase 1** for phase review gate per ADR-0017 unless owner approves continuation to Phase 2.

---

## Next steps

1. Owner approves this Phase 0 ADR report
2. Owner instructs Phase 1 start
3. Create `v0.2.0-platform-runtime` tag if not yet created (baseline lock)
4. Execute Phase 1 — package scaffold and Layout/Panel managers
5. Produce Phase 1 report at phase exit

---

_SPR-003 Phase 0 — ADRs complete. Awaiting owner approval before Phase 1._
