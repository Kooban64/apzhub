# APZQEP-152 — Security Discovery

| Field              | Value                                                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Programme          | APZQEP-152                                                                                                                                                      |
| Artefact           | SECURITY-DISCOVERY                                                                                                                                              |
| Authority          | Owner Authorisation — mandatory before remediation                                                                                                              |
| Timestamp          | 20260803T063000Z                                                                                                                                                |
| Baseline           | `49b391a9` (APZQEP-151 CLOSED; RB-001 CLEARED)                                                                                                                  |
| Classification     | Enterprise Production Security Certification                                                                                                                    |
| Remediation status | **ENGINEERING IN PROGRESS** (20260803T064000Z) — see [RB-002-REMEDIATION.md](./RB-002-REMEDIATION.md); this file remains the pre-remediation discovery baseline |

**Rule:** No remediation engineering before this discovery. Remediation follows this document.

---

## Executive verdict

| Layer                          | Classification     | Notes                                                                                          |
| ------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------- |
| Authentication                 | **SECURE**         | Better Auth session; tenant from session; APIs 401 without session                             |
| Platform RBAC framework        | **PARTIAL**        | PermissionService / ProductionAuthorizationProvider exist; Cap A–F HTTP path does not use them |
| Cap A–F HTTP authorisation     | **ELEVATION**      | RB-002 — `actorFromContext` grants Cap write when `serviceContext.permissions` empty           |
| Cap F system aggregation       | **ELEVATION**      | HR-001 — `system-reporting` synthetic actor                                                    |
| Workspace UI gating            | **FAIL_OPEN**      | Session-only shell entry; no Cap permission gate                                               |
| Commands (library)             | **PARTIAL**        | Fail-closed if wired with real grants; Cap commands not in platform catalogue                  |
| Notifications                  | **PARTIAL**        | Tenant scoping; not Cap ACL                                                                    |
| QKI                            | **PARTIAL**        | Tenant filter; no permission ACL on hits                                                       |
| Background / outbox            | **PARTIAL**        | System worker identity; Cap F privileged collector                                             |
| Tenant binding (session→actor) | **SECURE**         | Client cannot set tenant via body                                                              |
| Project isolation              | **PARTIAL**        | Client `projectId` filter; no membership check                                                 |
| Cap PostgreSQL RLS wiring      | **UNKNOWN / RISK** | FORCE RLS present; `applyPostgresTenantSession` not wired on Cap path                          |
| Audit of authz decisions       | **PARTIAL**        | Domain history yes; Cap elevation not audited                                                  |

**Production least-privilege RBAC for Caps A–F is not certified.**

---

## 1. Authentication flow

```text
Browser / API client
  → Better Auth session cookie (httpOnly, sameSite=lax, secure in production)
  → getValidatedSession / authenticatePlatformApiRequest
  → tenantId from session (activeTenantId / enriched tenant)
  → buildServiceRequestContext(userId, tenantId, permissions: [])
```

| Control                           | Location                                              | Status |
| --------------------------------- | ----------------------------------------------------- | ------ |
| Better Auth + Postgres adapter    | `packages/auth/src/server.ts`                         | SECURE |
| Session validation / expiry       | `packages/auth/src/session.ts`                        | SECURE |
| Cookie policy                     | `packages/auth/src/session-policy.ts`                 | SECURE |
| Edge middleware login gate (HTML) | `apps/web/middleware.ts`                              | SECURE |
| API JSON 401 (no redirect)        | middleware public `/api/v1/*` + `withPlatformApiAuth` | SECURE |
| Client roles/permissions trusted? | Explicitly **no** (`service-context.ts`)              | SECURE |

**Gap:** `serviceContext.permissions` is always `[]` by design for gateway paths that use ProductionAuthorizationProvider. Cap A–F bypass the gateway and treat empty permissions as a cue to elevate.

---

## 2. Permission evaluation model

### Platform (intended)

```text
Session → resolveSessionAuthorization → roles + effective permissions
  → ProductionAuthorizationProvider / RequestPipeline
  → deny by default
```

- Catalogue: `packages/platform-authorization`
- Seed roles: `platform-admin` (`*`), `law-operator`, `tenant-member`
- Cap A–F permission keys **not** in default seed catalogue
- Cap A–F operations **absent** from `operation-authorization-map.ts` for Core QE Caps A–F (legacy `qep.requirements.*` ENG ops exist separately)

### Cap domain (correct if actor honest)

```text
actor.permissions → requirePermission(perm) → fail closed
```

Domain services fail closed. HTTP falsifies the actor.

### Cap HTTP (RB-002 — defect)

```text
base = serviceContext.permissions  // always []
if missing Cap read/admin → append Cap write set
```

Present in all six handlers:

| Cap | Handler                                                       |
| --- | ------------------------------------------------------------- |
| A   | `apps/web/lib/api/v1/handlers/qep-suites.ts`                  |
| B   | `apps/web/lib/api/v1/handlers/qep-execution-plans.ts`         |
| C   | `apps/web/lib/api/v1/handlers/qep-execution-workspace.ts`     |
| D   | `apps/web/lib/api/v1/handlers/qep-defects.ts`                 |
| E   | `apps/web/lib/api/v1/handlers/qep-enterprise-requirements.ts` |
| F   | `apps/web/lib/api/v1/handlers/qep-enterprise-reporting.ts`    |

Because `base` is always empty, **every authenticated tenant user** receives Cap write grants.

APZQEP-150: `ISSUES-REGISTER.md` RB-002; `SECURITY-REVIEW.md`; `KNOWN-LIMITATIONS.md` KL-002.

---

## 3. Role hierarchy / inheritance / overrides

| Role           | Scope                | Grants (seed)                                                  |
| -------------- | -------------------- | -------------------------------------------------------------- |
| platform-admin | platform             | `*`                                                            |
| law-operator   | product law-platform | `legal.*`, `law.*`, `trust.*`                                  |
| tenant-member  | tenant               | workspace/project/search + legal view; **parent** law-operator |

No Cap A–F operator role. No Cap permission inheritance. Auto-provision assigns tenant-member + law-operator only.

Superadmin (`*`) is an explicit platform tier — not a Cap HTTP bypass by itself; Cap elevation makes Cap admin irrelevant under LIMITED_AVAILABILITY.

---

## 4. HTTP / API inventory (Cap A–F)

**Pattern today:** auth (session+tenant) → traffic → `actorFromContext` elevate → domain.

**Posture for all Cap A–F methods:** AUTH_OK · TENANT_FROM_SESSION · **PERM_ELEVATED (RB-002)**

Approx. **58** method handlers across Suites, Execution Plans, Execution Sessions, Defects, Enterprise Requirements, Enterprise Reporting under `/api/v1/qep/*`.

`withPlatformApiAuth` documents that “Permission decisions remain in RequestPipeline” — **false for Cap A–F** (pipeline unused).

---

## 5. Workspace security

| Surface        | Gate                                              | Class                 |
| -------------- | ------------------------------------------------- | --------------------- |
| `/workspace/*` | Session middleware only                           | FAIL_OPEN for Cap ACL |
| Cap routers    | Path registration only                            | FAIL_OPEN             |
| Cap UI         | Relies on API; elevation hides denials            | FAIL_OPEN             |
| Mutations      | Route Handlers (not separate Server Action authz) | ELEVATION             |

Workspaces in scope: Suites, Execution Planning, Execution, Defects, Requirements, Reporting, plus Commands / Notifications / Administration (platform).

---

## 6. Commands / notifications / QKI

| Surface                      | Finding                                           | Class                               |
| ---------------------------- | ------------------------------------------------- | ----------------------------------- |
| Cap command defs             | `requiredPermissions` on Cap platform-integration | PARTIAL                             |
| `@apzhub/qep-command` engine | Fail-closed on missing perms                      | PARTIAL (if wired with real grants) |
| Platform command catalogue   | Cap A–F commands not registered                   | PARTIAL                             |
| Notifications                | Tenant/subscription filter                        | PARTIAL                             |
| QKI search                   | Filters by `tenantId`; no Cap ACL                 | PARTIAL                             |

---

## 7. Background processing

| Component                | Authority                                  | Class                                                                 |
| ------------------------ | ------------------------------------------ | --------------------------------------------------------------------- |
| Cap outbox enqueue       | Same TX as aggregate; event tenantId       | PARTIAL                                                               |
| Platform OutboxWorker    | System identity; no user session           | PARTIAL (acceptable if handlers are tenant-scoped and non-privileged) |
| Cap F `qualityFactsPort` | `userId: "system-reporting"` + Cap E admin | **ELEVATION (HR-001)**                                                |

Product rule: no implicit administrator context for background work.

---

## 8. Tenant & project isolation

| Control                                       | Status                                                   |
| --------------------------------------------- | -------------------------------------------------------- |
| Tenant from session only                      | SECURE                                                   |
| Cap repo `eq(tenantId, …)`                    | PARTIAL defense-in-depth                                 |
| Cap RLS (`0096`) FORCE RLS on `app.tenant_id` | Schema present                                           |
| `applyPostgresTenantSession` on Cap TX path   | **NOT WIRED** — RISK                                     |
| Project membership checks                     | **ABSENT** — client `projectId` is filter/attribute only |
| Cross-tenant body overwrite                   | Not observed on Cap create schemas                       |

Cross-tenant reads/writes via HTTP tenant spoofing: blocked by session binding. Same-tenant privilege abuse: enabled by RB-002.

---

## 9. Session / tokens / transport

| Topic                      | Finding                                                      |
| -------------------------- | ------------------------------------------------------------ |
| Absolute / sliding session | Policy in `session-policy.ts` (7d / 24h update)              |
| Logout / invalid session   | Better Auth; API returns 401                                 |
| Cookie flags               | httpOnly; secure in production                               |
| Replay / fixation          | Relies on Better Auth defaults — certify under session tests |
| Transport                  | TLS assumed at edge (Caddy); not Cap-specific                |

---

## 10. Audit integrity

| Mechanism                                             | Cap coverage                   |
| ----------------------------------------------------- | ------------------------------ |
| Domain history + lifecycle                            | Yes                            |
| Platform API logs (correlation/actor/tenant/op)       | Yes — not authz decision audit |
| Authorization-audit (ProductionAuthorizationProvider) | Cap A–F skip this path         |
| Elevation grants                                      | **Not audited**                |
| Cap F system-reporting                                | Not attributed to caller       |

---

## 11. Secrets handling

| Topic                       | Finding                                           |
| --------------------------- | ------------------------------------------------- |
| DATABASE_URL / auth secrets | Env; not in Cap handlers                          |
| Cap elevation               | Does not log secrets                              |
| Stack traces to clients     | PlatformApiHttpError mapping — continue to verify |

---

## 12. Product rule gap analysis (fail closed)

| Surface                  | Explicit authz today?                                |
| ------------------------ | ---------------------------------------------------- |
| Cap API                  | Authentication yes; Cap permission **no** (elevated) |
| Cap page / workspace     | Session only                                         |
| Cap command              | Library yes; wiring UNKNOWN                          |
| Cap projection / QKI     | Tenant only                                          |
| Cap notification         | Tenant only                                          |
| Cap report / export      | Elevated Cap F path                                  |
| Cap background collector | Privileged synthetic actor                           |
| Cap admin actions        | Elevated                                             |

---

## 13. Remediation plan (post-discovery)

Ordered; preserves architecture (no redesign):

1. **Resolve real permissions** into `ServiceRequestContext` via `resolveSessionAuthorization` on Cap/API auth path (fail closed when empty for Cap ops).
2. **Remove all six Cap `actorFromContext` elevations** — pass session permissions only.
3. **Register Cap A–F permission catalogue**; add **`qep-operator`** (and optional read-only) roles; seed Postgres + in-memory; provision only under controlled policy (not silent write-for-all).
4. **HTTP operation permission check** before Cap domain invoke (defense in depth).
5. **Eliminate Cap F `system-reporting` elevation** — repository/derived facts under caller authority or non-privileged computation.
6. **Wire `applyPostgresTenantSession`** into Cap postgres transaction path.
7. **Workspace / nav / command** gating on Cap read (and write) permissions.
8. **Project isolation** — document current attribute filter; add membership checks where platform project model already supports it without redesign; else register known limitation with Owner if redesign required (STOP if redesign needed).
9. **Security test suite** — privilege escalation, anonymous, cross-tenant, regression.
10. **Documentation pack** + evidence + certification; **do not** declare production GO — recommend re-run APZQEP-150.

---

## 14. Stop-condition watchpoints

| Condition                        | Discovery assessment                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Platform redesign required       | **No** — use existing PermissionService / session authz                                                                   |
| Authentication redesign required | **No** — Better Auth adequate                                                                                             |
| Governance / ES change required  | **No**                                                                                                                    |
| Project membership model missing | **Possible STOP** if Board requires project ACL and no platform project membership API exists — assess during remediation |
| Owner decision                   | Only if provision policy (who receives Cap roles by default) needs Board choice                                           |

**Default provision policy (proposed, proceed unless STOP):**

```text
platform-admin (*): full Cap access
qep-operator (new): Cap A–F read+write permissions
qep-reader (new, optional): Cap A–F read only
tenant-member: NO Cap A–F grants by default (fail closed)
```

Demo/cert users must be assigned `qep-operator` (or admin). No silent elevation.

---

## 15. Discovery complete

```text
SECURITY-DISCOVERY: COMPLETE
Engineering gate: OPEN for remediation under APZQEP-152 only
RB-002 primary defect: Cap HTTP actorFromContext elevation + empty serviceContext.permissions
Related: HR-001 Cap F system-reporting; Cap RLS session wiring; workspace ACL
```
