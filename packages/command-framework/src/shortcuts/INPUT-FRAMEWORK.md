# Input Framework — Extension Notes (AF-014)

> **Story:** AF-014 (documentation only for broader framework)  
> **Package:** `@apzhub/command-framework`  
> **Status:** Extension point — Shortcut Registry is the first input binding surface

---

## Purpose

Sprint 004 introduces keyboard shortcut bindings as the first **input resolution** layer in the Action Framework. AF-014 implements **ShortcutRegistry** only. This document describes how future input modalities may extend the same architectural pattern without duplicating execution paths.

---

## Current scope (AF-014)

```text
KeyboardEventLike
      ↓
ShortcutRegistry.resolve() → actionId
      ↓
Workbench API / ActionExecutor (AF-015 shell wiring)
```

The Shortcut Registry:

- Stores chord → action id mappings
- Normalises chords and detects conflicts
- Exposes diagnostics
- **Does not** execute, evaluate permissions, or mutate workbench state

---

## Architectural boundary

| Component                 | Owns                                             | Must not own                            |
| ------------------------- | ------------------------------------------------ | --------------------------------------- |
| `ShortcutRegistry`        | Chord storage, lookup, conflict diagnostics      | Action execution, permission checks, UI |
| `ActionRegistry`          | Action metadata, handlers, palette flags         | Keyboard event handling                 |
| `ActionExecutor`          | Permission-gated execution routing               | Shortcut chord normalisation            |
| `@apzhub/workspace` shell | Global listeners, focus guards, palette shortcut | Registry storage                        |
| `@apzhub/ui`              | Presentation surfaces                            | Input device routing                    |

All user-facing execution continues through:

**Workbench API → Action Framework → WorkbenchCommandBridge**

---

## Future Input Framework (not implemented)

A broader Input Framework may unify multiple binding sources behind a common resolver interface:

```typescript
/** Future extension — not implemented in AF-014. */
interface InputBindingResolver {
  resolve(input: InputEventEnvelope): string | null;
}

interface InputEventEnvelope {
  readonly kind: "keyboard" | "voice" | "gesture" | "automation";
  readonly payload: unknown;
}
```

### Planned modality mapping

| Modality                      | Resolver (future)               | Sprint 004 status |
| ----------------------------- | ------------------------------- | ----------------- |
| Keyboard shortcuts            | `ShortcutRegistry`              | ✅ AF-014         |
| Command Palette search/select | Shell + registry list           | ✅ AF-011–013     |
| Context menu                  | Filtered action list            | AF-016            |
| Toolbar buttons               | Command id reference            | AF-017            |
| Voice commands                | Voice gateway stub              | AF-018 stub       |
| Automation / AI triggers      | Gateway stubs                   | AF-018 stub       |
| Mouse gestures                | Not planned Sprint 004          | Out of scope      |
| User preference overrides     | Preference layer above registry | Document 023      |

Each resolver would produce an **action id** only. Execution remains in `ActionExecutor` / Workbench API.

---

## Integration pattern for AF-015+

```text
DesktopShell keydown listener (AF-015)
      ↓
ShortcutRegistry.resolve(event)
      ↓
executeShortcutViaWorkbenchApi() OR useCommandRegistry().execute()
      ↓
DefaultActionExecutor → bridge → Request Bus
```

Focus guards (editable fields, open modals, palette combobox) belong in the **shell listener**, not in ShortcutRegistry.

---

## Conflict and preference evolution

| Phase  | Behaviour                                                       |
| ------ | --------------------------------------------------------------- |
| AF-014 | Manifest + built-in chords; duplicate detection via diagnostics |
| Future | User preference overrides (Document 023) layer above registry   |
| Future | Admin policy to disable conflicting platform shortcuts          |

ShortcutRegistry remains the **authoritative chord index**; preference layers compose rather than replace.

---

## Testing guidance

1. Unit-test chord normalisation and registry behaviour in `@apzhub/command-framework`.
2. Integration-test Workbench API execution path separately from registry storage.
3. Shell listener tests (AF-015) mock registry resolve — do not re-test normalisation.

---

## Related documents

- [SPR-004 AF Shortcut Registry spec](../../../../docs/specs/SPR-004-AF-shortcut-registry.md)
- [SPR-004 AF Surfaces spec](../../../../docs/specs/SPR-004-AF-surfaces.md)
- [ADR-0024 — Command Framework Package](../../../../docs/adr/ADR-0024-command-framework-package.md)
- [Document 019 — Universal Command Palette](../../../../docs/019-universal-command-palette-action-framework.md)

---

_Input Framework extension documented in AF-014. Additional input devices deferred to future milestones._
