# AF-009 — Completion Report

> **Story:** AF-009 — Platform Action Catalogue bootstrap  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-010**

---

## Objective

Implement automatic registration of the built-in Platform Action Catalogue to complete the Action Framework bootstrap process. Platform actions are available immediately after bootstrap without manual registration.

---

## Acceptance criteria

| Criterion                                                             | Status                |
| --------------------------------------------------------------------- | --------------------- |
| Platform Action Catalogue for all `REQUEST_COMMAND_MAP` workbench ids | ✅                    |
| Bootstrap registration of platform actions (atomic)                   | ✅                    |
| Platform vs capability action distinction in diagnostics              | ✅                    |
| Version metadata (platform / capability)                              | ✅                    |
| Registry reporting / hydration diagnostics                            | ✅                    |
| Capability actions still registered via manifests                     | ✅                    |
| No palette, shortcuts, toolbar, search, AI, workflow                  | ✅                    |
| Quality gates (lint, typecheck, build, test, e2e)                     | ✅                    |
| Coverage threshold (workbench-framework branches)                     | ⚠️ See Technical debt |

---

## Platform Action Catalogue summary

| Action id                     | Label             | Group      | Palette | Handler                                        |
| ----------------------------- | ----------------- | ---------- | ------- | ---------------------------------------------- |
| `workbench.view.open`         | Open View         | View       | yes     | `workbench-bridge:workbench.view.open`         |
| `workbench.view.close`        | Close View        | View       | yes     | `workbench-bridge:workbench.view.close`        |
| `workbench.view.focus`        | Focus View        | View       | yes     | `workbench-bridge:workbench.view.focus`        |
| `workbench.panel.open`        | Open Panel        | Panel      | yes     | `workbench-bridge:workbench.panel.open`        |
| `workbench.panel.close`       | Close Panel       | Panel      | yes     | `workbench-bridge:workbench.panel.close`       |
| `workbench.navigation.reveal` | Reveal Navigation | Navigation | yes     | `workbench-bridge:workbench.navigation.reveal` |
| `workbench.context.set`       | Set Context       | Context    | no      | `workbench-bridge:workbench.context.set`       |
| `workbench.selection.set`     | Set Selection     | Selection  | no      | `workbench-bridge:workbench.selection.set`     |

- **Count:** 8 (equals `REQUEST_COMMAND_MAP` workbench bridge ids)
- **Source:** `builtin` (platform actions)
- **Version:** `ACTION_FRAMEWORK_PLATFORM_VERSION` (`0.3.0`)

---

## Bootstrap summary

### Phases

```text
bootstrapActionRegistry()
    │
    ├─ Phase 1: registerPlatformActionCatalogue()  [atomic]
    │     └─ PLATFORM_ACTION_CATALOGUE → ActionRegistry
    │
    └─ Phase 2: bootstrapActionRegistryFromCapabilities()  [atomic]
          └─ manifest workbench.actions → ActionRegistry
```

### Server hydration (`apps/web`)

`loadActionRegistryDto()` now calls `bootstrapActionRegistry({ capabilityRecords })` so platform catalogue actions are included before permission filtering.

### API surface

| Function                                              | Role                          |
| ----------------------------------------------------- | ----------------------------- |
| `registerPlatformActionCatalogue(registry, options?)` | Register catalogue only       |
| `registerBuiltInWorkbenchCommands`                    | Deprecated alias              |
| `bootstrapActionRegistry(options?)`                   | Platform + capabilities       |
| `bootstrapActionRegistryFromCapabilities`             | Capabilities only (unchanged) |

### Package status

`COMMAND_FRAMEWORK_STATUS = "catalogue"`

---

## Platform vs capability distinction

| Aspect                    | Platform actions                           | Capability actions                             |
| ------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `ActionDescriptor.source` | `builtin`                                  | `manifest`                                     |
| Registration              | `registerPlatformActionCatalogue`          | Manifest extraction                            |
| `version`                 | `ACTION_FRAMEWORK_PLATFORM_VERSION`        | Capability `version` field                     |
| Diagnostics label         | `platformActionCount`, `platformActionIds` | `capabilityActionCount`, `capabilityActionIds` |
| Helpers                   | `isPlatformAction()`                       | `isCapabilityAction()`                         |

Duplicate capability ids that collide with platform catalogue ids are rejected atomically during phase 2.

---

## Registry diagnostics

### `ActionRegistry.getDiagnostics()`

| Field                     | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `registeredCount`         | Total actions                                   |
| `platformActionCount`     | Built-in catalogue count                        |
| `capabilityActionCount`   | Manifest-derived count                          |
| `platformVersion`         | Platform release stamped at catalogue bootstrap |
| `platformActionIds`       | Sorted platform action ids                      |
| `capabilityActionIds`     | Sorted capability action ids                    |
| `manifestCapabilityCount` | Capabilities that contributed actions           |
| `manifestCapabilities`    | Capability ids                                  |

### `ActionRegistryHydrationDiagnostics` (server)

Extends hydration reporting with platform/capability split and `platformVersion` for filtered DTO visibility.

---

## Files added / modified

| Package           | File                                              | Change                                          |
| ----------------- | ------------------------------------------------- | ----------------------------------------------- |
| command-framework | `catalogue/platform-action-catalogue.ts`          | **New** — catalogue entries                     |
| command-framework | `catalogue/platform-version.ts`                   | **New** — `ACTION_FRAMEWORK_PLATFORM_VERSION`   |
| command-framework | `catalogue/register-platform-actions.ts`          | **New** — atomic registration                   |
| command-framework | `catalogue/bootstrap-action-registry.ts`          | **New** — unified bootstrap                     |
| command-framework | `catalogue/action-origin.ts`                      | **New** — platform/capability helpers           |
| command-framework | `types/action-descriptor.ts`                      | `version` field                                 |
| command-framework | `registry/*`                                      | `recordPlatformCatalogue`, enhanced diagnostics |
| command-framework | `registry/freeze-action-descriptor.ts`            | Preserve `version`                              |
| command-framework | `extraction/*`                                    | Capability version stamping                     |
| command-framework | `server/action-registry-hydration-diagnostics.ts` | Platform/capability split                       |
| command-framework | `server/map-capability-records.ts`                | Pass capability `version`                       |
| apps/web          | `lib/command-hydration.ts`                        | Use `bootstrapActionRegistry`                   |
| Tests             | `catalogue/platform-action-catalogue.test.ts`     | **New** — 11 tests                              |
| Docs              | `README.md`, `CHANGELOG.md`                       | Updated                                         |

---

## Test results

| Suite                               | Tests                   |
| ----------------------------------- | ----------------------- |
| `platform-action-catalogue.test.ts` | 11 (new)                |
| `extract-actions.test.ts`           | +1 (version)            |
| `bootstrap-action-registry.test.ts` | updated diagnostics     |
| **Monorepo total**                  | **490** (+12 vs AF-008) |

### Scenarios covered

- Catalogue count matches `REQUEST_COMMAND_MAP` workbench ids
- Unique catalogue ids
- Platform bootstrap with `source: builtin` and platform version
- Registry platform diagnostics after registration
- Duplicate detection on repeat catalogue registration
- `list({ palette: true })` includes view/navigation commands
- Unified bootstrap (platform + capabilities)
- Capability version metadata
- Capability id collision with platform catalogue
- Bootstrap repeatability on fresh registries
- Hydration diagnostics platform/capability counts

---

## Coverage

| Area                                     | Lines | Branches   | Threshold    |
| ---------------------------------------- | ----- | ---------- | ------------ |
| `command-framework/src/catalogue/**`     | ~89%  | ~92%       | 80%          |
| `command-framework/src/**` (aggregate)   | ≥80%  | ≥80%       | 80%          |
| `workbench-framework/src/**` (aggregate) | ~80%  | **79.34%** | 80% branches |
| Monorepo aggregate                       | ~91%  | ~87%       | —            |

**Note:** `pnpm test:coverage` fails on `packages/workbench-framework` branch threshold (79.34% < 80%). This package was not modified in AF-009; failure appears pre-existing / borderline. All AF-009-added code meets package thresholds.

---

## Quality gates

| Gate                 | Result                                 |
| -------------------- | -------------------------------------- |
| `pnpm lint`          | ✅ Pass                                |
| `pnpm typecheck`     | ✅ Pass                                |
| `pnpm build`         | ✅ Pass                                |
| `pnpm test`          | ✅ 490 passed                          |
| `pnpm test:coverage` | ⚠️ workbench-framework branches 79.34% |
| `pnpm test:e2e`      | ✅ 15 passed                           |

---

## Technical debt

| ID        | Item                                                                                  | Target               |
| --------- | ------------------------------------------------------------------------------------- | -------------------- |
| TD-AF9-01 | `workbench-framework` branch coverage below 80% threshold                             | Maintenance / AF-010 |
| TD-AF9-02 | `registerBuiltInWorkbenchCommands` deprecated alias — remove after migration window   | AF-011+              |
| TD-AF9-03 | Capability bootstrap failure leaves platform actions in shared registry instance      | Documented behaviour |
| TD-AF9-04 | `COMMAND_FRAMEWORK_SERVER_STATUS` still `"filter"` — consider `"catalogue"` alignment | AF-010               |

---

## Recommendations for AF-010

1. **Client hydration** — implement `createCommandRegistryFromDto()` to hydrate filtered `ActionRegistryDto` on the client without re-running bootstrap.
2. **`useCommandRegistry` hook** — expose `{ commands, list, execute, isReady }`; `list({ query })` substring filter on labels; `execute` delegates to executor with actor `user`.
3. **Wire server DTO** — connect `loadActionRegistryDto()` output to client provider (React context or workbench hydration path).
4. **Include platform actions in client list** — verify palette-ready built-ins appear after hydration without additional registration.
5. **Do not implement** Command Palette UI, shortcuts, or toolbar — those remain AF-011+.
6. **Address TD-AF9-01** — add minimal branch coverage in workbench-framework if coverage gate must pass before AF-010 merge.

---

AF-009 complete. **Do not begin AF-010** until this report is reviewed and approved.
