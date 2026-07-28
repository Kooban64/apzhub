# APZHUB Platform 1.1.0 — CHANGELOG

> **Programme:** APZHUB-1.1-006  
> **Date:** 2026-07-20  
> **Predecessor:** Platform **1.0.0** (2026-07-19)

---

## [1.1.0] — 2026-07-20

### Added

- Cross-Product Automation Foundation (platform registration, event-driven handlers, workflow-trigger deferred intents) — APZHUB-1.1-004
- Support Event Bus catalogue publish + ENF Notification Attention foundation — APZHUB-1.1-003
- Platform durable ENF/ATF session stores for Law activity/notifications — APZHUB-1.1-002
- Official Platform **1.1.0** portfolio certification pack — this directory

### Changed

- Law AuthZ path hardened (OBS-LAW-01) — APZHUB-1.1-001
- Platform Production Baseline naming: **1.1.0** supersedes **1.0.0** upon Owner Acceptance of this pack
- Known Limitations updated for closed OBS-LAW-01/02, Support Event Bus/Attention, Automation Foundation

### Fixed

- Law permission pattern matching / no `*` injection on AuthZ path (OBS-LAW-01)
- Law session-only activity/notification UX (OBS-LAW-02)

### Deferred (unchanged STOP)

- Email System of Record
- FIN-001 Financial Engine extraction
- Workflow / n8n provider execute unlock
- Support webhook ingress · binary attachments · realtime WS/SSE
- Product AU-* automations (e.g. Support→Projects task create)
- Release 1.2 features

### Compatibility

- Public APIs additive-compatible with Platform **1.0.0**
- Commercial product SemVer baselines unchanged in this packaging programme
