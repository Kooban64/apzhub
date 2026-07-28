# APZHUB Audit Operations

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Authority:** Document **011** · platform audit SoR

---

## Scope

Operate and query the **platform audit** trail for security, compliance, and incident investigation.

## Rules

| Rule        | Detail                                                        |
| ----------- | ------------------------------------------------------------- |
| Append-only | Audit rows are never updated/deleted by operators             |
| Correlation | Link HTTP `correlationId` and event IDs                       |
| Scope       | Platform mutations and security-relevant actions              |
| Access      | Permission-gated; least privilege for auditors                |
| Export      | Controlled export for investigations; no engine brand leakage |

## Operational use cases

1. Who changed AuthZ assignments?
2. Which Support mutations preceded an incident?
3. Superadmin actions review
4. Failed AuthZ denials spike analysis

## Out of scope

Engine-native audit UIs are not the APZHUB audit SoR. Adapter translation may surface summaries only through platform services.
