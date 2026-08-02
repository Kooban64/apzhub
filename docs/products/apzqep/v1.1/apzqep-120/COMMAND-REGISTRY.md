# Command Registry — APZQEP-120-S13

| Field   | Value                           |
| ------- | ------------------------------- |
| Package | `@apzhub/qep-command` **0.1.0** |

## Purpose

Deterministic registration of command metadata. **No hard-coded routing** in the execution engine.

## Command kinds

| Kind           | Purpose                           |
| -------------- | --------------------------------- |
| global         | Always available (when permitted) |
| context        | Context-sensitive                 |
| entity         | Bound to QKI entity kind          |
| project        | Project-scoped                    |
| administrative | Admin surfaces                    |
| navigation     | Workspace navigation              |
| ai             | Reserved for future AI clients    |

## Surfaces

| API                    | Role                        |
| ---------------------- | --------------------------- |
| `register`             | Single command              |
| `registerBatch`        | Deterministic ordered batch |
| `list` / `listEnabled` | Catalogue enumeration       |
| `listByCategory`       | Category filter             |
| `listByKind`           | Kind filter                 |

## Built-in catalogue

Seeded via `BUILTIN_COMMAND_DEFINITIONS` at compose time — still registry entries, not engine hard-coding. Products register additional commands the same way.
