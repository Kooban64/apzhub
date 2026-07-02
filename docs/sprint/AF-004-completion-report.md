# AF-004 — Completion Report

> **Story:** AF-004 — Manifest-driven Action registration  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-005**

---

## Objective

Implement manifest-driven Action registration. Capabilities contribute Action Descriptors through manifests. The Action Framework discovers, validates, and registers those descriptors. No execution is implemented.

---

## Acceptance criteria

| Criterion                                                  | Status |
| ---------------------------------------------------------- | ------ |
| Manifest schema for `workbench.actions`                    | ✅     |
| Manifest validation (additive)                             | ✅     |
| Capability extraction                                      | ✅     |
| Registry population                                        | ✅     |
| Registry diagnostics                                       | ✅     |
| Stable Action IDs (immutable after registration)           | ✅     |
| Deterministic registration order                           | ✅     |
| Atomic batch registration                                  | ✅     |
| Structured validation errors on failure                    | ✅     |
| No execution, permissions, shortcuts, Workbench wiring, UI | ✅     |
| Quality gates pass                                         | ✅     |

---

## Manifest specification summary

### Envelope extension

Optional `workbench` block extended additively on all capability kinds that already support `optionalWorkbenchFields`:

```yaml
workbench:
  navigation: { ... } # existing — ADR-0022
  view: { ... } # existing — ADR-0022
  actions: [...] # canonical — AF-004
  commands: [...] # legacy alias — ADR-0025; normalised at extraction
```

### `workbench.actions[]` row schema

| Field         | Required | Description                                                                 |
| ------------- | -------- | --------------------------------------------------------------------------- |
| `id`          | Yes      | Globally unique action id; lowercase dot notation (`platform.theme.toggle`) |
| `label`       | Yes      | Display label                                                               |
| `handler`     | Yes      | Handler reference (`service:…`, `workbench-bridge:…`, `event:…`)            |
| `permission`  | Optional | Permission key (not evaluated in AF-004)                                    |
| `shortcut`    | Optional | Key chord string (not registered in AF-004)                                 |
| `palette`     | Optional | Default `true` — palette visibility hint                                    |
| `icon`        | Optional | Icon key                                                                    |
| `group`       | Optional | Palette / menu grouping                                                     |
| `contextWhen` | Optional | `{ surfaces?, selectionKinds?, contextTypes? }`                             |
| `order`       | Optional | Sort order within group; default `100` at registry list time                |

### Validation rules

- Zod `.strict()` on action rows and workbench block — unknown fields rejected.
- Action id uses `workbenchActionIdSchema` (`/^[a-z0-9][a-z0-9.-]*$/`) — distinct from capability id (kebab-case).
- Legacy `workbench.commands` accepted at schema level; `collectWorkbenchActionManifests()` merges both arrays at extraction.

### Schema location

`packages/platform-runtime/src/manifest-engine/schemas/workbench.ts`

---

## Registry integration summary

### Extraction pipeline

| Export                                                               | Package                     | Role                                                            |
| -------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `extractActionDescriptorsFromCapabilities(records, { activeOnly? })` | `@apzhub/command-framework` | Scan capability records; map manifest rows → `ActionDescriptor` |
| `mapWorkbenchActionToDescriptor(row, capabilityId)`                  | `@apzhub/command-framework` | Single-row mapper with handler kind inference                   |
| `populateRegistryFromCapabilities(registry, records)`                | `@apzhub/command-framework` | Extract + `registerManyAtomic` in one call                      |

### Atomic registration

| Method                            | Behaviour                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `registerManyAtomic(descriptors)` | Validates entire batch first; on any validation or duplicate error, **registers nothing** and returns `{ ok: false, errors: [...] }` |

Duplicate detection spans:

1. **Extraction** — duplicate action ids across capabilities → `extraction.ok = false`, zero descriptors.
2. **Registration** — duplicate ids within batch or vs existing registry → `registerManyAtomic` returns errors, registry unchanged.

### Registry ordering contract

Documented on `ActionRegistry` interface. `list()` and filtered results sort deterministically:

1. `order` (ascending; default `100`)
2. `group` (ascending; default `""`)
3. `label` (ascending)
4. `id` (ascending)

### Action ID immutability

- Registered descriptors are deep-frozen.
- Ids cannot change after registration; use `replace()` for metadata updates.

### Diagnostics

| Source     | Fields                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Extraction | `{ scannedCapabilities, extractedCount, skippedInactive, skippedWithoutActions, capabilityIds }` |
| Registry   | `{ status: "ready", registeredCount, actionIds }` (sorted ids)                                   |

### Package status

`COMMAND_FRAMEWORK_STATUS = "manifest"`

---

## Files added / modified

| File                                                                      | Change                                                                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `packages/platform-runtime/src/manifest-engine/schemas/workbench.ts`      | `workbenchActionSchema`, `workbenchActionIdSchema`, `collectWorkbenchActionManifests`, `hasWorkbenchActions` |
| `packages/platform-runtime/src/manifest-engine/workbench-actions.test.ts` | **New** — 4 manifest validation tests                                                                        |
| `packages/platform-runtime/src/manifest-engine/index.ts`                  | Exports                                                                                                      |
| `packages/command-framework/src/extraction/*`                             | **New** — extraction + population                                                                            |
| `packages/command-framework/src/registry/action-batch-registration.ts`    | **New** — batch result types                                                                                 |
| `packages/command-framework/src/registry/action-batch-helpers.ts`         | **New** — validation issue collectors                                                                        |
| `packages/command-framework/src/registry/default-action-registry.ts`      | `registerManyAtomic`                                                                                         |
| `packages/command-framework/src/registry/action-registry.ts`              | Contract docs, `registerManyAtomic`                                                                          |
| `packages/command-framework/src/registry/filter-action-descriptors.ts`    | Sort order: order → group → label → id                                                                       |
| `packages/command-framework/package.json`                                 | `@apzhub/platform-runtime` dependency                                                                        |
| `packages/command-framework/src/status.ts`                                | Status → `"manifest"`                                                                                        |
| `tsconfig.base.json`, `vitest.config.ts`                                  | Path aliases                                                                                                 |

---

## Test results

| Suite                             | Tests                   |
| --------------------------------- | ----------------------- |
| `workbench-actions.test.ts`       | 4                       |
| `extract-actions.test.ts`         | 9                       |
| `default-action-registry.test.ts` | 26 (+2 atomic)          |
| **Package total**                 | **49**                  |
| **Monorepo total**                | **436** (+15 vs AF-003) |

### Coverage highlights

| Area                                   | Lines | Branches | Threshold           |
| -------------------------------------- | ----- | -------- | ------------------- |
| `command-framework/src/registry/**`    | ~93%  | ~87%     | 85%                 |
| `command-framework/src/extraction/**`  | ~83%  | ~82%     | 80%                 |
| `manifest-engine/schemas/workbench.ts` | ~81%  | ~67%     | (package aggregate) |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |
| `pnpm test`          | ✅ Pass — 436 tests |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm test:e2e`      | ✅ Pass — 15 tests  |

---

## Technical debt

| ID        | Item                                                                                                               | Target                     |
| --------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| TD-AF4-01 | `workbench.commands` legacy alias retained — remove after migration window                                         | Future ADR                 |
| TD-AF4-02 | Extraction depends on `@apzhub/platform-runtime/manifest-engine` — keep server-side or split shared schema package | AF-005+                    |
| TD-AF4-03 | `registerMany()` still throws; prefer `registerManyAtomic()` for bootstrap paths                                   | Document only              |
| TD-AF4-04 | `manifestCapabilities` diagnostic field reserved but not populated on registry                                     | AF-005                     |
| TD-AF4-05 | `activeOnly: true` default skips inactive capabilities silently                                                    | Runtime wiring story       |
| TD-AF4-06 | ADR-0025 `toolbar` array not in schema yet                                                                         | AF-009+                    |
| TD-AF4-07 | No Runtime orchestrator hook — manual `populateRegistryFromCapabilities` only                                      | AF-005 / integration story |
| TD-AF4-08 | Permission keys on manifest rows validated for shape only — not evaluated                                          | AF-005                     |

---

## Recommendations for AF-005

1. **Implement `filterActionRegistryDto()`** in `@apzhub/command-framework/server` — permission-filter registry snapshots using ADR-0023 adapter pattern.

2. **Wire population at bootstrap** — call `populateRegistryFromCapabilities` from a server-only runtime hydration step after capability registry is ready; aggregate extraction + registration errors into platform diagnostics.

3. **Populate `manifestCapabilities`** in registry diagnostics from extraction metadata for operator visibility.

4. **Add integration test** with YAML fixtures end-to-end: validate manifest → extract → register → filter (mock permission adapter).

5. **Do not implement** Command Palette, shortcuts, toolbar, or execution — those remain AF-009+ / AF-006.

6. **Consider** deprecating `workbench.commands` alias once all internal manifests migrate to `workbench.actions`.

---

## Stop condition

AF-004 complete. **Do not begin AF-005** until this report is reviewed and approved.

---

_AF-004 Completion Report — Sprint 004 Action Framework._
