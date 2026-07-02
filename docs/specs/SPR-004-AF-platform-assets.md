# SPR-004 — Platform Asset Specification (AF-019)

> **Story:** AF-019 — Platform Asset manifest scaffolding  
> **Authority:** [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) · [ADR-0024](../adr/ADR-0024-command-framework-package.md)

---

## Objective

Provide built-in Platform Asset manifests for Actions, Toolbars, and Shortcuts so the Action Framework has meaningful default content — **no new execution behaviour**.

---

## Platform Assets vs Capability Assets

| Aspect              | Platform Assets             | Capability Assets           |
| ------------------- | --------------------------- | --------------------------- |
| Supplier            | APZHUB platform             | Registered capabilities     |
| `metadata.category` | `platform`                  | capability-specific         |
| Manifest schema     | Same `workbench` block      | Same `workbench` block      |
| Registry model      | Same extraction + bootstrap | Same extraction + bootstrap |
| Versioning          | Capability manifest version | Capability manifest version |

Both asset classes use identical manifest fields and flow through `bootstrapActionRegistry()`.

---

## Production Platform Asset manifests (AF-019)

| Manifest                                                           | Asset         | Declarations                                                               |
| ------------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------- |
| `packages/theme/themes/default/theme.yaml`                         | Default theme | `platform.theme.toggle` action, workspace toolbar, `Ctrl+Shift+T` shortcut |
| `packages/workbench-framework/manifests/platform-home/module.yaml` | Home scaffold | `platform.home.navigate` bridge action, `Ctrl+Shift+H` shortcut            |

---

## Manifest blocks

### Actions (`workbench.actions`)

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
```

Legacy alias: `workbench.commands` (merged at extraction).

### Toolbar (`workbench.toolbar`)

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

Orphan `commandId` references are omitted with extraction warnings (ADR-0025).

### Shortcuts

Declared on action rows via `shortcut:` — registered by `bootstrapShortcutRegistry()` after action population. No separate shortcut manifest block in Sprint 004.

---

## Bootstrap pipeline

```text
Runtime.bootstrap()
        ↓
mapPlatformCapabilitiesToActionRecords()
        ↓
bootstrapActionRegistry()
        ├─ registerPlatformActionCatalogue()     ← Platform Actions (builtin)
        ├─ populateRegistryFromCapabilities()    ← manifest actions
        ├─ extractToolbarRegionsFromCapabilities() ← manifest toolbar
        └─ bootstrapShortcutRegistry()           ← manifest shortcuts
        ↓
filterActionRegistryDto() → client hydration
```

---

## Extraction modules

| Module    | Path                                       | Role                           |
| --------- | ------------------------------------------ | ------------------------------ |
| Actions   | `extraction/extract-actions.ts`            | Manifest actions → descriptors |
| Toolbar   | `extraction/extract-toolbar.ts`            | Manifest toolbar → DTO regions |
| Shortcuts | `shortcuts/bootstrap-shortcut-registry.ts` | Descriptor.shortcut → registry |

---

## Diagnostics

`ActionRegistryHydrationDiagnostics` reports:

| Field                     | Description                             |
| ------------------------- | --------------------------------------- |
| `capabilityActionCount`   | Manifest-sourced actions                |
| `toolbarRegionCount`      | Extracted toolbar regions               |
| `toolbarItemCount`        | Total toolbar items after orphan filter |
| `registeredShortcutCount` | Actions with shortcut chords            |

---

## Fixtures

Reference copies: `packages/command-framework/fixtures/manifests/`

---

## Out of scope (AF-019)

- AI behaviour, gateway implementations, business capabilities
- New Workbench surfaces
- Service handler execution (handlers remain stubs)

---

## Related

- [Integration summary](./SPR-004-AF-platform-asset-integration.md)
- [AF-020 application wiring](./SPR-004-AF-integration.md#af-020--application-integration)
