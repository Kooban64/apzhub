# Platform UX / capability backlog (baseline from Cursor context)

This document captures **what we already improved in code** versus **what can still be improved**, organized by area. Use it as the working backlog; it does not replace [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) for env/runbooks.

**Captured:** section breakdown (UI/UX, backend, frontend, services, auth, admin, users) plus implementation status as of the “honest access” slice (`_meta`, admin banner, `APZHUB_ACCESS_STRICT_REAL`).

---

## UI / UX

**Done (baseline)**  
- Admin inspector: bundle save + matrix service override/clear for portal UUID users; `admin-access` query invalidation.  
- Login / reset: shared minimum password length.  
- Workspace launcher: readiness pills and blocked messaging from launch decisions.  
- Go-live guidance: [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) “Go-live matrix”, `npm run verify:preflight`, smoke `PREFLIGHT=1`.

**Improve**  
- Inspector: success toasts / clearer saved state after mutations.  
- Optional per-service override controls on **directory user** inspector (today: matrix cell + bundles on directory).  
- Loading skeletons on admin access pages during refetch.  
- Workspace “why blocked?” copy tied to `reasonCode` from launch decisions.

---

## Backend

**Done**  
- Postgres-backed access materialization; seeds + catalog max overrides; provisioning triggers when configured.  
- **`loadAdminAccessDataWithMeta`** + **`_meta`** on `GET /api/admin/access` describing whether the payload came from Postgres or a mock fallback.  
- **`APZHUB_ACCESS_STRICT_REAL`**: when `true`, real-mode materialization failures **throw** instead of silently serving mock (503 from API routes).

**Improve**  
- Structured operator payloads (correlation id, error code) on materialization failure.  
- Optional runtime public config endpoint so the browser is not only `NEXT_PUBLIC_*` at build time.

---

## Frontend (Next client)

**Done**  
- Workspace posture via `/api/workspace/access-posture` when `NEXT_PUBLIC_APZHUB_ACCESS_SOURCE` is not `mock`.  
- Default tenant includes **Drive + Chat** in [`lib/workspace/workspace-config.ts`](../lib/workspace/workspace-config.ts).

**Improve**  
- Runtime config fetch if rebuild discipline remains painful.  
- Tighter loading/error boundaries on workspace shell.

---

## Services (external / vendor)

**Baseline**  
- JWT mint / OIDC start in APZHUB; each vendor must trust tokens / IdP.  
- Simulated connectors acceptable per deploy docs.

**Persistence (APZHUB-owned)**  
- All durable portal/access/provisioning/launch state is in **Postgres** on the **`postgres_data`** volume in compose — survives **`web`/`worker` image rebuilds** unless volumes are removed. See [`docs/DATA_PERSISTENCE.md`](DATA_PERSISTENCE.md).

**Improve**  
- Runbooks per environment: connector profile, IdP URLs, JWT audience expectations.

---

## Auth

**Done**  
- Central password policy; local sessions; `directorySubjectIdForSession` for portal UUIDs.

**Improve**  
- MFA / session policy when product requires it.  
- Stronger audit surfacing for sensitive admin actions.

---

## Admin — features and functions

**Done**  
- Users, matrix, bundles/services, inspector, provisioning hooks, health strip.  
- **Admin datasource banner** when access payload is a **mock fallback** while server is configured for real/file (see `_meta.origin`).

**Improve**  
- Bulk bundle assignment; matrix export.  
- Deeper alert → deep-link automation.

---

## Users — features and functions

**Done**  
- Workspace modules, launcher, launch path; tenant allowlist aligned with seeded catalog (incl. Drive/Chat).

**Improve**  
- First-run empty states; multi-tenant workspace config beyond single default.

---

## Related code

- Access load + meta: [`lib/adapters/access/access-adapter.ts`](../lib/adapters/access/access-adapter.ts), [`lib/admin/access/admin-access-load-meta.ts`](../lib/admin/access/admin-access-load-meta.ts)  
- Admin banner: [`features/admin/admin-access-datasource-banner.tsx`](../features/admin/admin-access-datasource-banner.tsx)  
- Admin API: [`app/api/admin/access/route.ts`](../app/api/admin/access/route.ts)
