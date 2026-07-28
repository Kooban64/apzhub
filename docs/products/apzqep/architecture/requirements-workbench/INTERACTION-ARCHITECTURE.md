# Interaction Architecture — APZQEP-ARCH-006

> Companion extract. Authoritative detail: [REQUIREMENTS-WORKBENCH-ARCHITECTURE.md](./REQUIREMENTS-WORKBENCH-ARCHITECTURE.md) §2, §8, §12, §13, §14, §17.

## Core interaction rules

| Concern        | Rule                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| Selection      | One primary selection; multi-select enters bulk mode                     |
| Authority      | Server `availableActions` + permissions; UI never invents authority      |
| Mutations      | Explicit commands; dirty local draft until save succeeds                 |
| Immutability   | Locked Baselines, Content Versions, retired Relationships are read-only  |
| Commands       | Prefer Command Palette (019) for power paths                             |
| Feedback       | Validation → inline + Activity; Attention Engine for notifications (021) |
| Escape hatches | Graph → “Open as list”; compare → open artefacts in split                |

## Keyboard

Full keyboard operation required for navigation, edit, command, and bulk confirm. Exact keymaps are engineering parameters; registration must be discoverable and conflict-free.
