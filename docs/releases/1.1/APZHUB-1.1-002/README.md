# APZHUB-1.1-002 — Release 1.1 Law Operational Hardening (OBS-LAW-02)

> **Programme:** APZHUB-1.1-002  
> **Title:** Release 1.1 — Law Operational Hardening (OBS-LAW-02)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **READY FOR OWNER ACCEPTANCE** (accepted)  
> **Production baseline:** APZHUB Platform **1.0.0** (unchanged)  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-19  
> **Bootstrap:** AI-MANIFEST · repository evidence only

---

## Objective

Close **OBS-LAW-02** — persistent activity/notification stores deferred (session-only UX residual).

## Scope (done)

| Area                        | Change                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------- |
| ATF                         | `PersistedActivitySessionStore` — durable store behind `ActivitySessionStore`         |
| ENF                         | `PersistedNotificationSessionStore` — durable store behind `NotificationSessionStore` |
| Law composition             | Inject durable stores when `persistenceScope` (user/tenant) is present                |
| Law client shell            | Pass session user/tenant into ENF/ATF hooks                                           |
| Health / registry hydration | Unchanged (registries only; no parallel Law notify subsystem)                         |

## Out of scope (STOP)

FIN-001 · Email SoR · Release 1.2 · Law / Workbench / Identity / HTTP redesign · new legal functionality

## Pack contents

| Document                                                   | Purpose                     |
| ---------------------------------------------------------- | --------------------------- |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)             | What was delivered          |
| [ACCEPTANCE-REPORT.md](./ACCEPTANCE-REPORT.md)             | Owner Acceptance request    |
| [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)               | Gates executed              |
| [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md) | Public API / SemVer posture |
| [ARCHITECTURE-NOTES.md](./ARCHITECTURE-NOTES.md)           | Persistence path notes      |

## Recommendation

# READY FOR OWNER ACCEPTANCE
