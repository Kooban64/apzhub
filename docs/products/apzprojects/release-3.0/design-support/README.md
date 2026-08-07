# Design Support — APZ Projects Release 3.0

| Field                | Value                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| Mode                 | **Design Support** (Cursor Dual Mode)                                       |
| Product code changes | **NONE** unless Prep Track / Engineering Auth                               |
| Authority            | [APZHUB-CURSOR-DUAL-MODE.md](../../../framework/APZHUB-CURSOR-DUAL-MODE.md) |

## Purpose

While the CPO authors the Product Bible, Cursor continuously maintains technical design-office artefacts here.

| Artefact                                               | Purpose                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| [00-BASELINE-INVENTORY.md](./00-BASELINE-INVENTORY.md) | What exists today                                               |
| [01-GAP-REGISTER.md](./01-GAP-REGISTER.md)             | Gaps vs evolving Bible (updated as chapters land)               |
| [02-REUSE-REGISTER.md](./02-REUSE-REGISTER.md)         | Reusable components / services / APIs                           |
| [03-EFFORT-RISKS.md](./03-EFFORT-RISKS.md)             | Effort bands · risks · migrations                               |
| [04-PREP-BACKLOG.md](./04-PREP-BACKLOG.md)             | Guaranteed infrastructure candidates (needs Prep Auth to build) |

## Cadence

After each Bible chapter lands:

1. Diff chapter against codebase
2. Update Gap + Reuse + Effort registers
3. Propose Prep items only if truly chapter-independent
4. Do **not** invent product scope
