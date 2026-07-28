# APZ Law Platform — Testing Strategy (Release 1.0)

> **Programme:** APZ-LAW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** Document 015 · QA-002 · existing Law tests on disk

---

## Pyramid (for future packaging programme)

| Layer            | Scope                                                               |
| ---------------- | ------------------------------------------------------------------- |
| Unit             | legal-business-core · law-platform lib (matters, trust, billing, …) |
| Component        | Law Workbench components · UX layouts                               |
| Integration      | Workflow / outbox / postgres repository tests where present         |
| API              | LAW OpenAPI alignment · AuthZ · platform health/governance routes   |
| E2E (Playwright) | Law critical paths — revalidate or document limitation at packaging |
| Regression       | Existing law-platform test suite remains green                      |

---

## Existing evidence (retain)

- Extensive tests under `apps/law-platform` (workflows, trust reconciliation, search, persistence, diagnostics, …)
- LAW OpenAPI collections (Bruno/Postman)
- Historical readiness / validation artefacts

---

## Non-goals for this planning programme

No tests executed. No packages built. No CI changes.
