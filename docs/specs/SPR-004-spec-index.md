# SPR-004 — Technical Specification Index

> **Status:** Active — AF-001 complete  
> **Sprint:** SPR-004 — Action Framework  
> **Authority:** [SPR-004 backlog](../backlog/SPR-004-action-framework-backlog.md) · ADRs 0024–0026

---

## ADRs (AF-001)

| ADR                                                        | Title                                 | Status   |
| ---------------------------------------------------------- | ------------------------------------- | -------- |
| [ADR-0024](../adr/ADR-0024-command-framework-package.md)   | Command Framework Package             | Accepted |
| [ADR-0025](../adr/ADR-0025-workbench-commands-manifest.md) | Workbench Commands Manifest Extension | Accepted |
| [ADR-0026](../adr/ADR-0026-command-execution-model.md)     | Command Execution and Actor Model     | Accepted |

---

## Specification documents

| Document                                                 | Stories         | Description                                           |
| -------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| [SPR-004-spec-template.md](./SPR-004-spec-template.md)   | All             | Story spec template                                   |
| [SPR-004-AF-foundation.md](./SPR-004-AF-foundation.md)   | AF-002 – AF-009 | Package, registry, manifest, filter, executor, bridge |
| [SPR-004-AF-palette.md](./SPR-004-AF-palette.md)         | AF-010 – AF-013 | Client hydration, Command Palette UI, E2E             |
| [SPR-004-AF-surfaces.md](./SPR-004-AF-surfaces.md)       | AF-014 – AF-019 | Shortcuts, context menu, toolbar, scaffolds           |
| [SPR-004-AF-integration.md](./SPR-004-AF-integration.md) | AF-018 – AF-022 | Gateways, app wiring, docs, closeout                  |

---

## Story quick reference

| Story  | Title                             | Spec section                                               | ADR        |
| ------ | --------------------------------- | ---------------------------------------------------------- | ---------- |
| AF-001 | Technical specifications and ADRs | This index                                                 | 0024–0026  |
| AF-002 | Package scaffold                  | [Foundation § AF-002](./SPR-004-AF-foundation.md#af-002)   | 0024       |
| AF-003 | CommandRegistry core              | [Foundation § AF-003](./SPR-004-AF-foundation.md#af-003)   | 0024       |
| AF-004 | Manifest commands validation      | [Foundation § AF-004](./SPR-004-AF-foundation.md#af-004)   | 0025       |
| AF-005 | Server command filter DTO         | [Foundation § AF-005](./SPR-004-AF-foundation.md#af-005)   | 0025, 0023 |
| AF-006 | CommandExecutor and actor model   | [Foundation § AF-006](./SPR-004-AF-foundation.md#af-006)   | 0026       |
| AF-007 | WorkbenchCommandBridge            | [Foundation § AF-007](./SPR-004-AF-foundation.md#af-007)   | 0026, 0024 |
| AF-008 | Workbench API bridge integration  | [Foundation § AF-008](./SPR-004-AF-foundation.md#af-008)   | 0026       |
| AF-009 | Built-in command catalogue        | [Foundation § AF-009](./SPR-004-AF-foundation.md#af-009)   | 0024       |
| AF-010 | Client hydration + hook           | [Palette § AF-010](./SPR-004-AF-palette.md#af-010)         | 0024       |
| AF-011 | CommandPalette UI                 | [Palette § AF-011](./SPR-004-AF-palette.md#af-011)         | 019        |
| AF-012 | Palette shortcut + search         | [Palette § AF-012](./SPR-004-AF-palette.md#af-012)         | 019        |
| AF-013 | Palette E2E                       | [Palette § AF-013](./SPR-004-AF-palette.md#af-013)         | —          |
| AF-014 | ShortcutRegistry                  | [Surfaces § AF-014](./SPR-004-AF-surfaces.md#af-014)       | 0026       |
| AF-015 | Shell shortcut listener           | [Surfaces § AF-015](./SPR-004-AF-surfaces.md#af-015)       | 0026       |
| AF-016 | Context menu API + UI             | [Surfaces § AF-016](./SPR-004-AF-surfaces.md#af-016)       | 0025       |
| AF-017 | Toolbar manifest + UI             | [Surfaces § AF-017](./SPR-004-AF-surfaces.md#af-017)       | 0025       |
| AF-018 | Automation / AI / voice stubs     | [Integration § AF-018](./SPR-004-AF-integration.md#af-018) | 0026       |
| AF-019 | Scaffold command manifests        | [Surfaces § AF-019](./SPR-004-AF-surfaces.md#af-019)       | 0025       |
| AF-020 | Application integration           | [Integration § AF-020](./SPR-004-AF-integration.md#af-020) | 0024       |
| AF-021 | Documentation                     | [Integration § AF-021](./SPR-004-AF-integration.md#af-021) | —          | ✅  |
| AF-022 | Sprint closeout                   | [Integration § AF-022](./SPR-004-AF-integration.md#af-022) | —          |

---

## Quality gates (all stories)

Every story PR must pass:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e
```

AF-001 is documentation-only — gates must remain green (no regression).

---

_SPR-004 Technical Specification Index — maintained through sprint closeout (AF-022)._
