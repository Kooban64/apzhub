# SPR-004 — Platform Asset Integration Summary (AF-019)

> **Story:** AF-019 — Platform Asset manifest scaffolding

---

## End-to-end flow

```text
Monorepo discovery
  packages/theme/themes/default/theme.yaml          (Platform Asset)
  packages/workbench-framework/manifests/...        (Platform Asset)
        ↓
Runtime.bootstrap({ workspaceRoot })
        ↓
Manifest Engine validates workbench.actions + workbench.toolbar
        ↓
bootstrapActionRegistry({ capabilityRecords })
        ├─ 8 builtin platform actions (catalogue)
        ├─ ≥ 2 manifest actions (theme + home)
        ├─ 1 workspace toolbar region (theme)
        └─ 2 shortcuts (Ctrl+Shift+T, Ctrl+Shift+H)
        ↓
filterActionRegistryDto() → apps/web hydration (AF-020)
```

---

## Verified integration points

| Layer       | Package                                        | Verification                                 |
| ----------- | ---------------------------------------------- | -------------------------------------------- |
| Schema      | `@apzhub/platform-runtime`                     | `workbench.toolbar` Zod schema               |
| Extraction  | `@apzhub/command-framework`                    | `extractToolbarRegionsFromCapabilities`      |
| Bootstrap   | `@apzhub/command-framework`                    | Auto toolbar extraction in bootstrap         |
| Shortcuts   | `@apzhub/command-framework`                    | `bootstrapShortcutRegistry(registry.list())` |
| Integration | `platform-asset-bootstrap.integration.test.ts` | Full monorepo Runtime → registry chain       |

---

## Platform Asset inventory (AF-019)

| Action id                | Source manifest             | Handler                                        | Shortcut       |
| ------------------------ | --------------------------- | ---------------------------------------------- | -------------- |
| `platform.theme.toggle`  | `theme.yaml`                | `service:theme-service:toggle`                 | `Ctrl+Shift+T` |
| `platform.home.navigate` | `platform-home/module.yaml` | `workbench-bridge:workbench.navigation.reveal` | `Ctrl+Shift+H` |

| Toolbar region | Items                   |
| -------------- | ----------------------- |
| `workspace`    | `platform.theme.toggle` |

---

## Client surfaces (unchanged execution)

Workbench surfaces consume hydrated DTO — no AF-019 surface changes:

- Command Palette — `list({ palette: true })`
- Toolbar — `dto.toolbar` regions
- Global shortcuts — `ShortcutRegistry` populated from manifest shortcuts

---

## Next step: AF-020

Wire `loadActionRegistryDto()` results into `CommandRegistryProvider` and enable shell surfaces in `apps/web`.
