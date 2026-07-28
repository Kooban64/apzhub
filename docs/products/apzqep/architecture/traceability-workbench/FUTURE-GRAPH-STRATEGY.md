# Future Graph Strategy — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §20.

## Position

Graph visualisation is an **optional future enhancement**. The Traceability Workbench must remain fully usable with:

- matrix-first interaction;  
- list-first Explorer interaction;  
- inspector-first detail interaction.

## Rules

| Rule | Detail |
| --- | --- |
| Not System of Record | Graph is a lens over Trace Links |
| Escape hatch | Always “Open as list / matrix” |
| Bounds | Bounded depth; cycle guards; never load entire tenant graph |
| Accessibility | Graph never sole information path |
| Selection sync | Node/edge click updates Explorer + Inspector |
| Implementation | **Not authorised** by ARCH-008 |

## Relationship to ARCH-006

Extends ADR-ARCH-006-002 (lists before graphs) for Traceability with an explicit **matrix-first** primary path.
