# Action Framework — Developer Onboarding

> **Audience:** Engineers adding platform or capability actions  
> **Prerequisite:** [Getting started](./getting-started.md) · [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md)  
> **Architecture:** [command-framework.md](../architecture/command-framework.md)

---

## What you need to understand

The Action Framework answers three questions:

1. **What actions exist?** — `ActionRegistry` populated at server bootstrap from catalogue + manifests
2. **Which actions can this user see?** — `filterActionRegistryDto()` with `WorkbenchPermissionAdapter`
3. **How are actions executed?** — `DefaultActionExecutor` → bridge or handler → Workbench Request Bus

Shell surfaces (palette, shortcuts, toolbar, context menu) are **read-only consumers** of the hydrated registry. They call `useCommandRegistry().execute(actionId)` — never engines directly.

---

## Quick mental model

```text
Manifest YAML  →  Runtime.bootstrap  →  bootstrapActionRegistry
                                              ↓
                                    filterActionRegistryDto (server)
                                              ↓
                                    CommandRegistryProvider (client)
                                              ↓
                              Palette / Shortcuts / Toolbar / Context Menu
                                              ↓
                                    DefaultActionExecutor
```

---

## Task 1 — Understand the Action Framework

Read in order:

1. [Document 019](../019-universal-command-palette-action-framework.md) — product vision
2. [command-framework.md](../architecture/command-framework.md) — architecture
3. [packages/command-framework/README.md](../../packages/command-framework/README.md) — package API
4. [SPR-004 spec index](../specs/SPR-004-spec-index.md) — story specifications

Run the platform locally and verify:

```bash
pnpm dev
# Sign in → /workspace/home
# Ctrl+Shift+P — palette opens with platform actions
# Inspect dev diagnostics: data-testid="action-framework-diagnostics"
curl -s localhost:3300/api/health | jq .commands
```

---

## Task 2 — Add a platform action (built-in catalogue)

Built-in actions use bridge ids directly (`workbench.view.open`, etc.).

**When to use:** Platform-wide workbench orchestration actions already mapped in `PLATFORM_ACTION_CATALOGUE`.

**Steps:**

1. Add entry to `PLATFORM_ACTION_CATALOGUE` in `packages/command-framework/src/catalogue/platform-action-catalogue.ts`
2. Ensure bridge supports the id in `WORKBENCH_BRIDGE_ACTION_IDS`
3. Map payload in `default-workbench-command-bridge.ts` if new bridge action
4. Add unit tests in catalogue and bridge test suites
5. ADR if changing public action contract

**Do not** add built-in catalogue entries from capability manifests — use manifest actions instead.

---

## Task 3 — Add a capability action (manifest)

**When to use:** Platform themes, modules, services declaring executable behaviour.

**Example** (`packages/theme/themes/default/theme.yaml`):

```yaml
workbench:
  actions:
    - id: platform.theme.toggle
      label: Toggle Theme
      handler: service:theme-service:toggle
      permission: platform.theme.manage
      shortcut: Ctrl+Shift+T
      palette: true
      group: appearance
      icon: sun
      order: 10
      description: Switch between light and dark theme modes.
```

**Steps:**

1. Declare action under `workbench.actions` in capability manifest
2. Declare `permission` key (required for visibility)
3. Choose `handler`:
   - `workbench-bridge:workbench.navigation.reveal` — routes through bridge (**action id must be bridge-compatible today** — see gaps)
   - `service:…` — requires service implementation (currently `NOT_IMPLEMENTED`)
4. Run manifest validation tests
5. Verify bootstrap: `bootstrapActionRegistry` integration test pattern
6. E2E if user-visible

**Rules:**

- Action ids are immutable after release
- One permission key per action
- `palette: true` for Command Palette visibility
- `shortcut` for global chord registration

---

## Task 4 — Add a toolbar action

Toolbar items reference registered action ids — they do not define new actions.

```yaml
workbench:
  toolbar:
    - region: workspace
      items:
        - commandId: platform.theme.toggle
          icon: sun
          label: Toggle Theme
          order: 10
```

**Steps:**

1. Register the action first (Task 2 or 3)
2. Add toolbar item with matching `commandId`
3. Enable toolbar in shell: `enableToolbar toolbarRegion="workspace"`
4. Orphan items (unknown `commandId`) are omitted with extraction warnings

Regions: `workspace` is scaffolded. Additional regions require platform UX story.

---

## Task 5 — Add a command palette action

Palette visibility is controlled by the action descriptor:

```yaml
palette: true
group: Navigation
order: 5
```

No separate palette manifest block. The palette reads from the hydrated registry via `useCommandRegistry().list()`.

Default open shortcut **Ctrl+Shift+P** is shell-owned (not Action Registry).

---

## Task 6 — Add a shortcut

Declare on the action:

```yaml
shortcut: Ctrl+Shift+H
```

Shortcuts bootstrap into `ShortcutRegistry` at client hydration. Conflict detection runs at registration with diagnostics.

**Testing:** `register-shortcuts-from-actions.test.ts` patterns; E2E keyboard tests with `Control+Shift+…` on Linux/Windows.

**Known gap:** Manifest actions whose ids differ from bridge ids may not execute on shortcut press (TD-AF20-01). Prefer bridge-compatible ids or built-in catalogue actions until handler resolution is improved.

---

## Task 7 — Testing and documentation standards

Every action change requires:

| Requirement         | Command / location                                                |
| ------------------- | ----------------------------------------------------------------- |
| Unit tests          | `pnpm test` — registry, extraction, executor                      |
| Integration         | `platform-asset-bootstrap.integration.test.ts` pattern            |
| E2E (if UI-visible) | `testing/playwright/e2e/spr-004-action-framework.spec.ts` pattern |
| Coverage            | `pnpm test:coverage` — maintain ≥ 80% package thresholds          |
| Lint / types        | `pnpm lint && pnpm typecheck`                                     |
| Docs                | Update manifest comments; CHANGELOG if user-visible               |

PR quality gates (all stories):

```bash
pnpm lint && pnpm typecheck && pnpm build && pnpm test && pnpm test:coverage && pnpm test:e2e
```

---

## Onboarding verification checklist

A new engineer should be able to complete:

| Task                           | Documented | Runnable locally       | Gap                                              |
| ------------------------------ | ---------- | ---------------------- | ------------------------------------------------ |
| Understand Action Framework    | ✅         | ✅ palette + health    | —                                                |
| Add platform catalogue action  | ✅         | ✅ with bridge tests   | Requires ADR for new bridge ids                  |
| Add capability manifest action | ✅         | ✅ theme/home examples | Service handlers not implemented                 |
| Add toolbar item               | ✅         | ✅ workspace toolbar   | Extra regions not scaffolded                     |
| Add palette action             | ✅         | ✅ `palette: true`     | —                                                |
| Add shortcut                   | ✅         | ⚠ bridge id mismatch   | TD-AF20-01                                       |
| Follow testing standards       | ✅         | ✅ 672 tests           | apps/web hydration lacks Vitest integration test |

---

## Common mistakes

| Mistake                                            | Correct approach                                  |
| -------------------------------------------------- | ------------------------------------------------- |
| Hardcode commands in React                         | Declare in manifest; hydrate from registry        |
| Call engines from palette handler                  | `execute()` → executor → bridge → Request Bus     |
| Skip permission key                                | Every action needs `permission`                   |
| Mutate client registry                             | Server DTO is authoritative; read-only client     |
| Import `@apzhub/platform-runtime/server` in client | Server bootstrap only                             |
| Expect service handlers to work                    | Implement service or use workbench-bridge handler |

---

## Related guides

| Guide                                                                                | When                              |
| ------------------------------------------------------------------------------------ | --------------------------------- |
| [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md) | New capability with actions       |
| [Workbench Development Guide](../governance/APZHUB-Workbench-Development-Guide.md)   | Workbench API / shell integration |
| [Runtime Development Guide](../governance/APZHUB-Runtime-Development-Guide.md)       | Manifest schema changes           |

---

_Action Framework developer onboarding — Sprint 004 (AF-021)._
