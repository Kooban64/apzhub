# Platform-1.3-ENG-003 — Support Realtime (SSE)

> **Programme:** Platform-1.3-ENG-003  
> **Epic:** P13-E03  
> **Title:** Support Realtime (SSE)  
> **Classification:** ENGINEERING  
> **Baseline:** Platform 1.3 Engineering · ADR-0072 **ACCEPTED**  
> **Date:** 2026-07-22  
> **Status:** **ACCEPTED**  
> **Recommendation (historical):** READY FOR OWNER ENGINEERING ACCEPTANCE · Owner Decision 2026-07-22

## Scope

Implement ADR-0072 Phase A for Support only: transport abstraction with **SSE** as sole concrete transport; Gateway SSE endpoints; Support event subscriptions; Workbench live refresh; authn/authz; heartbeat; retry; back-pressure; diagnostics; health; metrics; configuration; feature flag.

**Not in scope:** WebSockets · Notification Delivery · ADR-0071 · Email SoR · FIN-001 · Workflow Execute · Support Chat · Collaborative Editing · Observe Realtime.

## Pack

| Document          | Path                                           |
| ----------------- | ---------------------------------------------- |
| SSE architecture  | [SSE-ARCHITECTURE.md](./SSE-ARCHITECTURE.md)   |
| Supported events  | [SUPPORTED-EVENTS.md](./SUPPORTED-EVENTS.md)   |
| Client connection | [CLIENT-CONNECTION.md](./CLIENT-CONNECTION.md) |
| Authorization     | [AUTHORIZATION.md](./AUTHORIZATION.md)         |
| Health            | [HEALTH.md](./HEALTH.md)                       |
| Diagnostics       | [DIAGNOSTICS.md](./DIAGNOSTICS.md)             |
| Metrics           | [METRICS.md](./METRICS.md)                     |
| Configuration     | [CONFIGURATION.md](./CONFIGURATION.md)         |
| Quality evidence  | [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)   |
| Known limitations | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md) |
| Completion report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Owner acceptance  | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)   |
