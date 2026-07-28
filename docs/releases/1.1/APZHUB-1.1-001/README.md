# APZHUB-1.1-001 — Release 1.1 Law Authorization Hardening (OBS-LAW-01)

> **Programme:** APZHUB-1.1-001  
> **Title:** Release 1.1 — Law Authorization Hardening (OBS-LAW-01)  
> **Classification:** ENGINEERING IMPLEMENTATION  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **READY FOR OWNER ACCEPTANCE** (accepted)  
> **Production baseline:** APZHUB Platform **1.0.0** (unchanged)  
> **Standard:** [Platform Delivery Standard](../../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)  
> **Date:** 2026-07-19  
> **Bootstrap:** AI-MANIFEST · repository evidence only

---

## Objective

Close **OBS-LAW-01** — Law Platform authorization residual (dev allow-all / `*` injection vs session AuthorizationService grants).

## Scope (done)

| Area                   | Change                                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| Workbench auth adapter | Pattern-aware `can()` (`legal.*`, `*`)                                  |
| Law registry hydration | Force `mode: "auth"` (workbench, commands, knowledge, events, activity) |
| Law client shell       | Pass session `authPermissionContext` + `permissionMode="auth"`          |
| Law HTTP API           | `resolveLawApiPermissions` always auth mode; no `*` injection           |
| Health summaries       | Unchanged — explicit `mode: "allow-all"` retained                       |

## Out of scope (STOP)

OBS-LAW-02 · FIN-001 · Email SoR · Release 1.2 · Identity / Workbench / Legal Business Core / HTTP API redesign

## Pack contents

| Document                                                   | Purpose                     |
| ---------------------------------------------------------- | --------------------------- |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)             | What was delivered          |
| [ACCEPTANCE-REPORT.md](./ACCEPTANCE-REPORT.md)             | Owner Acceptance request    |
| [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)               | Gates executed              |
| [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md) | Public API / SemVer posture |
| [ARCHITECTURE-NOTES.md](./ARCHITECTURE-NOTES.md)           | AuthZ path notes            |

## Recommendation

# READY FOR OWNER ACCEPTANCE
