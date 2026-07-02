# AF-019 — Completion Report

> **Story:** AF-019 — Platform Asset manifest scaffolding  
> **Sprint:** SPR-004 — Action Framework  
> **Date:** 2026-06-28  
> **Status:** Complete — **await review before AF-020**

---

## Objective

Complete Platform Asset manifest scaffolding — built-in manifests for platform Actions, Toolbars, and Shortcuts with bootstrap extraction and registry population. No new execution behaviour.

---

## Acceptance criteria

| Criterion                                            | Status |
| ---------------------------------------------------- | ------ |
| Platform Action manifests                            | ✅     |
| Platform Toolbar manifests                           | ✅     |
| Platform Shortcut manifests                          | ✅     |
| Bootstrap extraction                                 | ✅     |
| Registry population                                  | ✅     |
| Integration tests                                    | ✅     |
| Diagnostics                                          | ✅     |
| Platform vs Capability Asset distinction documented  | ✅     |
| No AI, gateways, business capabilities, new surfaces | ✅     |
| All quality gates pass                               | ✅     |

---

## Platform Asset manifests

| File                                                               | Declarations                                               |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `packages/theme/themes/default/theme.yaml`                         | `platform.theme.toggle`, workspace toolbar, `Ctrl+Shift+T` |
| `packages/workbench-framework/manifests/platform-home/module.yaml` | `platform.home.navigate`, `Ctrl+Shift+H`                   |

---

## Engineering changes

| Package           | Change                                           |
| ----------------- | ------------------------------------------------ |
| platform-runtime  | `workbench.toolbar` Zod schema + helpers         |
| command-framework | `extractToolbarRegionsFromCapabilities`          |
| command-framework | Auto toolbar extraction in bootstrap             |
| command-framework | Hydration diagnostics: toolbar + shortcut counts |
| command-framework | Fixtures + integration test                      |

---

## Test results

| Suite                                          | Focus                               |
| ---------------------------------------------- | ----------------------------------- |
| `extract-toolbar.test.ts`                      | Region merge, orphan filter, dedupe |
| `platform-asset-fixtures.test.ts`              | Fixture YAML validation             |
| `platform-asset-bootstrap.integration.test.ts` | Runtime → bootstrap chain           |
| `platform-action-catalogue.test.ts`            | Toolbar + shortcut diagnostics      |
| `workbench-actions.test.ts`                    | Toolbar schema validation           |

**Monorepo total:** **668** (+7 vs AF-018)

### Scenarios covered

- Manifest action extraction
- Toolbar region extraction with orphan omission
- Shortcut population from manifest `shortcut` fields
- Bootstrap integration after `Runtime.bootstrap()`
- Hydration diagnostics reporting

---

## Coverage

Monorepo statement coverage: **91.44%**

---

## Quality gates

| Gate                 | Result        |
| -------------------- | ------------- |
| `pnpm lint`          | ✅            |
| `pnpm typecheck`     | ✅            |
| `pnpm build`         | ✅            |
| `pnpm test`          | ✅ 668 passed |
| `pnpm test:coverage` | ✅ 91.44%     |

---

## Technical debt

| ID         | Item                                                                        | Target                     |
| ---------- | --------------------------------------------------------------------------- | -------------------------- |
| TD-AF19-01 | Service handler `platform.theme.toggle` not implemented                     | Future theme service story |
| TD-AF19-02 | Toolbar regions beyond `workspace` not scaffolded                           | Future platform UX         |
| TD-AF19-03 | Dedicated shortcut manifest block deferred                                  | Future ADR revision        |
| TD-AF19-04 | `apps/web` still uses empty toolbar until AF-020 wiring verified end-to-end | AF-020                     |
| TD-AF19-05 | Orphan toolbar warnings not surfaced in production diagnostics UI           | AF-020 / future            |

---

## Recommendations for AF-020

1. **Wire `loadActionRegistryDto()`** into `CommandRegistryProvider` on authenticated shell load.
2. **Enable shell surfaces** — palette, global shortcuts, context menu, toolbar via `DesktopShell` props.
3. **Inject `DefaultActionExecutor`** with bridge into `createWorkbenchAPI()`.
4. **Verify production build** with `@apzhub/command-framework` transpiled.
5. **Expose hydration diagnostics** optionally in health endpoint (non-breaking).

---

## Documentation

- [Platform Asset specification](../specs/SPR-004-AF-platform-assets.md)
- [Integration summary](../specs/SPR-004-AF-platform-asset-integration.md)

---

AF-019 complete. **Do not begin AF-020** until this report is reviewed and approved.
