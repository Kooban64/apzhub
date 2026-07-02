# APZHUB Registry Pattern — Extension Notes

> **Story:** AF-015 (documentation only)  
> **Status:** Emerging pattern — documented from Action Framework registries  
> **Related:** [ADR-0024](../adr/ADR-0024-command-framework-package.md) · [Platform Registry](./platform-registry.md)

---

## Purpose

APZHUB is converging on a consistent **Registry Pattern** for platform-owned indexes that map declarative metadata to runtime behaviour. AF-009 through AF-015 established two registries in `@apzhub/command-framework`:

1. **ActionRegistry** — action metadata, handlers, palette flags
2. **ShortcutRegistry** — keyboard chord → action id bindings

This document captures the emerging pattern for future platform registries (toolbar bindings, context predicates, search fusion, preference overrides) **without implementing them in AF-015**.

---

## Core principles

| Principle                                 | Description                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Registration, not execution**           | Registries store and resolve metadata; execution belongs in executors, bridges, and shell surfaces            |
| **Server authority**                      | Manifests and platform catalogues hydrate registries server-side; client receives immutable DTO snapshots     |
| **Normalisation at registration**         | External declarations (manifest strings) are normalised once at bootstrap — not at lookup time in UI          |
| **Conflict observability**                | Duplicate keys are reported via diagnostics — not silent overwrites or thrown errors (unless fatal bootstrap) |
| **DI at composition root**                | `createActionFrameworkContext()` / `CommandRegistryProvider` wire registries for consumers                    |
| **Presentation consumes read-only views** | Shell surfaces (`CommandPalette`, global shortcuts) read registries; they do not register actions             |

---

## Registry anatomy

```text
Declaration source (manifest | built-in catalogue)
        ↓
Extraction / bootstrap (server)
        ↓
Registry.register* (atomic phases where required)
        ↓
Serialisable DTO (client hydration)
        ↓
Read-only client view + diagnostics
        ↓
Shell surface or executor consumer
```

---

## ActionRegistry (reference implementation)

| Aspect             | Implementation                            |
| ------------------ | ----------------------------------------- |
| Package            | `@apzhub/command-framework`               |
| Key                | `action.id` (lowercase dot notation)      |
| Source             | Platform catalogue + capability manifests |
| Client hook        | `useCommandRegistry()`                    |
| Execution consumer | `DefaultActionExecutor`                   |
| Server filter      | Permission adapter (AF-005)               |

---

## ShortcutRegistry (AF-014 reference)

| Aspect             | Implementation                                    |
| ------------------ | ------------------------------------------------- |
| Package            | `@apzhub/command-framework`                       |
| Key                | Normalised chord (`Ctrl+Shift+T`)                 |
| Source             | `ActionDescriptor.shortcut` field                 |
| Client hook        | `useShortcutRegistry()`                           |
| Execution consumer | Shell listener → `useCommandRegistry().execute()` |
| Conflict detection | `getConflicts()`, `getDiagnostics()`              |

---

## Future registry candidates (not implemented)

| Registry                   | Key                           | Consumer                  | Sprint       |
| -------------------------- | ----------------------------- | ------------------------- | ------------ |
| ToolbarRegistry            | `region` + `commandId`        | Toolbar surface           | AF-017       |
| ContextMenuRegistry        | Action + `contextWhen` filter | Context menu surface      | AF-016       |
| PreferenceOverrideRegistry | User id + chord               | Shortcut preference layer | Document 023 |
| SearchFusionRegistry       | Query token + action id       | Palette ranking           | Milestone 5  |

Each should follow the same boundary: **resolve metadata → delegate execution elsewhere**.

---

## Anti-patterns

| Anti-pattern                     | Why rejected                                                    |
| -------------------------------- | --------------------------------------------------------------- |
| Registry executes handlers       | Blurs storage and policy; untestable surfaces                   |
| UI registers actions at runtime  | Violates server authority and permission model                  |
| Workbench Manager owns shortcuts | Document 019 / ADR-0024 — Command Framework owns input bindings |
| Silent duplicate overwrite       | Operators cannot detect manifest conflicts                      |
| Per-surface normalisation        | Inconsistent keys; duplicate logic                              |

---

## Testing guidance

1. **Unit-test registries** in `@apzhub/command-framework` — registration, lookup, conflicts, normalisation.
2. **Integration-test shell wiring** in `@apzhub/workspace` — keydown → resolve → executor mock.
3. **Do not E2E test normalisation** in Playwright — keep deterministic unit fixtures.

---

## Related documents

- [SPR-004 AF Shortcut Registry spec](../specs/SPR-004-AF-shortcut-registry.md)
- [SPR-004 AF Shortcut Integration summary](../specs/SPR-004-AF-shortcut-integration.md)
- [Input Framework extension notes](../../packages/command-framework/src/shortcuts/INPUT-FRAMEWORK.md)

---

_Registry Pattern documented in AF-015. Future registries should align with this pattern unless an ADR amends it._
