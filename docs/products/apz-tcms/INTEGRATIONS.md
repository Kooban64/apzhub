# APZ TCMS — Integrations (Release 1.0 Planning)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [INTEGRATION-PRODUCT-CAPABILITY-INVENTORY](../../foundation/INTEGRATION-PRODUCT-CAPABILITY-INVENTORY.md) · ADR-0059

---

## Provider integrations

| Provider                                    | Role                                 | CE/self-hosted                 | Status                                                                                   |
| ------------------------------------------- | ------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------- |
| Native testing-* SoR                        | System of Record                     | Yes                            | **On disk** · APZTCMS-001…024                                                            |
| GitHub Actions                              | CI/CD metadata (read-only certified) | Yes (GHA)                      | `@apzhub/integration-github-actions` **0.1.0** · **frozen** · PRWL                       |
| GitLab CI                                   | CI/CD metadata (read-only)           | Yes (self-hosted / gitlab.com) | `@apzhub/integration-gitlab-ci` **0.1.0** · R12-TCMS-01 (APZHUB-1.2-007) · metadata only |
| Kiwi TCMS                                   | Historical OSS option                | —                              | **ABSENT** · **SUPERSEDED** (ADR-0059)                                                   |
| Result adapters (Vitest/Playwright/JUnit/…) | Result ingestion                     | OSS formats                    | Pattern documented; not a Kiwi wrapper                                                   |

---

## Cross-product integrations (assessment)

| Product / capability      | Release 1.0 expectation                                                                                          | Evidence / notes                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **APZ Projects**          | **Partial / present patterns** — requirements/traceability adjacency; no new Projects features in this pack      | Projects Production **1.1.0**; TCMS requirements model links delivery context |
| **APZ Workflow**          | **Optional / later** — automations may trigger or consume test events later; **not** required for TCMS packaging | Workflow **1.0.0** filing separate; no TCMS→Workflow bypass                   |
| **APZ Analytics**         | **Optional / later** — quality dashboards may appear in Analytics; EI/executive dashboards exist inside TCMS     | Do not embed Metabase in TCMS                                                 |
| **Identity**              | **Required** — BetterAuth + PermissionService; testing permissions server-authoritative                          | No TCMS engine login                                                          |
| **Search**                | **Present** — `@apzhub/search-testing` **0.1.1** Search Publication                                              | No standalone TCMS search engine                                              |
| **Documents**             | **Partial / later** — evidence/document adjacency; Documents **1.0.0** metadata-first                            | Do not invent binary DMS inside TCMS                                          |
| **Notification services** | **Partial / later** — events → Platform Notification Framework only; no TCMS-owned notify subsystem              | Notification SoR frozen separately                                            |

---

## Integration rules

1. Modules never import adapter clients.
2. HTTP handlers call `gateway.testing.*` only.
3. Workbench calls `/api/v1/testing/*` only.
4. Integration SDK **1.0.0** Architecture Frozen.
5. Engine brands never appear as primary UX.
6. Kiwi must not be introduced as silent “fix” for native SoR.

---

## Status

Documented against disk. This programme does **not** create integrations, contracts, or adapters.
