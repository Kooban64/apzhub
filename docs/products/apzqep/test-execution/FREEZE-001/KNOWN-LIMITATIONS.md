# Known Limitations — Test Execution 1.0.0-rc.1

Authority: APZQEP-CERT-001 Risk Acceptance Register (**APPROVED**).

| ID   | Limitation                               | Owner disposition                                                 | Operational control                                                                    |
| ---- | ---------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| L-01 | OpenAPI gap for `/api/v1/qep/executions` | Accept for Release                                                | Document internal client/schemas; schedule OpenAPI programme                           |
| L-02 | EvidenceAccessPort default-allow         | Accept with RA — **mandatory remediation before unrestricted GA** | Restrict evidence-association permissions; pilot/controlled only; track corrective ENG |
| L-03 | Outbox enqueue-only                      | Accept for Release                                                | Do not deploy consumers depending on execution outbox dispatch                         |
| L-04 | No Postgres integration tests            | Accept with RA                                                    | Deploy verification of migrations/RLS; schedule Compose DB tests                       |

## GA gate (binding Owner condition)

```text
L-02 EvidenceAccessPort MUST be remediated before unrestricted General Availability.
Acceptable for controlled production release or pilot.
MUST NOT become permanent technical debt.
```
