# SPR-004 — Surfaces Technical Specifications (AF-014 – AF-019)

> **Stories:** AF-014 through AF-019  
> **ADRs:** [0025](../adr/ADR-0025-workbench-commands-manifest.md) · [0026](../adr/ADR-0026-command-execution-model.md)

---

## AF-014 — ShortcutRegistry

### Objective

Map normalised key chords to command IDs; detect conflicts.

### Types

```typescript
interface ShortcutRegistration {
  readonly commandId: string;
  readonly chord: string;
  readonly source: "manifest" | "builtin";
}

class ShortcutRegistry {
  register(reg: ShortcutRegistration): void;
  resolve(event: KeyboardEventLike): string | null;
  getConflicts(): readonly ShortcutConflict[];
  getDiagnostics(): ShortcutRegistryDiagnostics;
}
```

### Normalisation rules

- Normalise `Ctrl` / `Meta` / `Cmd` to canonical internal form
- Case-insensitive key letters
- Order: modifier+key sorted consistently (e.g. `Ctrl+Shift+P`)

Document platform behaviour: macOS maps `Ctrl` in manifest to `Meta` for palette-only shortcuts is **not** applied — manifest declares platform-specific chords explicitly in AF-019 scaffolds.

### Population

Built from `PlatformCommand.shortcut` at registry bootstrap (AF-009 + manifest extraction).

### Tests

- Register and resolve chord
- Conflict: two commands same chord → listed in getConflicts()
- Resolve with no match returns null

### Files

```text
packages/command-framework/src/shortcuts/shortcut-registry.ts
packages/command-framework/src/shortcuts/normalise-chord.ts
```

**Implemented (AF-014):** see [SPR-004-AF-shortcut-registry.md](./SPR-004-AF-shortcut-registry.md).

---

## AF-015 — Shell global shortcut listener

### Objective

Execute commands on registered shortcuts (excluding palette open chord).

### Implementation

`packages/workspace/src/desktop-shell/global-shortcuts.ts`

- Listen `keydown` on document or shell root
- Call `ShortcutRegistry.resolve(event)`
- If match → `useCommandRegistry().execute(commandId)`
- `preventDefault()` when handled

Exclude when palette input focused or modal open.

**Implemented (AF-015):** see [SPR-004-AF-shortcut-integration.md](./SPR-004-AF-shortcut-integration.md).

### Tests

- Integration: mock keydown → execute called with commandId
- E2E (optional): if AF-019 adds theme toggle shortcut — verify side effect or executor call mock

---

## AF-016 — Context menu API and shell component

### Objective

Right-click menu filtered by context predicates.

### Registry extension

Extend `CommandRegistry.list()`:

```typescript
list({
  surface: "workspace",
  selection: selectionSnapshot,
  context: contextSnapshot,
}): PlatformCommand[]
```

Filter logic in `packages/command-framework/src/registry/context-filter.ts`:

- Match `contextWhen.surfaces`
- Match `contextWhen.selectionKinds` against selection mode
- Match `contextWhen.contextTypes` against context engine type

**Implemented (AF-016):** see [SPR-004-AF-context-menu.md](./SPR-004-AF-context-menu.md).

### UI component

`packages/ui/src/context-menu/` — presentational menu

`packages/workspace/src/context-menu/` — provider, shell surface, diagnostics

### Execution

Menu item click → `execute(commandId, { actor: "user" })`.

### Tests

- Unit: context filter with fixtures
- Component: menu renders filtered items
- axe: menu accessible (deferred)

---

## AF-017 — Toolbar manifest and shell component

### Objective

Render toolbar buttons from manifest DTO.

### Validation

Toolbar extraction in AF-004; orphan `commandId` → omit item + diagnostic.

### UI

`packages/workspace/src/toolbar/` — provider, shell surface, diagnostics

- Receives toolbar regions from hydrated DTO via `useCommandRegistry().toolbar`
- Renders icon buttons per region
- Tooltip from label
- onClick → execute(commandId)

**Implemented (AF-017):** see [SPR-004-AF-toolbar.md](./SPR-004-AF-toolbar.md).

### Regions (Sprint 004)

Implement `workspace` region only; others stub empty.

### Tests

- Unit: toolbar DTO maps to buttons
- Component: click fires onExecute

---

## AF-019 — Scaffold platform command manifests

### Objective

Add real YAML declarations to existing scaffolds.

### Target manifests (minimum)

| Manifest                                   | Commands                                        |
| ------------------------------------------ | ----------------------------------------------- |
| `packages/theme/themes/default/theme.yaml` | `platform.theme.toggle` (service handler stub)  |
| Platform admin/home scaffold               | One navigation-related workbench-bridge command |

### Requirements

- Valid per ADR-0025 schema
- Discovered in integration test after `Runtime.bootstrap()`
- Appear in filtered DTO count ≥ 2

### Tests

- Integration in command-framework: bootstrap extracts commands, toolbar, shortcuts
- Fixture validation tests

**Implemented (AF-019):** see [SPR-004-AF-platform-assets.md](./SPR-004-AF-platform-assets.md).

---

_Surfaces specifications — AF-014/015 sequential; AF-016/017 after AF-010; AF-019 after AF-004/005._
