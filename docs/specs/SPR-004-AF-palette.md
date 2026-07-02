# SPR-004 — Command Palette Technical Specifications (AF-010 – AF-013)

> **Stories:** AF-010 through AF-013  
> **Authority:** [Document 019](../019-universal-command-palette-action-framework.md) · [ADR-0024](../adr/ADR-0024-command-framework-package.md)

---

## AF-010 — Client hydration and `useCommandRegistry`

### Objective

Hydrate CommandRegistry from server DTO; expose React hook.

### Server payload (apps/web — specified here; implemented AF-020)

Extend workbench hydration response:

```typescript
interface ShellHydrationPayload {
  readonly workbench: WorkbenchRegistryDto;
  readonly commands: CommandRegistryDto; // new
}
```

### Client bootstrap

```typescript
// @apzhub/command-framework/react

function createCommandRegistryFromDto(dto: CommandRegistryDto): {
  registry: CommandRegistry;
  executor: CommandExecutor;
};

function useCommandRegistry(): {
  readonly isReady: boolean;
  readonly commands: readonly PlatformCommand[];
  list(options?: CommandRegistryListOptions): PlatformCommand[];
  execute(
    commandId: string,
    args?: Record<string, unknown>,
  ): Promise<CommandExecutionResult>;
};
```

Hook reads from React context provided by app provider (AF-020).

### Dependencies injected at provider

- `CommandRegistry` populated from DTO + built-ins
- `CommandExecutor` with bridge and workbench execute closure
- `WorkbenchPermissionAdapter` from existing workbench provider

### Tests

- Unit: DTO → registry round-trip
- Unit: list({ query: "theme" }) filters labels
- Component test (if setup exists): hook returns isReady after provider mount

### Files

```text
packages/command-framework/src/react/command-registry-context.tsx
packages/command-framework/src/react/use-command-registry.ts
packages/command-framework/src/react/create-from-dto.ts
```

---

## AF-011 — CommandPalette shell component

### Objective

Modal command list UI in Desktop Shell.

### Location

Primary: `packages/workspace/src/command-palette/` or `packages/ui/src/command-palette/`

**Decision for AF-011:** `@apzhub/ui` — presentational component; `@apzhub/workspace` — shell placement and open state.

### Component API

```typescript
interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly commands: readonly PlatformCommand[];
  readonly onSelect: (commandId: string) => void;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
}
```

### UX requirements (Document 019)

- Modal overlay centred or top (match VS Code pattern — top centre preferred)
- Input field auto-focused on open
- List virtualisation not required for Sprint 004 (< 100 commands expected)
- Keyboard: ArrowUp/Down, Enter, Escape
- aria-role: `dialog`, `aria-modal="true"`, listbox pattern for items

### Design tokens

Use `@apzhub/theme` tokens only — no hardcoded hex values.

### Tests

- Component render with 3 mock commands
- axe: no critical violations when open

---

## AF-012 — Palette activation shortcut and fuzzy search

### Objective

Global shortcut opens palette; improved search ranking.

### Shortcut

| Platform      | Default chord  |
| ------------- | -------------- |
| Windows/Linux | `Ctrl+Shift+P` |
| macOS         | `Meta+Shift+P` |

Implement in `@apzhub/workspace` DesktopShell — single keydown handler delegates to palette state.

**Note:** Palette shortcut handled separately from ShortcutRegistry (AF-014) to avoid circular dependency — palette open is shell concern, not command execution.

### Search algorithm

Sprint 004 minimum: case-insensitive substring match on `label` and `id`.

Optional enhancement (if no new dependency): simple score — prefix match ranks higher.

**If fuzzy library needed:** require ADR amendment — default spec is **substring only** for AF-012.

Debounce: 50–100ms on query input.

### Files

```text
packages/command-framework/src/registry/search.ts   # pure filter function
packages/workspace/src/desktop-shell/palette-shortcut.ts
```

### Tests

- Unit: search ranks "Toggle Theme" for query "theme"
- Component: shortcut keydown sets open=true

---

## AF-013 — Command Palette presentation enhancement

### Objective

Improve Command Palette discoverability and usability through richer presentation — **no new execution behaviour**.

### Scope (AF-013)

| Feature                    | Layer                             | Notes                                                            |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| Action icons               | `@apzhub/ui` `CommandPalette`     | Glyph from `icon` or label initial                               |
| Action descriptions        | `@apzhub/ui` + descriptor mapping | Optional `description` on `ActionDescriptor`                     |
| Shortcut display           | `@apzhub/ui`                      | `<kbd>` badge — presentation only                                |
| Disabled presentation      | `@apzhub/ui`                      | `aria-disabled`, skip select — no permission evaluation          |
| Group separators           | `@apzhub/ui`                      | Section headers from `group` field                               |
| Pinned actions             | `@apzhub/workspace`               | Optional `pinnedActionIds` prop                                  |
| Empty-state copy           | `@apzhub/ui`                      | `CommandPaletteEmptyState`                                       |
| Loading-state copy         | `@apzhub/ui`                      | `CommandPaletteLoadingState`                                     |
| Ranking strategy extension | Documentation                     | See `packages/workspace/src/command-palette/RANKING-STRATEGY.md` |

### Presentation-only rules

The palette **must not**:

- Evaluate permissions
- Register actions
- Execute business logic
- Handle shortcut chords
- Implement ranking logic

### Component API (AF-013)

```typescript
interface CommandPaletteItem {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: string;
  readonly description?: string;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly pinned?: boolean;
}

interface CommandPaletteEmptyState {
  readonly title: string;
  readonly description?: string;
}

interface CommandPaletteLoadingState {
  readonly message: string;
  readonly description?: string;
}

interface WorkbenchCommandPaletteProps {
  readonly pinnedActionIds?: readonly string[];
  readonly emptyState?: CommandPaletteEmptyState;
  readonly loadingState?: CommandPaletteLoadingState;
}
```

### Files

```text
packages/ui/src/components/command-palette/
  command-palette.tsx
  build-palette-rows.ts
  types.ts
packages/workspace/src/command-palette/
  map-palette-items.ts
  RANKING-STRATEGY.md
packages/command-framework/src/types/action-descriptor.ts   # description, disabled
```

### Tests

- Icons, descriptions, shortcuts, disabled rows, group headers, pinned section
- Enhanced empty and loading states
- Mapper unit tests for descriptor → palette row fields

### Deferred (not AF-013)

- Toolbar, context menus, AI, recent actions, history, personalisation
- Ranking strategy implementation (AF-014+)
- Playwright E2E (AF-020 prerequisites)

---

## AF-013 (original spec) — Command Palette E2E

> **Note:** E2E verification was re-scoped. AF-013 in Sprint 004 delivery covers presentation enhancement above. Playwright scenarios remain planned for a later story once AF-020 hydration lands in `apps/web`.

### File (deferred)

`testing/playwright/e2e/spr-004-command-palette.spec.ts`

### Scenarios (deferred)

1. **Open palette** — authenticated user presses Ctrl+Shift+P; palette visible
2. **Search** — type partial command label; list filters
3. **Execute** — select command; assert route or shell state change

### Prerequisites

AF-008, AF-012, AF-020 merged (or feature complete in branch under test).

---

_Command Palette specifications — implement AF-010 through AF-013 sequentially after foundation stories._
