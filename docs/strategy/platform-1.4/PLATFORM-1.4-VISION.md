# Platform 1.4 Vision

## Release theme

**Production Operational Maturity for Durable Notification Delivery & Shared-Host Resilience**

## Why Platform 1.4 is a distinct release

Platform 1.3 delivered additive platform capabilities (Search live drain, Observe live alerts, Support SSE, Notification Delivery Phase A) and certified **PRODUCTION READY WITH LIMITATIONS**. The remaining limitations that block a stronger production claim are **operational durability and evidence**, not missing product features:

1. Notification Delivery runtime is Phase A **process-local** despite migration **0065** schema readiness (P13-KL-ND-03).
2. Shared-host **capacity is not certified** for SSE / workers / DB growth (P13-KL-ND-08).
3. **POPIA formal review** is required before external delivery enablement (P13-KL-ND-07).
4. Full monorepo / Playwright portfolios were **not re-certified** under CERT-002 (honesty residual).

Platform 1.4 therefore exists to make the Platform 1.3 notification and realtime operational plane **durable, measurable, compliance-gated, and release-evidence complete** — as one coherent baseline — without becoming Email SoR, Workflow Execute, FIN-001, or WebSockets.

## Target outcomes

- Durable, restart-safe notification delivery runtime using approved platform persistence.
- Measured capacity evidence for SSE, Event Bus consumers, delivery workers, and database growth.
- Formal compliance pathway before any external transactional provider enablement.
- Honest full regression / Playwright release evidence for Platform 1.4 certification.
- Administration and operational runbooks sufficient for production enablement of delivery flags.

## Non-goals (vision)

- Email System of Record / mailbox / inbound mail
- Workflow Execute unlock
- FIN-001 extraction
- WebSocket transport
- Integration SDK thaw
- Platform architecture replacement
