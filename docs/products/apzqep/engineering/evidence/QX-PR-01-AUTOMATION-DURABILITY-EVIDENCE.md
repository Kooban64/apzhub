# QX-PR-01 Automation Durability Evidence

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Timestamp | 20260807T212300Z                                                                          |
| Authority | [OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md](../OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md) |
| Status    | **OWNER ACCEPTANCE CANDIDATE — CLOSED**                                                   |
| Target    | APZQEP Version 1.1 Production Ready                                                       |

---

## Implementation complete

| Artefact   | Path / result                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Migrations | `0131_apz_qep_automation_execution.sql` · `0132_…_rls.sql` — applied via `pnpm db:migrate`                     |
| Table      | `qep_automation_execution` present on `apzhub-postgres:54334`                                                  |
| RLS        | `relrowsecurity = true`                                                                                        |
| Adapter    | `packages/qep-automation/src/infrastructure/postgres-execution-store.ts`                                       |
| Resolver   | `apps/web/lib/qep/persistence/resolve-automation-persistence.ts` — postgres default in production; fail-closed |

---

## Operational evidence

| Check                                        | Result | Suite                                                                        |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| Migration execution                          | PASS   | `pnpm db:migrate` → `[db] Migrations applied`                                |
| Write + restart hydrate                      | PASS   | `testing/apzqep-qx-pr-01/automation-postgres-durability.integration.test.ts` |
| Tenant isolation (`list`)                    | PASS   | same                                                                         |
| Fail-closed (no DATABASE_URL in production)  | PASS   | `apps/web/lib/qep/persistence/resolve-automation-persistence.test.ts`        |
| Fail-closed (memory forbidden in production) | PASS   | same                                                                         |
| Production default = postgres                | PASS   | same                                                                         |

```
Test Files  2 passed (2)
Tests       5 passed (5)
```

---

## Acceptance criteria map

| Criterion                           | Evidence                                       |
| ----------------------------------- | ---------------------------------------------- |
| Survives process restart            | New `createDb` client hydrates prior execution |
| Tenant-scoped                       | `list(tenantA)` excludes tenantB               |
| Production uses Postgres by default | Mode resolution + fail-closed tests            |
| Wave 1 residual cleared             | Durable store is production default path       |

**Owner acceptance candidate:** QX-PR-01 CLOSED.
