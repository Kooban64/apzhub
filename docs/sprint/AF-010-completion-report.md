# AF-010 — Completion Report

> **Story:** AF-010 — Client Action Registry synchronisation (hydration)  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-011**

---

## Objective

Implement client-side Action Registry synchronisation so the browser receives a server-generated Action Registry DTO and constructs a read-only client registry, preparing the platform for future Command Palette work.

---

## Acceptance criteria

| Criterion                                                              | Status                |
| ---------------------------------------------------------------------- | --------------------- |
| `createCommandRegistryFromDto()`                                       | ✅                    |
| Read-only `ClientActionRegistry`                                       | ✅                    |
| Registry hydration from server DTO                                     | ✅                    |
| `useCommandRegistry()` hook (`commands`, `list`, `execute`, `isReady`) | ✅                    |
| `list({ query })` substring filter                                     | ✅                    |
| `execute` calls executor with actor `user`                             | ✅                    |
| Diagnostics                                                            | ✅                    |
| Dependency injection via `CommandRegistryProvider`                     | ✅                    |
| Server remains authoritative — no client mutation                      | ✅                    |
| Synchronisation extension points documented                            | ✅                    |
| No palette, search, shortcuts, toolbar, context menus, AI              | ✅                    |
| Quality gates (lint, typecheck, build, test, e2e)                      | ✅                    |
| Coverage threshold (workbench-framework branches)                      | ⚠️ See Technical debt |

---

## Client registry summary

### Architecture

```text
Server (authoritative)
  bootstrapActionRegistry()
  filterActionRegistryDto()
       ↓
  ActionRegistryDto (serialisable)
       ↓
Client (read-only)
  createCommandRegistryFromDto(dto)
       ↓
  ClientActionRegistry
       ↓
  useCommandRegistry() → { commands, list, execute, isReady }
```

### Read-only contract

`ReadOnlyActionRegistry` exposes only:

| API                | Purpose                    |
| ------------------ | -------------------------- |
| `has(id)`          | Lookup                     |
| `get(id)`          | Retrieve frozen descriptor |
| `list(options?)`   | Sorted/filtered snapshot   |
| `getDiagnostics()` | Client reporting           |

No `register`, `replace`, `clear`, or `registerMany*` APIs exist on the client registry.

### Key types

| Export                              | Role                                      |
| ----------------------------------- | ----------------------------------------- |
| `createCommandRegistryFromDto(dto)` | DTO → read-only registry + diagnostics    |
| `validateActionRegistryDto(dto)`    | Defensive validation before hydration     |
| `ClientActionRegistry`              | In-memory frozen snapshot                 |
| `CommandRegistryProvider`           | React DI (dto + executor)                 |
| `useCommandRegistry()`              | Shell hook for palette/surfaces (AF-011+) |

### Package status

| Constant                        | Value         |
| ------------------------------- | ------------- |
| `COMMAND_FRAMEWORK_STATUS`      | `"hydration"` |
| `ACTION_FRAMEWORK_REACT_STATUS` | `"hydration"` |

---

## Synchronisation extension points

**Current (AF-010):** one-way hydration — `mode: "hydration"`.

```text
Server → Client hydration
```

Documented in `packages/command-framework/src/client/synchronisation.ts`:

| Extension                                     | Status          | Future use                           |
| --------------------------------------------- | --------------- | ------------------------------------ |
| `ClientRegistrySynchronisationState.revision` | Reserved        | Server registry etag / version       |
| `lastSyncedAt`                                | Reserved        | Last successful import or delta sync |
| `mode: "synchronisation"`                     | Not implemented | Push/pull registry patches (AF-020+) |

**Not implemented:** bidirectional sync, delta patches, or live registry updates.

---

## Registry diagnostics

### `ClientActionRegistryDiagnostics`

| Field                   | Description                        |
| ----------------------- | ---------------------------------- |
| `status`                | `empty` \| `hydrated` \| `invalid` |
| `actionCount`           | Total hydrated actions             |
| `platformActionCount`   | Built-in (`source: builtin`)       |
| `capabilityActionCount` | Manifest (`source: manifest`)      |
| `platformActionIds`     | Sorted platform ids                |
| `capabilityActionIds`   | Sorted capability ids              |
| `toolbarRegionCount`    | Toolbar regions in DTO             |
| `hydratedAt`            | ISO timestamp of import            |
| `source`                | Always `"server-dto"`              |
| `synchronisation`       | Hydration/sync metadata            |

Invalid DTOs produce `status: "invalid"` with structured `errors` on the provider context.

---

## Files added / modified

| Package           | File                                              | Change                          |
| ----------------- | ------------------------------------------------- | ------------------------------- |
| command-framework | `client/synchronisation.ts`                       | **New** — sync extension points |
| command-framework | `client/read-only-action-registry.ts`             | **New** — read-only interface   |
| command-framework | `client/client-action-registry.ts`                | **New** — frozen snapshot       |
| command-framework | `client/client-action-registry-diagnostics.ts`    | **New**                         |
| command-framework | `client/validate-action-registry-dto.ts`          | **New**                         |
| command-framework | `client/create-command-registry-from-dto.ts`      | **New**                         |
| command-framework | `react/command-registry-context.tsx`              | **New** — Provider + DI         |
| command-framework | `react/use-command-registry.ts`                   | **New** — hook                  |
| command-framework | `status.ts`                                       | `"hydration"`                   |
| command-framework | `tsconfig.json`                                   | `jsx: react-jsx`                |
| Tests             | `client/create-command-registry-from-dto.test.ts` | **New** — 12 tests              |
| Tests             | `react/use-command-registry.test.tsx`             | **New** — 7 tests               |
| Docs              | `README.md`, `CHANGELOG.md`                       | Updated                         |

---

## Test results

| Suite                                      | Tests                   |
| ------------------------------------------ | ----------------------- |
| `create-command-registry-from-dto.test.ts` | 12 (new)                |
| `use-command-registry.test.tsx`            | 7 (new)                 |
| `react/index.test.ts`                      | updated                 |
| **Monorepo total**                         | **509** (+19 vs AF-009) |

### Scenarios covered

- DTO validation (shape, descriptors, duplicates)
- Registry creation from valid DTO
- Read-only API surface (no mutation methods)
- Frozen descriptor immutability
- Invalid DTO → empty invalid registry
- Empty DTO → ready empty registry
- `list({ query })` label filter
- Hook `isReady` after provider mount
- Hook `execute` with actor `user`
- Hook outside provider throws
- Invalid DTO → `isReady: false`
- `useActionRegistry` alias

---

## Coverage

| Area                                     | Lines | Branches   | Threshold    |
| ---------------------------------------- | ----- | ---------- | ------------ |
| `command-framework/src/client/**`        | ~90%  | ~88%       | 80%          |
| `command-framework/src/react/**`         | ~95%  | ~90%       | 80%          |
| `workbench-framework/src/**` (aggregate) | ~80%  | **79.34%** | 80% branches |
| Monorepo aggregate                       | ~91%  | ~87%       | —            |

**Note:** `pnpm test:coverage` fails on pre-existing `workbench-framework` branch threshold. AF-010 code meets command-framework thresholds.

---

## Quality gates

| Gate                 | Result                                 |
| -------------------- | -------------------------------------- |
| `pnpm lint`          | ✅ Pass                                |
| `pnpm typecheck`     | ✅ Pass                                |
| `pnpm build`         | ✅ Pass                                |
| `pnpm test`          | ✅ 509 passed                          |
| `pnpm test:coverage` | ⚠️ workbench-framework branches 79.34% |
| `pnpm test:e2e`      | ✅ 15 passed                           |

---

## Technical debt

| ID         | Item                                                               | Target      |
| ---------- | ------------------------------------------------------------------ | ----------- |
| TD-AF10-01 | `workbench-framework` branch coverage below 80%                    | Maintenance |
| TD-AF10-02 | App wiring — `CommandRegistryProvider` not yet in `apps/web` shell | AF-020      |
| TD-AF10-03 | Shell hydration payload does not yet include `commands` DTO field  | AF-020      |
| TD-AF10-04 | `useActionRegistry` deprecated alias — remove after migration      | AF-012+     |
| TD-AF10-05 | Bidirectional synchronisation not implemented                      | AF-020+     |

---

## Recommendations for AF-011

1. **Command Palette UI** — build presentational component in `@apzhub/ui`; shell placement in `@apzhub/workspace`.
2. **Consume `useCommandRegistry`** — render `commands` / `list({ query })` in palette modal; wire `execute` on selection.
3. **Keyboard navigation** — ArrowUp/Down, Enter, Escape in palette (no global shortcut yet — AF-012).
4. **Do not implement** fuzzy search (AF-012), global shortcuts (AF-012), or toolbar (AF-017).
5. **Wire provider in AF-020** — until then, palette can be developed/tested with `CommandRegistryProvider` + mock DTO in Storybook/tests.
6. **Address TD-AF10-01** if coverage gate must pass before merge.

---

AF-010 complete. **Do not begin AF-011** until this report is reviewed and approved.
