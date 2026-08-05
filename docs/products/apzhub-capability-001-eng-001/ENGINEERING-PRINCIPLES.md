# Engineering Principles — Unified Work Composition Layer

| Field     | Value                         |
| --------- | ----------------------------- |
| Programme | APZHUB-CAPABILITY-001-ENG-001 |
| Status    | **MANDATORY**                 |
| Timestamp | 20260805T103000Z              |

## Principle 1 — Products remain Systems of Record

Always. Composition never becomes authoritative for task, ticket, timesheet, quality, or workflow state.

## Principle 2 — Portfolio capability composes

Never owns. My Work coordinates references; products own domains.

## Principle 3 — No duplicated business state

No second copy of product entities as SoR. Request-scoped projection only.

## Principle 4 — Every work card contains references

Never copies. Cards carry `id`, `href`, product/kind metadata — action happens in the owning product.

## Principle 5 — Navigation follows work

Not products. Work-first entry is primary; capability-first product workspaces remain available.

## Principle 6 — Design philosophy

A user asks:

> "What do I need to do?"

—not—

> "Which product should I open?"

That sentence gates UX copy, queue ordering, and navigation labels.
