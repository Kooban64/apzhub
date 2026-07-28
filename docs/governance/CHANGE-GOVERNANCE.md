# APZOR Change Governance

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20  
> **Bridges:** [CHANGE-MANAGEMENT.md](../operations/CHANGE-MANAGEMENT.md) · CAB

---

## Enterprise rule

No Production change without a Change record and appropriate authority (CAB / Emergency path / Owner for Major).

## Change classes (enterprise)

| Class             | Authority            | Notes                |
| ----------------- | -------------------- | -------------------- |
| Standard          | Pre-approved runbook | Low risk             |
| Normal            | CAB                  | Scheduled            |
| Emergency         | Expedited + PIR      | Hotfix Policy        |
| Major / Programme | Owner Approval       | SemVer, STOP, freeze |

## Asset governance (change-linked)

Changes that alter inventory (hosts, certs, services, vendors) update Configuration / Asset records ([CONFIGURATION-MANAGEMENT.md](../operations/CONFIGURATION-MANAGEMENT.md)).

## Vendor / supplier changes

Engine upgrades, credential rotations, and hosting changes are Changes; branding must remain masked in user communications.
