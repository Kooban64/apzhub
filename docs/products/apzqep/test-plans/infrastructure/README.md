# APZQEP-ENG-060B — Test Plans Infrastructure

| Field                            | Value                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Programme                        | **APZQEP-ENG-060B**                                                                                     |
| Title                            | Test Plans Infrastructure Engineering                                                                   |
| Architecture                     | **APZQEP-ARCH-013** **ACCEPTED / BASELINED / CLOSED**                                                   |
| Infrastructure OES               | **APZQEP-OES-ENG-060B** **ACCEPTED / BASELINED / CLOSED** — [OES-ENG-060B](../OES-ENG-060B/COMPLETE.md) |
| Domain (ENG-060A)                | **ACCEPTED / CLOSED** — [domain pack](../domain/README.md)                                              |
| Domain Certification (CERT-060A) | **CERTIFIED / CLOSED** — [domain-certification pack](../domain-certification/README.md)                 |
| Package                          | `@apzhub/qep-test-plans` **0.2.0**                                                                      |
| Status                           | **ACCEPTED WITH RECORDED LIMITATIONS / APPROVED / CLOSED**                                              |
| Owner Decision                   | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                                            |
| Limitations                      | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                                          |
| ECR                              | [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md) **PASS WITH CONDITIONS**         |
| Evidence                         | Acceptance `20260727T194000Z-APZQEP-ENG-060B-ACCEPTANCE.json`                                           |
| Migrations                       | **0085**, **0086**                                                                                      |
| API base                         | `/api/v1/qep/plans/*`                                                                                   |

## Purpose

Deliver Test Plans infrastructure on top of the certified ENG-060A Domain: persistence, repositories, application commands/queries, REST, permissions, audit hooks, search projection, observability, transactions, and optimistic concurrency — fidelity to [APZQEP-OES-ENG-060B](../OES-ENG-060B/COMPLETE.md), mirroring the accepted [Test Specifications Infrastructure](../../test-specifications/engine/README.md) (APZQEP-ENG-050B) pattern.

## Documentation

| Document                      | Path                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Infrastructure overview       | [INFRASTRUCTURE.md](./INFRASTRUCTURE.md)                                     |
| Database                      | [DATABASE.md](./DATABASE.md)                                                 |
| Repositories                  | [REPOSITORIES.md](./REPOSITORIES.md)                                         |
| Application services          | [SERVICES.md](./SERVICES.md)                                                 |
| REST API                      | [REST.md](./REST.md)                                                         |
| Search                        | [SEARCH.md](./SEARCH.md)                                                     |
| Permissions                   | [PERMISSIONS.md](./PERMISSIONS.md)                                           |
| Audit                         | [AUDIT.md](./AUDIT.md)                                                       |
| Observability                 | [OBSERVABILITY.md](./OBSERVABILITY.md)                                       |
| Testing                       | [TESTING.md](./TESTING.md)                                                   |
| Owner Acceptance              | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                 |
| Known limitations             | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                               |
| Owner summary                 | [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                       |
| Completion report             | [INFRASTRUCTURE-COMPLETION-REPORT.md](./INFRASTRUCTURE-COMPLETION-REPORT.md) |
| Engineering Completion Review | [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md)       |
| ECR checklist                 | [INFRASTRUCTURE-ECR-CHECKLIST.md](./INFRASTRUCTURE-ECR-CHECKLIST.md)         |

## Baselines

| Field                                                            | Value                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Platform                                                         | APZHUB 1.4 CERTIFIED                                                  |
| Requirements / Traceability / Verification / Test Specifications | **1.0.0 CERTIFIED / FROZEN**                                          |
| ARCH-013                                                         | **ACCEPTED / BASELINED / CLOSED**                                     |
| OES-ENG-060B                                                     | **ACCEPTED / BASELINED / CLOSED**                                     |
| ENG-060A (Domain)                                                | **ACCEPTED / CLOSED**                                                 |
| CERT-060A (Domain Certification)                                 | **CERTIFIED / CLOSED** — `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** |

## STOP

```text
Programme: APZQEP-ENG-060B
Status: ACCEPTED / APPROVED / CLOSED
READY FOR INFRASTRUCTURE COMPONENT CERTIFICATION
```

Await Owner Programme Instruction for **APZQEP-CERT-060B**. Workbench / Capability Freeze remain **NOT AUTHORISED**.
