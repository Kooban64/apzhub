# QX-PR-04 Dashboard Durability Evidence

| Field     | Value                                                                                     |
| --------- | ----------------------------------------------------------------------------------------- |
| Timestamp | 20260807T233000Z                                                                          |
| Authority | [OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md](../OWNER-REVIEW-V1.1-PRODUCTION-READINESS.md) |
| Status    | **OWNER ACCEPTANCE CANDIDATE — CLOSED**                                                   |
| Target    | APZQEP Version 1.1 Production Ready                                                       |

---

## Implementation complete

| Artefact   | Path / result                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| Migrations | `0139_apz_qep_dashboard_sor.sql` · `0140_…_rls.sql` — applied via `pnpm db:migrate`                           |
| Tables     | `qep_dashboard_layout` · `qep_dashboard_saved_view` present on platform PostgreSQL                            |
| RLS        | `relrowsecurity = true` on both tables (`app.tenant_id`)                                                      |
| Port       | `packages/platform-dashboard/src/store/layout-store.ts` — async `LayoutStore`                                 |
| Adapter    | `packages/qep-dashboards/src/infrastructure/postgres-layout-store.ts`                                         |
| Factory    | `packages/qep-dashboards/src/infrastructure/persistence.ts`                                                   |
| Resolver   | `apps/web/lib/qep/persistence/resolve-dashboard-persistence.ts` — postgres default in production; fail-closed |
| Runtime    | `apps/web/lib/qep/dashboard-runtime.ts` — wired via resolver + factory                                        |

---

## Operational evidence

| Check                                          | Result | Suite                                                                       |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| Migration execution                            | PASS   | `pnpm db:migrate` → `[db] Migrations applied`                               |
| Write + restart hydrate                        | PASS   | `testing/apzqep-qx-pr-04/dashboard-postgres-durability.integration.test.ts` |
| Tenant isolation (`listLayouts` / `listViews`) | PASS   | same                                                                        |
| Fail-closed (no DATABASE_URL in production)    | PASS   | `apps/web/lib/qep/persistence/resolve-dashboard-persistence.test.ts`        |
| Fail-closed (memory forbidden in production)   | PASS   | same                                                                        |
| Production default = postgres                  | PASS   | same                                                                        |

```
Test Files  2 passed (2)
Tests       5 passed (5)
```

---

## Acceptance criteria map

| Criterion                           | Evidence                                                   |
| ----------------------------------- | ---------------------------------------------------------- |
| Survives process restart            | New `createDb` client hydrates prior layout and saved view |
| Tenant-scoped                       | `list*(tenantA)` excludes tenantB                          |
| Production uses Postgres by default | Mode resolution + fail-closed tests                        |
| Wave 4 residual cleared             | Durable store is production default path                   |

**Owner acceptance candidate:** QX-PR-04 CLOSED.
