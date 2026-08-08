# QX-PR-02 SCM Durability Evidence

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Timestamp | 20260807T232300Z                                                                          |
| Authority | [OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md](../OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md) |
| Status    | **OWNER ACCEPTANCE CANDIDATE — CLOSED**                                                   |
| Target    | APZQEP Version 1.1 Production Ready                                                       |

---

## Implementation complete

| Artefact   | Path / result                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Migrations | `0135_apz_qep_scm_sor.sql` · `0136_…_rls.sql` — applied via `pnpm db:migrate`                                                           |
| Tables     | `qep_scm_repository` · `qep_scm_webhook_audit` · `qep_scm_webhook_idempotency` · `qep_scm_traceability_link` on `apzhub-postgres:54334` |
| RLS        | `relrowsecurity = true` on all four tables                                                                                              |
| Store port | `packages/platform-scm/src/engine/repository-store.ts` — `RepositoryStore`                                                              |
| Adapter    | `packages/qep-scm/src/infrastructure/postgres-repository-store.ts`                                                                      |
| Factory    | `packages/qep-scm/src/infrastructure/persistence.ts` — `createScmPersistence`                                                           |
| Resolver   | `apps/web/lib/qep/persistence/resolve-scm-persistence.ts` — postgres default in production; fail-closed                                 |
| Runtime    | `apps/web/lib/qep/scm-runtime.ts` — wired via resolver + factory                                                                        |

---

## Operational evidence

| Check                                        | Result | Suite                                                                 |
| -------------------------------------------- | ------ | --------------------------------------------------------------------- |
| Migration execution                          | PASS   | `pnpm db:migrate` → `[db] Migrations applied`                         |
| Write + restart hydrate                      | PASS   | `testing/apzqep-qx-pr-02/scm-postgres-durability.integration.test.ts` |
| Tenant isolation (`list`)                    | PASS   | same                                                                  |
| Webhook audit + idempotency persist          | PASS   | same                                                                  |
| Fail-closed (no DATABASE_URL in production)  | PASS   | `apps/web/lib/qep/persistence/resolve-scm-persistence.test.ts`        |
| Fail-closed (memory forbidden in production) | PASS   | same                                                                  |
| Production default = postgres                | PASS   | same                                                                  |

```
Test Files  2 passed (2)
Tests       5 passed (5)
```

---

## Acceptance criteria map

| Criterion                           | Evidence                                                         |
| ----------------------------------- | ---------------------------------------------------------------- |
| Survives process restart            | New `createDb` client hydrates prior repository + webhook audit  |
| Tenant-scoped                       | `list(tenantA)` excludes tenantB                                 |
| Production uses Postgres by default | Mode resolution + fail-closed tests                              |
| Same durability bar as PR-01        | RepositoryStore port + Postgres adapter + RLS + resolver pattern |

**Owner acceptance candidate:** QX-PR-02 CLOSED.
