# Known Limitations Register — Test Execution 1.0.1-rc.1

Authority: CERT-001 dispositions as updated by CERT-002 Owner Acceptance (2026-07-29).

| ID      | Limitation                                   | Disposition                                                  | Operational control                                   |
| ------- | -------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| L-01    | OpenAPI gap for executions API               | Accept for patch release                                     | Use handler schemas / internal client                 |
| L-02    | EvidenceAccessPort default-allow             | **CLOSED** — remediated (REM-001) + verified (CERT-002)      | N/A — security issue closed                           |
| L-03    | Outbox enqueue-only                          | Accept for patch release                                     | Do not depend on async dispatch from execution outbox |
| L-04    | No Postgres integration tests                | Accept with prior RA                                         | Deploy verification of migrations/RLS                 |
| L-OP-01 | Authenticated Playwright journeys incomplete | **Accept for Limited Availability** — blocks unrestricted GA | Improve browser E2E before unrestricted GA decision   |

## Risk Acceptance

| ID           | Status      |
| ------------ | ----------- |
| RA-02 (L-02) | **RETIRED** |

## Availability

```text
LIMITED_AVAILABILITY_APPROVED
Security Readiness: APPROVED
Operational Browser Readiness: PARTIALLY VERIFIED
Unrestricted GA: NOT APPROVED
```
