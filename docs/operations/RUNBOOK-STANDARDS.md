# APZHUB Runbook Standards

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20

---

## Purpose

Standardise operational runbooks so L1/L2 can execute safely without redesigning platforms.

## Mandatory runbook sections

1. **Title / service / owner**
2. **Symptoms** (user + health signals)
3. **Severity guidance**
4. **Preconditions** (access, freeze warnings)
5. **Diagnosis steps** (commands/checks — no secrets)
6. **Containment**
7. **Resolution / rollback**
8. **Verification**
9. **Escalation**
10. **Related KL / ADRs**

## Placement

| Type              | Location                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| Platform runbooks | `docs/operations/runbooks/` (create as needed under Change)             |
| Product runbooks  | Product ops packs / `docs/releases/*/OPERATIONAL-READINESS.md` pointers |
| Engine-internal   | Adapter-owned; never user-facing                                        |

## Rules

- Prefer read-only diagnosis first.
- No `curl` of production secrets into chat logs.
- Mask engine brand names in user communications.
- Runbooks for STOP surfaces must say **UNSUPPORTED**.

## Minimum Production runbook set (governance)

Identity unavailable · Gateway 5xx · Platform DB restore · Redis session storm · Support adapter unhealthy · Law AuthZ denials spike · Event Bus publish failures · Automation deferred flood (informational).
