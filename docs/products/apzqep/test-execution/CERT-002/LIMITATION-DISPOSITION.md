# LIMITATION-DISPOSITION — APZQEP-CERT-002

## L-02

| Field                   | Value                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Prior                   | REMEDIATED_PENDING_VERIFICATION (REM-001 accepted)                                                                     |
| CERT-002 recommendation | **CLOSE**                                                                                                              |
| Rationale               | Default-allow path independently verified removed; fail-closed behaviour reproduced; no Critical/High security defects |
| Authoritative close     | **Owner only** after accepting this certification                                                                      |

## Other known limitations (unchanged by CERT-002)

| ID      | Topic                                           | Status                                         |
| ------- | ----------------------------------------------- | ---------------------------------------------- |
| L-01    | OpenAPI deferred                                | Remains open (accepted at CERT-001)            |
| L-03    | Outbox enqueue-only                             | Remains open                                   |
| L-04    | No Postgres integration tests                   | Remains open                                   |
| CERT-PW | Playwright authenticated TE journeys incomplete | New certification limitation for GA confidence |

Do **not** mark L-02 closed in authoritative registers without Owner acceptance.
