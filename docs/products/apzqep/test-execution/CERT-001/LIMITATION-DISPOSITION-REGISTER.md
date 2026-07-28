# Limitation Disposition Register — APZQEP-CERT-001

Authority: Owner Certification Directive — four ECR limitations must be assessed individually.  
**No engineering performed under CERT-001.**

---

## L-01 — OpenAPI documentation gap

| Field             | Value                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Confirmation      | No `/api/v1/qep/executions` paths in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` or `apps/web/lib/api/v1/openapi.ts`      |
| Production impact | External/consumer contract discovery incomplete; internal Workbench uses typed client                                      |
| Severity          | **High (documentation / contract)** — not a runtime correctness defect                                                     |
| Disposition       | **Accept for release** as known documentation limitation                                                                   |
| Rationale         | Handlers, Zod schemas, and client API exist; gap is publication. Post-release / Freeze-adjacent docs programme recommended |
| Freeze impact     | Does **not** block Freeze if Risk Acceptance signed                                                                        |

---

## L-02 — EvidenceAccessPort default-allow

| Field             | Value                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmation      | `createEvidenceAccessPort`: `if (!check) return`; production bootstrap does not inject `evidenceCheck`                                                                      |
| Production impact | Users with associate-evidence permission may attach any URI without evidence ACL / accessibility validation                                                                 |
| Severity          | **High (security residual)**                                                                                                                                                |
| Disposition       | **Defer with documented risk acceptance** for Production Freeze under controlled deployment; **Correct before release** required before Evidence-integrated unrestricted GA |
| Rationale         | Association remains permission-gated; Evidence platform ACL seam exists but unwired. Prefer separate Owner-authorised ENG to inject Platform check before broad GA          |
| Freeze impact     | Freeze allowed **only with** Owner risk acceptance (RA-02). If Owner rejects RA-02 → **RETURN TO ENGINEERING**                                                              |

---

## L-03 — Outbox enqueue-only

| Field             | Value                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmation      | `EventOutboxPort.enqueue` inserts `qep_test_execution_outbox`; no dispatcher/worker in repo                                                     |
| Production impact | Async consumers (notify/search/event bus) will not receive execution events until a platform dispatcher exists. Synchronous audit still written |
| Severity          | **High (reliability / integration)** for event-driven dependents; **Low** if no consumers are deployed yet                                      |
| Disposition       | **Accept for release** for first deployment profile **without** depending on execution outbox consumers                                         |
| Rationale         | Schema includes dispatch columns; audit path is synchronous. Do not claim event-driven notify/search until dispatcher programme                 |
| Freeze impact     | Does **not** block Freeze if RA-03 signed (no consumer dependency asserted)                                                                     |

---

## L-04 — Lack of Postgres integration tests

| Field             | Value                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Confirmation      | No package Postgres/integration suite; mapper unit tests + migrations 0087/0088 + RLS present                             |
| Production impact | Persistence/RLS regressions less likely to be caught in CI                                                                |
| Severity          | **High (assurance gap)** — not an observed runtime defect                                                                 |
| Disposition       | **Defer with documented risk acceptance**                                                                                 |
| Rationale         | Schema, RLS, and mapper coverage provide baseline; Compose DB contract tests recommended as post-Freeze quality programme |
| Freeze impact     | Does **not** block Freeze if RA-04 signed                                                                                 |

---

## Summary matrix

| ID   | Disposition                                             | Blocks Freeze?         | Blocks unrestricted GA?                         |
| ---- | ------------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| L-01 | Accept for release                                      | No (with RA-01)        | No                                              |
| L-02 | Defer + risk acceptance; Correct before unrestricted GA | Only if RA-02 rejected | **Yes** (recommended)                           |
| L-03 | Accept for release (no consumer dependency)             | No (with RA-03)        | If consumers required before GA → Correct first |
| L-04 | Defer + risk acceptance                                 | No (with RA-04)        | No                                              |

## Certification conclusion on limitations

Limitations are **verification items dispositioned**, not unreviewed debt. They support class **PRODUCTION_READY_WITH_LIMITATIONS**.
