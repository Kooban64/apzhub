# PRH-007 Security Review — Tenant Isolation

**Date:** 2026-07-09  
**Reviewer:** Platform Security (PRH-007 validation milestone)  
**Scope:** Tenant boundaries, cross-tenant protection, session/authorization consistency

---

## Executive summary

Tenant isolation for Law Platform PostgreSQL data is **defense-in-depth and validated**. PRH-007 closes membership validation gaps on Law API tenant claims and restricts cross-tenant platform diagnostics exposure. Residual risk is limited to in-memory dev mode and platform metadata tables without RLS.

**Overall posture:** Acceptable for PRH-007 stop condition. Await owner approval before PRH-008.

---

## Strengths

| Control | Assessment |
|---------|--------------|
| PostgreSQL RLS + FORCE | Strong backstop; behavioral tests confirm denial |
| Adapter tenant filters | Consistent across all law aggregates + trust |
| UoW session binding | `app.tenant_id` set on every transaction |
| Law API middleware | All entity routes use `withLawApiAuth` |
| Trust services | Explicit `TRUST_*_TENANT_MISMATCH` guards |
| Authorization | Tenant-scoped roles filtered; mismatch outcome tracked |

---

## Findings addressed in PRH-007

| Finding | Severity | Resolution |
|---------|----------|------------|
| `x-tenant-id` accepted without membership check | High | `validateUserTenantMembership` enforced in Law API context |
| Platform ops routes exposed cross-tenant metadata | Medium | `requirePlatformAdminRoute` on summary/tenants/authz diagnostics |
| Search providers queried global in-memory repos | Medium | Empty results without persistence tenant ALS |
| RLS not behaviorally tested | Medium | `testing/integration/rls-cross-tenant-denial.test.ts` |
| Matter repository missing isolation test | Low | Added integration test |

---

## Residual observations

| Observation | Severity | Recommendation |
|-------------|----------|----------------|
| Platform tables without RLS | Medium | Design platform RLS in future sprint |
| In-memory mode no physical isolation | Low | Document dev-only; use Postgres in CI |
| Remaining platform API routes without guard | Low | PRH-009 full audit |
| Double ALS (web + law-platform) | Low | Monitor workflow-runner usage |

---

## Success criteria verification

| Criterion | Met |
|-----------|-----|
| No tenant accesses another tenant's data (Postgres) | ✅ |
| No diagnostics expose another tenant without permission | ✅ |
| No reports cross tenant boundaries | ✅ (existing + trust tests) |
| No searches leak tenant information | ✅ |
| No workflows bypass tenant enforcement | ✅ |

---

## References

- [Tenant Isolation Architecture](../architecture/APZHUB-Tenant-Isolation-Architecture.md)
- [Tenant Validation Report](./PRH-007-Tenant-Validation-Report.md)
- [PRH-007 Completion Report](../sprint/PRH-007-completion-report.md)
