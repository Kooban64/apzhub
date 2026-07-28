# Matrix Model — APZQEP-ARCH-008

> Companion extract. Authoritative detail: [TRACEABILITY-WORKBENCH-ARCHITECTURE.md](./TRACEABILITY-WORKBENCH-ARCHITECTURE.md) §7.

## Purpose

Presentation architecture for Trace Matrices. Defines interaction for rows, columns, cells, grouping, sorting, filtering, selection, and indicator slots.

## Matrix families (future catalogue)

Requirement ↔ Specification · Test Case · Execution · Evidence · Verification · Certification  
Execution ↔ Evidence · Evidence ↔ Certification

Extensible registry when domains exist.

## Structural rules

| Element                      | Rule                                                 |
| ---------------------------- | ---------------------------------------------------- |
| Rows / columns               | Artefact identities; paginated / virtualised         |
| Cell                         | Empty · one link · multiple (chooser)                |
| Status indicators            | Lifecycle / confidence / warnings                    |
| Coverage / impact indicators | **Display slots only** — no calculations in ARCH-008 |
| Create from empty            | Prefill endpoints when `create` available            |
| Bounds                       | Server windowing mandatory at scale                  |

## Explicit non-goals

Coverage percentages · authoritative covered state · blast-radius scoring · unbounded expansion · graph dependency.
