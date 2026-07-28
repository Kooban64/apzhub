# APZ Workflow — Release Plan & Version Strategy

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Standards:** [PRODUCT-RELEASE-STANDARD](../PRODUCT-RELEASE-STANDARD.md) · [RELEASE-NAMING-STANDARD](../../releases/RELEASE-NAMING-STANDARD.md) · [RELEASE-MANAGEMENT-STANDARD](../../operations/RELEASE-MANAGEMENT-STANDARD.md)

---

## Version strategy

| Line             | Form      | Meaning                                          | Authorisation                                     |
| ---------------- | --------- | ------------------------------------------------ | ------------------------------------------------- |
| First commercial | **1.0.0** | First Production product SemVer for APZ Workflow | Future certification programme + Owner Acceptance |
| Patch            | **1.0.x** | Backward-compatible fixes                        | Owner Approval                                    |
| Minor            | **1.1.0** | Backward-compatible features                     | Owner Approval                                    |
| Major            | **2.0.0** | Breaking product changes / multi-engine GA       | Owner Approval                                    |

Engine versions (n8n, future Temporal, etc.) are connector-internal — never user-facing product versions.

---

## Release phases (planning — not authorised)

| Phase                              | Intent                                                          | Gate                                  |
| ---------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| **P0 — Planning**                  | This pack (APZ-WORKFLOW-001)                                    | Owner Acceptance                      |
| **P1 — Architecture unlock**       | ADR(s) for execute/schedule/credentials/approvals beyond freeze | Owner + ADR Acceptance                |
| **P2 — Implementation programmes** | Named programmes for services/HTTP/Workbench/product UX         | Owner Approval per programme          |
| **P3 — Certification**             | Quality gates + `docs/releases/workflow/1.0.0/`                 | Owner Acceptance of release programme |
| **P4 — Production baseline**       | Portfolio register + commercial catalogue SemVer                | Owner Acceptance                      |

---

## Current posture (repository evidence)

| Layer                                       | Status                                                     |
| ------------------------------------------- | ---------------------------------------------------------- |
| Workflow SoR (APZWORKFLOW-001…005)          | **PRODUCTION_READY_WITH_LIMITATIONS** · frozen             |
| Workflow Engine / n8n (APZWORKFLOW-006…011) | **PRODUCTION_READY_WITH_LIMITATIONS** · frozen · read-only |
| Commercial product SemVer                   | **None**                                                   |
| This planning pack                          | **Awaiting Acceptance**                                    |

---

## Release artefacts (future 1.0.0)

```text
docs/releases/workflow/1.0.0/
  README.md
  … Release Notes · Quality Evidence · Compatibility · Known Limitations links
```

Plus completion / acceptance reports under `docs/sprint/` and `docs/foundation/completion-reports/`.

---

## Rules

1. This document does **not** authorise Patch/Minor/Major or implementation.
2. Architecture Frozen: execute/schedule expansion needs ADR + Owner.
3. Mandatory checklist: [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) · [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md).
