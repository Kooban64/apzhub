# QA Onboarding — APZQEP Wave 1

| Field     | Value                     |
| --------- | ------------------------- |
| Programme | APZQEP-161-OE             |
| Audience  | QA engineers / test leads |

## First day checklist

- [ ] Sign in at https://apzhub.apzportal.apzor.com
- [ ] Open **Enterprise Automation**
- [ ] Confirm Providers: Playwright **active**; others placeholder
- [ ] Run **Playwright dry-run**
- [ ] Open execution detail — status, timing, artifacts, evidence refs
- [ ] Run a second execution — confirm history
- [ ] Attempt a placeholder provider (expect clear rejection)
- [ ] Walk [Demo Script](../apzqep-161r/DEMO-SCRIPT.md) once for stakeholders

## How to think about dry-run vs live

| Mode                                                        | When to use                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| Dry-run (default)                                           | Daily lifecycle / evidence pipeline practice; no browser install |
| Live (`APZHUB_AUTOMATION_LIVE=true` + Playwright installed) | Real browser proof; optional                                     |

## Failure investigation (Wave 1)

1. Read execution **state** + **resultSummary**.
2. Check artifact list (kinds present even when media viewer is absent).
3. Note evidence refs for later Evidence Platform / QKI consumers.
4. Re-run with the same target to compare history rows.
5. Log UX gaps in the feedback register (do not invent parallel trackers).

## Reporting expectation

Formal Cap F reporting and executive dashboards are **not** Wave 1 automation theatre. Use execution summaries now; escalate dashboard needs as Future Wave (164).
