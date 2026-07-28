# APZ TCMS — Compatibility Statement (Planning)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Status:** Planning baseline — not a Production SemVer compatibility claim

---

## Current disk baseline

| Component                            | Version / status           | Notes                          |
| ------------------------------------ | -------------------------- | ------------------------------ |
| `@apzhub/integration-sdk`            | **1.0.0**                  | Architecture Frozen            |
| `@apzhub/testing-contracts`          | **0.11.0**                 | Domain contracts               |
| `@apzhub/testing-foundation`         | **0.1.0**                  | Registries                     |
| `@apzhub/testing-persistence`        | **0.11.0**                 | Persistence                    |
| `@apzhub/testing-services`           | **0.11.0**                 | Domain services                |
| `@apzhub/integration-github-actions` | **0.1.0**                  | GHA Reference Adapter · frozen |
| `@apzhub/search-testing`             | **0.1.1**                  | Search Publication             |
| Testing HTTP                         | `/api/v1/testing/*`        | Present                        |
| Workbench                            | Testing module (`testing`) | Present                        |
| Kiwi adapter                         | **ABSENT**                 | Superseded                     |

---

## Release 1.0 compatibility rules (future packaging)

1. Workbench → HTTP only; handlers → `gateway.testing.*` only.
2. Breaking Testing HTTP requires Major SemVer + Owner Approval.
3. GHA Reference Adapter Standard changes require ADR + Owner.
4. Introducing Kiwi or GitLab is a **new** programme — not a silent patch to **1.0.0**.
5. Other Production products unaffected by this planning pack.

---

## This programme

Documentation only — **no** package or API version changes.
