# SPR-004 — Shortcut Registry Specification (AF-014)

> **Story:** AF-014 — ShortcutRegistry  
> **Authority:** [ADR-0024](../adr/ADR-0024-command-framework-package.md) · [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) · [Document 019](../019-universal-command-palette-action-framework.md)

---

## Objective

Map normalised keyboard chords to action IDs. The registry **stores**, **resolves**, and **reports conflicts** — it never executes actions.

Execution path (AF-015+):

```text
Keyboard event
      ↓
ShortcutRegistry.resolve(event) → actionId
      ↓
Workbench API.executeAction / ActionExecutor
      ↓
WorkbenchCommandBridge → Request Bus
```

---

## Package location

```text
packages/command-framework/src/shortcuts/
├── types.ts
├── normalise-chord.ts
├── default-shortcut-registry.ts
├── register-shortcuts-from-actions.ts
└── index.ts
```

---

## Types

```typescript
interface ShortcutRegistration {
  readonly commandId: string;
  readonly chord: string;
  readonly source: "manifest" | "builtin";
}

interface ShortcutConflict {
  readonly chord: string;
  readonly commandIds: readonly string[];
  readonly registrations: readonly ShortcutRegistration[];
}

interface ShortcutRegistryDiagnostics {
  readonly status: "ready" | "empty";
  readonly registrationCount: number;
  readonly uniqueChordCount: number;
  readonly conflictCount: number;
  readonly conflictChords: readonly string[];
}

interface ShortcutRegistry {
  register(registration: ShortcutRegistration): void;
  registerMany(registrations: readonly ShortcutRegistration[]): void;
  lookup(chord: string): string | null;
  resolve(event: KeyboardEventLike): string | null;
  getConflicts(): readonly ShortcutConflict[];
  getDiagnostics(): ShortcutRegistryDiagnostics;
  clear(): void;
}
```

---

## Chord normalisation

| Rule             | Behaviour                                                     |
| ---------------- | ------------------------------------------------------------- |
| Modifier aliases | `Ctrl`, `Control` → `Ctrl`; `Cmd`, `Command`, `Meta` → `Meta` |
| Key letters      | Case-insensitive → uppercase single letter                    |
| Modifier order   | Sorted: `Alt`, `Ctrl`, `Meta`, `Shift`, then key              |
| Example          | `shift+ctrl+p` → `Ctrl+Shift+P`                               |
| Example          | `Cmd+Shift+T` → `Meta+Shift+T`                                |

**Platform note:** manifest declares platform-specific chords explicitly. The registry does **not** auto-map `Ctrl` to `Meta` on macOS (per AF-014 surfaces spec).

---

## Manifest support

Workbench manifest actions may declare:

```yaml
workbench:
  actions:
    - id: platform.theme.toggle
      label: Toggle Theme
      shortcut: Ctrl+Shift+T
      handler: service:theme-service:toggle
```

At bootstrap / client hydration:

```typescript
registerShortcutsFromActions(shortcutRegistry, actionDescriptors);
```

Only actions with a non-empty `shortcut` field are registered.

---

## Duplicate detection

When two distinct action ids register the same normalised chord:

1. Both registrations are retained for diagnostics
2. `getConflicts()` lists the chord and conflicting command ids
3. `lookup()` / `resolve()` return the **first registered** action id
4. `getDiagnostics().conflictCount` reflects conflict cardinality

The registry does not throw on duplicate chords — conflicts are observable via diagnostics.

---

## Dependency injection

`ActionFrameworkContext` includes `shortcuts: ShortcutRegistry`:

```typescript
const ctx = createActionFrameworkContext({
  registry,
  shortcuts: createDefaultShortcutRegistry(),
  executor,
});
```

Server bootstrap (`bootstrapActionRegistry`) and client hydration (`createCommandRegistryFromDto`) populate shortcuts from registered action descriptors.

---

## Workbench API integration

Integration helpers live in `packages/command-framework/src/integration/workbench-shortcut-integration.ts`:

| Function                                                              | Responsibility                                     |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| `resolveShortcutActionId(registry, event)`                            | Resolve only — returns action id or null           |
| `executeShortcutViaWorkbenchApi(shortcuts, executor, event, options)` | Resolve then delegate to `WorkbenchActionExecutor` |

The ShortcutRegistry class itself **never** executes actions.

---

## Out of scope (AF-014)

| Item                                        | Target story           |
| ------------------------------------------- | ---------------------- |
| Shell global keydown listener               | AF-015                 |
| User preference overrides                   | Document 023 — future  |
| Palette open shortcut (`Ctrl+Shift+P`)      | Shell concern (AF-012) |
| Context menus, toolbar, AI, voice, gestures | AF-016+                |

---

## Tests

| Area                            | Location                                  |
| ------------------------------- | ----------------------------------------- |
| Normalisation                   | `normalise-chord.test.ts`                 |
| Registration / lookup / resolve | `default-shortcut-registry.test.ts`       |
| Manifest field bootstrap        | `register-shortcuts-from-actions.test.ts` |
| Workbench API path              | `workbench-shortcut-integration.test.ts`  |
| DI context                      | `index.test.ts`                           |

---

_Shortcut Registry — AF-014 complete. Shell listener deferred to AF-015._
