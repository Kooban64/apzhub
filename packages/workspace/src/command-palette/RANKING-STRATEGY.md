# Command Palette — Ranking Strategy Extension Point

> **Story:** AF-013 (documentation only)  
> **Package:** `@apzhub/workspace` / `@apzhub/command-framework`  
> **Status:** Extension point — **not implemented in palette**

---

## Purpose

The Command Palette is a **Workbench Surface** with **presentation-only** responsibilities. Search ranking and result ordering are **not** palette concerns.

AF-012 introduced a default ranking implementation in `@apzhub/command-framework`:

```text
packages/command-framework/src/registry/search.ts
  └─ searchActionDescriptors()   ← current default strategy
```

AF-013 documents how a future story may replace or compose ranking **without** moving logic into the palette component.

---

## Architectural boundary

| Layer                                                   | Responsibility                                          |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `CommandPalette` (`@apzhub/ui`)                         | Render rows, keyboard focus, empty/loading states       |
| `WorkbenchCommandPalette` (`@apzhub/workspace`)         | Wire registry → filter → map → presentation             |
| `searchActionDescriptors` (`@apzhub/command-framework`) | **Current** ranking/filter implementation               |
| Future `RankingStrategy`                                | Pluggable ordering injected at workspace shell boundary |

The palette **must not**:

- Implement ranking algorithms
- Re-order results for business rules
- Evaluate permissions to influence rank
- Register actions or execute handlers

---

## Proposed extension point (AF-014+)

Future work may introduce a pure function interface at the workspace layer:

```typescript
/** Pure ranking strategy — injected by shell, not implemented by palette UI. */
export interface CommandPaletteRankingStrategy {
  rank(
    actions: readonly ActionDescriptor[],
    query: string,
  ): readonly ActionDescriptor[];
}
```

### Default strategy (current)

```typescript
const defaultRankingStrategy: CommandPaletteRankingStrategy = {
  rank: (actions, query) => searchActionDescriptors(actions, query),
};
```

### Example future strategies (out of scope for AF-013)

| Strategy              | Use case                                   | Owner                        |
| --------------------- | ------------------------------------------ | ---------------------------- |
| Substring-only        | Deterministic baseline                     | command-framework            |
| Fuzzy score (current) | Discovery UX                               | command-framework            |
| Group-priority        | Platform actions before capability actions | workspace shell              |
| Context-aware rank    | Boost actions matching active surface      | workbench provider (AF-015+) |

**Important:** Context-aware or permission-aware ranking belongs **outside** the palette UI — typically in `WorkbenchCommandPalette` or a dedicated provider that supplies **pre-ranked** descriptors to `mapActionsToPaletteItems()`.

---

## Integration pattern

```text
useCommandRegistry().list()
        │
        ▼
RankingStrategy.rank(actions, debouncedQuery)   ← future injectable hook
        │
        ▼
mapActionsToPaletteItems(ranked, { pinnedActionIds })
        │
        ▼
CommandPalette (presentation only)
```

Pinned actions (AF-013) are a **presentation** concern applied **after** ranking via `pinnedActionIds` — they do not alter rank scores.

---

## Testing guidance (future)

When a ranking strategy is extracted:

1. Unit-test strategies in `@apzhub/command-framework` or `@apzhub/workspace` — not in `@apzhub/ui`.
2. Keep palette component tests focused on rendering and interaction.
3. Preserve deterministic ordering fixtures for regression tests.

---

## Related documents

- [SPR-004 AF Palette spec](../../../../docs/specs/SPR-004-AF-palette.md)
- [Document 019 — Universal Command Palette](../../../../docs/019-universal-command-palette-action-framework.md)
- [AF-012 completion report](../../../../docs/sprint/AF-012-completion-report.md)

---

_Ranking strategy remains documented only in AF-013. Implementation deferred to AF-014+._
