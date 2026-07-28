# APZ Documents — Testing Strategy (Release 1.0)

> **Programme:** APZ-DOCUMENTS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Authority:** Document 015 · QA-002 PRODUCTION READY · APZDOCS-006

---

## Pyramid (for future certification packaging programme)

| Layer            | Scope                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| Unit             | document-contracts · document-core · permissions · storage coordination  |
| Component        | Workbench views · routers · boundary tests (no connector imports)        |
| Integration      | Persistence / storage providers (in-memory + env-gated where applicable) |
| API              | `/api/v1/documents*` OpenAPI · AuthZ matrix                              |
| E2E (Playwright) | Documents Workbench smoke — revalidate LIMITED historical status         |
| Regression       | `pnpm audit:document-vertical` + APZDOCS audit scripts must remain green |

---

## Existing evidence (retain)

- APZDOCS-006 vertical certification suite
- `testing/document-vertical` · `testing/document-foundation`
- OpenAPI platform validation
- Search-documents package tests (Search Publication freeze)

---

## Release 1.0 certification tests (future)

1. Permission-filtered Documents navigation
2. No Module → Connector bypass
3. No external DMS brand in standard UI
4. Metadata lifecycle actions (classify/archive/restore) behind AuthZ
5. Search publication compatibility (no standalone Documents search engine)
6. Known Limitations still accurate

---

## Non-goals for this planning programme

No tests executed. No packages built. No CI changes.
