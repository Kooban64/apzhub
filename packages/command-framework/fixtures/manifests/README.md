# Platform Asset Manifest Fixtures (AF-019)

Reference manifests for platform Action, Toolbar, and Shortcut scaffolding.

| File                         | Platform asset                         | Declares                  |
| ---------------------------- | -------------------------------------- | ------------------------- |
| `platform-theme-assets.yaml` | Theme (`apzhub-default-theme` pattern) | Action, toolbar, shortcut |
| `platform-home-assets.yaml`  | Home module (`platform-home` pattern)  | Action, shortcut          |

Production manifests:

- `packages/theme/themes/default/theme.yaml`
- `packages/workbench-framework/manifests/platform-home/module.yaml`

Both use `metadata.category: platform` — **Platform Assets** supplied by APZHUB. Capability Assets use the same schema with capability-owned ids.
