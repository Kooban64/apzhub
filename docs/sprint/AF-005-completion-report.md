# AF-005 — Completion Report

> **Story:** AF-005 — Permission-aware Action Registry filtering  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-006**

---

## Objective

Implement permission-aware Action Registry filtering. The Action Framework exposes only actions available to the current permission context. Permission decisions remain delegated to the Permission Adapter.

---

## Acceptance criteria

| Criterion                                                                | Status |
| ------------------------------------------------------------------------ | ------ |
| Server-side `filterActionRegistryDto()`                                  | ✅     |
| Registry filtering by permission context (via adapter)                   | ✅     |
| Bootstrap integration for registry population                            | ✅     |
| Diagnostics: registered, filtered, manifest capability counts            | ✅     |
| Permission-aware DTO generation                                          | ✅     |
| Action Framework never evaluates permissions directly                    | ✅     |
| Stable action identity contract documented                               | ✅     |
| No execution, palette, shortcuts, toolbar UI, Workbench/Runtime redesign | ✅     |
| Quality gates pass                                                       | ✅     |

---

## Permission filtering summary

### Separation of concerns

The Action Framework **does not evaluate permissions**. `filterActionRegistryDto()` delegates exclusively to `WorkbenchPermissionAdapter.filter()` per ADR-0023 — the same adapter used by `filterWorkbenchRegistryDto()`.

```typescript
const actions = permissionAdapter.filter([...dto.actions]);
const allowedIds = new Set(actions.map((action) => action.id));
// Toolbar items referencing filtered-out actions are removed
```

### Rules (inherited from adapter)

| Case                                             | Visibility                     |
| ------------------------------------------------ | ------------------------------ |
| No `permission` on action                        | Allowed (adapter returns item) |
| `permission` present + user has key              | Allowed                        |
| `permission` present + user lacks key            | Omitted from DTO               |
| Toolbar item `commandId` not in filtered actions | Removed                        |

### Server export

`@apzhub/command-framework/server` — `COMMAND_FRAMEWORK_SERVER_STATUS = "filter"`

| Export                                                          | Purpose                              |
| --------------------------------------------------------------- | ------------------------------------ |
| `filterActionRegistryDto(dto, adapter)`                         | Permission-filter actions + toolbar  |
| `mapActionRegistryDto(registry, toolbar?)`                      | Build unfiltered DTO from registry   |
| `createEmptyActionRegistryDto()`                                | Empty hydration fallback             |
| `bootstrapActionRegistryFromCapabilities(records)`              | Populate registry from manifests     |
| `mapPlatformCapabilitiesToActionRecords(snapshots)`             | Platform registry → extraction input |
| `buildActionRegistryHydrationDiagnostics(registry, visibleDto)` | Registered vs filtered counts        |
| `ActionRegistryHydrationDiagnostics`                            | Hydration metrics type               |

---

## Bootstrap integration summary

### Server-side population flow

```text
Platform Registry.findAll()
    → mapPlatformCapabilitiesToActionRecords()
    → bootstrapActionRegistryFromCapabilities()
        → extractActionDescriptorsFromCapabilities()
        → registerManyAtomic()
        → recordManifestSource()
    → mapActionRegistryDto()
    → filterActionRegistryDto(dto, permissionAdapter)
    → buildActionRegistryHydrationDiagnostics()
```

### App integration point

`apps/web/lib/command-hydration.ts` — mirrors `workbench-hydration.ts`:

- Calls `ensurePlatformRuntimeReady()`
- Populates action registry from platform capabilities
- Filters DTO with session-backed `createWorkbenchPermissionAdapter()`
- Returns `{ dto, diagnostics }`

Not wired to layout props yet (AF-010 / AF-020) — bootstrap helper only.

### Registry diagnostics

| Field                     | Source                                |
| ------------------------- | ------------------------------------- |
| `registeredCount`         | Actions in registry after population  |
| `filteredCount`           | Actions in permission-filtered DTO    |
| `manifestCapabilityCount` | Capabilities that contributed actions |
| `manifestCapabilities`    | Sorted capability ids                 |

`DefaultActionRegistry.recordManifestSource()` called after successful `populateRegistryFromCapabilities()`.

---

## Stable action identity (documentation)

Documented on `ActionRegistry` interface contract:

- Action ids are immutable after registration.
- Released action ids shall not be reused.
- Replacement occurs through explicit migration.
- Deprecated ids may remain as aliases in future releases where appropriate.

---

## Files added / modified

| File                                                  | Change                                           |
| ----------------------------------------------------- | ------------------------------------------------ |
| `src/server/filter-action-registry-dto.ts`            | **New** — permission filter                      |
| `src/server/map-action-registry-dto.ts`               | **New** — DTO mapping                            |
| `src/server/bootstrap-action-registry.ts`             | **New** — bootstrap population                   |
| `src/server/map-capability-records.ts`                | **New** — platform snapshot mapper               |
| `src/server/action-registry-hydration-diagnostics.ts` | **New** — hydration diagnostics                  |
| `src/server/*.test.ts`                                | **New** — 14 tests                               |
| `src/server.ts`                                       | Re-exports; status → `"filter"`                  |
| `src/registry/action-registry.ts`                     | Stable identity contract; `recordManifestSource` |
| `src/registry/default-action-registry.ts`             | Manifest metadata tracking                       |
| `src/extraction/populate-registry.ts`                 | Records manifest source on success               |
| `apps/web/lib/command-hydration.ts`                   | **New** — bootstrap integration                  |
| `apps/web/package.json`, `tsconfig.json`              | command-framework dependency                     |
| `package.json`                                        | `@apzhub/workbench-framework` dependency         |

---

## Test results

| Suite                                | Tests                   |
| ------------------------------------ | ----------------------- |
| `filter-action-registry-dto.test.ts` | 6                       |
| `bootstrap-action-registry.test.ts`  | 5                       |
| `server.test.ts`                     | 3                       |
| `extract-actions.test.ts` (updated)  | 9                       |
| **Package total**                    | **63**                  |
| **Monorepo total**                   | **448** (+12 vs AF-004) |

### Scenarios covered

- Allow-all adapter passes all actions
- Empty permission set denies gated actions
- Full permission set retains gated actions
- Mixed visibility (public + gated)
- Toolbar orphan removal
- Adapter delegation (no inline permission logic)
- Bootstrap population + diagnostics
- Bootstrap failure leaves registry empty
- DTO mapping sort order

---

## Coverage

| Area                                | Lines | Branches | Threshold |
| ----------------------------------- | ----- | -------- | --------- |
| `command-framework/src/server/**`   | ~95%+ | ~90%+    | 80%       |
| `command-framework/src/registry/**` | ~93%  | ~87%     | 85%       |
| Monorepo aggregate                  | ~91%  | ~87%     | —         |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |
| `pnpm test`          | ✅ Pass — 448 tests |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm test:e2e`      | ✅ Pass — 15 tests  |

---

## Technical debt

| ID        | Item                                                                                  | Target              |
| --------- | ------------------------------------------------------------------------------------- | ------------------- |
| TD-AF5-01 | `loadActionRegistryDto()` not wired to RSC layout props                               | AF-010 / AF-020     |
| TD-AF5-02 | Population errors not surfaced in platform diagnostics                                | Runtime integration |
| TD-AF5-03 | `ActionPermissionAdapter` minimal type retained — prefer `WorkbenchPermissionAdapter` | Document only       |
| TD-AF5-04 | Toolbar regions empty until AF-017 manifest extraction                                | AF-017              |
| TD-AF5-05 | No client-side permission defence-in-depth hook                                       | AF-010              |
| TD-AF5-06 | Executor permission gate not implemented                                              | AF-006              |

---

## Recommendations for AF-006

1. **Implement `ActionExecutor`** with permission gate reusing the same `WorkbenchPermissionAdapter.can()` before dispatch.

2. **Add actor attribution** per ADR-0026 — `{ actionId, actor: "user" | "system" | "automation", context }`.

3. **Structured result codes** — `OK`, `DENIED`, `NOT_FOUND`, `NOT_IMPLEMENTED` for handler kinds.

4. **Audit hook** — invoke `ActionAuditHook` on execution attempts (allow/deny).

5. **Do not implement** Command Palette, shortcuts, or toolbar UI — remain AF-009+.

6. **Integration test** — executor denies when adapter denies, even if action visible in stale client DTO.

---

## Stop condition

AF-005 complete. **Do not begin AF-006** until this report is reviewed and approved.

---

_AF-005 Completion Report — Sprint 004 Action Framework._
