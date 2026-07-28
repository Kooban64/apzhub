# APZ TCMS 1.0.0 — Operational Readiness

> **Release:** APZ TCMS **1.0.0**  
> **Programme:** APZ-TCMS-002  
> **Status:** Certification filed — **Awaiting Acceptance**  
> **Date:** 2026-07-19

---

## Enablement

| Control          | Requirement                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Auth             | Better Auth session + testing/certification permissions               |
| Gateway          | Platform API pipeline → `gateway.testing.*`                           |
| Persistence      | Platform PostgreSQL (TCMS metadata)                                   |
| Evidence storage | Configured S3-compatible / storage refs — never plain secrets in repo |
| CI provider      | GHA credential **references** only when live path enabled             |
| Search           | search-testing publication when Search enabled                        |
| Health           | Platform health hierarchy (module / service / adapter)                |

---

## Operator checklist

1. Users with Testing permissions see Testing module navigation
2. `/api/v1/testing` family respects AuthZ
3. GHA adapter health without exposing GitHub admin UI as primary UX
4. Secrets never in logs or repos
5. Backup covers PostgreSQL metadata + evidence storage
6. Known Limitations understood (GHA read-only CI metadata; no Kiwi/GitLab/AI)

---

## Limitations affecting ops

| Area                      | Posture                                                    |
| ------------------------- | ---------------------------------------------------------- |
| GHA dispatch/rerun/cancel | **Not in certified product scope** (APZTCMS-019 non-goals) |
| Kiwi ops                  | **N/A** — absent                                           |
| GitLab ops                | **N/A** — absent                                           |
| AI Assist ops             | **N/A** — deferred                                         |

---

## Related

- [Administrator Guide](./guides/ADMINISTRATOR-GUIDE.md)
- [APZTCMS-019 Production Readiness](../../reviews/APZTCMS-019-production-readiness.md)
