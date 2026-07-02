# AF-003 — Completion Report

> **Story:** AF-003 — DefaultActionRegistry  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-004**

---

## Objective

Implement the first functional Action Registry — in-memory storage and querying of Action Descriptors. No action execution.

---

## Acceptance criteria

| Criterion                                                    | Status |
| ------------------------------------------------------------ | ------ |
| `DefaultActionRegistry` implemented                          | ✅     |
| Action registration with validation                          | ✅     |
| Duplicate ID rejection                                       | ✅     |
| Lookup by ID (`get`, `has`)                                  | ✅     |
| Enumeration (`list`) with basic filtering                    | ✅     |
| Registry diagnostics                                         | ✅     |
| Immutable ActionDescriptor handling (deep-freeze)            | ✅     |
| Explicit `replace()` API — no in-place mutation              | ✅     |
| No execution, permissions, shortcuts, Workbench, Runtime, UI | ✅     |
| Zero Runtime / Workbench package changes                     | ✅     |
| Quality gates pass                                           | ✅     |

---

## Registry API summary

### `DefaultActionRegistry`

| Method                      | Behaviour                                            |
| --------------------------- | ---------------------------------------------------- |
| `register(descriptor)`      | Validates, rejects duplicates, stores frozen copy    |
| `registerMany(descriptors)` | Batch validate; atomic duplicate check before insert |
| `replace(descriptor)`       | Updates existing id only; throws if not found        |
| `has(id)`                   | Returns whether id is registered                     |
| `get(id)`                   | Returns frozen copy or `undefined`                   |
| `list(options?)`            | Sorted snapshot with optional filters                |
| `clear()`                   | Removes all entries                                  |
| `getDiagnostics()`          | `{ status: "ready", registeredCount, actionIds }`    |

### `list()` filters (AF-003 scope)

| Option           | Filter                                                                    |
| ---------------- | ------------------------------------------------------------------------- |
| `query`          | Case-insensitive substring on `label` and `id`                            |
| `palette: true`  | Excludes `palette: false`                                                 |
| `palette: false` | Only `palette === false`                                                  |
| `surface`        | When `contextWhen.surfaces` set, must include surface; otherwise included |

`selection` / `context` options reserved for AF-016.

### Immutability

- `freezeActionDescriptor()` deep-freezes at registration
- `get()` returns a frozen copy
- **Do not mutate** registered objects — use `replace()`

Documented in `DefaultActionRegistry` JSDoc and package README.

### Errors

| Class                           | When                                  |
| ------------------------------- | ------------------------------------- |
| `ActionRegistryValidationError` | Invalid descriptor shape              |
| `ActionRegistryDuplicateError`  | Duplicate id on register/registerMany |
| `ActionRegistryNotFoundError`   | `replace()` on unknown id             |

### Factories

| Export                          | Purpose                   |
| ------------------------------- | ------------------------- |
| `createDefaultActionRegistry()` | New registry instance     |
| `defaultActionRegistryFactory`  | DI factory `{ create() }` |

### DI default

`createActionFrameworkContext()` now defaults to `DefaultActionRegistry` (executor remains placeholder).

### Package status

`COMMAND_FRAMEWORK_STATUS = "registry"`

---

## Files added / modified

| File                                           | Change                                             |
| ---------------------------------------------- | -------------------------------------------------- |
| `src/registry/default-action-registry.ts`      | **New** — core implementation                      |
| `src/registry/default-action-registry.test.ts` | **New** — 24 tests                                 |
| `src/registry/validate-action-descriptor.ts`   | **New**                                            |
| `src/registry/freeze-action-descriptor.ts`     | **New**                                            |
| `src/registry/filter-action-descriptors.ts`    | **New**                                            |
| `src/registry/registry-errors.ts`              | **New**                                            |
| `src/registry/action-registry.ts`              | Extended interface (`replace`, `has`, diagnostics) |
| `src/registry/placeholder-action-registry.ts`  | Stub `replace`/`has`                               |
| `src/registry/index.ts`                        | Exports                                            |
| `src/index.ts`                                 | Public exports                                     |
| `src/status.ts`                                | Status → `"registry"`                              |
| `src/di/action-framework-context.ts`           | Default registry                                   |
| `README.md`                                    | Immutability docs                                  |
| `vitest.config.ts`                             | Registry coverage threshold 85%                    |

---

## Test results

| Suite                             | Tests   |
| --------------------------------- | ------- |
| `default-action-registry.test.ts` | 24      |
| `index.test.ts` (updated)         | 9       |
| **Package total**                 | **35**  |
| **Monorepo total**                | **421** |

### Coverage (`packages/command-framework/src/registry/**`)

| Metric    | Result | Threshold |
| --------- | ------ | --------- |
| Lines     | ~97%   | 85%       |
| Branches  | ~88%   | 85%       |
| Functions | ~94%   | 85%       |

---

## Quality gates

| Gate                 | Result              |
| -------------------- | ------------------- |
| `pnpm lint`          | ✅ Pass             |
| `pnpm typecheck`     | ✅ Pass             |
| `pnpm build`         | ✅ Pass             |
| `pnpm test`          | ✅ Pass — 421 tests |
| `pnpm test:coverage` | ✅ Pass             |
| `pnpm test:e2e`      | ✅ Pass — 15 tests  |

---

## Technical debt

| ID        | Item                                                      | Target |
| --------- | --------------------------------------------------------- | ------ |
| TD-AF3-01 | `selection` / `context` list filters not implemented      | AF-016 |
| TD-AF3-02 | `unregister(id)` not exposed — add if needed via ADR      | Future |
| TD-AF3-03 | PlaceholderActionRegistry still exported for tests        | Keep   |
| TD-AF3-04 | No manifest extraction — registry is manual register only | AF-004 |
| TD-AF3-05 | Service/event handler kinds validated but not executable  | AF-006 |

---

## Recommendations for AF-004

1. **Add `extractActionsFromCapabilities()`** in `packages/command-framework/src/extraction/` — read normalised capability payloads; do not import full runtime in client bundle.

2. **Extend `manifest-engine/schemas/workbench.ts`** additively with `commands` and `toolbar` Zod schemas per ADR-0025.

3. **Wire extraction → registerMany** in a server-only helper (not app yet) with integration test using YAML fixtures in `packages/command-framework/fixtures/manifests/`.

4. **Duplicate policy at extraction** — fail bootstrap with aggregated error when duplicate command ids across capabilities (per foundation spec).

5. **Do not implement** `filterActionRegistryDto` permission filtering — that is AF-005.

6. **Reuse** `validateActionDescriptor()` when mapping manifest rows to `ActionDescriptor`.

---

## Stop condition

AF-003 complete. **Do not begin AF-004** until this report is reviewed and approved.

---

_AF-003 Completion Report — Sprint 004 Action Framework._
