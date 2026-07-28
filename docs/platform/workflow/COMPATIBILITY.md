# Workflow Platform — Compatibility Statement

> **Programme:** APZHUB-PLATFORM-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19

---

## Compatibility with engineering baseline

| Component                      | Version / status              | This programme                                                                    |
| ------------------------------ | ----------------------------- | --------------------------------------------------------------------------------- |
| `@apzhub/integration-sdk`      | **1.0.0** Architecture Frozen | **Unchanged**                                                                     |
| `@apzhub/integration-n8n`      | **0.1.0**                     | **Unchanged**                                                                     |
| `@apzhub/workflow-contracts`   | **0.4.0**                     | Additive IM contracts (APZHUB-PLATFORM-WORKFLOW-003) — SoR/engine facets retained |
| `@apzhub/workflow-core`        | **0.1.1**                     | **Unchanged**                                                                     |
| `@apzhub/workflow-persistence` | **0.1.1**                     | **Unchanged**                                                                     |
| `@apzhub/platform-services`    | **0.28.0**                    | **Unchanged**                                                                     |
| Workflow HTTP / Workbench      | Frozen APZWORKFLOW surfaces   | **Unchanged**                                                                     |
| ADR-0068 / ADR-0069            | **Accepted** (this programme) | Architecture recognition only                                                     |

---

## Forward compatibility

1. Future execute/schedule programmes must preserve SoR IDs and AuthZ patterns or take Major-compatible paths with Owner Approval.
2. New providers implement the same Platform Service contracts.
3. Integration SDK freeze remains unless ADR + Owner change SDK.
4. Commercial APZ Workflow 1.0 consumes this platform — does not fork it.

---

## This programme

Documentation + ADRs only — **no** package or API version changes.
