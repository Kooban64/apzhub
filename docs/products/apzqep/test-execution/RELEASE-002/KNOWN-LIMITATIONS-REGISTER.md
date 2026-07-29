# Known Limitations Register — Test Execution 1.0.1

| ID      | Limitation                                   | Disposition                                                 | Control                        |
| ------- | -------------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| L-01    | OpenAPI gap for executions API               | Accept for patch release                                    | Internal schemas/client        |
| L-02    | EvidenceAccessPort default-allow             | **CLOSED**                                                  | N/A                            |
| L-03    | Outbox enqueue-only                          | Accept for patch release                                    | No consumer dependency         |
| L-04    | No Postgres integration tests                | Accept (prior RA)                                           | Deploy verify migrations/RLS   |
| L-OP-01 | Authenticated Playwright journeys incomplete | Accept for Limited Availability; **blocks unrestricted GA** | Complete under GA-001 planning |

## Risk Acceptance

| ID    | Status      |
| ----- | ----------- |
| RA-02 | **RETIRED** |

## Availability

```text
LIMITED_AVAILABILITY_APPROVED
Security Readiness: APPROVED
Operational Browser Readiness: PARTIALLY VERIFIED
Unrestricted GA: NOT APPROVED
```
