# APZHUB — Testing Security & Tenancy Guide

**Milestone:** APZTCMS-011  
**Authority:** [013](../013-security-zero-trust-architecture-framework.md) · [APZ TCMS Authorization Guide](./APZHUB-APZ-TCMS-Authorization-Guide.md)  
**Status:** Tenant-scoped platform path with production authz

---

## Zero Trust on every call

Testing platform operations require:

1. **Identity** — authenticated user in `ServiceRequestContext.userId`
2. **Tenant context** — `tenantId` on every request
3. **Correlation** — `correlationId` for audit and error trace
4. **Authorisation** — explicit operation map + permission catalogue
5. **Validation** — domain rules before persistence
6. **Audit** — pipeline audit sink when configured

No trust by network location or prior session alone.

---

## Tenancy model

| Layer | Enforcement |
| ----- | ----------- |
| **Request context** | `assertTestingContext` — required fields before domain call |
| **Domain services** | Operations scoped by `ctx.tenantId` |
| **Repositories** | Row-level tenant filter + RLS on `testing_*` tables |
| **Persistence errors** | `TENANT_MISMATCH` → `PlatformServiceError` authorization category |

Cross-tenant reads return not-found or tenant mismatch — never leak foreign tenant data.

Tests: `testing-platform-services.test.ts` — tenant isolation cases.

---

## Authorisation

| Concern | Mechanism |
| ------- | --------- |
| Permission keys | `APZ_TCMS_PERMISSIONS` merged into platform catalogue |
| Operation mapping | `operation-authorization-map.ts` — deny if unmapped |
| Production mode | Requires `accessResolver`; no silent allow-all |
| UI gating | `apps/web/lib/testing/permissions.ts` — display only |

Certification approve, evidence verify, and approval decide require elevated keys (`certification.approve`, `evidence.admin`, `approval.decide`).

---

## Sensitive data

| Data | APZTCMS-011 handling |
| ---- | -------------------- |
| Evidence binaries | Not stored — metadata only |
| Automation raw payloads | Domain ingestion only; errors sanitized at platform boundary |
| Audit history | Immutable domain records; no PII in error messages |
| Backend engine IDs | Connector-internal; not exposed on platform contracts |

---

## Configuration security

| Control | Requirement |
| ------- | ----------- |
| `TESTING_SERVICE_ENABLED` | Explicit opt-in — default off |
| Production persistence | Postgres only — no in-memory SoR |
| Secrets | Never in code, logs, or error messages |
| Break-glass allow-all | `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION` only with explicit env |

---

## Superadmin

Superadmin remains a distinct permission tier — not a bypass of testing operation map or tenant checks unless explicitly modelled in access resolver fixtures.

---

## Related

- [Testing Permission Catalogue](./APZHUB-Testing-Permission-Catalogue.md)
- [Testing Operation Permission Map](./APZHUB-Testing-Operation-Permission-Map.md)
- [Testing Bootstrap Configuration Guide](./APZHUB-Testing-Bootstrap-Configuration-Guide.md)
- [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
