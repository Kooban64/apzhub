# Platform 1.4 Residual Review

> Source: Platform-1.3-CERT-002 KNOWN-LIMITATIONS · ENG-003/004 packs · RR-001 · PL12 register

| Residual                                                            | Classification                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| SMTP delivery deferred (P13-KL-ND-01)                               | **REQUIRES_ADR** then **PLATFORM_1_4_CANDIDATE** (conditional after durable runtime + POPIA) |
| SMS / push / Teams / Slack (P13-KL-ND-02)                           | **EXPLICITLY_EXCLUDED**                                                                      |
| Process-local notification runtime / Postgres wiring (P13-KL-ND-03) | **PLATFORM_1_4_CANDIDATE** (MUST theme) · **REQUIRES_ADR**                                   |
| Preference / quiet hours / digest limits (P13-KL-ND-04)             | **DEFERRED_FUTURE** (MAY if capacity)                                                        |
| External recipients (P13-KL-ND-05)                                  | **RETAINED_LIMITATION** / **EXPLICITLY_EXCLUDED** for 1.4                                    |
| Template administration product (P13-KL-ND-06)                      | **DEFERRED_FUTURE**                                                                          |
| POPIA formal production review (P13-KL-ND-07)                       | **COMPLIANCE_PRECONDITION**                                                                  |
| Shared-host capacity certification (P13-KL-ND-08)                   | **OPERATIONAL_PRECONDITION** · **PLATFORM_1_4_CANDIDATE**                                    |
| Email SoR (PL12-KL-07)                                              | **EXPLICITLY_EXCLUDED** · gate review **REMAIN EXCLUDED**                                    |
| FIN-001 (PL12-KL-08)                                                | **EXPLICITLY_EXCLUDED** · **REMAIN STOPPED**                                                 |
| Workflow Execute (PL12-KL-09)                                       | **EXPLICITLY_EXCLUDED** · **KEEP GATED**                                                     |
| WebSockets                                                          | **EXPLICITLY_EXCLUDED**                                                                      |
| Integration SDK LIMITED coverage                                    | **RETAINED_LIMITATION** (freeze retained; coverage raise not required to thaw SDK)           |
| Full monorepo Vitest not re-run                                     | **PLATFORM_1_4_CANDIDATE** (quality MUST/SHOULD)                                             |
| Playwright portfolio not re-run                                     | **PLATFORM_1_4_CANDIDATE** (quality MUST)                                                    |
| Notification retry/DLQ operational maturity                         | **PLATFORM_1_4_CANDIDATE**                                                                   |
| Notification provider coverage (SMTP only candidate)                | **REQUIRES_ADR** · conditional                                                               |
| Observe residuals (PL12-KL-02 partially remediated)                 | **RETAINED_LIMITATION** / light ops MAY                                                      |
| Support attachment delete (PL12-KL-05)                              | **DEFERRED_FUTURE** / product residual                                                       |
| Search residuals post ENG-001                                       | **RETAINED_LIMITATION** (no reopen without evidence)                                         |
| Administration residuals (delivery ops)                             | **PLATFORM_1_4_CANDIDATE**                                                                   |
| Repository quality residuals (format/SDK wording)                   | **RETAINED_LIMITATION** if green under CERT-002                                              |

## Treatment summary

Platform 1.4 **remediates** operational durability, capacity evidence, compliance preconditions, and release-quality honesty.

Platform 1.4 **retains/defers** Email SoR, FIN-001, Workflow Execute, WebSockets, SMS/push, external recipients, and unrelated product residuals.
