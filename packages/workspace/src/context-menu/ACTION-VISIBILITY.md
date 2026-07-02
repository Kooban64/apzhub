# Action Visibility — Extension Notes (AF-016)

> **Story:** AF-016 (documentation only)  
> **Status:** Future model — not implemented in Sprint 004  
> **Related:** [ADR-0025](../../adr/ADR-0025-workbench-commands-manifest.md) · [Context Menu spec](../../../../docs/specs/SPR-004-AF-context-menu.md)

---

## Purpose

Context menus, toolbars, and palettes must eventually distinguish **whether an action appears** and **whether it is interactive**. AF-016 implements presentation-only `disabled` flags hydrated from the server — permission evaluation remains server-side.

This document defines the future **Action Visibility** model without implementing it in AF-016.

---

## Visibility states (future)

| State                    | User experience                      | Registry / server responsibility                         |
| ------------------------ | ------------------------------------ | -------------------------------------------------------- |
| **Hidden**               | Action not shown in surface list     | Filtered before client hydration or by context predicate |
| **Visible but disabled** | Row/menu item shown, non-interactive | `ActionDescriptor.disabled: true` (presentation flag)    |
| **Visible and enabled**  | Row/menu item shown and executable   | Default when present in filtered list                    |

---

## Current Sprint 004 behaviour (AF-016)

| Visibility           | AF-016 implementation                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| Hidden               | `contextWhen` predicates + server permission filter remove actions from hydrated DTO |
| Visible but disabled | `disabled: true` on descriptor → menu item rendered with `aria-disabled`             |
| Visible and enabled  | Default menu item — click invokes `useCommandRegistry().execute()`                   |

The Context Menu **does not evaluate permissions**. Disabled state is declarative metadata only.

---

## Future extension points

### Server-side visibility (preferred for Hidden)

```typescript
interface ActionVisibilityDto {
  readonly actionId: string;
  readonly visibility: "hidden" | "disabled" | "enabled";
  readonly reason?: string;
}
```

Server applies visibility before serialising `ActionRegistryDto` — client surfaces remain presentation-only.

### Client-side visibility adapter (future)

A read-only adapter may compose:

1. Context predicate filter (`filterActionsByContext`)
2. Permission-filtered DTO (server)
3. User preference overrides (Document 023)

Surfaces consume the composed list — they do not compute visibility rules.

---

## Surface-specific notes

| Surface            | Hidden                           | Disabled presentation                   |
| ------------------ | -------------------------------- | --------------------------------------- |
| Command Palette    | Omitted from search results      | Row shown, skip select (AF-013)         |
| Context Menu       | Omitted when `contextWhen` fails | Menu item shown, skip click (AF-016)    |
| Toolbar (AF-017)   | Button omitted                   | Button shown, `aria-disabled` (planned) |
| Shortcuts (AF-015) | Unregistered chords              | N/A — shortcuts resolve or null         |

---

## Anti-patterns

| Anti-pattern                                      | Why rejected                                       |
| ------------------------------------------------- | -------------------------------------------------- |
| Surface evaluates `permission` field              | Violates presentation-only Workbench Surface rules |
| Separate context-menu registry                    | Duplicates ActionRegistry — ADR-0024               |
| Hidden actions returned with `display: none` only | Wastes hydration payload; server should filter     |

---

## Related documents

- [SPR-004 AF Context Menu spec](../../../../docs/specs/SPR-004-AF-context-menu.md)
- [APZHUB Registry Pattern](../../architecture/APZHUB-Registry-Pattern.md)

---

_Action Visibility model documented in AF-016. Implementation deferred to server visibility DTO + preference layers._
