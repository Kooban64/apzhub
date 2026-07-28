# Platform 1.4 Candidate Epics

> No epic is authorised by appearance here. Statuses are planning recommendations only.

## P14-E01 — Durable Notification Runtime

| Field                 | Content                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Business outcome      | Restart-safe delivery; no silent loss of queued intents/attempts                                                      |
| Technical outcome     | Persistent queue/retry/DLQ using platform Postgres/outbox patterns; process-local Phase A retired for production path |
| Beneficiaries         | All products using Notification Delivery; ops                                                                         |
| Components            | platform-services notification delivery · persistence · outbox · workers · admin                                      |
| Dependencies          | ADR for persistence/runtime ownership                                                                                 |
| Architecture impact   | Additive; retain ADR-0071 Option D                                                                                    |
| ADR                   | **Required** (proposed ADR-0073 placeholder)                                                                          |
| Security / compliance | Tenant isolation; audit; no Email SoR                                                                                 |
| DB impact             | Likely additive use of 0065 + possible additive migration under ENG                                                   |
| Provider impact       | None required                                                                                                         |
| Tests / evidence      | Restart recovery · idempotency · DLQ · migration · tenant isolation                                                   |
| Exclusions            | SMTP; Email SoR; SMS                                                                                                  |
| Sequence              | Wave A first                                                                                                          |
| Recommendation        | **RECOMMENDED**                                                                                                       |

## P14-E02 — Capacity and Resilience Evidence

| Field             | Content                                                                         |
| ----------------- | ------------------------------------------------------------------------------- |
| Business outcome  | Measured shared-host suitability before enablement                              |
| Technical outcome | Capacity pack: concurrent SSE, queue depth, worker throughput, DB growth bounds |
| Recommendation    | **RECOMMENDED**                                                                 |
| ADR               | Not required unless topology changes                                            |
| Classification    | OPERATIONAL                                                                     |

## P14-E03 — POPIA Production Readiness

| Field             | Content                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Business outcome  | Formal compliance pathway before external delivery                            |
| Technical outcome | Technical controls evidence + compliance checklist; not a legal opinion claim |
| Recommendation    | **RECOMMENDED** (compliance programme)                                        |
| ADR               | Not required for checklist; provider ADR separate                             |

## P14-E04 — Full Regression and Browser Certification

| Field             | Content                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| Business outcome  | Honest release portfolio evidence                                                 |
| Technical outcome | Full `pnpm test` + Playwright portfolio green or PRWL-classified with remediation |
| Recommendation    | **RECOMMENDED**                                                                   |
| ADR               | None                                                                              |

## P14-E05 — Administration Maturity (Delivery / Realtime Ops)

| Field            | Content                                                        |
| ---------------- | -------------------------------------------------------------- |
| Business outcome | Ops can triage DLQ, view diagnostics, manage enablement safely |
| Recommendation   | **CONDITIONAL** (after E01)                                    |
| ADR              | Only if new SoR/admin boundaries appear                        |

## P14-E06 — Notification Provider Enablement (Transactional)

| Field            | Content                                                   |
| ---------------- | --------------------------------------------------------- |
| Business outcome | Optional external transactional channel without Email SoR |
| Dependencies     | E01 · E03 · provider ADR                                  |
| Recommendation   | **CONDITIONAL**                                           |
| Exclusions       | Mailbox · inbound · archive · marketing                   |

## P14-E07 — Platform Release Automation

| Field          | Content                          |
| -------------- | -------------------------------- |
| Recommendation | **CONDITIONAL** / SHOULD         |
| ADR            | None unless new infra dependency |

## P14-E08 — Workflow Execute Architecture Assessment

| Field          | Content                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Recommendation | **EXCLUDED** from implementation · gate review only → **KEEP GATED** / future ADR outside MUST |
| Note           | May produce **PROPOSE FUTURE ADR** stub only if Owner requests later                           |

## P14-E09 — Email SoR Architecture Assessment

| Field          | Content                                                |
| -------------- | ------------------------------------------------------ |
| Recommendation | **EXCLUDED** from implementation · **REMAIN EXCLUDED** |
| Note           | Distinct from transactional provider (E06)             |

## P14-E10 — Product Integration Maturity (bounded)

| Field            | Content                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Recommendation   | **DEFERRED** unless portfolio evidence shows blocking product dependency on 1.4 MUST theme |
| Example residual | Support attachment delete — not required for theme                                         |

## Classification roll-up

| Status                      | Epics                                                |
| --------------------------- | ---------------------------------------------------- |
| **RECOMMENDED**             | E01 · E02 · E03 · E04                                |
| **CONDITIONAL**             | E05 · E06 · E07                                      |
| **DEFERRED**                | E10                                                  |
| **EXCLUDED**                | E08 impl · E09 impl · SMS/push etc.                  |
| **REQUIRES OWNER DECISION** | Whether E06 SMTP enters MUST vs SHOULD after E01/E03 |
