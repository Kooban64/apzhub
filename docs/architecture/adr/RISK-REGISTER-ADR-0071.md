# Risk Register — Platform-1.3-ADR-0071

| ID     | Risk                                 | Severity | Mitigation                                      | Residual                 |
| ------ | ------------------------------------ | -------- | ----------------------------------------------- | ------------------------ |
| R71-01 | Conflation with Email SoR            | High     | Explicit ADR fence; ENG-004 honesty docs        | Monitor marketing claims |
| R71-02 | Observe couples to providers         | High     | Hook/events only; architecture tests in ENG-004 | Medium until ENG-004     |
| R71-03 | Secret leakage                       | High     | Secret refs; log redaction                      | Ongoing ops              |
| R71-04 | Broadcast abuse                      | Medium   | Fan-out caps; dual-control                      | Config dependent         |
| R71-05 | Pressure to thaw Integration SDK     | Medium   | Local adapters; deferred SDK work               | Accepted for 1.3         |
| R71-06 | Duplicate deliveries on bus replay   | Medium   | Idempotency keys                                | ENG-004 tests            |
| R71-07 | False “delivered” claims             | Medium   | Receipt honesty model                           | UX review                |
| R71-08 | ENG-004 starts before ADR Acceptance | High     | CURRENT-MILESTONE STOP                          | Process                  |
