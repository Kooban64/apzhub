# APZ Workflow — Testing Strategy (Release 1.0)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** [015 Quality](../../015-quality-assurance-testing-release-standards.md) · QA-002 PRODUCTION READY

---

## Pyramid (when implementation is authorised)

| Layer            | Scope                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Unit             | Contracts · services · permissions · adapters (mock-first)                                                                   |
| Component        | Workbench views · routers · boundary tests (no connector imports)                                                            |
| Integration      | Platform Service → Adapter (mock + optional env-gated live)                                                                  |
| API              | `/api/v1/workflows*` OpenAPI contract tests · AuthZ matrix                                                                   |
| E2E (Playwright) | Catalogue · templates · runs · approvals · health · diagnostics                                                              |
| Regression       | Frozen SoR + Engine audits (`audit:workflow-vertical`, `audit:workflow-engine-vertical`) must remain green or Owner-accepted |

---

## Existing evidence (foundation — retain)

- APZWORKFLOW SoR + Engine certification baselines (PRWL)
- Env-gated live n8n adapter (`APZHUB_WORKFLOW_ENGINE_ENABLED`)
- Playwright live webServer historically LIMITED (external Testing slug conflict — revalidate in future cert)

---

## Release 1.0 certification tests (future)

1. Permission-filtered navigation and command surfaces
2. No Module → Connector bypass
3. No engine brand in standard UI
4. Secrets redaction in logs/UI
5. Idempotent retries / failure paths (if execute in scope)
6. Cross-product integration smoke (mocked)

---

## Non-goals for this planning programme

No tests executed. No packages built. No CI changes.
