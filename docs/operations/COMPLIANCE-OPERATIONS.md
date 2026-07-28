# APZHUB Compliance Operations

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Purpose

Operate APZHUB within legal/regulatory/policy constraints applicable to the deploying organisation — without claiming certifications not in evidence packs.

## Compliance anchors (platform)

| Area                 | Platform posture                                                        |
| -------------------- | ----------------------------------------------------------------------- |
| Audit trail          | Immutable platform audit for mutations                                  |
| Access control       | PermissionService + RequestPipeline                                     |
| Data residency / SoR | Document **011** — one SoR per datum                                    |
| Privacy              | Recipient address hints only in Notification SoR; no delivery providers |
| Change evidence      | Change/Release records                                                  |
| Known Limitations    | Honest PRWL marketing                                                   |

## Operational duties

1. Retain audit logs per org retention policy.
2. Periodic access reviews (especially superadmin).
3. Evidence packs for Production Baseline kept under `docs/releases/`.
4. Do not market Email SoR / Workflow execute / FIN-001 as compliant delivered features.

## Organisation-specific controls

Map local ISO/SOC/HIPAA/etc. requirements onto this framework via Owner-approved overlays — not by forking platform architecture.
