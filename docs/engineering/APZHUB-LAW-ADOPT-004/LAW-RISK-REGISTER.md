# LAW-RISK-REGISTER

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-LAW-ADOPT-004 |
| Timestamp | 20260803T135126Z     |

## Purpose

Operational risk register for APZ Law Platform under enterprise ops governance. Risks are reviewed at Monthly Board and Quarterly Strategy reviews.

## Register

| Risk ID     | Risk                                               | Likelihood                      | Impact | Mitigation (ops)                                                                                     | Residual                   | Owner                    |
| ----------- | -------------------------------------------------- | ------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------ |
| LAW-RISK-01 | Live telemetry not yet measured                    | High (until measurement window) | Medium | Dashboard structure + “Defined – Awaiting Production Measurement”; no fabricated data                | Blind spots until measured | Product Operations Owner |
| LAW-RISK-02 | Monitoring tooling not implemented                 | High                            | Medium | Explicit exclusion of ADOPT-004; escalate tooling as future ops/platform programme if Board requires | No automated alerts yet    | Product Operations Owner |
| LAW-RISK-03 | Host coexistence with legacy stack                 | Medium                          | High   | Follow ENVIRONMENT.md; coordinate Platform Ops                                                       | Shared-host contention     | Platform Operations      |
| LAW-RISK-04 | Trust OpenAPI honesty residual                     | Low                             | Low    | Documented; consumer guidance                                                                        | Spec incompleteness        | Product Owner            |
| LAW-RISK-05 | Silent engineering pressure from support           | Medium                          | High   | Incident/enhancement gates; engineering CLOSED without Owner Auth                                    | Process drift              | Board liaison            |
| LAW-RISK-06 | Adoption incomplete (ops cert / readiness pending) | Medium                          | Medium | Await PBR-004 then ADOPT-005 path                                                                    | Not enterprise-adopted yet | Product Board            |

## Rules

1. Do not convert risks into unauthorised engineering.
2. Update likelihood/impact only from evidence.
3. Closed risks retain historical row with Closed status (append; do not rewrite history silently).
