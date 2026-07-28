# APZ TCMS 1.0.0 — Compatibility Statement

> **Release:** APZ TCMS **1.0.0**  
> **Programme:** APZ-TCMS-002  
> **Status:** Certification filed — **Awaiting Acceptance**  
> **Date:** 2026-07-19

---

## Baseline

| Component                            | Version / status    | Notes                          |
| ------------------------------------ | ------------------- | ------------------------------ |
| `@apzhub/integration-sdk`            | **1.0.0**           | Architecture Frozen            |
| `@apzhub/testing-contracts`          | **0.11.0**          | Domain contracts               |
| `@apzhub/testing-foundation`         | **0.1.0**           | Registries                     |
| `@apzhub/testing-persistence`        | **0.11.0**          | Persistence                    |
| `@apzhub/testing-services`           | **0.11.0**          | Domain services                |
| `@apzhub/integration-github-actions` | **0.1.0**           | GHA Reference Adapter · frozen |
| `@apzhub/search-testing`             | **0.1.1**           | Search Publication             |
| Testing HTTP                         | `/api/v1/testing/*` | Present                        |
| Workbench                            | module `testing`    | Present                        |
| Kiwi adapter                         | **ABSENT**          | Superseded · excluded          |
| GitLab adapter                       | **ABSENT**          | Excluded from Release 1.0      |

---

## Compatibility rules

1. Workbench consumes Platform HTTP only — handlers call `gateway.testing.*` only.
2. Breaking Testing HTTP requires Major SemVer + Owner Approval.
3. GHA Reference Adapter Standard changes require ADR + Owner.
4. Introducing Kiwi or GitLab is a **new** programme — not a Patch to **1.0.0**.
5. AI Assist is out of scope — never auto-certify.
6. Other Production products (Projects, Time, Support, Documents, Analytics, Workflow) are unaffected by this packaging.

---

## Consumers

| Consumer                        | Expectation                                                    |
| ------------------------------- | -------------------------------------------------------------- |
| APZHUB Workbench Testing module | HTTP `/api/v1/testing/*`                                       |
| Platform Search                 | `search-testing` publication                                   |
| Future Workflow automations     | Optional; not required for TCMS 1.0.0                          |
| Projects / Documents / Support  | Traceability / evidence / defect adjacency as already designed |
