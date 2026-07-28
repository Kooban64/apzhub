# APZQEP-ENG-040B — Verification Infrastructure

| Field                 | Value                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------- |
| Programme             | **APZQEP-ENG-040B**                                                                     |
| Title                 | Verification Persistence, Application Services, APIs and Platform Integration           |
| Architecture          | **APZQEP-ARCH-009** **ACCEPTED**                                                        |
| Domain (ENG-040A)     | **ACCEPTED** — [engine-domain pack](../engine-domain/README.md)                         |
| Package at acceptance | `@apzhub/qep-verification` **0.2.0** (current **0.3.0** includes ENG-040C presentation) |
| Status                | **ACCEPTED / CLOSED / COMPLETE**                                                        |
| Migrations            | **0081**, **0082**                                                                      |
| API base              | `/api/v1/qep/verifications/*`                                                           |
| Owner Acceptance      | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                            |
| Workbench             | **APZQEP-ENG-040C** — [workbench](../workbench/README.md)                               |

## Purpose

Deliver Verification infrastructure on top of the Owner-accepted ENG-040A domain: persistence, repositories, subject resolution, application commands/queries, REST, permissions, audit, search projection, and observability — fidelity to [APZQEP-ARCH-009](../../architecture/verification/README.md).

## Documentation

| Document                      | Path                                                   |
| ----------------------------- | ------------------------------------------------------ |
| Implementation                | [PART2-IMPLEMENTATION.md](./PART2-IMPLEMENTATION.md)   |
| Persistence                   | [PERSISTENCE.md](./PERSISTENCE.md)                     |
| Repositories                  | [REPOSITORIES.md](./REPOSITORIES.md)                   |
| Application services          | [APPLICATION-SERVICES.md](./APPLICATION-SERVICES.md)   |
| Commands                      | [COMMANDS.md](./COMMANDS.md)                           |
| Queries                       | [QUERIES.md](./QUERIES.md)                             |
| REST API                      | [REST.md](./REST.md)                                   |
| Permissions                   | [PERMISSIONS.md](./PERMISSIONS.md)                     |
| Audit                         | [AUDIT.md](./AUDIT.md)                                 |
| Search                        | [SEARCH.md](./SEARCH.md)                               |
| Observability                 | [OBSERVABILITY.md](./OBSERVABILITY.md)                 |
| Subject (endpoint) resolution | [ENDPOINT-RESOLUTION.md](./ENDPOINT-RESOLUTION.md)     |
| Operational readiness         | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) |
| Engineering evidence          | [ENGINEERING-EVIDENCE.md](./ENGINEERING-EVIDENCE.md)   |
| Completion report             | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)         |

## Baselines

| Field        | Value                        |
| ------------ | ---------------------------- |
| Platform     | APZHUB 1.4 CERTIFIED         |
| Requirements | **1.0.0 CERTIFIED / FROZEN** |
| Traceability | **1.0.0 CERTIFIED / FROZEN** |
| ARCH-009     | **ACCEPTED**                 |
| ENG-040A     | **ACCEPTED**                 |

## STOP

APZQEP-ENG-040B is **implemented** and awaits Owner Acceptance. Do **not** begin Workbench UI, Coverage, Impact, Evidence, Certification, AI, or MCP under this programme. Do **not** declare Owner Acceptance of ENG-040B in this pack.
