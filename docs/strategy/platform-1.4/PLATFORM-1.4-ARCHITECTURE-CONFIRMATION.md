# Platform 1.4 Architecture Confirmation

## Confirmation statement

The frozen Platform 1.3 architecture **supports** the proposed Platform 1.4 release theme **without structural redesign**.

Platform 1.4 is confirmed as an **additive operational-maturity release** on the inherited baseline.

## Layering

Presentation → Platform Services → Connector → Engine — **CONFIRMED RETAIN**.

## Suitability

| Outcome                                | Architecture fit                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Durable notification runtime           | Fit via Platform Services + Postgres/outbox; **REQUIRES ADR** for persistence/runtime ownership details |
| Capacity & resilience evidence         | Fit via ops measurement; no redesign                                                                    |
| POPIA production readiness             | Fit via compliance programme + existing controls                                                        |
| Full regression / Playwright           | Fit via quality programmes; no redesign                                                                 |
| External transactional provider        | Fit via ADR-0071 adapter; **REQUIRES ADR** for provider selection/credentials                           |
| Distributed SSE fan-out                | Only if capacity evidence demands; **REQUIRES ADR**; not WebSockets                                     |
| Email SoR / Workflow Execute / FIN-001 | **EXCLUDE / KEEP GATED**                                                                                |

## Verdict

**Architecture suitable for Platform 1.4 planning.** Implementation blocked until Owner Architecture Acceptance and subsequent named ADR/ENG approvals.

## Domain assessments (summary)

### Notification Delivery

Prioritise **durable runtime** (MUST). External provider **conditional** after ADR-0074 + POPIA. Do not authorise SMTP merely because deferred. Retain adapter abstraction; never Email SoR.

### Realtime (ADR-0072)

**No realtime redesign required** for MUST. Operational hardening + capacity certification. Distributed fan-out only if measured (**ADR-0075**). WebSockets prohibited.

### Observe

Sufficiently mature for 1.4 MUST. Retain ownership. No alert lifecycle redesign.

### Support

SSE path retained. Attachment-delete residual deferred. No Support chat.

### Search

Do not reopen frozen Search architecture. ENG-001 residual retained unless new evidence.

### Workflow Execute

**KEEP GATED**

### Email SoR

**REMAIN EXCLUDED** (transactional provider ≠ SoR)

### FIN-001

**REMAIN STOPPED**
