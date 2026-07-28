# APZQEP-ENG-030C — Traceability Workbench

| Field         | Value                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Programme     | **APZQEP-ENG-030C**                                                                                                                    |
| Title         | Traceability Workbench UI                                                                                                              |
| Architecture  | **APZQEP-ARCH-008** ACCEPTED · grammar **APZQEP-ARCH-006** · semantics **APZQEP-ARCH-007**                                             |
| Backend       | **APZQEP-ENG-030A** Parts 1–2 ACCEPTED                                                                                                 |
| Package       | `@apzhub/qep-traceability` **1.0.0** (certified baseline pending TRACE-001 Owner Acceptance)                                           |
| Module        | `modules/qep-traceability` **1.0.0**                                                                                                   |
| Status        | **ACCEPTED / CLOSED / COMPLETE**                                                                                                       |
| Acceptance    | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                                                                           |
| Certification | **APZQEP-TRACE-001** — [capability-certification](../capability-certification/README.md) (**IMPLEMENTED / AWAITING OWNER ACCEPTANCE**) |

## Routes (summary)

Workspace prefix is `/workspace/qep/traceability/*` (not `/qep/`).

| Route                                                  | View                        |
| ------------------------------------------------------ | --------------------------- |
| `/workspace/qep/traceability`                          | Workbench home → Explorer   |
| `/workspace/qep/traceability/trace-links`              | Trace Link Explorer         |
| `/workspace/qep/traceability/trace-links/new`          | Create Trace Link           |
| `/workspace/qep/traceability/trace-links/supersede`    | Supersede workflow          |
| `/workspace/qep/traceability/trace-links/{id}`         | Detail / Inspector          |
| `/workspace/qep/traceability/trace-links/{id}/history` | Trace History               |
| `/workspace/qep/traceability/matrix`                   | Trace Matrix (presentation) |
| `/workspace/qep/traceability/taxonomy`                 | Taxonomy browser            |

## Documentation

| Document              | Path                                                         |
| --------------------- | ------------------------------------------------------------ |
| Implementation        | [WORKBENCH-IMPLEMENTATION.md](./WORKBENCH-IMPLEMENTATION.md) |
| Routes                | [ROUTES.md](./ROUTES.md)                                     |
| Explorer              | [EXPLORER.md](./EXPLORER.md)                                 |
| Matrix                | [MATRIX.md](./MATRIX.md)                                     |
| Inspector             | [INSPECTOR.md](./INSPECTOR.md)                               |
| Trace Link creation   | [TRACE-LINK-CREATION.md](./TRACE-LINK-CREATION.md)           |
| Lifecycle actions     | [LIFECYCLE-ACTIONS.md](./LIFECYCLE-ACTIONS.md)               |
| History               | [HISTORY.md](./HISTORY.md)                                   |
| Taxonomy              | [TAXONOMY.md](./TAXONOMY.md)                                 |
| Search                | [SEARCH.md](./SEARCH.md)                                     |
| Accessibility         | [ACCESSIBILITY.md](./ACCESSIBILITY.md)                       |
| Responsive behaviour  | [RESPONSIVE-BEHAVIOUR.md](./RESPONSIVE-BEHAVIOUR.md)         |
| Performance           | [PERFORMANCE.md](./PERFORMANCE.md)                           |
| Permissions           | [PERMISSIONS.md](./PERMISSIONS.md)                           |
| Operational readiness | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md)       |
| Test evidence         | [TEST-EVIDENCE.md](./TEST-EVIDENCE.md)                       |
| Completion report     | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)               |

## STOP

**APZQEP-ENG-030C is ACCEPTED / CLOSED / COMPLETE.** Traceability certification proceeds under [APZQEP-TRACE-001](../capability-certification/README.md). Do **not** begin Coverage Engine, Impact Engine, AI, or MCP without a separate Owner Instruction.
