# QX-PR-03 Quality Intelligence Durability Evidence

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Timestamp | 20260807T232700Z                                                                          |
| Authority | [OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md](../OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md) |
| Status    | **OWNER ACCEPTANCE CANDIDATE — CLOSED**                                                   |
| Target    | APZQEP Version 1.1 Production Ready                                                       |

---

## Implementation complete

| Artefact   | Path / result                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Migrations | `0137_apz_qep_qi_sor.sql` · `0138_…_rls.sql` — applied via `pnpm db:migrate`                                              |
| Tables     | `qep_qi_observation` · `qep_qi_signal` · `qep_qi_recommendation` · `qep_qi_explanation` · `qep_qi_score` · `qep_qi_audit` |
| RLS        | `relrowsecurity = true` on all six tables (`app.tenant_id`)                                                               |
| Store port | `packages/platform-quality-intelligence/src/store/intelligence-store.ts` — `IntelligenceStore`                            |
| Adapter    | `packages/qep-quality-intelligence/src/infrastructure/postgres-intelligence-store.ts`                                     |
| Factory    | `packages/qep-quality-intelligence/src/infrastructure/persistence.ts` — `createQiPersistence`                             |
| Resolver   | `apps/web/lib/qep/persistence/resolve-qi-persistence.ts` — postgres default in production; fail-closed                    |
| Runtime    | `apps/web/lib/qep/qi-runtime.ts` — wired via resolver + factory                                                           |

---

## Operational evidence

| Check                                                                                       | Result | Suite                                                                |
| ------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| Migration execution                                                                         | PASS   | `pnpm db:migrate` → `[db] Migrations applied`                        |
| Write + restart hydrate                                                                     | PASS   | `testing/apzqep-qx-pr-03/qi-postgres-durability.integration.test.ts` |
| Tenant isolation (`listObservations`)                                                       | PASS   | same                                                                 |
| Immutable observation duplicate rejection                                                   | PASS   | same                                                                 |
| Full analysis artefacts persist (signals / recommendations / scores / audit / explanations) | PASS   | same                                                                 |
| Fail-closed (no DATABASE_URL in production)                                                 | PASS   | `apps/web/lib/qep/persistence/resolve-qi-persistence.test.ts`        |
| Fail-closed (memory forbidden in production)                                                | PASS   | same                                                                 |
| Production default = postgres                                                               | PASS   | same                                                                 |

```
Test Files  4 passed (4)
Tests       19 passed (19)
```

---

## Acceptance criteria map

| Criterion                             | Evidence                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Survives process restart              | New `createDb` client hydrates prior observations and analysis artefacts |
| Tenant-scoped                         | `listObservations(tenantA)` excludes tenantB; RLS on all tables          |
| Production uses Postgres by default   | Mode resolution + fail-closed tests                                      |
| Immutable observation rules preserved | Duplicate `observationId` throws in store + engine `Object.freeze`       |
| Same durability bar as PR-01/02       | IntelligenceStore port + Postgres adapter + RLS + resolver pattern       |

**Owner acceptance candidate:** QX-PR-03 CLOSED.
