# LAW-015-11 — Technical Debt & LAW-015-12 Recommendation

---

## Technical debt

| Item                      | Severity | Notes                                                                                                                                  |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Service constructor casts | Medium   | Domain services still typed to `InMemory*` repositories; postgres adapters satisfy interfaces but require casts in factory             |
| Partial outbox coverage   | Low      | Outbox wired for account create/update and transaction post/reverse only; workflow/approval/transfer events remain in-memory event bus |
| JSONB payload entities    | Low      | Drafts, transfers, approvals stored as JSONB for speed; normalise hot paths if query performance requires                              |
| OpenAPI registration      | Low      | Trust paths not yet added to `docs/specs/LAW-OpenAPI-v1.yaml`                                                                          |
| Workbench API wiring      | Medium   | UI still uses `getSharedTrustWorkbench()` in-process; REST APIs ready for client integration                                           |
| `TrustUnitOfWork`         | Low      | Uses inline transactions in store; dedicated unit-of-work type deferred                                                                |
| Interest accrual API      | Low      | POST `/interest` requires pre-existing rule ID; rule CRUD API deferred                                                                 |

---

## Test report summary

- **1816** tests passed, **44** skipped (postgres integration when `DATABASE_URL` unavailable)
- New: 10 Trust API tests, 2 repository parity tests, 2 postgres integration suites (tenant + outbox)
- All quality gates green

---

## Recommendation for LAW-015-12

**Proposed title:** Trust Exports & Operational Integration (owner approval required)

Priority order after owner sign-off:

1. **Report export rendering** — PDF/Excel for existing report metadata (no new accounting logic)
2. **OpenAPI + client SDK** — register trust paths; optional typed client for workbench
3. **Workbench API backing** — switch Trust Workbench reads/writes to REST behind Platform Service boundary
4. **Outbox workers** — consume `legal.trust.*` outbox rows for audit/search/activity indexing
5. **Bank feed adapter skeleton** — read-only statement import (no payment gateway)

Defer Financial Engine extraction until Law trust flows are stable on postgres in production-like environments.
