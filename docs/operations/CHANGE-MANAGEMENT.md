# APZHUB Change Management

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Complements:** [CHANGE-MANAGEMENT-STANDARD.md](./CHANGE-MANAGEMENT-STANDARD.md)

---

## Purpose

Control risk when Production (or Staging cutover) configuration, infrastructure, or software changes.

## Change types

| Type              | Approval                  | Examples                                                |
| ----------------- | ------------------------- | ------------------------------------------------------- |
| Standard          | Pre-approved runbook      | Certificate renew (documented), rotate non-prod secrets |
| Normal            | Change Manager / Ops Lead | Config change, dependency bump, scheduled deploy        |
| Emergency         | Expedited + post-review   | P1 hotfix ([HOTFIX-POLICY.md](./HOTFIX-POLICY.md))      |
| Major / programme | Owner Approval            | SemVer release, freeze exception, STOP reopen           |

## Lifecycle

```text
Request → Assess risk → Approve → Schedule window → Implement → Verify → Close / Rollback
```

## Forbidden without Owner Approval

- Architecture freeze changes
- Email SoR / FIN-001 / Workflow execute unlock / Release 1.2
- Host-wide changes that disrupt legacy `apz-stack` coexistence
- Production secret commits to git

## Maintenance windows

Prefer announced low-traffic windows for Normal changes. Emergency changes may break windows with dual approval (Ops Lead + Release Manager) and mandatory PIR.
