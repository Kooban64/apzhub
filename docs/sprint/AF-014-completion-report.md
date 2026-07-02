# AF-014 — Completion Report

> **Story:** AF-014 — ShortcutRegistry  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-015**

---

## Objective

Implement the Shortcut Registry — mapping normalised keyboard chords to action IDs with registration, duplicate detection, lookup, diagnostics, manifest support, and dependency injection. Execution continues through Workbench API → Action Framework; the registry never executes actions.

---

## Acceptance criteria

| Criterion                                       | Status |
| ----------------------------------------------- | ------ |
| Shortcut Registry                               | ✅     |
| Shortcut registration                           | ✅     |
| Duplicate shortcut detection                    | ✅     |
| Shortcut lookup                                 | ✅     |
| Shortcut resolution from keyboard events        | ✅     |
| Shortcut diagnostics                            | ✅     |
| Manifest support (`ActionDescriptor.shortcut`)  | ✅     |
| Dependency injection (`ActionFrameworkContext`) | ✅     |
| Workbench API integration (resolve → executor)  | ✅     |
| Input Framework extension notes (documentation) | ✅     |
| No direct action execution in registry          | ✅     |
| No permission evaluation / workbench state / UI | ✅     |
| No context menus, toolbar, AI, voice, gestures  | ✅     |
| All quality gates pass                          | ✅     |

---

## Architecture summary

```text
Manifest / catalogue ActionDescriptor.shortcut
        │
        ▼
registerShortcutsFromActions() / bootstrapShortcutRegistry()
        │
        ▼
ShortcutRegistry (stores chord → actionId)
        │
        ├─ lookup(chord)
        ├─ resolve(KeyboardEventLike)
        ├─ getConflicts()
        └─ getDiagnostics()
        │
        ▼ (AF-015 shell listener — not AF-014)
executeShortcutViaWorkbenchApi() → WorkbenchActionExecutor → bridge
```

| Layer                                                      | AF-014 responsibility                                |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| `normalise-chord.ts`                                       | Canonical chord form; keyboard event → chord         |
| `DefaultShortcutRegistry`                                  | Register, lookup, resolve, conflicts, diagnostics    |
| `register-shortcuts-from-actions.ts`                       | Populate from manifest/built-in descriptors          |
| `ActionFrameworkContext.shortcuts`                         | DI root                                              |
| `bootstrapActionRegistry` / `createCommandRegistryFromDto` | Hydrate shortcuts with actions                       |
| `workbench-shortcut-integration.ts`                        | Resolve → Workbench executor path (integration only) |

### Registry rules preserved

The Shortcut Registry **does not**:

- Execute actions
- Evaluate permissions
- Modify Workbench state
- Invoke UI directly

Palette open (`Ctrl+Shift+P` / `Cmd+Shift+P`) remains a **shell concern** (AF-012), separate from ShortcutRegistry.

---

## Files added / modified

| Package           | File                                            | Change                                    |
| ----------------- | ----------------------------------------------- | ----------------------------------------- |
| command-framework | `shortcuts/types.ts`                            | **New** — registry interfaces             |
| command-framework | `shortcuts/normalise-chord.ts`                  | **New** — chord normalisation             |
| command-framework | `shortcuts/default-shortcut-registry.ts`        | **New** — registry implementation         |
| command-framework | `shortcuts/register-shortcuts-from-actions.ts`  | **New** — manifest bootstrap              |
| command-framework | `shortcuts/INPUT-FRAMEWORK.md`                  | **New** — Input Framework extension notes |
| command-framework | `shortcuts/*.test.ts`                           | **New** — unit tests                      |
| command-framework | `integration/workbench-shortcut-integration.ts` | **New** — Workbench API path              |
| command-framework | `di/action-framework-context.ts`                | Added `shortcuts` to DI                   |
| command-framework | `catalogue/bootstrap-action-registry.ts`        | Bootstrap shortcuts on success            |
| command-framework | `client/create-command-registry-from-dto.ts`    | Client shortcut hydration                 |
| command-framework | `index.ts`                                      | Public exports                            |
| docs              | `specs/SPR-004-AF-shortcut-registry.md`         | **New** — specification                   |
| docs              | `specs/SPR-004-AF-surfaces.md`                  | AF-014 implementation link                |
| docs              | `sprint/AF-014-completion-report.md`            | This report                               |

---

## Test results

| Suite                                     | Tests                   |
| ----------------------------------------- | ----------------------- |
| `normalise-chord.test.ts`                 | 5 (new)                 |
| `default-shortcut-registry.test.ts`       | 6 (new)                 |
| `register-shortcuts-from-actions.test.ts` | 2 (new)                 |
| `workbench-shortcut-integration.test.ts`  | 3 (new)                 |
| Updated bootstrap / DTO / DI tests        | +3                      |
| **Monorepo total**                        | **593** (+17 vs AF-013) |

### Scenarios covered

- Chord normalisation (`ctrl+shift+p`, `Cmd+Shift+T`)
- Register and resolve keyboard events
- Duplicate chord conflict detection and diagnostics
- First-wins lookup for conflicting chords
- Manifest `shortcut` field → registry bootstrap
- Server bootstrap + client DTO hydration
- DI context includes `shortcuts`
- Workbench API integration: resolve → executor → bridge (no registry execution)

---

## Coverage

| Area                                | Status               |
| ----------------------------------- | -------------------- |
| `command-framework/src/shortcuts/`  | ✅ 84.87% statements |
| `workbench-shortcut-integration.ts` | ✅ Covered           |
| All package thresholds              | ✅ Pass              |
| Monorepo statements                 | ✅ 90.74%            |

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅ Pass       |
| `pnpm typecheck`     | ✅ Pass       |
| `pnpm build`         | ✅ Pass       |
| `pnpm test`          | ✅ 593 passed |
| `pnpm test:coverage` | ✅ Pass       |

---

## Technical debt

| ID         | Item                                                             | Target           |
| ---------- | ---------------------------------------------------------------- | ---------------- |
| TD-AF14-01 | Shell global keydown listener not wired                          | AF-015           |
| TD-AF14-02 | Platform catalogue has no default shortcuts                      | AF-019 scaffolds |
| TD-AF14-03 | User preference overrides (Document 023)                         | Future           |
| TD-AF14-04 | `CommandRegistryProvider` does not expose shortcuts to React yet | AF-015           |
| TD-AF14-05 | Conflict resolution is first-wins — no admin policy layer        | Future           |

---

## Recommendations for AF-015

1. **Shell global shortcut listener** — `packages/workspace/src/desktop-shell/global-shortcuts.tsx`; call `ShortcutRegistry.resolve()` then `useCommandRegistry().execute()` or `executeShortcutViaWorkbenchApi()`.
2. **Expose shortcuts in React context** — extend `CommandRegistryProvider` with hydrated `ShortcutRegistry` from `createCommandRegistryFromDto().shortcuts`.
3. **Focus guards** — skip shortcuts when editable fields focused or modals open (reuse palette-shortcut patterns).
4. **Exclude palette open chord** — keep `Ctrl+Shift+P` as shell-only; do not register in ShortcutRegistry.
5. **Do not implement** context menus (AF-016) or toolbar (AF-017) in AF-015.

---

## Input Framework extension

See [`packages/command-framework/src/shortcuts/INPUT-FRAMEWORK.md`](../../packages/command-framework/src/shortcuts/INPUT-FRAMEWORK.md).

Summary: ShortcutRegistry is the first input binding resolver. Future voice, gesture, and automation gateways should produce action ids and delegate execution to the same Workbench API path.

---

AF-014 complete. **Do not begin AF-015** until this report is reviewed and approved.
