# APZHUB Quality Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** Document 015 · QA-002 · APZ TCMS · testing packages  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **quality engineering** components and gates.

---

## Inventory

| Component                        | Evidence                                                                                     | Status                                |
| -------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| **APZ TCMS**                     | testing-* **0.11.0**; APZTCMS-001…024                                                        | **Production** (PRWL where certified) |
| **Test Automation**              | Vitest monorepo suite · Playwright e2e                                                       | **Operational**                       |
| **Playwright**                   | `testing/playwright/e2e/` · product cert specs                                               | **Operational**                       |
| **Vitest**                       | Root vitest config · package tests                                                           | **Operational**                       |
| **Certification**                | Vertical audits · UI cert · product release evidence                                         | **Operational**                       |
| **Regression**                   | CI on every commit · cert suites                                                             | **Operational**                       |
| **Coverage**                     | Configured where packages require; not a single global mandate                               | **Partial / per-package**             |
| **Quality Gates**                | lint · types · build · tests · Playwright · security checks                                  | **Mandatory** (015 / DoD)             |
| **Repository Certification**     | QA-002 **PRODUCTION READY**                                                                  | **ACCEPTED / CLOSED**                 |
| **CI/CD Reference Adapter**      | `@apzhub/integration-github-actions` **0.1.0**                                               | **Frozen** reference                  |
| **Definition of Done / Ready**   | [ops DoD](../operations/DEFINITION-OF-DONE.md) · [DoR](../operations/DEFINITION-OF-READY.md) | **ACTIVE**                            |
| **Release Governance Checklist** | [RELEASE-GOVERNANCE-CHECKLIST](../releases/RELEASE-GOVERNANCE-CHECKLIST.md)                  | **ACTIVE**                            |

---

## Quality path (canonical)

```text
Change → lint → typecheck → unit/integration tests → build
  → (product) Playwright cert → docs → Owner Acceptance → main
```

Failing gates never merge to `main`.

---

## Related

- [ENTERPRISE-ARCHITECTURE-CATALOGUE.md](./ENTERPRISE-ARCHITECTURE-CATALOGUE.md)
- [ARCHITECTURE-MATURITY-MATRIX.md](./ARCHITECTURE-MATURITY-MATRIX.md)
