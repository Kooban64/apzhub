# APZ TCMS — Testing Strategy (Release 1.0)

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** Document 015 · QA-002 · APZTCMS audits

---

## Pyramid (for future packaging programme)

| Layer            | Scope                                                    |
| ---------------- | -------------------------------------------------------- |
| Unit             | testing-contracts · services · persistence · permissions |
| Component        | Workbench testing views · boundary tests                 |
| Integration      | GHA adapter (mock / env-gated)                           |
| API              | `/api/v1/testing*` AuthZ · OpenAPI alignment             |
| E2E (Playwright) | Testing Workbench smoke — revalidate at packaging        |
| Regression       | Existing APZTCMS vertical audit commands remain green    |

---

## Existing evidence (retain)

- APZTCMS-019 GHA supporting audits
- Component/unit tests under `apps/web/components/testing` and testing packages
- Architecture boundary tests

---

## Non-goals for this planning programme

No tests executed. No packages built. No CI changes.
