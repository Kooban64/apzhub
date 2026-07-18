# APZ TCMS — Traceability Guide

**Milestone:** APZTCMS-004

## Chain

```
Requirement ↔ Feature/Story/Task
  ↔ TestPlan / TestSuite / TestCase
  ↔ ManualExecution
  ↔ Evidence
  ↔ Certification / Release (refs)
  ↔ Defect (placeholder)
```

## API

`TraceabilityService`:

- `linkEntities` / `createLink` / `removeLink`
- `listOutgoing` / `listIncoming` / `getBidirectional`
- `getMatrixForRequirement` / `listMatrix`

Entity kinds are listed in `TRACEABILITY_ENTITY_KINDS` (`@apzhub/testing-contracts`).

## Rules

- Bidirectional queries are derived from directed links (no duplicate reverse rows required).
- Self-links are forbidden.
- Coverage matrix merges explicit links and case→requirement foreign keys.

## Related

- [Manual Testing Domain](./APZHUB-APZ-TCMS-Manual-Testing-Domain.md)
- [Service Architecture](./APZHUB-APZ-TCMS-Service-Architecture.md)
