# LAW-015-13 — Technical Debt & LAW-015-14 Recommendation

---

## Technical debt

| Item                                | Severity | Notes                                                                     |
| ----------------------------------- | -------- | ------------------------------------------------------------------------- |
| UI mutation forms absent            | Medium   | E2E validates seeded read models; full journey requires REST hybrid       |
| Workbench vs API memory isolation   | Medium   | UI workbench and REST API use separate in-memory bundles                  |
| No shared Playwright auth fixture   | Low      | `signIn()` duplicated across specs                                        |
| Allocation POST not exposed         | Low      | API workflow uses service harness                                         |
| Interest rule POST not exposed      | Low      | API workflow uses service harness                                         |
| Transfer approve/post REST          | Low      | Only draft creation exposed                                               |
| Permission denial E2E               | Low      | Dev allow-all mode; 403 covered in Vitest                                 |
| Next.js dynamic route slug conflict | Fixed    | Unified `[trustTransactionId]` for post + reverse                         |
| Client bundle imports PostgreSQL    | High     | Partial fix — workbench uses in-memory repos; full factory split deferred |
| OpenAPI trust export paths          | Low      | Still not in `LAW-OpenAPI-v1.yaml`                                        |

---

## Test summary

| Suite                      | New tests | Total (approx.) |
| -------------------------- | --------- | --------------- |
| API workflow validation    | 1         | —               |
| Playwright trust E2E       | 7         | —               |
| Existing trust unit/API/UI | —         | 1845+           |

---

## Recommendation for LAW-015-14 (Closeout)

Proceed with **LAW-015-14 — Trust Documentation** as milestone documentation closeout:

1. **Developer guide** — `docs/developer/legal-trust-developer-guide.md` (architecture, services, API usage)
2. **Operator guide** — reconciliation and reporting runbook
3. **OpenAPI update** — trust paths including export endpoints
4. **Manifest template** — trust module registration example
5. **Onboarding update** — link trust workbench from law platform onboarding

Defer until LAW-015-15:

- Bank integration, outbox workers, Financial Engine extraction
- REST-backed workbench UI
- Playwright permission-denial scenarios (requires RBAC seed or env flag)

---

## Stop condition

LAW-015-13 validation complete. Await owner approval before LAW-015-14 or any new implementation.
