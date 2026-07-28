# Workflow Platform — Security Model

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** [013 Security](../../013-security-zero-trust-standards.md) · Zero Trust  
> **Date:** 2026-07-19

---

## 1. Zero Trust controls

Every Workflow Platform request:

1. Authenticated (Better Auth session / service identity)
2. Authorised (`workflow.*` / future run/schedule/approval keys)
3. Validated (schemas)
4. Audited (immutable audit where required)
5. Correlated (correlation ID)

---

## 2. Permissions (pattern)

| Area                                  | Pattern                                            |
| ------------------------------------- | -------------------------------------------------- |
| Catalogue / templates                 | `workflow.*` (existing SoR keys)                   |
| Engine discovery                      | `workflow.engine.*` (existing)                     |
| Runs / schedules / approvals (target) | Additive keys — Owner-approved catalogue expansion |

Least privilege for users, services, connectors, and workers. Superadmin is explicit tier, not bypass.

---

## 3. Credentials & secrets

| Rule      | Requirement                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------- |
| Storage   | Credential **references** in platform metadata; secrets in approved secret stores / engine vaults |
| UI / logs | Never emit plain secrets                                                                          |
| Modules   | Never hold engine API keys                                                                        |
| Adapters  | Retrieve secrets via secure config refs only                                                      |

---

## 4. Tenancy & isolation

Tenant-ready schema and AuthZ scoping for catalogue, runs, and approvals. Engine tenancy constrained by provider CE capabilities — documented as limitations.

---

## 5. HITL / approvals

Approval decisions are authenticated, authorisation-checked, audited, and immutable. Impersonation forbidden.

---

## 6. Freeze note

Security patterns for existing SoR/engine surfaces remain as certified. Expanding permission catalogues or credential runtime requires Owner-approved programmes.
